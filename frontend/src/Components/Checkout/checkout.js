import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api"; // your axios instance

function Checkout() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customer_name: "",
    customer_address: "",
    product_id: "", // user will input this
    size: "",
    quantity: 1,
    payment_type: "cash",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.product_id) {
      alert("Product ID is required!");
      return;
    }

    try {
      await api.post("/orders", form);
      alert("✅ Order placed successfully!");
      navigate("/myorders"); // redirect after success
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      alert("⚠️ Error placing order");
    }
  };

  return (
    <div className="checkout">
      <h2>Checkout</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="customer_name"
          placeholder="Full Name"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="customer_address"
          placeholder="Delivery Address"
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="product_id"
          placeholder="Product ID"
          value={form.product_id}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="size"
          placeholder="Shoe Size (e.g. 42)"
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="quantity"
          min="1"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <select name="payment_type" value={form.payment_type} onChange={handleChange}>
          <option value="cash">Cash on Delivery</option>
          <option value="card">Card</option>
        </select>

        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
}

export default Checkout;
