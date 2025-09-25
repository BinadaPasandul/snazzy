const Product = require("../Models/ProductModel");
const Promotion = require("../Models/PromotionModel");

//Data Insert 
const addProducts = async (req, res) => {
  const { pname, pcode, pamount, psize, pcolor, pdescription, quantity  } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const product = new Product({
      pname,
      pcode,
      pamount,
      psize,
      pcolor,
      pdescription,
      quantity: quantity || 0,
      image: imagePath
    });
    await product.save();
    return res.status(201).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to add product" });
  }
};

//Data Update
const updateProduct = async (req, res) => {
  const id = req.params.id;
  const { pname, pcode, pamount, psize, pcolor, pdescription, quantity } = req.body;

  const updateData = { pname, pcode, pamount, psize, pcolor, pdescription };

  if (typeof quantity !== "undefined") updateData.quantity = quantity; // ✅

  if (req.file) updateData.image = `/uploads/${req.file.filename}`;

  try {
    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.status(200).json({ product });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Unable to update product" });
  }
};

// Purchase Product
const purchaseProduct = async (req, res) => {
  const { quantity } = req.body; 
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    if (product.quantity < quantity) {
      return res.status(400).json({ message: "Not enough stock available" });
    }

    product.quantity -= quantity;  
    await product.save();

    return res.status(200).json({ product, message: "Purchase successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error processing purchase" });
  }
};



// Helper function to calculate discounted price
const calculateDiscountedPrice = (originalPrice, discountPercentage) => {
  const discount = (originalPrice * discountPercentage) / 100;
  return originalPrice - discount;
};

// Helper function to check if promotion is active
const isPromotionActive = (startDate, endDate) => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  return now >= start && now <= end;
};

module.exports = {
  getAllProducts: async (req, res) => {
    try {
      const products = await Product.find();
      
      // Get all active promotions
      const promotions = await Promotion.find();
      const activePromotions = promotions.filter(promo => 
        isPromotionActive(promo.startDate, promo.endDate)
      );
      
      // Add promotion info to products
      const productsWithPromotions = products.map(product => {
        const productPromotion = activePromotions.find(promo => 
          promo.productId === product.pcode
        );
        
        if (productPromotion) {
          const discountedPrice = calculateDiscountedPrice(product.pamount, productPromotion.discount);
          return {
            ...product.toObject(),
            promotion: {
              id: productPromotion._id,
              title: productPromotion.title,
              discount: productPromotion.discount,
              startDate: productPromotion.startDate,
              endDate: productPromotion.endDate,
              bannerImage: productPromotion.bannerImage
            },
            originalPrice: product.pamount,
            discountedPrice: discountedPrice,
            hasActivePromotion: true
          };
        }
        
        return {
          ...product.toObject(),
          hasActivePromotion: false
        };
      });
      
      return res.status(200).json({ products: productsWithPromotions });
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
      
      // Check for active promotion for this product
      const promotions = await Promotion.find();
      const activePromotions = promotions.filter(promo => 
        isPromotionActive(promo.startDate, promo.endDate)
      );
      
      const productPromotion = activePromotions.find(promo => 
        promo.productId === product.pcode
      );
      
      if (productPromotion) {
        const discountedPrice = calculateDiscountedPrice(product.pamount, productPromotion.discount);
        const productWithPromotion = {
          ...product.toObject(),
          promotion: {
            id: productPromotion._id,
            title: productPromotion.title,
            discount: productPromotion.discount,
            startDate: productPromotion.startDate,
            endDate: productPromotion.endDate,
            bannerImage: productPromotion.bannerImage
          },
          originalPrice: product.pamount,
          discountedPrice: discountedPrice,
          hasActivePromotion: true
        };
        return res.status(200).json({ product: productWithPromotion });
      }
      
      return res.status(200).json({ 
        product: {
          ...product.toObject(),
          hasActivePromotion: false
        }
      });
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
  },
  purchaseProduct,
  
  // Get product with promotion details by product code
  getProductByCode: async (req, res) => {
    try {
      const { productCode } = req.params;
      const product = await Product.findOne({ pcode: productCode });
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check for active promotion
      const promotions = await Promotion.find();
      const activePromotions = promotions.filter(promo => 
        isPromotionActive(promo.startDate, promo.endDate)
      );
      
      const productPromotion = activePromotions.find(promo => 
        promo.productId === product.pcode
      );
      
      if (productPromotion) {
        const discountedPrice = calculateDiscountedPrice(product.pamount, productPromotion.discount);
        return res.status(200).json({
          product: {
            ...product.toObject(),
            promotion: {
              id: productPromotion._id,
              title: productPromotion.title,
              discount: productPromotion.discount,
              startDate: productPromotion.startDate,
              endDate: productPromotion.endDate,
              bannerImage: productPromotion.bannerImage
            },
            originalPrice: product.pamount,
            discountedPrice: discountedPrice,
            hasActivePromotion: true
          }
        });
      }
      
      return res.status(200).json({
        product: {
          ...product.toObject(),
          hasActivePromotion: false
        }
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Error fetching product" });
    }
  }
};
