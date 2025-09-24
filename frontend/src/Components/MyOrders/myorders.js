import React, { useEffect, useState } from "react";
import axios from "axios";

const URL = "http://localhost:5000/orders/user";

function MyOrders({ userId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    axios.get(`${URL}/${userId}`)
      .then((res) => setOrders(res.data.orders))
      .catch((err) => console.error(err));
  }, [userId]);

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
              <th>Shoe Name</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Size</th>
              <th>Delivery Address</th>
              <th>Payment Type</th>
              <th>Order Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order._id}</td>
                <td>{order.shoe_name || "Pending"}</td>
                <td>{order.price || "Pending"}</td>
                <td>{order.quantity}</td>
                <td>{order.size}</td>
                <td>{order.customer_address}</td>
                <td>{order.payment_type}</td>
                <td>{order.order_status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyOrders;
