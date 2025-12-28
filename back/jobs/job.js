const echeance = require('../models/echeance');
const Facture = require('../models/facture');
const Client = require('../models/client');
const {sendEmail : emailService} = require('../services/email');

async function sendEmail(job) {
  const facture = await Facture.findById(job.facture).populate('client');
  if (!facture || !facture.client) {
    throw new Error('Client not found for invoice');
  }

  await emailService(facture.client.email,'Reminder: Invoice Due', `Your invoice ${facture._id} is due soon.`);
}

async function suspendAccount(job) {
  const facture = await Facture.findById(job.facture).populate('client');
  if (!facture || !facture.client) {
    throw new Error('Facture or client not found');
  }

  await Client.findByIdAndUpdate(
    facture.client._id,
    { statut: 'suspendu' }
  );

  await emailService(facture.client.email,'Account Suspended',`Your account was suspended due to unpaid invoice ${facture._id}.`);
}





async function createEcheance(facture) {
  await echeance.create([
    {
      type: 'email',
      facture: facture._id,
      executeAt: new Date(facture.dateFacture.getTime() +14 * 24 * 60 * 60 * 1000),
    },
    {
      type: 'suspendAccount',
      facture: facture._id,
      executeAt: new Date(facture.dateFacture.getTime() +30 * 24 * 60 * 60 * 1000),
    }
  ]);
  console.log('Echéances créées pour la facture', facture._id);
}

async function deleteEcheance(factureId) {
  const timeout = new Date(Date.now() - 10 * 60 * 1000);

  await echeance.deleteMany({
    facture: factureId,
    $or: [
      { status: 'pending' },
      { status: 'processing', startedAt: { $lte: timeout } }
    ]
  });
}


setInterval(async () => {
  try {
    const now = new Date();
    const timeout = new Date(Date.now() - 10 * 60 * 1000);

    const jobs = await echeance.find({
      executeAt: { $lte: now },
      $or: [
        { status: 'pending' },
        { status: 'processing', startedAt: { $lte: timeout } }
      ]
    }).sort({ executeAt: 1 }).limit(5);
    const jobCount = jobs.length;
    console.log(`Scheduler found ${jobCount} job(s) to process`);
    for (const job of jobs) {

      // Atomic lock
      const locked = await echeance.findOneAndUpdate(
        { _id: job._id, status: job.status },
        { $set: { status: 'processing', startedAt: new Date() } },
        { new: true }
      );

      if (!locked) continue; // another worker took it

      try {
        if (locked.type === 'email') {
            await sendEmail(locked);
            } else if (locked.type === 'suspendAccount') {
            await suspendAccount(locked);
            }


        await echeance.updateOne(
          { _id: job._id },
          { $set: { status: 'completed', completedAt: new Date() } }
        );

      } catch (err) {
        await echeance.updateOne(
          { _id: job._id },
          {
            $set: {
              status: 'failed',
              error: err.message,
              failedAt: new Date()
            }
          }
        );
      }
    }
    console.log('Scheduler cycle completed');

  } catch (err) {
    console.error('Scheduler error:', err);
  }
}, 5000);

module.exports = {
  createEcheance,
  deleteEcheance
};