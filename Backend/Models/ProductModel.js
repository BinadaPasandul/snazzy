
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  pname:       { type: String, required: true },
  pcode:       { type: String, required: true },
  pamount:     { type: Number, required: true },
  psize:       { type: Number, required: true },
  pcolor:      { type: String, required: true },
  pdescription:{ type: String, required: true },
  image:       { type: String },
  quantity:    { type: Number, required: true, default: 0 }
});

module.exports = mongoose.model("ProductModel", ProductSchema);
