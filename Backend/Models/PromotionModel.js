const mongoose = require("mongoose");
const Schema = mongoose.Schema;

//promotion input details from the fronted form
const PromotionSchema = new Schema({
    title: { 
        type: String, //datatype
        required: true  //validate
    },
    productId: {
        type: String,
        required:true //validate
    },
    description: { 
        type: String  
    },
    discount: { 
        type: Number, 
        required: true   //validate
    },
    startDate: { 
        type: Date, 
        required: true 
    },
    endDate: { 
        type: Date, 
        required: true 
    },
    bannerImage: { 
        type: String 
    }
 });

module.exports = mongoose.model(
    "PromotionModel", //file name
    PromotionSchema //function name
);
