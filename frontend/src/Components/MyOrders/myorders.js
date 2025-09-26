import React, { useEffect, useState } from "react";
import api from "../../utils/api"; // your axios instance with JWT
import ChatPopup from "../Payment/ChatPopup"; // Import chat popup component
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openChatForPayment, setOpenChatForPayment] = useState(null);
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [selectedOrderForRefund, setSelectedOrderForRefund] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");

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

  const fetchRefunds = async () => {
    try {
      const res = await api.get("/refund/my-requests");
      setRefunds(res.data.refunds || []);
    } catch (err) {
      console.error("Failed to fetch refunds:", err.response?.data || err.message);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchRefunds();
  }, []);

  const handleRefundClick = (orderId, paymentId) => {
    setSelectedOrderForRefund({ orderId, paymentId });
    setShowReasonDialog(true);
  };

  const handleRefundSubmit = async () => {
    if (!selectedReason) {
      alert("Please select a reason for the refund request.");
      return;
    }

    try {
      const res = await api.post(`/refund/request/${selectedOrderForRefund.paymentId}`, {
        reason: selectedReason
      });
      alert("Refund request submitted successfully!");
      fetchRefunds(); // refresh refunds after request
      setShowReasonDialog(false);
      setSelectedOrderForRefund(null);
      setSelectedReason("");
    } catch (err) {
      console.error("Refund failed:", err.response?.data || err.message);
      alert("Failed to request refund.");
    }
  };

  const handleCancelRefund = () => {
    setShowReasonDialog(false);
    setSelectedOrderForRefund(null);
    setSelectedReason("");
  };

  const getRefundStatus = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    if (!order || !order.payment_id) return null;
    
    const refund = refunds.find(r => r.paymentId._id === order.payment_id);
    return refund ? refund.status : null;
  };


  const getStatusColor = (status) => {
    switch (status) {
      case "Delivered":
        return "green";
      case "Delivering":
        return "orange";
      case "Processing":
      default:
        return "blue";
    }
  };

  const getRefundStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "green";
      case "rejected":
        return "red";
      case "pending":
      default:
        return "orange";
    }
  };

  if (loading) {
    return <p>Loading orders...</p>;
  }

  return (
    <div>
       <Nav />
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
                    {order.status || "Processing"}
                  </span>
                </td>
                <td>
                  {/* Show refund button only if no refund request exists and order has payment_id */}
                  {!getRefundStatus(order._id) && order.payment_id && (
                    <button
                      onClick={() => handleRefundClick(order._id, order.payment_id)}
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
                  
                  {/* Show refund status if refund request exists */}
                  {getRefundStatus(order._id) && (
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          color: "white",
                          backgroundColor: getRefundStatusColor(getRefundStatus(order._id)),
                          fontWeight: "bold",
                          fontSize: "12px",
                        }}
                      >
                        Refund: {getRefundStatus(order._id)}
                      </span>
                      {order.payment_id && (
                        <button
                          onClick={() => setOpenChatForPayment(order.payment_id)}
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          💬 Chat
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Chat Popup for refund requests */}
      {openChatForPayment && (
        <ChatPopup
          paymentId={openChatForPayment}
          onClose={() => setOpenChatForPayment(null)}
        />
      )}

      {/* Refund Reason Selection Dialog */}
      {showReasonDialog && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "8px",
              width: "400px",
              maxWidth: "90%",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: "20px" }}>
              Select Refund Reason
            </h3>
            
            <div style={{ marginBottom: "20px" }}>
              <p style={{ marginBottom: "15px", fontWeight: "bold" }}>
                Please select a reason for your refund request:
              </p>
              
              {[
                "Ordered by mistake",
                "Found a better price elsewhere", 
                "Delivery time too long",
                "Changed mind / no longer needed",
                "Other"
              ].map((reason) => (
                <label
                  key={reason}
                  style={{
                    display: "block",
                    marginBottom: "10px",
                    cursor: "pointer",
                    padding: "8px",
                    borderRadius: "4px",
                    backgroundColor: selectedReason === reason ? "#e3f2fd" : "#f5f5f5",
                    border: selectedReason === reason ? "2px solid #2196f3" : "2px solid transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="refundReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    style={{ marginRight: "10px" }}
                  />
                  {reason}
                </label>
              ))}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                onClick={handleCancelRefund}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={!selectedReason}
                style={{
                  backgroundColor: selectedReason ? "#dc3545" : "#ccc",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: selectedReason ? "pointer" : "not-allowed",
                }}
              >
                Submit Refund Request
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
    <Footer />
    </div>
  );
}

export default MyOrders;
