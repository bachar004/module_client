const express = require('express');
const router = express.Router();
const Commande = require("../models/commande");
const Client = require("../models/client");
const Facture = require('../models/facture');
const Paiement = require("../models/paiement");
const { createEcheance } = require('../jobs/job');

router.post('/add', async (req, res) => {
  try {
    const { client, articles, notes } = req.body;

    const clientExiste = await Client.findById(client);
    if (!clientExiste) {
      return res.status(404).json({ message: "Client introuvable" });
    }

    if (clientExiste.statut !== 'actif') {
      return res.status(400).json({ 
        message: "Le client n'est pas actif. Commande refusée." 
      });
    }

    let montantTotal = 0;
    const articlesAvecTotal = articles.map(article => {
      const total = article.quantite * article.prixUnitaire;
      montantTotal += total;
      return { ...article, total };
    });

    const nouvelleCommande = new Commande({
      client,
      articles: articlesAvecTotal,
      montantTotal,
      notes,
      statut: 'en_attente'
    });

    const commandeSauvegardee = await nouvelleCommande.save();
    const commandeComplete = await Commande.findById(commandeSauvegardee._id)
      .populate('client');

    res.status(201).json({
      message: "Commande créée avec succès",
      commande: commandeComplete
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.get('/findall', async (req, res) => {
  try {
    const { statut } = req.query;
    let filter = {};
    
    if (statut) {
      filter.statut = statut;
    }

    const commandes = await Commande.find(filter)
      .populate('client')
      .sort({ dateCommande: -1 });
    
    res.json(commandes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id)
      .populate('client');
    
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    
    res.json(commande);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/valider/:id', async (req, res) => {
  try {
    const commande = await Commande.findById(req.params.id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (commande.statut !== 'en_attente') {
      return res.status(400).json({ 
        message: "Seules les commandes en attente peuvent être validées" 
      });
    }

    // Récupérer le client
    const clientExiste = await Client.findById(commande.client);
    if (!clientExiste) {
      return res.status(404).json({ message: "Client introuvable" });
    }

    // Vérifier le statut du client
    if (clientExiste.statut !== 'actif') {
      return res.status(400).json({ 
        message: "Le client n'est pas actif. Validation refusée." 
      });
    }

    // Calculer les montants en fonction du solde client
    let montantPaye = 0;
    let montantRestant = commande.montantTotal;
    let statutFacture = 'impayee';

    if (clientExiste.soldeCompte > 0) {
      if (clientExiste.soldeCompte >= commande.montantTotal) {
        // Paiement complet
        montantPaye = commande.montantTotal;
        montantRestant = 0;
        statutFacture = 'payee';
        clientExiste.soldeCompte -= commande.montantTotal;
      } else {
        // Paiement partiel
        montantPaye = clientExiste.soldeCompte;
        montantRestant = commande.montantTotal - clientExiste.soldeCompte;
        statutFacture = 'partiellement_payee';
        clientExiste.soldeCompte = 0;
      }
    }

    // Mettre à jour la commande
    commande.statut = 'validee';
    commande.dateValidation = new Date();
    commande.montantRestant = montantRestant;
    await commande.save();

    // Sauvegarder le client
    await clientExiste.save();

    // Créer la facture
    const nouvelleFacture = new Facture({
      commande: commande._id,
      client: commande.client,
      montantTotal: commande.montantTotal,
      montantPaye: montantPaye,
      soldeRestant: montantRestant,
      statut: statutFacture
    });

    await nouvelleFacture.save();

    if (statutFacture !== 'payee') {
      await createEcheance(nouvelleFacture);
    }

    // Créer un paiement si de l'argent a été déduit du solde
    if (montantPaye > 0) {
      const paiement = new Paiement({
        facture: nouvelleFacture._id,
        client: commande.client,
        montant: montantPaye,
        modePaiement: "solde_compte",
        datePaiement: new Date(),
        notes: "Paiement automatique depuis le solde du compte"
      });
      await paiement.save();
    }

    // Récupérer la commande complète avec le client
    const commandeComplete = await Commande.findById(commande._id)
      .populate('client');

    res.json({
      message: "Commande validée avec succès",
      commande: commandeComplete,
      facture: nouvelleFacture,
      montantPaye: montantPaye,
      nouveauSoldeClient: clientExiste.soldeCompte
    });
  } catch (err) {
    console.error('Erreur lors de la validation:', err);
    res.status(400).json({ message: err.message });
  }
});

router.put('/annuler/:id', async (req, res) => {
  try {
    const { raisonAnnulation } = req.body;
    const commande = await Commande.findById(req.params.id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    if (commande.statut === 'annulee') {
      return res.status(400).json({ 
        message: "Cette commande est déjà annulée" 
      });
    }

    if (commande.statut === 'livree') {
      return res.status(400).json({ 
        message: "Une commande livrée ne peut pas être annulée" 
      });
    }

    commande.statut = 'annulee';
    commande.dateAnnulation = new Date();
    commande.raisonAnnulation = raisonAnnulation || "Non spécifiée";
    
    await commande.save();
    const commandeComplete = await Commande.findById(commande._id)
      .populate('client');

    res.json({
      message: "Commande annulée avec succès",
      commande: commandeComplete
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/statut/:id', async (req, res) => {
  try {
    const { statut } = req.body;
    const commande = await Commande.findById(req.params.id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    commande.statut = statut;
    await commande.save();
    
    const commandeComplete = await Commande.findById(commande._id)
      .populate('client');

    res.json({
      message: "Statut mis à jour avec succès",
      commande: commandeComplete
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/delete/:id', async (req, res) => {
  try {
    const commande = await Commande.findByIdAndDelete(req.params.id);
    
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    
    res.json({ message: "Commande supprimée avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats/overview', async (req, res) => {
  try {
    const totalCommandes = await Commande.countDocuments();
    const commandesEnAttente = await Commande.countDocuments({ statut: 'en_attente' });
    const commandesValidees = await Commande.countDocuments({ statut: 'validee' });
    const commandesAnnulees = await Commande.countDocuments({ statut: 'annulee' });
    
    const montantTotal = await Commande.aggregate([
      { $match: { statut: { $in: ['validee', 'en_cours', 'livree'] } } },
      { $group: { _id: null, total: { $sum: '$montantTotal' } } }
    ]);

    res.json({
      totalCommandes,
      commandesEnAttente,
      commandesValidees,
      commandesAnnulees,
      montantTotal: montantTotal[0]?.total || 0
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;