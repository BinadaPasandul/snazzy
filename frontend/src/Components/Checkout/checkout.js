import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api"; // your axios instance

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get product data from ProductDetail
  const { productCode, productPrice } = location.state || {};

  const [form, setForm] = useState({
    customer_name: "",
    customer_address: "",
    product_id: productCode || "", // auto-fill from navigation
    size: "",
    quantity: 1,
    payment_type: "cash",
  });

  useEffect(() => {
    if (productCode) {
      setForm((prev) => ({ ...prev, product_id: productCode }));
    }
  }, [productCode]);

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
      navigate("/myorders");
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      alert("⚠️ Error placing order");
    }
  };

  return (
    <div
      className="checkout-container"
      style={{ display: "flex", gap: "20px", padding: "20px" }}
    >
      {/* Left Side - Checkout Form */}
      <div style={{ flex: 1 }}>
        <h2>Checkout</h2>
        <form onSubmit={handleSubmit} className="checkout-form">
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

          {/* Product Code (auto-filled, read-only) */}
          <input
            type="text"
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            readOnly
          />

          {/* Show product price (not editable, just display) */}
          {productPrice && (
            <p>
              <strong>Price:</strong> ${productPrice}
            </p>
          )}

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

          <select
            name="payment_type"
            value={form.payment_type}
            onChange={handleChange}
          >
            <option value="cash">Cash on Delivery</option>
            <option value="card">Card</option>
          </select>

          {/* ✅ Show submit button only if payment type is cash */}
          {form.payment_type === "cash" && (
            <button type="submit">Submit Order</button>
          )}
        </form>
      </div>

      {/* Right Side - Card Payment */}
      <div style={{ flex: 1 }}>
        {form.payment_type === "card" ? (
          <iframe
            src="/pay"
            title="Card Payment"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              minHeight: "500px",
            }}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              border: "1px dashed gray",
              borderRadius: "8px",
              padding: "20px",
            }}
          >
            <p>👉 Select "Card" as payment type to proceed with card payment</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Checkout;
