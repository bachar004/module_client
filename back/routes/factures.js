const express = require('express');
const router = express.Router();
const Facture = require("../models/facture");
const Paiement = require("../models/paiement");
const Client = require("../models/client");
const { model } = require('mongoose');

// ==================== FACTURES ROUTES ====================

// Get all factures with advanced filters
router.get('/findall', async (req, res) => {
    try {
        const { 
            statut, 
            dateDebut, 
            dateFin, 
            montantMin, 
            montantMax,
            modePaiement,
            clientId,
            limit,
            page
        } = req.query;
        
        let filter = {};
        
        // Filter by status
        if (statut) {
            if (statut.includes(',')) {
                filter.statut = { $in: statut.split(',') };
            } else {
                filter.statut = statut;
            }
        }
        
        // Filter by date range
        if (dateDebut || dateFin) {
            filter.dateFacture = {};
            if (dateDebut) {
                filter.dateFacture.$gte = new Date(dateDebut);
            }
            if (dateFin) {
                filter.dateFacture.$lte = new Date(dateFin);
            }
        }
        
        // Filter by amount range
        if (montantMin || montantMax) {
            filter.montantTotal = {};
            if (montantMin) {
                filter.montantTotal.$gte = parseFloat(montantMin);
            }
            if (montantMax) {
                filter.montantTotal.$lte = parseFloat(montantMax);
            }
        }
        
        // Filter by payment mode
        if (modePaiement) {
            filter.modePaiement = modePaiement;
        }
        
        // Filter by client
        if (clientId) {
            filter.client = clientId;
        }
        
        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        const skip = (pageNumber - 1) * limitNumber;
        
        const totalFactures = await Facture.countDocuments(filter);
        const factures = await Facture.find(filter)
            .populate({ path: 'client', model: 'clients' })
            .populate({ path: 'commande', model: 'commandes' })
            .sort({ dateFacture: -1 })
            .skip(skip)
            .limit(limitNumber);

        
        res.json({
            factures,
            pagination: {
                total: totalFactures,
                page: pageNumber,
                pages: Math.ceil(totalFactures / limitNumber),
                limit: limitNumber
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single facture by ID
router.get('/:id', async (req, res) => {
    try {
        const facture = await Facture.findById(req.params.id)
            .populate({ path: 'client', model: 'clients' })
            .populate({ path: 'commande', model: 'commandes' });

        if (!facture) {
            return res.status(404).json({ message: "Facture introuvable" });
        }
        res.json(facture);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ==================== PAIEMENTS ROUTES ====================

// Get all payments with advanced filters
router.get('/paiements/findall', async (req, res) => {
    try {
        const { 
            dateDebut, 
            dateFin, 
            modePaiement, 
            montantMin, 
            montantMax,
            clientId,
            factureId,
            limit,
            page
        } = req.query;
        
        let filter = {};
        
        // Filter by date range
        if (dateDebut || dateFin) {
            filter.datePaiement = {};
            if (dateDebut) {
                filter.datePaiement.$gte = new Date(dateDebut);
            }
            if (dateFin) {
                filter.datePaiement.$lte = new Date(dateFin);
            }
        }
        
        // Filter by payment mode
        if (modePaiement) {
            filter.modePaiement = modePaiement;
        }
        
        // Filter by amount range
        if (montantMin || montantMax) {
            filter.montant = {};
            if (montantMin) {
                filter.montant.$gte = parseFloat(montantMin);
            }
            if (montantMax) {
                filter.montant.$lte = parseFloat(montantMax);
            }
        }
        
        // Filter by client
        if (clientId) {
            filter.client = clientId;
        }
        
        // Filter by facture
        if (factureId) {
            filter.facture = factureId;
        }
        
        // Pagination
        const pageNumber = parseInt(page) || 1;
        const limitNumber = parseInt(limit) || 50;
        const skip = (pageNumber - 1) * limitNumber;
        
        const totalPaiements = await Paiement.countDocuments(filter);
        const paiements = await Paiement.find(filter)
            .populate({ path: 'facture', model: 'facture' })
            .populate({ path: 'client', model: 'clients' })
            .sort({ datePaiement: -1 })
            .skip(skip)
            .limit(limitNumber);


        
        res.json({
            paiements,
            pagination: {
                total: totalPaiements,
                page: pageNumber,
                pages: Math.ceil(totalPaiements / limitNumber),
                limit: limitNumber
            }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Add payment for a client
router.post('/paiements/:id', async (req, res) => {
    try {
        const { client: clientId, montantPaiement, modePaiement } = req.body;
        
        console.log('=== DÉBUT PAIEMENT ===');
        console.log('Body reçu:', req.body);
        
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: "Client introuvable" });
        }
        
        console.log('Client trouvé:', client.nom, client.prenom);
        
        if (!montantPaiement || montantPaiement <= 0) {
            return res.status(400).json({ message: "Montant de paiement invalide" });
        }
        
        const factureImpayee = await Facture.find({
            client: clientId,
            statut: { $in: ["impayee", "partiellement_payee"] }
        }).sort({ dateFacture: 1 });
        
        console.log('Factures impayées trouvées:', factureImpayee.length);
        
        const anciensolde = client.soldeCompte;
        let montantRestant = montantPaiement;
        
        const paiementcreated = [];
        const facturesMisesAJour = [];
        
        // CAS 1: Pas de factures impayées - créer un paiement de crédit
        if (factureImpayee.length === 0) {
            console.log('Aucune facture impayée - création d\'un paiement créditeur');
            
            // Créer un paiement sans facture (crédit client)
            const paiementCredit = new Paiement({
                client: clientId,
                montant: montantPaiement,
                modePaiement: modePaiement || "especes",
                datePaiement: new Date(),
                notes: "Paiement en avance - Crédit client"
            });
            
            try {
                const savedPaiement = await paiementCredit.save();
                console.log('✓ Paiement créditeur sauvegardé avec ID:', savedPaiement._id);
                paiementcreated.push(savedPaiement);
            } catch (saveError) {
                console.error('✗ ERREUR lors de la sauvegarde du paiement créditeur:', saveError);
                throw saveError;
            }
            
            client.soldeCompte = anciensolde + montantPaiement;
            await client.save();
            
            return res.status(200).json({
                message: "Paiement enregistré comme crédit client (aucune facture impayée)",
                paiements: paiementcreated,
                montant_recu: montantPaiement,
                nouveausolde: client.soldeCompte,
                anciensolde: anciensolde
            });
        }
        
        // CAS 2: Il y a des factures impayées
        for (const facture of factureImpayee) {
            if (montantRestant <= 0) break;
            
            const montant_a_payer = Math.min(facture.soldeRestant, montantRestant);
            
            console.log(`\n--- Traitement facture ${facture.numeroFacture} ---`);
            console.log('Montant à payer:', montant_a_payer);
            
            const paiementData = {
                facture: facture._id,
                client: clientId,
                montant: montant_a_payer,
                modePaiement: modePaiement || "especes",
                datePaiement: new Date()
            };
            
            try {
                const paiement = new Paiement(paiementData);
                const savedPaiement = await paiement.save();
                console.log('✓ Paiement sauvegardé avec ID:', savedPaiement._id);
                paiementcreated.push(savedPaiement);
            } catch (saveError) {
                console.error('✗ ERREUR lors de la sauvegarde du paiement:', saveError);
                throw saveError;
            }
            
            facture.montantPaye += montant_a_payer;
            facture.soldeRestant = facture.montantTotal - facture.montantPaye;
            
            if (facture.soldeRestant === 0) {
                facture.statut = "payee";
            } else {
                facture.statut = "partiellement_payee";
            }
            facture.modePaiement = modePaiement || "especes";
            await facture.save();
            
            facturesMisesAJour.push({
                factureId: facture._id,
                numeroFacture: facture.numeroFacture,
                nouveauStatut: facture.statut,
                montantPaye: facture.montantPaye,
                soldeRestant: facture.soldeRestant
            });
            
            montantRestant -= montant_a_payer;
        }
        
        
        
        client.soldeCompte = anciensolde + montantRestant;
        await client.save();
        
        console.log('\n=== RÉSULTAT FINAL ===');
        console.log('Paiements créés:', paiementcreated.length);
        console.log('Nouveau solde:', client.soldeCompte);
        
        res.json({
            message: "Paiement(s) enregistré(s) avec succès",
            paiements: paiementcreated,
            facturesMisesAJour: facturesMisesAJour,
            montant_recu: montantPaiement,
            nouveausolde: client.soldeCompte,
            anciensolde: anciensolde
        });
    } catch (err) {
        console.error('=== ERREUR GLOBALE ===');
        console.error('Message:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ 
            message: err.message,
            error: err.toString()
        });
    }
});
// Get payment history for a specific facture
router.get('/:id/paiements', async (req, res) => {
    try {
        const factureId = req.params.id;
        
        // Verify facture exists
        const facture = await Facture.findById(factureId);
        if (!facture) {
            return res.status(404).json({ message: "Facture introuvable" });
        }
        
        // Get all payments for this facture
        const paiements = await Paiement.find({ facture: factureId })
            .populate({ path: 'client', model: 'clients', select: 'nom prenom' })
            .sort({ datePaiement: -1 });

        
        res.json({
            facture: {
                numeroFacture: facture.numeroFacture,
                montantTotal: facture.montantTotal,
                montantPaye: facture.montantPaye,
                soldeRestant: facture.soldeRestant,
                statut: facture.statut
            },
            historiquePaiements: paiements,
            totalPaiements: paiements.length
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get single payment details by ID
router.get('/paiements/:id', async (req, res) => {
    try {
        const paiement = await Paiement.findById(req.params.id)
            .populate({
                path: 'client',
                model: 'clients',
                select: 'nom prenom email telephone adresse'
            })
            .populate({
                path: 'facture',
                model: 'facture',
                select: 'numeroFacture montantTotal montantPaye soldeRestant statut dateFacture modePaiement'
            });

        if (!paiement) {
            return res.status(404).json({ message: "Paiement introuvable" });
        }
        
        res.json(paiement);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;