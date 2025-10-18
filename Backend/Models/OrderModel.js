const mongoose = require("mongoose");//connecting the database
const Schema = mongoose.Schema;



const orderSchema = new Schema({
    userId:{type: String, required:true},
   
    customer_name:{
        type:String,
        required:true,

    },
    product_name:{
        type:String,
        required:true,
    },
    customer_address:{
        type:String,
        required:true,

    },
    product_id: {   //   lakmith
       type:String,
        required: true,
    },
     size:{
        type:String,
        required:true,

    },
     quantity:{
        type:Number,
        required:true,

    },
         payment_type:{
        type:String,
        required:true,

    },
     //discount eka and loyality points
     total_price: { type: Number, required: true },
     base_price: { type: Number, required: false },
     
     
     loyalty_discount: { type: Number, required: false, default: 0 },
     used_loyalty_points: { type: Boolean, required: false, default: false },
     
     
     promotion_discount: { type: Number, required: false, default: 0 },
     has_promotion: { type: Boolean, required: false, default: false },
     promotion_title: { type: String, required: false },
     promotion_id: { type: String, required: false },
     
     payment_id:{
         type:String,
         required:false,
     },

    //order status yooo
    status:{
        type:String,
        enum:["Processing","Delivering","Delivered"],
        default:"Processing",
    },


});


module.exports = mongoose.model(
    "OrderModel",
    orderSchema
)


