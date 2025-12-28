const mongoose = require('mongoose');

const echeanceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['email', 'suspendAccount'],
    required: true
  },

  facture: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'facture',
    required: true
  },

  executeAt: {
    type: Date,
    required: true,
    index: true
  },

  status: { 
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending',
    index: true
  },

  startedAt: Date,
  completedAt: Date,
  failedAt: Date,
  error: String

}, { timestamps: true });

module.exports = mongoose.model('echeance', echeanceSchema);
