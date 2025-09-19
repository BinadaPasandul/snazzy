import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const URL = "http://localhost:5000/orders";

function Checkout() {
  const [form, setForm] = useState({
    customer_name: "",
    customer_address: "",
    size: "",
    quantity: 1,
    payment_type: "cash"
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(URL, form);
      alert("Order placed successfully!");
      navigate("/"); // redirect wherever you want
    } catch (err) {
      console.error(err);
      alert("Error placing order");
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
          name="size" 
          placeholder="Shoe Size (e.g. 42)" 
          onChange={handleChange} 
          required 
        />

        <input 
          type="number" 
          name="quantity" 
          min="1"
          placeholder="Quantity" 
          onChange={handleChange} 
          required 
        />

        <select name="payment_type" onChange={handleChange}>
          <option value="cash">Cash on Delivery</option>
          <option value="card">Card</option>
        </select>

        <button type="submit">Submit Order</button>
      </form>
    </div>
  );
}

export default Checkout;
