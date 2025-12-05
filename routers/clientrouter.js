const express = require('express');
const router = express.Router();
const clientcontroller=require("../controllers/clientcontroller")

router.post("/",clientcontroller.ajoutclient)
router.get("/",clientcontroller.listeclients)
router.get("/:id",clientcontroller.clientbyid)
router.put("/:id",clientcontroller.updateclient)
router.patch("/activer/:id",clientcontroller.activerclient)
router.patch("/desactiver/:id",clientcontroller.desactiverclient)
module.exports = router;