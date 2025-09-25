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

  const handleRefund = async (orderId) => {
    if (!window.confirm("Are you sure you want to request a refund for this order?")) return;

    try {
      await api.post(`/orders/${orderId}/refund`); // ✅ backend route for refund
      alert("Refund request submitted successfully!");
      fetchOrders(); // refresh orders after refund
    } catch (err) {
      console.error("Refund failed:", err.response?.data || err.message);
      alert("Failed to request refund.");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "green";
      case "Delivering":
        return "orange";
      case "Packing":
      default:
        return "blue";
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div>
      <h2>My Orders</h2>
      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <table
          border="1"
          cellPadding="8"
          style={{ marginTop: "20px", borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Product Name</th>
              <th>Product ID</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Total Price</th>
              <th>Delivery Address</th>
              <th>Payment Type</th>
              <th>Status</th>
              <th>Action</th> {/* ✅ Refund button column */}
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.product_name}</td>
                <td>{order.product_id}</td>
                <td>{order.size}</td>
                <td>{order.quantity}</td>
                <td>{order.total_price}</td>
                <td>{order.customer_address}</td>
                <td>{order.payment_type}</td>
                <td>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "4px",
                      color: "white",
                      backgroundColor: getStatusColor(order.status),
                      fontWeight: "bold",
                    }}
                  >
                    {order.status || "Packing"}
                  </span>
                </td>
                <td>
                  {/* ✅ Show refund button only if NOT delivered */}
                  {order.status !== "Delivered" && (
                    <button
                      onClick={() => handleRefund(order._id)}
                      style={{
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        padding: "6px 10px",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Refund
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyOrders;
