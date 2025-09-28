import React, { useEffect, useState } from "react";
import Nav from "../Navbar/nav";
import Footer from '../Footer/Footer';
import api from "../../utils/api"; // axios instance with JWT
import "./ordermanager.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  // Discount statistics
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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredOrders = normalizedQuery
    ? orders.filter((order) => {
        const fields = [
          order._id,
          order.customer_name,
          order.customer_address,
          order.product_id,
          order.product_name,
          order.size,
          String(order.quantity),
          order.payment_type,
          order.status,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        return fields.some((f) => f.includes(normalizedQuery));
      })
    : orders;

  // ✅ PDF generator
  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Orders Report", 14, 22);

    const tableColumn = [
      "Order ID",
      "Customer Name",
      "Address",
      "Product ID",
      "Product Name",
      "Quantity",
      "Total Price",
      "Status"
    ];

    const tableRows = orders.map(order => [
      order._id,
      order.customer_name,
      order.customer_address,
      order.product_id,
      order.product_name,
      order.quantity,
      `$${order.total_price.toFixed(2)}`,
      order.status
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
    });

    doc.save("orders_report.pdf");
  };

  return (
    <div>
      <Nav />
      <div className="om-container">
        <div className="om-header">
          <h2 className="om-title">Order Manager Dashboard</h2>
          <div className="om-actions">
            <button className="btn btn-primary1" onClick={generatePDF}>
              Download Order Report
            </button>
          </div>
          <div className="om-search">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, customer, product, status..."
              aria-label="Search orders"
            />
          </div>
        </div>

        {orders.length > 0 && (
          <div className="om-stats">
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Total Orders</div>
                <div className="om-stat-value">{orders.length}</div>
              </div>
              <div className="om-stat-icon">📋</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Promotion Discounts</div>
                <div className="om-stat-value om-danger">{discountStats.promotionDiscounts}</div>
              </div>
              <div className="om-stat-icon">🎯</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Loyalty Discounts</div>
                <div className="om-stat-value om-warn">{discountStats.loyaltyDiscounts}</div>
              </div>
              <div className="om-stat-icon">⭐</div>
            </div>
            <div className="om-stat">
              <div className="om-stat-info">
                <div className="om-stat-label">Total Discounts Given</div>
                <div className="om-stat-value om-success">${discountStats.totalDiscountAmount.toFixed(2)}</div>
              </div>
              <div className="om-stat-icon">💰</div>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="orders-section">
          <div className="orders-header">
            <h2 className="orders-title">Orders Management</h2>
            <div className="orders-info">
              <span className="orders-count">
                {filteredOrders.length} of {orders.length} orders
              </span>
            </div>
          </div>

          {filteredOrders.length > 0 ? (
            <div className="om-table-container">
              <table className="om-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
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
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="om-mono">{order._id}</td>
                      <td>{order.customer_name}</td>
                      <td>{order.customer_address}</td>
                      <td className="om-mono">{order.product_id}</td>
                      <td>{order.product_name}</td>
                      <td>{order.size}</td>
                      <td>{order.quantity}</td>
                      <td>
                        {order.base_price ? `$${order.base_price.toFixed(2)}` : `$${order.total_price.toFixed(2)}`}
                      </td>
                      <td>
                        {order.has_promotion && order.promotion_discount > 0 ? (
                          <div>
                            <span className="om-badge om-danger">-{order.promotion_discount.toFixed(2)}</span>
                            <div className="om-subtext">{order.promotion_title || "Promotion"}</div>
                          </div>
                        ) : (
                          <span className="om-subtext">No promotion</span>
                        )}
                      </td>
                      <td>
                        {order.used_loyalty_points && order.loyalty_discount > 0 ? (
                          <span className="om-badge om-warn">-{order.loyalty_discount.toFixed(2)}</span>
                        ) : (
                          <span className="om-subtext">No loyalty discount</span>
                        )}
                      </td>
                      <td>
                        <span className={`om-price ${order.used_loyalty_points || order.has_promotion ? "om-warn" : ""}`}>
                          ${order.total_price.toFixed(2)}
                        </span>
                        {(order.used_loyalty_points || order.has_promotion) && (
                          <div className="om-subtext">
                            {order.has_promotion && order.used_loyalty_points
                              ? "Promotion + Loyalty"
                              : order.has_promotion
                              ? "Promotion Applied"
                              : "Loyalty Points Used"}
                          </div>
                        )}
                      </td>
                      <td>{order.payment_type}</td>
                      <td>
                        <select
                          className="status-select"
                          value={order.status || "Packing"}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        >
                          <option value="Packing">Processing</option>
                          <option value="Delivering">Delivering</option>
                          <option value="Delivered">Delivered</option>
                        </select>
                      </td>
                      <td>
                        <button className="btn btn-edit" onClick={() => openEditModal(order)}>Edit</button>
                        <button className="btn btn-delete" onClick={() => handleDelete(order._id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state-container">
              <p className="empty-state">{orders.length > 0 ? "No orders match your search." : "No orders found"}</p>
            </div>
          )}
        </div>

        {editingOrder && (
          <div className="om-modal-backdrop" onClick={closeModal}>
            <div className="om-modal" onClick={(e) => e.stopPropagation()}>
              <button className="om-modal-close" onClick={closeModal}>
                ×
              </button>
              <h3>Edit Order</h3>

              {(editingOrder.used_loyalty_points || editingOrder.has_promotion) && (
                <div className="om-discount-card">
                  <div className="om-discount-title">🎉 Discounts Applied</div>
                  <div className="om-subtext">
                    Base Price: ${editingOrder.base_price?.toFixed(2) || editingOrder.total_price.toFixed(2)}<br />
                    {editingOrder.has_promotion && (
                      <>
                        Promotion Discount: -${editingOrder.promotion_discount?.toFixed(2) || "0.00"} ({editingOrder.promotion_title || "Promotion"})<br />
                      </>
                    )}
                    {editingOrder.used_loyalty_points && (
                      <>
                        Loyalty Points Discount: -${editingOrder.loyalty_discount?.toFixed(2) || "0.00"}<br />
                      </>
                    )}
                    Final Price: ${editingOrder.total_price.toFixed(2)}
                  </div>
                </div>
              )}

              <form onSubmit={handleUpdate} className="om-form">
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  placeholder="Customer Name"
                  required
                  readOnly
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
                  readOnly
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
                  readOnly
                />
                <input
                  type="text"
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  placeholder="Payment Type"
                  required
                  readOnly
                />
                <select name="status" value={formData.status} onChange={handleChange} className="status-select">
                  <option value="Packing">Processing</option>
                  <option value="Delivering">Delivering</option>
                  <option value="Delivered">Delivered</option>
                </select>
                <div className="om-form-actions">
                  <button type="submit" className="btn btn-primary">Save</button>
                  <button type="button" className="btn btn-secondarye" onClick={closeModal}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
      <Footer/>
    </div>
  );
}

export default OrderManager;
