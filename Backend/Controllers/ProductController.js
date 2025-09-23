const Product = require("../Models/ProductModel");

const addProducts = async (req, res) => {
  const { pname, pcode, pamount, psize, pcolor, pdescription } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const product = new Product({
      pname,
      pcode,
      pamount,
      psize,
      pcolor,
      pdescription,
      image: imagePath
    });
    await product.save();
    return res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add product" });
  }
};

const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { pname, pcode, pamount, psize, pcolor, pdescription } = req.body;
  const updateData = { pname, pcode, pamount, psize, pcolor, pdescription };

  // If a new image is uploaded, replace the old one
  if (req.file) {
    updateData.image = `/uploads/${req.file.filename}`;
  }

  try {
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update product" });
  }
};

module.exports = {
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      return res.status(200).json({ products });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching products" });
    }
  },
  addProducts,
  getById: async (req, res) => {
    try {
      const product = await Product.findById(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      return res.status(200).json({ product });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching product" });
    }
  },
  updateProduct,
  deleteProduct: async (req, res) => {
    try {
      const product = await Product.findByIdAndDelete(req.params.id);
      if (!product) return res.status(404).json({ message: "Product not found" });
      return res.status(200).json({ product });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error deleting product" });
    }
  }
};
