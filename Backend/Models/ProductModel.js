
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  pname:       { type: String, required: true },
  pcode:       { type: String, required: true },
  pamount:     { type: Number, required: true },
  pdescription:{ type: String, required: true },
  image:       { type: String }, // Keep for backward compatibility - will store first image
  images:      [{ type: String }], // Array of image paths for multiple images
  variants:    [{
    size:       { type: Number, required: true, min: 35, max: 44 },
    color:      { type: String, required: true },
    quantity:   { type: Number, required: true, default: 0, min: 0 }
  }],
  // Legacy fields for backward compatibility (deprecated)
  psize:       { type: Number },
  pcolor:      { type: String },
  quantity:    { type: Number, default: 0 }
});

module.exports = mongoose.model("ProductModel", ProductSchema);
