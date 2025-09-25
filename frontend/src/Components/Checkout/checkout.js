import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../../utils/api"; // your axios instance

function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get product data from ProductDetail
  const { productCode, productPrice, productname } = location.state || {};

  const [form, setForm] = useState({
    customer_name: "",
    product_name:productname,
    customer_address: "",
    product_id: productCode || "", // auto-fill from navigation
    size: "",
    quantity: 1,
    payment_type: "cash",
  });
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (productCode) {
      setForm((prev) => ({ ...prev, product_id: productCode }));
    }
  }, [productCode]);

  // Listen for payment success messages from iframe
  useEffect(() => {
    const handleMessage = async (event) => {
      if (event.data.type === 'PAYMENT_SUCCESS') {
        console.log('Payment successful:', event.data);
        setPaymentSuccess(true);
        
        // Automatically submit order after successful payment
        if (!form.product_id) {
          alert("Product ID is required!");
          return;
        }

        if (!form.customer_name || !form.customer_address || !form.size) {
          alert("Please fill in all required fields!");
          return;
        }

        const orderData = {
          ...form,
          total_price: form.quantity * productPrice,
        };

        try {
          await api.post("/orders", orderData);
          alert("✅ Order placed successfully!");
          navigate("/myorders");
        } catch (err) {
          console.error("Order failed:", err.response?.data || err.message);
          alert("⚠️ Error placing order");
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [form, productPrice, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({
      ...form,
      [name]: name === "quantity" ? Number(value) : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.product_id) {
      alert("Product ID is required!");
      return;
    }

    const orderData = {
      ...form,
      total_price: form.quantity * productPrice,
    };

    try {
      await api.post("/orders", orderData);
      alert("✅ Order placed successfully!");
      navigate("/myorders");
    } catch (err) {
      console.error("Order failed:", err.response?.data || err.message);
      alert("⚠️ Error placing order");
    }
  };

  // ✅ derived value for total price
  const totalPrice = productPrice ? form.quantity * productPrice : 0;
  
  // ✅ Check if all required fields are completed
  const isFormComplete = form.customer_name && form.customer_address && form.size && form.product_id;

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
             placeholder="Full Name *"
             value={form.customer_name}
             onChange={handleChange}
             required
             style={{
               border: !form.customer_name ? "2px solid #dc3545" : "1px solid #ccc"
             }}
           />
           <input
             type="text"
             name="customer_address"
             placeholder="Delivery Address *"
             value={form.customer_address}
             onChange={handleChange}
             required
             style={{
               border: !form.customer_address ? "2px solid #dc3545" : "1px solid #ccc"
             }}
           />

          {/* Product Code (auto-filled, read-only) */}
          <input
            type="text"
            name="product_id"
            value={form.product_id}
            onChange={handleChange}
            readOnly
          />

          {/* Product Price & Total Price */}
          {productPrice && (
            <p>
              <strong>Unit Price:</strong> ${productPrice}
            </p>
          )}
          <input
            type="number"
            name="quantity"
            min="1"
            value={form.quantity}
            onChange={handleChange}
            required
          />
          <p>
            <strong>Total Price:</strong> ${totalPrice}
          </p>

           <input
             type="text"
             name="size"
             placeholder="Shoe Size (e.g. 42) *"
             value={form.size}
             onChange={handleChange}
             required
             style={{
               border: !form.size ? "2px solid #dc3545" : "1px solid #ccc"
             }}
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

          {/* Show payment success status */}
          {form.payment_type === "card" && paymentSuccess && (
            <div style={{ 
              background: "#d4edda", 
              color: "#155724", 
              padding: "10px", 
              borderRadius: "4px",
              marginTop: "10px"
            }}>
              ✅ Payment successful! Order is being submitted...
            </div>
          )}
        </form>
      </div>

      {/* Right Side - Card Payment */}
      <div style={{ flex: 1 }}>
        {form.payment_type === "card" ? (
          isFormComplete ? (
            <iframe
              // ✅ pass total price and form completion status to /pay
              src={`/pay?amount=${totalPrice}&formComplete=true`}
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
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                border: "2px solid #ffc107",
                borderRadius: "8px",
                padding: "20px",
                background: "#fff8e1",
              }}
            >
              <div style={{ fontSize: "48px", marginBottom: "20px" }}>⚠️</div>
              <h3 style={{ color: "#856404", marginBottom: "10px" }}>
                Complete Checkout Form First
              </h3>
              <p style={{ textAlign: "center", color: "#666" }}>
                Please fill in all required fields in the checkout form before proceeding with payment.
              </p>
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <p style={{ color: "#856404", fontWeight: "bold" }}>Required fields:</p>
                <ul style={{ color: "#666", textAlign: "left" }}>
                  {!form.customer_name && <li>Full Name</li>}
                  {!form.customer_address && <li>Delivery Address</li>}
                  {!form.size && <li>Shoe Size</li>}
                </ul>
              </div>
            </div>
          )
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
