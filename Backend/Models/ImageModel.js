const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    image:{
        type:String,//dataType
        required:true,//validate
    },
    
});

module.exports = mongoose.model(
    "ImageModel",//filename
    ImageSchema //functionName
)