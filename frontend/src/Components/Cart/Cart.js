import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Nav from "../Navbar/nav";
import Footer from "../Footer/Footer";
import api from "../../utils/api";
import "./Cart.css";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load cart items from backend on component mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        const response = await api.get('/cart');
        if (response.data && response.data.cart) {
          setCartItems(response.data.cart.items || []);
        }
      } catch (error) {
        console.error('Error loading cart:', error);
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, []);

  // Save cart to backend whenever cart changes
  const saveCartToBackend = async (items) => {
    try {
      // This will be handled by individual API calls (add, update, remove)
      // No need to save entire cart on every change
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  };

  // Calculate totals
  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.hasActivePromotion ? item.discountedPrice : item.pamount;
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    try {
      const response = await api.put(`/cart/item/${itemId}`, { quantity: newQuantity });
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart.items || []);
        // Dispatch custom event to update cart count in navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      alert('Failed to update quantity. Please try again.');
    }
  };

  // Remove item from cart
  const removeFromCart = async (itemId) => {
    try {
      const response = await api.delete(`/cart/item/${itemId}`);
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart.items || []);
        // Dispatch custom event to update cart count in navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error removing item:', error);
      alert('Failed to remove item. Please try again.');
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const response = await api.delete('/cart/clear');
      if (response.data && response.data.cart) {
        setCartItems(response.data.cart.items || []);
        // Dispatch custom event to update cart count in navbar
        window.dispatchEvent(new CustomEvent('cartUpdated'));
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      alert('Failed to clear cart. Please try again.');
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      return;
    }
    
    // Navigate to checkout with all cart items
    navigate("/checkout", {
      state: {
        cartItems: cartItems,
        isFromCart: true
      }
    });
  };

  // Continue shopping
  const continueShopping = () => {
    navigate("/items");
  };

  if (loading) {
    return (
      <div className="cart-container">
        <Nav />
        <div className="cart-loading">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="cart-container">
      <Nav />
      
      <div className="cart-wrapper">
        {/* Header */}
        <div className="cart-header">
          <h1 className="cart-title">Your Cart</h1>
          <p className="cart-subtitle">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
            </div>
            <h2 className="empty-cart-title">Your cart is empty</h2>
            <p className="empty-cart-text">
              Looks like you haven't added any items to your cart yet.
            </p>
            <button 
              className="continue-shopping-btn"
              onClick={continueShopping}
            >
              Continue Shopping
            </button>
          </div>
        ) : (
          /* Cart with Items */
          <div className="cart-content">
            <div className="cart-main">
              {/* Cart Items */}
              <div className="cart-items">
                <div className="cart-items-header">
                  <h2>Items</h2>
                  {cartItems.length > 0 && (
                    <button 
                      className="clear-cart-btn"
                      onClick={clearCart}
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
                
                <div className="cart-items-list">
                  {cartItems.map((item) => (
                    <div key={item._id || item.id} className="cart-item">
                      {/* Product Image */}
                      <div className="cart-item-image">
                        {item.image ? (
                          <img
                            src={`http://localhost:5000${item.image}`}
                            alt={item.pname}
                          />
                        ) : (
                          <div className="cart-item-placeholder">
                            No Image
                          </div>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="cart-item-details">
                        <h3 className="cart-item-name">{item.pname}</h3>
                        <p className="cart-item-code">Style: {item.pcode}</p>
                        
                        {/* Size and Color */}
                        <div className="cart-item-variants">
                          {item.selectedSize && (
                            <span className="variant-info">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="variant-info">
                              Color: {item.selectedColor}
                            </span>
                          )}
                        </div>

                        {/* Price */}
                        <div className="cart-item-price">
                          {item.hasActivePromotion ? (
                            <div className="price-with-promotion">
                              <span className="current-price">
                                ${item.discountedPrice}
                              </span>
                              <span className="original-price">
                                ${item.pamount}
                              </span>
                              <span className="discount-badge">
                                {item.promotion.discount}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="current-price">
                              ${item.pamount}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="cart-item-quantity">
                        <div className="quantity-controls">
                          <button
                            onClick={() => updateQuantity(item._id || item.id, item.quantity - 1)}
                            className="quantity-btn decrease"
                          >
                            −
                          </button>
                          <span className="quantity-display">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item._id || item.id, item.quantity + 1)}
                            className="quantity-btn increase"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Item Total */}
                      <div className="cart-item-total">
                        <span className="item-total">
                          ${((item.hasActivePromotion ? item.discountedPrice : item.pamount) * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <div className="cart-item-actions">
                        <button
                          onClick={() => removeFromCart(item._id || item.id)}
                          className="remove-item-btn"
                          title="Remove item"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="cart-summary">
              <div className="summary-card">
                <h3 className="summary-title">Order Summary</h3>
                
                <div className="summary-details">
                  <div className="summary-row">
                    <span>Subtotal ({cartItems.length} items)</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Shipping</span>
                    <span>Free</span>
                  </div>
                  
                  <div className="summary-row">
                    <span>Tax</span>
                    <span>Included</span>
                  </div>
                  
                  <div className="summary-divider"></div>
                  
                  <div className="summary-row total-row">
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>

                <button 
                  className="checkout-btn"
                  onClick={proceedToCheckout}
                >
                  Proceed to Checkout
                </button>

                <button 
                  className="continue-shopping-btn-secondary"
                  onClick={continueShopping}
                >
                  Continue Shopping
                </button>

                {/* Security Badge */}
                <div className="security-badge">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    <path d="M9 12l2 2 4-4"></path>
                  </svg>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
