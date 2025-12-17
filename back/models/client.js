const mongoose = require("mongoose");

//adresse
const adresseSchema = new mongoose.Schema(
  {
    rue: String,
    ville: String,
    codePostal: String,
    pays: String
  },
  { _id: false }
);

// historique
const historiqueSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      default: Date.now
    },
    champ: String,
    ancienneValeur: String,
    nouvelleValeur: String
  },
  { _id: false }
);

// Client
const clientSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true
  },
  prenom: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  telephone: String,

  adresse: adresseSchema,

  dateCreation: {
    type: Date,
    default: Date.now
  },

  statut: {
    type: String,
    enum: ["actif", "inactif", "suspendu"],
    default: "actif"
  },

  soldeCompte: {
    type: Number,
    default: 0
  },

  historiqueModifications: [historiqueSchema]
});

module.exports = mongoose.model("clients", clientSchema);
