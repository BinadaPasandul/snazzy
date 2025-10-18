const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware")
const OrderController = require("../Controllers/OrderController");


router.get("/",auth(), OrderController.getAllOrders);
router.post("/",auth(), OrderController.addOrders);
router.get("/user", auth(), OrderController.getUserOrders);
router.get("/:id",auth(),OrderController.getById); //get order by Id thingggggg
router.put("/:id",auth(),OrderController.updateOrder)//update order thnggg
router.delete("/:id",auth(), OrderController.deleteOrder); 



module.exports = router;
