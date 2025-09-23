const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  pname: { type: String, required: true },
  pcode: { type: String, required: true },
  pamount: { type: Number, required: true },
  psize: { type: Number, required: true },
  pcolor: { type: String, required: true },
  pdescription: { type: String, required: true },

  // ✅ New field to store image path
  image: { type: String } // e.g. "/uploads/filename.jpg"
});

module.exports = mongoose.model("ProductModel", ProductSchema);
