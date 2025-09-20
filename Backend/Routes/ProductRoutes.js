const express = require("express");
const router = express.Router();
const authMiddleware = require('../Middleware/authMiddleware');

//Insert Model
const Product = require("../Models/ProductModel");

//Insert Product Controller
const ProductController = require("../Controllers/ProductControllers");

router.get("/",authMiddleware(),ProductController.getAllProducts);
router.post("/",authMiddleware(),ProductController.addProducts);
router.get("/:id",authMiddleware(),ProductController.getById);
router.put("/:id",authMiddleware(),ProductController.updateProduct);
router.delete("/:id",authMiddleware(),ProductController.deleteProduct);

//export
module.exports = router;