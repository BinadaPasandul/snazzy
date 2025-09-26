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

  // Calculate discount statistics
  const discountStats = orders.reduce((stats, order) => {
    if (order.used_loyalty_points) {
      stats.loyaltyDiscounts += 1;
      stats.loyaltyDiscountAmount += order.loyalty_discount || 0;
    }
    if (order.has_promotion) {
      stats.promotionDiscounts += 1;
      stats.promotionDiscountAmount += order.promotion_discount || 0;
    }
    stats.totalDiscountAmount += (order.loyalty_discount || 0) + (order.promotion_discount || 0);
    return stats;
  }, { 
    loyaltyDiscounts: 0, 
    loyaltyDiscountAmount: 0,
    promotionDiscounts: 0,
    promotionDiscountAmount: 0,
    totalDiscountAmount: 0
  });

  return (
    <div>
      <Nav />
      <h2>Order Manager - Display Order Details</h2>
      
      {/* Loyalty Points Statistics */}
      {orders.length > 0 && (
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid #e2e8f0',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827' }}>
              {orders.length}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Orders</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626' }}>
              {discountStats.promotionDiscounts}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Promotion Discounts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {discountStats.loyaltyDiscounts}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Loyalty Discounts</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
              ${discountStats.totalDiscountAmount.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>Total Discounts Given</div>
          </div>
        </div>
      )}

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
              <th>Base Price</th>
              <th>Promotion Discount</th>
              <th>Loyalty Discount</th>
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
                <td>
                  {order.base_price ? `$${order.base_price.toFixed(2)}` : `$${order.total_price.toFixed(2)}`}
                </td>
                <td>
                  {order.has_promotion && order.promotion_discount > 0 ? (
                    <div>
                      <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                        -${order.promotion_discount.toFixed(2)}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {order.promotion_title || 'Promotion'}
                      </div>
                    </div>
                  ) : (
                    <span style={{ color: '#6b7280' }}>No promotion</span>
                  )}
                </td>
                <td>
                  {order.used_loyalty_points && order.loyalty_discount > 0 ? (
                    <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>
                      -${order.loyalty_discount.toFixed(2)}
                    </span>
                  ) : (
                    <span style={{ color: '#6b7280' }}>No loyalty discount</span>
                  )}
                </td>
                <td>
                  <span style={{ 
                    fontWeight: 'bold',
                    color: (order.used_loyalty_points || order.has_promotion) ? '#f59e0b' : '#111827'
                  }}>
                    ${order.total_price.toFixed(2)}
                  </span>
                  {(order.used_loyalty_points || order.has_promotion) && (
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {order.has_promotion && order.used_loyalty_points ? 'Promotion + Loyalty' : 
                       order.has_promotion ? 'Promotion Applied' : 'Loyalty Points Used'}
                    </div>
                  )}
                </td>
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
            
            {/* Display discount information */}
            {(editingOrder.used_loyalty_points || editingOrder.has_promotion) && (
              <div style={{
                backgroundColor: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '6px',
                padding: '10px',
                marginBottom: '15px',
                fontSize: '0.9rem'
              }}>
                <div style={{ fontWeight: 'bold', color: '#92400e', marginBottom: '5px' }}>
                  🎉 Discounts Applied
                </div>
                <div style={{ color: '#6b7280' }}>
                  Base Price: ${editingOrder.base_price?.toFixed(2) || editingOrder.total_price.toFixed(2)}<br/>
                  {editingOrder.has_promotion && (
                    <>
                      Promotion Discount: -${editingOrder.promotion_discount?.toFixed(2) || '0.00'} 
                      ({editingOrder.promotion_title || 'Promotion'})<br/>
                    </>
                  )}
                  {editingOrder.used_loyalty_points && (
                    <>
                      Loyalty Points Discount: -${editingOrder.loyalty_discount?.toFixed(2) || '0.00'}<br/>
                    </>
                  )}
                  Final Price: ${editingOrder.total_price.toFixed(2)}
                </div>
              </div>
            )}
            
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
