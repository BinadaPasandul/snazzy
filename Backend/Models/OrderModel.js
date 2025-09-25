const mongoose = require("mongoose");//connecting the database
const Schema = mongoose.Schema;

//craete the function to call data

const orderSchema = new Schema({
    userId:{type: String, required:true},
   
    customer_name:{
        type:String,//data type
        required:true,//validation

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

    //new field added to update the order status yooo
    status:{
        type:String,
        enum:["Packing","Delivering","Delivered"],
        default:"Packing",
    },
});


module.exports = mongoose.model(
    "OrderModel",//file name
    orderSchema//function name
)


