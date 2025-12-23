// models/facture.js
const mongoose = require("mongoose");

const factureSchema = new mongoose.Schema({
  numeroFacture: {
    type: String,
    required: true,
    unique: true
  },
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'commandes',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'clients',
    required: true
  },
  dateFacture: {
    type: Date,
    default: Date.now
  },
  montantTotal: {
    type: Number,
    required: true
  },
  montantPaye: {
    type: Number,
    default: 0
  },
  soldeRestant: {
    type: Number,
    required: true
  },
  statut: {
    type: String,
    enum: ["impayee", "partiellement_payee", "payee"],
    default: "impayee"
  },
  modePaiement: {
    type: String,
    enum: ["especes", "carte", "virement", "cheque"],
    default: null
  }
}, {
  timestamps: true
});

factureSchema.pre('save', async function(next) {
  if (this.isNew && !this.numeroFacture) {
    const count = await mongoose.model('factures').countDocuments();
    this.numeroFacture = `FAC${String(count + 1).padStart(6, '0')}`;
  }
  this.soldeRestant = this.montantTotal - this.montantPaye;
  next();
});

module.exports = mongoose.model("factures", factureSchema);