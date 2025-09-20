const express = require("express");
const router = express.Router();

//Insert Model
const Product = require("../Models/ProductModel");

//Insert Product Controller
const ProductController = require("../Controllers/ProductControllers");

router.get("/",ProductController.getAllProducts);
router.post("/",ProductController.addProducts);
router.get("/:id",ProductController.getById);
router.put("/:id",ProductController.updateProduct);
router.delete("/:id",ProductController.deleteProduct);

//export
module.exports = router;