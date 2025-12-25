const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  reference: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clients',
    required: true
  },
  titre: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  dateCreation: {
    type: Date,
    default: Date.now
  },
  statut: {
    type: String,
    enum: ['OUVERT', 'EN_COURS', 'RESOLU', 'CLOS', 'ARCHIVE'],
    default: 'OUVERT'
  },
  agent: {
    type: String, // Pour l'instant String, peut être ObjectId si un modèle Agent existe
    default: null
  },
  historique: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: String,
    user: String, // Qui a fait l'action
    details: String
  }],
  commentaires: [{
    date: {
      type: Date,
      default: Date.now
    },
    user: String,
    content: String,
    type: {
      type: String,
      enum: ['INTERNAL', 'EXTERNAL'], // Interne (Agent-Agent) ou Externe (Agent-Client)
      default: 'EXTERNAL'
    },
    attachments: [String] // URLs des fichiers
  }]
});

// Middleware pour générer la référence avant la sauvegarde si elle n'existe pas
ticketSchema.pre('validate', async function () {
  if (!this.reference) {
    const date = new Date();
    const year = date.getFullYear().toString().substr(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    // Note: countDocuments might be slow on validate hook but acceptable for MVP
    const count = await this.constructor.countDocuments();
    this.reference = `TKT-${year}${month}-${(count + 1).toString().padStart(4, '0')}`;
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
