const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const bd = require("./database/connexion")

// Register models explicitly to avoid Schema hasn't been registered errors
require('./models/client');
require('./models/ticket');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/factures', require('./routes/factures'));
app.use('/api/tickets', require('./routes/tickets'));

// Route de test
app.get('/', (req, res) => {
  res.json({ message: 'API ERP Module Client' });
});

app.listen(process.env.PORT, () => {
  console.log(`Serveur démarré sur le port ${process.env.PORT}`)
}
);