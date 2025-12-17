const mongoose=require("mongoose")
require("dotenv").config()

mongoose.connect(process.env.DB_STRING).then(
    console.log("connecteé!")
).catch((err)=>{
    console.log('probelem de connexion ')
})

module.exports=mongoose