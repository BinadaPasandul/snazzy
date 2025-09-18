import React, { useEffect, useState } from "react";
import Nav from "../Navbar/nav";
import axios from "axios";

const URL = "http://localhost:5000/orders"; // lowercase localhost!

// get the data
const fetchHandler = async () => {
  return await axios.get(URL).then((res) => res.data);
};

function OrderManager() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetchHandler().then((data) => setOrders(data.Orders)); // uppercase O
  }, []);

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

  const handleEdit = async (order) => {
    const customer_name = window.prompt("Customer Name", order.customer_name);
    if (customer_name === null) return;
    const customer_address = window.prompt("Customer Address", order.customer_address);
    if (customer_address === null) return;
    const shoe_description = window.prompt("Shoe Description", order.shoe_description);
    if (shoe_description === null) return;
    const shoe_priceInput = window.prompt("Price", String(order.shoe_price));
    if (shoe_priceInput === null) return;
    const shoe_price = Number(shoe_priceInput);
    const payment_type = window.prompt("Payment Type", order.payment_type);
    if (payment_type === null) return;

    try {
      const body = { customer_name, customer_address, shoe_description, shoe_price, payment_type };
      const res = await axios.put(`${URL}/${order._id}`, body);
      const updated = res.data.order ?? body;
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, ...updated } : o)));
    } catch (err) {
      console.error(err);
      alert("Failed to update order");
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
                <td>{order.payment_type}</td>
                <td>
                  <button onClick={() => handleEdit(order)}>Edit</button>
                  <button style={{ marginLeft: 8 }} onClick={() => handleDelete(order._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default OrderManager;
