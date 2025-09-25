import React, { useEffect, useState } from "react";
import Nav from "../Navbar/nav";
import api from "../../utils/api"; // axios instance with JWT

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_address: "",
    product_id: "",
    size: "",
    quantity: "",
    payment_type: "",
    status: "Packing", // ✅ new default
  });

  // Fetch orders
  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data || err.message);
      alert("Failed to fetch orders. Are you logged in?");
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Open modal to edit
  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      customer_name: order.customer_name || "",
      customer_address: order.customer_address || "",
      product_id: order.product_id || "",
      size: order.size || "",
      quantity: order.quantity || "",
      payment_type: order.payment_type || "",
      status: order.status || "Packing",
    });
  };

  const closeModal = () => {
    setEditingOrder(null);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.put(`/orders/${editingOrder._id}`, formData);
      const updatedOrder = res.data.order || formData;
      setOrders((prev) =>
        prev.map((o) => (o._id === editingOrder._id ? { ...o, ...updatedOrder } : o))
      );
      closeModal();
    } catch (err) {
      console.error("Failed to update order:", err.response?.data || err.message);
      alert("Failed to update order");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;
    try {
      await api.delete(`/orders/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error("Failed to delete order:", err.response?.data || err.message);
      alert("Failed to delete order");
    }
  };

  // ✅ handle inline status change from table
  const handleStatusChange = async (id, newStatus) => {
    try {
      const orderToUpdate = orders.find((o) => o._id === id);
      const res = await api.put(`/orders/${id}`, {
        ...orderToUpdate,
        status: newStatus,
      });
      const updatedOrder = res.data.order;
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? updatedOrder : o))
      );
    } catch (err) {
      console.error("Failed to update status:", err.response?.data || err.message);
      alert("Failed to update status");
    }
  };

  return (
    <div>
      <Nav />
      <h2>Order Manager - Display Order Details</h2>

      {orders.length > 0 ? (
        <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Order ID</th> {/* ✅ Added column */}
              <th>Customer Name</th>
              <th>Address</th>
              <th>Product ID</th>
              <th>Product Name</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Payment Type</th>
              <th>Status</th> {/* ✅ new column */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td> {/* ✅ Show Order ID */}
                <td>{order.customer_name}</td>
                <td>{order.customer_address}</td>
                <td>{order.product_id}</td>
                <td>{order.product_name}</td>
                <td>{order.size}</td>
                <td>{order.quantity}</td>
                <td>{order.total_price}</td>
                <td>{order.payment_type}</td>
                <td>
                  <select
                    value={order.status || "Packing"}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  >
                    <option value="Packing">Processing</option>
                    <option value="Delivering">Delivering</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => openEditModal(order)}>Edit</button>
                  <button
                    style={{ marginLeft: 8 }}
                    onClick={() => handleDelete(order._id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No orders found</p>
      )}

      {/* Edit Modal */}
      {editingOrder && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "400px",
            }}
          >
            <h3>Edit Order</h3>
            <form onSubmit={handleUpdate}>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                placeholder="Customer Name"
                required
              />
              <input
                type="text"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
                placeholder="Address"
                required
              />
              <input
                type="text"
                name="product_id"
                value={formData.product_id}
                onChange={handleChange}
                placeholder="Product ID"
                required
              />
              <input
                type="text"
                name="size"
                value={formData.size}
                onChange={handleChange}
                placeholder="Size"
                required
              />
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                placeholder="Quantity"
                required
              />
              <input
                type="text"
                name="payment_type"
                value={formData.payment_type}
                onChange={handleChange}
                placeholder="Payment Type"
                required
              />
              {/* ✅ Status field in modal */}
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                style={{ marginTop: "10px", width: "100%" }}
              >
                <option value="Packing">Processing</option>
                <option value="Delivering">Delivering</option>
                <option value="Delivered">Delivered</option>
              </select>
              <div style={{ marginTop: "10px" }}>
                <button type="submit">Save</button>
                <button type="button" onClick={closeModal} style={{ marginLeft: "10px" }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrderManager;
