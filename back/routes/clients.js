const express = require('express');
const router=express.Router();
const Client=require("../models/client");

//ajouter client
router.post('/add', async (req, res) => {
  try {
    const clt = new Client(req.body);
    const savedClient = await clt.save();
    res.status(201).json(savedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

//lister client 
router.get('/findall', async (req, res) => {
  try {
    const clients = await Client.find().limit(50);

    console.log("Clients récupérés:", clients.length);
    res.json(clients);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//suppression
router.delete('/delete/:id', async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);
    if (!deletedClient) return res.status(404).json({ message: "Client non trouvé" });
    res.json({ message: "Client supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.put('/update/:id', async (req, res) => {
  try {
    const clientId = req.params.id;
    const updateData = req.body;

    // Récupérer le client existant
    const client = await Client.findById(clientId);
    if (!client) return res.status(404).json({ message: 'Client non trouvé' });

    const modifications = [];

    //transformer les valeurs pour comparaison
    const stringifyValue = (value) => {
      if (value instanceof Date) return value.toISOString();
      if (typeof value === 'object' && value !== null) return JSON.stringify(value);
      return value != null ? value.toString() : '';
    };

    // Parcourir les champs à mettre à jour
    for (const key in updateData) {
      const oldValue = stringifyValue(client[key]);
      const newValue = stringifyValue(updateData[key]);

      if (oldValue !== newValue) {
        modifications.push({
          date: new Date(),
          champ: key,
          ancienneValeur: oldValue,
          nouvelleValeur: newValue
        });
      }
    }

    // Mettre à jour le client
    Object.assign(client, updateData);

    // Ajouter les modifications dans l'historique si nécessaire
    if (modifications.length > 0) {
      client.historiqueModifications.push(...modifications);
    }

    // Sauvegarder
    await client.save();

    res.json(client);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// chercher clien 
// GET /clients/search?query=xxx
router.get('/search', async (req, res) => {
  try {
    const query = req.query.query || '';

    // Si la query est vide, retourner tous les clients
    if (!query) {
      const clients = await Client.find().limit(15); // limite à 50 résultats
      return res.json(clients);
    }

    // Recherche sur plusieurs champs : nom, prenom, email, telephone
    const clients = await Client.find({
      $or: [
        { nom: { $regex: query, $options: 'i' } },
        { prenom: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
        { telephone: { $regex: query, $options: 'i' } }
      ]
    }).limit(50); // limite à 50 résultats

    res.json(clients);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});




module.exports=router;
