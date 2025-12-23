// models/paiement.js
const mongoose = require("mongoose");

const paiementSchema = new mongoose.Schema({
  facture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'factures',
    required: true
  },
  montant: {
    type: Number,
    required: true,
    min: 0
  },
  modePaiement: {
    type: String,
    enum: ["especes", "carte", "virement", "cheque"],
    required: true
  },
  datePaiement: {
    type: Date,
    default: Date.now
  },
  reference: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("paiements", paiementSchema);