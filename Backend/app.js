console.log("hiii");
console.log("welcome to Snazzy")

// pw-snazzy123   - admin

const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/UserRoutes");

const app = express();
const cors = require("cors");

//middleware

app.use(express.json());
app.use(cors());

app.use("/user", router);

//database connection link
//link - mongodb+srv://admin:snazzy123@snazzy.vopoe0w.mongodb.net/

//db connection
mongoose.connect("mongodb+srv://admin:snazzy123@snazzy.vopoe0w.mongodb.net/")
.then(()=>console.log("connected to mongo db"))
.then(()=>{
    app.listen(5000);
})
.catch((err)=> console.log((err)));

//pass = zQKIpuqwgpTycmAm

const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/ProductRoutes");


//Middleware
app.use(express.json());
app.use("/products",router);


mongoose.connect("mongodb+srv://lakmith:zQKIpuqwgpTycmAm@snazzydb.lwyeb7v.mongodb.net/")
.then(()=> console.log("Connected to MongoDB"))
.then(()=>  {
    app.listen(5000);
})
.catch((err) => console.log((err)));