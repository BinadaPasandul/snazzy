const express = require("express");
const router = express.Router();
const upload = require("../Middleware/uploadMiddleware");
const authMiddleware = require('../Middleware/authMiddleware');


//Insert Product Controller
const ProductController = require("../Controllers/ProductControllers");

router.get("/", ProductController.getAllProducts);
router.post("/",authMiddleware(), upload.single("image"), ProductController.addProducts);
router.get("/code/:productCode", ProductController.getProductByCode);
router.get("/:id", ProductController.getById);
router.put("/:id",authMiddleware(), upload.single("image"), ProductController.updateProduct);
router.delete("/:id",authMiddleware(), ProductController.deleteProduct);
router.post("/:id/purchase",authMiddleware(), ProductController.purchaseProduct);

//export
module.exports = router;