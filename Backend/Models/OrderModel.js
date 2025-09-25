const mongoose = require("mongoose");//connecting the database
const Schema = mongoose.Schema;

//craete the function to call data

const orderSchema = new Schema({
    userId:{type: String, required:true},
   
    customer_name:{
        type:String,//data type
        required:true,//validation

    },
    product_name:{
        type:String,
        required:true,
    },
    customer_address:{
        type:String,//data type
        required:true,//validation

    },
    product_id: {   //  link to product from lakmith
       type:String,
        required: true,
    },
     size:{
        type:String,//data type
        required:true,//validation

    },
     quantity:{
        type:Number,//data type
        required:true,//validation

    },
         payment_type:{
        type:String,//data type
        required:true,//validation

    },
    //New field to store the total amount from checkout
    total_price: { type: Number, required: true },
    

    //new field added to update the order status yooo
    status:{
        type:String,
        enum:["Processing","Delivering","Delivered"],
        default:"Processing",
    },


});


module.exports = mongoose.model(
    "OrderModel",//file name
    orderSchema//function name
)


