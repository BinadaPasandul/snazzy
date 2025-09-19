import React, { useEffect, useState } from "react";
import Nav from "../Navbar/nav";
import axios from "axios";

const URL = "http://localhost:5000/orders";

const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [editingOrder, setEditingOrder] = useState(null); 
  const [formData, setFormData] = useState({
    customer_name: "",
    customer_address: "",
    shoe_description: "",
    shoe_price: "",
    size: "",
    quantity: "",
    payment_type: ""
  });

  useEffect(() => {
    fetchHandler().then((data) => setOrders(data.Orders));
  }, []);

  const openEditModal = (order) => {
    setEditingOrder(order);
    setFormData({
      customer_name: order.customer_name,
      customer_address: order.customer_address,
      shoe_description: order.shoe_description,
      shoe_price: order.shoe_price,
      size: order.size,
      quantity: order.quantity,
      payment_type: order.payment_type
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
      const res = await axios.put(`${URL}/${editingOrder._id}`, formData);
      const updated = res.data.order ?? formData;
      setOrders((prev) =>
        prev.map((o) => (o._id === editingOrder._id ? { ...o, ...updated } : o))
      );
      closeModal();
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this order?");
    if (!confirmDelete) return;
    try {
      await axios.delete(`${URL}/${id}`);
      setOrders((prev) => prev.filter((o) => o._id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete order");
    }
  };

  return (
    <div>
      <Nav />
      <h2>Order Manager - Display Order Details</h2>

      {orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Customer Name</th>
              <th>Address</th>
              <th>Shoe Description</th>
              <th>Price</th>
              <th>Size</th>
              <th>Quantity</th>
              <th>Payment Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.customer_name}</td>
                <td>{order.customer_address}</td>
                <td>{order.shoe_description}</td>
                <td>{order.shoe_price}</td>
                <td>{order.size}</td>
                <td>{order.quantity}</td>
                <td>{order.payment_type}</td>
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
      )}

      {/* Modal */}
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
            alignItems: "center"
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "400px"
            }}
          >
            <h3>Edit Order</h3>
            <form onSubmit={handleUpdate}>
              <div>
                <label>Customer Name:</label>
                <input
                  type="text"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Address:</label>
                <input
                  type="text"
                  name="customer_address"
                  value={formData.customer_address}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Shoe Description:</label>
                <input
                  type="text"
                  name="shoe_description"
                  value={formData.shoe_description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Price:</label>
                <input
                  type="number"
                  name="shoe_price"
                  value={formData.shoe_price}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Size:</label>
                <input
                  type="text"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Quantity:</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label>Payment Type:</label>
                <input
                  type="text"
                  name="payment_type"
                  value={formData.payment_type}
                  onChange={handleChange}
                  required
                />
              </div>
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
