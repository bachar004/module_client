const express = require('express');
const router = express.Router();
const Commande = require("../models/commande");
const Client = require("../models/client");
const facture = require('../models/facture');

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

    // Déterminer le statut de paiement et mettre à jour le solde
    if (clientExiste.soldeCompte < commande.montantTotal) {
      // Paiement partiel ou aucun paiement
      if (clientExiste.soldeCompte > 0) {
        facture.statut = 'partiellement_payee';
        commande.montantRestant = commande.montantTotal - clientExiste.soldeCompte;
        clientExiste.soldeCompte = 0;
      } else {
        facture.statut = 'impayee';
        commande.montantRestant = commande.montantTotal;
      }
    } else {
      // Paiement complet
      clientExiste.soldeCompte -= commande.montantTotal;
      commande.montantRestant = 0;
      facture.statut = 'payee';
    }
    commande.statut = 'validee';

    commande.dateValidation = new Date();
    
    // Sauvegarder les modifications
    await commande.save();
    await clientExiste.save();

    // Créer la facture
    const Facture = require("../models/facture");
    const nouvelleFacture = new Facture({
      commande: commande._id,
      client: commande.client,
      montantTotal: commande.montantTotal,
      montantPaye: commande.montantTotal - commande.montantRestant,
      soldeRestant: commande.montantRestant
    });
    
    // Déterminer le statut de la facture
    if (nouvelleFacture.soldeRestant === 0) {
      nouvelleFacture.statut = 'payee';
    } else if (nouvelleFacture.montantPaye > 0) {
      nouvelleFacture.statut = 'partiellement_payee';
    } else {
      nouvelleFacture.statut = 'impayee';
    }

    await nouvelleFacture.save();

    // Récupérer la commande complète avec le client
    const commandeComplete = await Commande.findById(commande._id)
      .populate('client');

    res.json({
      message: "Commande validée avec succès",
      commande: commandeComplete,
      facture: nouvelleFacture
    });
  } catch (err) {
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