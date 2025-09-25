const Order = require("../Models/OrderModel");
const Register = require("../Models/UserModel");
const UserController = require("./UserController");

// ✅ Get all orders
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("product_id")
            .populate("userId", "username email"); // optional: show user info

        if (!orders || orders.length === 0) {
            return res.status(404).json({ message: "No orders found" });
        }

        return res.status(200).json({ orders });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching orders" });
    }
};

// ✅ Add new order
const addOrders = async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
    }

    console.log("Incoming body:", req.body);

    const { customer_name, customer_address, product_id, size, quantity, payment_type } = req.body;

    try {
        // optional: validate user exists
        const user = await Register.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const order = new Order({
            userId,
            customer_name,
            customer_address,
            product_id,
            size,
            quantity,
            payment_type,
        });

        await order.save();
        await UserController.updateLoyaltyPoints(userId);
        return res.status(201).json({ order });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error creating order" });
    }
  
};

// ✅ Get order by ID
const getById = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findById(id)
            .populate("product_id")
            .populate("userId", "username email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({ order });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Error fetching order" });
    }
};

// ✅ Update order
const updateOrder = async (req, res) => {
    const { id } = req.params;
    const { customer_name, customer_address, size, quantity, payment_type, status } = req.body;

    try {
        const order = await Order.findByIdAndUpdate(
            id,
            { customer_name, customer_address, size, quantity, payment_type, status },
            { new: true } // return updated doc
        );

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        return res.status(200).json({ order });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unable to update order" });
    }
};

// ✅ Delete order
const deleteOrder = async (req, res) => {
    const { id } = req.params;

    try {
        const order = await Order.findByIdAndDelete(id);

        if (!order) {
            return res.status(404).json({ message: "Order not found, cannot delete" });
        }

        return res.status(200).json({ message: "Order deleted successfully" });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Unable to delete order" });
    }
};
// ✅ Get all orders for the logged-in user
const getUserOrders = async (req, res) => {
  const userId = req.user?.id; // set by auth middleware

  if (!userId) {
    return res.status(401).json({ message: "User not authenticated" });
  }

  try {
    const orders = await Order.find({ userId })
      .populate("product_id"); // optional: populate product info

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }

    return res.status(200).json({ orders });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Error fetching user orders" });
  }
};





module.exports = { getAllOrders, addOrders, getById, updateOrder, deleteOrder, getUserOrders };
