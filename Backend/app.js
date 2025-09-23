console.log("hiii");
console.log("welcome to Snazzy")

// pw-snazzy123   - admin

const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/UserRoutes");
const router1 = require("./Routes/ProductRoutes");
const paymentRoute = require('./Routes/paymentRoute');
const orderRoute = require('./Routes/OrderRoute');
const bodyParser = require('body-parser');
require('dotenv').config();


const app = express();
const cors = require("cors");

//middleware

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static('Uploads'));

app.use("/user", router);
//Senan
app.get('/', (req, res) => res.send('Server is up!'));
app.use('/payment', paymentRoute);
//Lakmith
app.use(express.json());
app.use("/products",router1);

//Binada
app.use("/orders",orderRoute);


//database connection link
//link - mongodb+srv://admin:snazzy123@snazzy.vopoe0w.mongodb.net/

/*
mongoose.connect("mongodb+srv://admin:snazzy123@snazzy.vopoe0w.mongodb.net/")
.then(()=>console.log("connected to mongo db"))
.then(()=>{
    app.listen(5000);
})
.catch((err)=> console.log((err)));*/


// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB Atlas connected'))
    .catch(err => console.log('MongoDB connection error:', err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



//pass = zQKIpuqwgpTycmAm


