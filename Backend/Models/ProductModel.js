const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    pname:{
        type:String,//dataType
        required:true,//validate
    },
    pcode:{
        type:String,
        required:true,
    },
    pamount:{
        type:Number,
        required:true,
    },
});

module.exports = mongoose.model(
    "ProductModel",//filename
    ProductSchema //functionName
)