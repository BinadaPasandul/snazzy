const express = require("express");
const router = express.Router();
const upload = require("../Middleware/uploadMiddleware");
const ProductController = require("../Controllers/ProductController");

router.get("/", ProductController.getAllProducts);
router.post("/", upload.single("image"), ProductController.addProducts);
router.get("/:id", ProductController.getById);
router.put("/:id", upload.single("image"), ProductController.updateProduct);
router.delete("/:id", ProductController.deleteProduct);

module.exports = router;
