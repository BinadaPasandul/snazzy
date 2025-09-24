import React, { useEffect, useState } from "react";
import api from "../../utils/api"; // your axios instance with JWT

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/user"); // fetch only current user's orders
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error("Failed to fetch orders:", err.response?.data || err.message);
      alert("Failed to fetch orders. Please make sure you are logged in.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product ID</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Delivery Address</th>
              <th>Payment Type</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.product_id}</td>
                <td>{order.size}</td>
                <td>{order.quantity}</td>
                <td>{order.customer_address}</td>
                <td>{order.payment_type}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyOrders;
