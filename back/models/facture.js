// models/facture.js
const mongoose = require("mongoose");

const counterSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  seq: { type: Number, default: 0 }
});

const Counter = mongoose.models.Counter || mongoose.model("Counter", counterSchema);
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

factureSchema.pre("validate", async function(next) {
  if (!this.numeroFacture) {
    const counter = await Counter.findOneAndUpdate(
      { name: "facture" },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    this.numeroFacture = `FAC${String(counter.seq).padStart(6, "0")}`;
  }

  this.soldeRestant = this.montantTotal - this.montantPaye;
  
});


module.exports = mongoose.model("factures", factureSchema);