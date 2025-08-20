console.log("hiii");
console.log("welcome to Snazzy")

// pw-snazzy123   - admin

const express = require("express");
const mongoose = require("mongoose");

const app = express();

//middleware
app.use("/",(requestAnimationFrame, resizeBy, next)=>
{
    res.send("It is working")
}
)

//database connection link
//link - mongodb+srv://admin:snazzy123@snazzy.vopoe0w.mongodb.net/

//db connection
mongoose.connect("mongodb+srv://admin:snazzy123@snazzy.vopoe0w.mongodb.net/")
.then(()=>console.log("connected to mongo db"))
.then(()=>{
    app.listen(5000);
})
.catch((err)=> console.log((err)));
