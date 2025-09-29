import React, { useEffect, useState } from "react";
import api from "../../utils/api"; //  axios instance with JWT
import ChatPopup from "../Payment/ChatPopup"; // Import chat popup component
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";
import "./myorders.css";

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
      const res = await api.get("/orders/user"); // current user's orders
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
      await api.post(`/refund/request/${selectedOrderForRefund.paymentId}`, {
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




  const stats = orders.reduce(
    (acc, o) => {
      acc.total += 1;
      const status = o.status || "Processing";
      if (status === "Delivered") acc.delivered += 1;
      else if (status === "Delivering") acc.delivering += 1;
      else acc.processing += 1;
      const price = typeof o.total_price === "number" ? o.total_price : parseFloat(o.total_price) || 0;
      acc.spent += price;
      return acc;
    },
    { total: 0, delivered: 0, delivering: 0, processing: 0, spent: 0 }
  );

  if (loading) {
    return (
      <div>
        <Nav />
        <div className="my-orders-page">
          <div className="mo-container">
            <div className="mo-header">
              <h1 className="mo-title">My Orders</h1>
              <p className="mo-subtitle">Track and manage your orders</p>
            </div>
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p className="loading-text">Loading your orders...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Nav />
      <div className="my-orders-page">
        <div className="mo-container">
          <div className="mo-header">
            <h1 className="mo-title">My Orders</h1>
            <p className="mo-subtitle">Track and manage your orders</p>
          </div>

          {orders.length === 0 ? (
            <div className="mo-empty-state">
              <div className="empty-icon">📦</div>
              <h3 className="empty-title">No Orders Yet</h3>
              <p className="empty-message">You haven't placed any orders yet. Start shopping to see your orders here!</p>
              <button className="shop-now-btn" onClick={() => window.location.href = '/home'}>
                Start Shopping
              </button>
            </div>
          ) : (
            <>
              <div className="mo-stats">
                <div className="mo-stat">
                  <div className="mo-stat-icon">📋</div>
                  <div className="mo-stat-info">
                    <div className="mo-stat-value">{stats.total}</div>
                    <div className="mo-stat-label">Total Orders</div>
                  </div>
                </div>
                <div className="mo-stat">
                  <div className="mo-stat-icon">✅</div>
                  <div className="mo-stat-info">
                    <div className="mo-stat-value">{stats.delivered}</div>
                    <div className="mo-stat-label">Delivered</div>
                  </div>
                </div>
                <div className="mo-stat">
                  <div className="mo-stat-icon">🚚</div>
                  <div className="mo-stat-info">
                    <div className="mo-stat-value">{stats.delivering}</div>
                    <div className="mo-stat-label">Delivering</div>
                  </div>
                </div>
                <div className="mo-stat">
                  <div className="mo-stat-icon">⏳</div>
                  <div className="mo-stat-info">
                    <div className="mo-stat-value">{stats.processing}</div>
                    <div className="mo-stat-label">Processing</div>
                  </div>
                </div>
              </div>

              <div className="orders-section">
                <h2 className="orders-section-title">Your Orders</h2>
                <div className="orders-grid">
                  {orders.map((order) => (
                    <div key={order._id} className="order-card">
                      <div className="order-header">
                        <div className="order-id">#{order._id.slice(-8)}</div>
                        <div className={`order-status status-${order.status?.toLowerCase() || 'processing'}`}>
                          {order.status || "Processing"}
                        </div>
                      </div>

                      <div className="order-content">
                        <div className="product-info">
                          <h3 className="product-name">{order.product_name}</h3>
                          <div className="product-details">
                            <span className="product-id">ID: {order.product_id}</span>
                            <span className="product-size">Size: {order.size}</span>
                            <span className="product-quantity">Qty: {order.quantity}</span>
                          </div>
                        </div>

                        <div className="order-details">
                          <div className="detail-row">
                            <span className="detail-label">Total Price:</span>
                            <span className="detail-value price">${order.total_price?.toFixed ? order.total_price.toFixed(2) : order.total_price}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Payment:</span>
                            <span className="detail-value">{order.payment_type}</span>
                          </div>
                          <div className="detail-row">
                            <span className="detail-label">Address:</span>
                            <span className="detail-value address">{order.customer_address}</span>
                          </div>
                        </div>

                        <div className="order-actions">
                          {!getRefundStatus(order._id) && order.payment_id && order.status !== "Delivered" && order.status !== "Delivering" ? (
                            <button 
                              className="action-btn refund-btn" 
                              onClick={() => handleRefundClick(order._id, order.payment_id)}
                            >
                              Request Refund
                            </button>
                          ) : getRefundStatus(order._id) ? (
                            <div className="refund-status-container">
                              <div className={`refund-status refund-${getRefundStatus(order._id)}`}>
                                Refund: {getRefundStatus(order._id)}
                              </div>
                              {order.payment_id && (
                                <button 
                                  className="action-btn chat-btn" 
                                  onClick={() => setOpenChatForPayment(order.payment_id)}
                                >
                                  💬 Chat
                                </button>
                              )}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
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
        <div className="refund-dialog-overlay">
          <div className="refund-dialog">
            <div className="dialog-header">
              <h3 className="dialog-title">Select Refund Reason</h3>
              <p className="dialog-subtitle">Please select a reason for your refund request</p>
            </div>
            
            <div className="reasons-list">
              {[
                "Ordered by mistake",
                "Found a better price elsewhere", 
                "Delivery time too long",
                "Changed mind / no longer needed",
                "Other"
              ].map((reason) => (
                <label
                  key={reason}
                  className={`reason-option ${selectedReason === reason ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="refundReason"
                    value={reason}
                    checked={selectedReason === reason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                  />
                  <span className="reason-text">{reason}</span>
                </label>
              ))}
            </div>

            <div className="dialog-actions">
              <button className="dialog-btn cancl-btn" onClick={handleCancelRefund}>
                Cancel
              </button>
              <button 
                className={`dialog-btn submt-btn ${!selectedReason ? 'disabled' : ''}`}
                onClick={handleRefundSubmit}
                disabled={!selectedReason}
              >
                Submit Refund Request
              </button>
            </div>
          </div>
        </div>
      )}
      
    </div>
    
    </div>
    <Footer />
    </div>
  );
}

export default MyOrders;
