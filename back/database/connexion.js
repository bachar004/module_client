const mongoose=require("mongoose")
require("dotenv").config()

mongoose.connect(process.env.DB_STRING).then(
    console.log("connecté!")
).catch((err)=>{
    console.log('problème de connexion ')
})

module.exports=mongoose