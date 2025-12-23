const express = require('express');
const router = express.Router();
const Facture = require("../models/facture");
const Paiement = require("../models/paiement");
const Client = require("../models/client");

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
            .populate('client')
            .populate('commande')
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
            .populate('client')
            .populate('commande');
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
            .populate('facture')
            .populate('client')
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
        
        const client = await Client.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: "Client introuvable" });
        }
        
        if (!montantPaiement || montantPaiement <= 0) {
            return res.status(400).json({ message: "Montant de paiement invalide" });
        }
        
        const factureImpayee = await Facture.find({
            client: clientId,
            statut: { $in: ["impayee", "partiellement_payee"] }
        }).sort({ dateFacture: 1 });
        
        const anciensolde = client.soldeCompte;
        let nouveausolde = anciensolde + montantPaiement;
        client.soldeCompte = nouveausolde;
        await client.save();
        
        if (factureImpayee.length === 0) {
            return res.status(200).json({
                message: "Aucune facture impayée pour ce client",
                montant_reçu: montantPaiement,
                nouveausolde: nouveausolde,
                anciensolde: anciensolde
            });
        }
        
        const paiementcreated = [];
        const facturesMisesAJour = [];
        
        for (const facture of factureImpayee) {
            if (client.soldeCompte <= 0) break;
            
            const montant_a_payer = Math.min(facture.soldeRestant, client.soldeCompte);
            
            const paiement = new Paiement({
                facture: facture._id,
                client: client._id,
                montant: montant_a_payer,
                modePaiement: modePaiement || "especes",
                datePaiement: new Date()
            });
            await paiement.save();
            paiementcreated.push(paiement);
            
            facture.montantPaye += montant_a_payer;
            facture.soldeRestant = facture.montantTotal - facture.montantPaye;
            
            if (facture.soldeRestant === 0) {
                facture.statut = "payee";
                facture.modePaiement = modePaiement || "especes";
            } else {
                facture.statut = "partiellement_payee";
                facture.modePaiement = modePaiement || "especes";
            }
            await facture.save();
            
            facturesMisesAJour.push({
                factureId: facture._id,
                numeroFacture: facture.numeroFacture,
                nouveauStatut: facture.statut,
                montantPaye: facture.montantPaye,
                soldeRestant: facture.soldeRestant
            });
            
            client.soldeCompte -= montant_a_payer;
        }
        
        await client.save();
        
        res.json({
            message: "Paiement(s) enregistré(s) avec succès",
            paiements: paiementcreated,
            facturesMisesAJour: facturesMisesAJour,
            montant_recu: montantPaiement,
            nouveausolde: client.soldeCompte,
            anciensolde: anciensolde
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;