const express = require("express");
const router = express.Router();

const PromotionController = require("../Controllers/PromotionController");
const upload = require("../Middleware/uploadMiddleware"); // your multer setup

// Routes
router.get("/", PromotionController.getAllPromotions);
router.post("/", upload.single("bannerImage"), PromotionController.addPromotions); // handle image
router.get("/:id", PromotionController.getById);
router.put("/:id", upload.single("bannerImage"), PromotionController.updatePromotion); // optional image update
router.delete("/:id", PromotionController.deletePromotion);

module.exports = router;
