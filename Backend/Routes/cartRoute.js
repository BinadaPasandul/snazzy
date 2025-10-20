const express = require("express");
const router = express.Router();
const cartController = require("../Controllers/CartController");
const authMiddleware = require("../Middleware/authMiddleware");

// Apply authentication middleware to all cart routes
router.use(authMiddleware());

// Get user's cart
router.get("/", cartController.getCart);

// Add item to cart
router.post("/add", cartController.addToCart);

// Update cart item quantity
router.put("/item/:itemId", cartController.updateCartItem);

// Remove item from cart
router.delete("/item/:itemId", cartController.removeFromCart);

// Clear entire cart
router.delete("/clear", cartController.clearCart);

// Get cart item count
router.get("/count", cartController.getCartItemCount);

module.exports = router;
