const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware")
const OrderController = require("../Controllers/OrderController");

// GET all orders
router.get("/",auth(), OrderController.getAllOrders);
router.post("/",auth(), OrderController.addOrders);
// ✅ Get all orders for the logged-in user
router.get("/user", auth(), OrderController.getUserOrders);
router.get("/:id",auth(),OrderController.getById); //get order by Id thingggggg
router.put("/:id",auth(),OrderController.updateOrder)//update order thnggg
router.delete("/:id",auth(), OrderController.deleteOrder); // delete order by id



module.exports = router;
