const express = require('express');
const cors = require('cors');
require('dotenv').config();
const app = express();

const bd=require("./database/connexion")

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/clients', require('./routes/clients'));
app.use('/api/commandes', require('./routes/commandes'));
app.use('/api/factures', require('./routes/factures'));
app.use('/api/tickets', require('./routes/tickets'));


app.listen(process.env.PORT, () => {
    console.log(` Server listen ${process.env.PORT}`)
}
);