const express = require('express');
const router = express.Router();
const Ticket = require('../models/ticket');

// Créer un ticket (Client)
router.post('/', async (req, res) => {
    try {
        const { clientId, titre, description, user } = req.body;

        // Logique basique si user pas fourni
        const createur = user || 'Client';

        const ticket = new Ticket({
            client: clientId,
            titre,
            description,
            historique: [{
                action: 'CREATION',
                user: createur,
                details: 'Ticket créé'
            }]
        });

        const savedTicket = await ticket.save();
        res.status(201).json(savedTicket);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Lister tous les tickets (Manager/Agent)
router.get('/', async (req, res) => {
    try {
        // Force use of 'clients' model to avoid schema ref issues
        const tickets = await Ticket.find().populate({ path: 'client', model: 'clients' }).sort({ dateCreation: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Lister les tickets d'un client spécifique
router.get('/client/:clientId', async (req, res) => {
    try {
        const tickets = await Ticket.find({ client: req.params.clientId }).sort({ dateCreation: -1 });
        res.json(tickets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Détails d'un ticket
router.get('/:id', async (req, res) => {
    try {
        const ticket = await Ticket.findById(req.params.id).populate({ path: 'client', model: 'clients' });
        if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });
        res.json(ticket);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Assigner un agent
router.put('/:id/assign', async (req, res) => {
    try {
        const { agent } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });

        ticket.agent = agent;
        ticket.statut = 'EN_COURS';
        ticket.historique.push({
            action: 'ASSIGNATION',
            user: 'System', // Ou l'admin qui assigne
            details: `Assigné à ${agent}`
        });

        await ticket.save();
        res.json(ticket);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Changer le statut (Transition d'état)
router.put('/:id/status', async (req, res) => {
    try {
        const { statut, user, details } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });

        // Validation simple des transitions
        // TODO: Ajouter des validations plus strictes si nécessaire (ex: CLIENT seul peut confirmer la résolution)

        ticket.statut = statut;
        ticket.historique.push({
            action: 'CHANGEMENT_STATUT',
            user: user || 'System',
            details: `${details || 'Changement de statut'} vers ${statut}`
        });

        await ticket.save();
        res.json(ticket);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Ajouter un commentaire (Interne/Externe)
router.post('/:id/comments', async (req, res) => {
    try {
        const { user, content, type, attachments } = req.body;
        const ticket = await Ticket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ message: 'Ticket non trouvé' });

        ticket.commentaires.push({
            user,
            content,
            type: type || 'EXTERNAL',
            attachments: attachments || []
        });

        // Optionnel : Si le ticket était en attente, le repasser en cours ? Ou juste logger.
        // ticket.historique.push(...) 

        await ticket.save();
        res.json(ticket);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Statistiques pour le Dashboard Manager
router.get('/stats/dashboard', async (req, res) => {
    try {
        const total = await Ticket.countDocuments();
        const ouverts = await Ticket.countDocuments({ statut: 'OUVERT' });
        const envol = await Ticket.countDocuments({ statut: 'EN_COURS' });
        const resolus = await Ticket.countDocuments({ statut: 'RESOLU' });
        const clos = await Ticket.countDocuments({ statut: 'CLOS' });

        // Exemple de stat : Temps moyen de résolution (très simplifié)
        // Nécessiterait une agrégation plus complexe sur l'historique

        res.json({
            total,
            ouverts,
            envol,
            resolus,
            clos
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;