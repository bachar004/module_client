const express = require("express");
const app = express();
const cors=require("cors");
require("dotenv").config();
app.use(express.json());


const routeclient = require('./routers/clientrouter');
app.use('/api/clients', routeclient);


const port = process.env.PORT;
app.listen(port, () => console.log(`Serveur lancé sur le port ${port}`));
