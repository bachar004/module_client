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
    const clients = await Client.find();
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
//update
router.put('/MAJ/:id', async (req, res) => {
  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedClient) return res.status(404).json({ message: "Client non trouvé" });
    res.json(updatedClient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
module.exports=router;