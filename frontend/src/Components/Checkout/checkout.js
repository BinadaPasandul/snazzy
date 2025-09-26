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
  const [paymentId, setPaymentId] = useState(null);

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
        
        // Store payment ID from either explicit paymentId or payment._id
        const receivedPaymentId = event.data.paymentId || event.data.payment._id;
        setPaymentId(receivedPaymentId);
        
        console.log('Received payment ID:', receivedPaymentId);
        
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
          payment_id: receivedPaymentId, // Include payment ID
        };

        console.log('Submitting order with data:', orderData);

        try {
          const orderResponse = await api.post("/orders", orderData);
          console.log('Order submitted successfully:', orderResponse.data);
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
      payment_id: paymentId, // Include payment ID if available
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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>Checkout</h1>
          <p style={{ color: '#6b7280' }}>Complete your order details and payment</p>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          alignItems: 'flex-start'
        }}>
          {/* Left Side - Checkout Form */}
          <div>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '1rem',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              padding: '2rem',
              border: '1px solid #e5e7eb'
            }}>
              <h2 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#111827',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center'
              }}>
                <svg style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.5rem', color: '#4f46e5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Order Information
              </h2>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Customer Name */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="customer_name"
                    placeholder="Enter your full name"
                    value={form.customer_name}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: !form.customer_name ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = form.customer_name ? '#e5e7eb' : '#ef4444';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>

                {/* Delivery Address */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    name="customer_address"
                    placeholder="Enter your delivery address"
                    value={form.customer_address}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: !form.customer_address ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = form.customer_address ? '#e5e7eb' : '#ef4444';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>

                {/* Shoe Size */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Shoe Size *
                  </label>
                  <input
                    type="text"
                    name="size"
                    placeholder="e.g., 42, 9.5, L"
                    value={form.size}
                    onChange={handleChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: !form.size ? '2px solid #ef4444' : '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      transition: 'all 0.2s',
                      backgroundColor: '#fafafa'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = form.size ? '#e5e7eb' : '#ef4444';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  />
                </div>

                {/* Product Information */}
                <div style={{
                  backgroundColor: '#f8fafc',
                  borderRadius: '0.75rem',
                  padding: '1.5rem',
                  border: '1px solid #e2e8f0'
                }}>
                  <h3 style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#111827',
                    marginBottom: '1rem'
                  }}>
                    Product Details
                  </h3>
                  
                  {/* Product Code */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#6b7280',
                      marginBottom: '0.5rem'
                    }}>
                      Product Code
                    </label>
                    <input
                      type="text"
                      name="product_id"
                      value={form.product_id}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        backgroundColor: '#f3f4f6',
                        color: '#6b7280'
                      }}
                    />
                  </div>

                  {/* Quantity */}
                  <div style={{ marginBottom: '1rem' }}>
                    <label style={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '0.5rem'
                    }}>
                      Quantity
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      min="1"
                      value={form.quantity}
                      onChange={handleChange}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        border: '2px solid #e5e7eb',
                        borderRadius: '0.5rem',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        backgroundColor: '#fafafa'
                      }}
                      onFocus={(e) => {
                        e.target.style.borderColor = '#4f46e5';
                        e.target.style.backgroundColor = 'white';
                      }}
                      onBlur={(e) => {
                        e.target.style.borderColor = '#e5e7eb';
                        e.target.style.backgroundColor = '#fafafa';
                      }}
                    />
                  </div>

                  {/* Price Information */}
                  {productPrice && (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.75rem 0',
                      borderTop: '1px solid #e2e8f0'
                    }}>
                      <span style={{ color: '#6b7280' }}>Unit Price:</span>
                      <span style={{ fontWeight: '500', color: '#111827' }}>${productPrice}</span>
                    </div>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.75rem 0',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <span style={{ fontWeight: '600', color: '#111827' }}>Total Price:</span>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '1.125rem',
                      color: '#4f46e5' 
                    }}>
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Payment Type */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Payment Method
                  </label>
                  <select
                    name="payment_type"
                    value={form.payment_type}
                    onChange={handleChange}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      border: '2px solid #e5e7eb',
                      borderRadius: '0.5rem',
                      fontSize: '1rem',
                      backgroundColor: '#fafafa',
                      transition: 'all 0.2s'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#4f46e5';
                      e.target.style.backgroundColor = 'white';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.backgroundColor = '#fafafa';
                    }}
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="card">Card Payment</option>
                  </select>
                </div>

                {/* Submit Button for Cash */}
                {form.payment_type === "cash" && (
                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      fontWeight: '500',
                      padding: '0.875rem 1.5rem',
                      borderRadius: '0.75rem',
                      border: 'none',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#4338ca';
                      e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#4f46e5';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }}
                  >
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Submit Order
                  </button>
                )}

                {/* Payment Success Status */}
                {form.payment_type === "card" && paymentSuccess && (
                  <div style={{
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    color: '#16a34a',
                    padding: '1rem',
                    borderRadius: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    fontSize: '0.875rem'
                  }}>
                    <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <div style={{ fontWeight: '500' }}>Payment successful! Order is being submitted...</div>
                      {paymentId && (
                        <div style={{ fontSize: '0.75rem', marginTop: '0.25rem', opacity: 0.8 }}>
                          Payment ID: {paymentId}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Right Side - Payment Section */}
          <div>
            {form.payment_type === "card" ? (
              isFormComplete ? (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  border: '1px solid #e5e7eb',
                  overflow: 'hidden'
                }}>
                  <iframe
                    src={`/pay?amount=${totalPrice}&formComplete=true`}
                    title="Card Payment"
                    style={{
                      width: '100%',
                      height: '900px',
                      border: 'none'
                    }}
                  />
                </div>
              ) : (
                <div style={{
                  backgroundColor: 'white',
                  borderRadius: '1rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '2rem',
                  border: '1px solid #e5e7eb',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '4rem',
                    height: '4rem',
                    backgroundColor: '#fef3c7',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1.5rem'
                  }}>
                    <svg style={{ width: '2rem', height: '2rem', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  
                  <h3 style={{
                    fontSize: '1.125rem',
                    fontWeight: '600',
                    color: '#92400e',
                    marginBottom: '0.5rem'
                  }}>
                    Complete Checkout Form First
                  </h3>
                  
                  <p style={{
                    color: '#6b7280',
                    marginBottom: '1.5rem',
                    lineHeight: '1.5'
                  }}>
                    Please fill in all required fields in the checkout form before proceeding with payment.
                  </p>
                  
                  <div style={{
                    backgroundColor: '#fef3c7',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    textAlign: 'left'
                  }}>
                    <p style={{
                      color: '#92400e',
                      fontWeight: '500',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem'
                    }}>
                      Required fields:
                    </p>
                    <ul style={{
                      color: '#6b7280',
                      fontSize: '0.875rem',
                      margin: 0,
                      paddingLeft: '1.25rem'
                    }}>
                      {!form.customer_name && <li>Full Name</li>}
                      {!form.customer_address && <li>Delivery Address</li>}
                      {!form.size && <li>Shoe Size</li>}
                    </ul>
                  </div>
                </div>
              )
            ) : (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '1rem',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                padding: '2rem',
                border: '1px solid #e5e7eb',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px'
              }}>
                <div style={{
                  width: '4rem',
                  height: '4rem',
                  backgroundColor: '#e0e7ff',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.5rem'
                }}>
                  <svg style={{ width: '2rem', height: '2rem', color: '#4f46e5' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                
                <h3 style={{
                  fontSize: '1.125rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '0.5rem'
                }}>
                  Select Card Payment
                </h3>
                
                <p style={{
                  color: '#6b7280',
                  lineHeight: '1.5'
                }}>
                  Choose "Card Payment" as your payment method to proceed with secure online payment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
