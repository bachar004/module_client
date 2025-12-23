const mongoose = require("mongoose");

const articleCommandeSchema = new mongoose.Schema(
  {
    produit: {
      type: String,
      required: true
    },
    quantite: {
      type: Number,
      required: true,
      min: 1
    },
    prixUnitaire: {
      type: Number,
      required: true,
      min: 0
    },
    total: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const commandeSchema = new mongoose.Schema({
  numeroCommande: {
    type: String,
    required: true,
    unique: true
  },
  
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clients',
    required: true
  },

  dateCommande: {
    type: Date,
    default: Date.now
  },

  articles: [articleCommandeSchema],

  montantTotal: {
    type: Number,
    required: true,
    min: 0
  },

  statut: {
    type: String,
    enum: ["en_attente", "validee", "annulee", "en_cours", "livree"],
    default: "en_attente"
  },

  raisonAnnulation: {
    type: String,
    default: null
  },

  dateValidation: {
    type: Date,
    default: null
  },

  dateAnnulation: {
    type: Date,
    default: null
  },

  notes: {
    type: String,
    default: ""
  }
}, {
  timestamps: true
});

commandeSchema.pre('save', async function(next) {
  if (this.isNew && !this.numeroCommande) {
    const count = await mongoose.model('commandes').countDocuments();
    this.numeroCommande = `CMD${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model("commandes", commandeSchema);