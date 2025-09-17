const express = require("express");
const router = express.Router();

const OrderController = require("../Controllers/OrderController");

// GET all orders
router.get("/", OrderController.getAllOrders);
router.post("/", OrderController.addOrders);
router.get("/:id",OrderController.getById); //get order by Id thingggggg
router.put("/:id",OrderController.updateOrder)//update order thnggg
router.delete("/:id", OrderController.deleteOrder); // delete order by id


module.exports = router;
