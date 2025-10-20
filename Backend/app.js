console.log("hiii");
console.log("welcome to Snazzy");

// Load environment variables first
require('dotenv').config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// Routes
const userRouter = require("./Routes/UserRoutes");
const paymentRouter = require('./Routes/paymentRoute');
const refundRouter = require('./Routes/refundRoute');
const chatRouter = require('./Routes/chatRoute');
const orderRoute = require('./Routes/OrderRoute');
const promotionRouter = require('./Routes/PromotionRoute');
const contactRouter = require('./Routes/contactRoute');
<<<<<<< Updated upstream
const reportRouter = require('./Routes/reportRoute');
=======
const cartRouter = require('./Routes/cartRoute');
>>>>>>> Stashed changes
const bodyParser = require('body-parser');
const ProductRouter = require("./Routes/ProductRoutes");


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static('Uploads'));


// Routes
app.use("/user", userRouter);
app.use("/payment" , paymentRouter);
app.use("/refund", refundRouter);
app.use("/chat", chatRouter);
app.use("/orders",orderRoute);
app.use("/Promotions", promotionRouter);
app.use("/products", ProductRouter);
app.use("/contact", contactRouter);
<<<<<<< Updated upstream
app.use('/reports', reportRouter);
=======
app.use("/cart", cartRouter);
>>>>>>> Stashed changes


//database connection link
//link - mongodb+srv://admin:snazzy123@snazzy.vopoe0w.mongodb.net/

//db connection
mongoose.connect("mongodb+srv://admin:snazzy123@snazzy.vopoe0w.mongodb.net/")
.then(()=>console.log("connected to mongo db"))
.then(()=>{
    app.listen(5000);
})
.catch((err)=> console.log((err)));
