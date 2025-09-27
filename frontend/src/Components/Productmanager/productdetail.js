import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Navbar/nav"; // keep/remove based on project
import Footer from "../Footer/Footer";
import "./ProductDetail.css";

const ProductDetail = () => {
  const { id } = useParams();               // grabs the :id from URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/products/${id}`);
        setProduct(res.data.product);        // make sure backend returns { product: {...} }
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Get available sizes for selected color
  const getAvailableSizes = (color) => {
    if (!product?.variants) return [];
    return product.variants
      .filter(variant => variant.color === color && variant.quantity > 0)
      .map(variant => variant.size)
      .sort((a, b) => a - b);
  };

  // Get available colors for selected size
  const getAvailableColors = (size) => {
    if (!product?.variants) return [];
    return product.variants
      .filter(variant => variant.size === size && variant.quantity > 0)
      .map(variant => variant.color)
      .sort();
  };

  // Get all available colors
  const getAllAvailableColors = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants
      .filter(variant => variant.quantity > 0)
      .map(variant => variant.color))]
      .sort();
  };

  // Get all available sizes
  const getAllAvailableSizes = () => {
    if (!product?.variants) return [];
    return [...new Set(product.variants
      .filter(variant => variant.quantity > 0)
      .map(variant => variant.size))]
      .sort((a, b) => a - b);
  };

  // Handle size selection
  const handleSizeSelect = (size) => {
    setSelectedSize(size);
    if (selectedColor) {
      const variant = product.variants.find(v => v.size === size && v.color === selectedColor);
      setSelectedVariant(variant);
      setQuantity(1);
    } else {
      setSelectedVariant(null);
    }
  };

  // Handle color selection
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    if (selectedSize) {
      const variant = product.variants.find(v => v.size === selectedSize && v.color === color);
      setSelectedVariant(variant);
      setQuantity(1);
    } else {
      setSelectedVariant(null);
    }
  };

  // Handle quantity change
  const handleQuantityChange = (newQuantity) => {
    if (selectedVariant && newQuantity <= selectedVariant.quantity && newQuantity > 0) {
      setQuantity(newQuantity);
    }
  };

  const handleBuyNow = () => {
    if (!selectedVariant) {
      alert("Please select a size and color first!");
      return;
    }
    
    // ✅ Pass product code and price to checkout (use discounted price if available)
    const finalPrice = product.hasActivePromotion ? product.discountedPrice : product.pamount;
    navigate("/checkout", { 
      state: { 
        productCode: product.pcode, 
        productPrice: finalPrice,
        originalPrice: product.pamount,
        productname: product.pname,
        hasPromotion: product.hasActivePromotion,
        promotion: product.hasActivePromotion ? product.promotion : null,
        selectedSize: selectedSize,
        selectedColor: selectedColor,
        quantity: quantity,
        variant: selectedVariant
      } 
    });
  };

  const handleAddToCart = () => {
    if (!selectedVariant) {
      alert("Please select a size and color first!");
      return;
    }
    
    // Replace with cart API or global state
    alert(`${product.pname} (Size ${selectedSize}, ${selectedColor}, Qty: ${quantity}) added to cart!`);
  };

  if (loading) return <p className="loading-state">Loading...</p>;
  if (error)   return <p className="error-state">{error}</p>;
  if (!product) return null;

  const handleContainerClick = () => {
    navigate("/items");
  };

  return (
    <div className="product-detail-container">
      <Nav />
      <div className="product-detail-wrapper">
        {/* LEFT SIDE - IMAGE GALLERY */}
        <div className="image-gallery">
          <div className="image-gallery-sticky">
            {product.image ? (
              <div className="product-image-container">
                <img
                  src={`http://localhost:5000${product.image}`}
                  alt={product.pname}
                  className="product-image"
                />
              </div>
            ) : (
              <div className="no-image-placeholder">
                No Image Available
              </div>
            )}
            
            {/* Color Variants Preview */}
            {product.variants && product.variants.length > 0 && (
              <div className="color-variants-section">
                <h4 className="color-variants-title">
                  Available Colors
                </h4>
                <div className="color-variants-grid">
                  {getAllAvailableColors().slice(0, 6).map(color => (
                    <div
                      key={color}
                      className={`color-swatch ${selectedColor === color ? 'selected' : ''}`}
                      style={{ background: color.toLowerCase() }}
                      onClick={() => handleColorSelect(color)}
                    >
                      {selectedColor === color && (
                        <div className="color-swatch-checkmark">
                          <span>✓</span>
                        </div>
                      )}
                    </div>
                  ))}
                  {getAllAvailableColors().length > 6 && (
                    <div className="color-swatch-more">
                      +{getAllAvailableColors().length - 6}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE - PRODUCT INFO */}
        <div className="product-info">
          <div className="product-header">
            <h1 className="product-title">
              {product.pname}
            </h1>
            <p className="product-style-code">
              Style: {product.pcode}
            </p>
          </div>
          
          {/* Price Display */}
          <div className="price-section">
            {product.hasActivePromotion ? (
              <div>
                <div className="price-promotion">
                  <span className="price-current">
                    ${product.discountedPrice}
                  </span>
                  <span className="price-original">
                    ${product.originalPrice}
                  </span>
                  <span className="discount-badge">
                    {product.promotion.discount}% OFF
                  </span>
                </div>
                <p className="promotion-validity">
                  Valid until: {new Date(product.promotion.endDate).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <div className="price-normal">
                <span className="price-current">
                  ${product.pamount}
                </span>
                <span className="price-tax-info">
                  (tax included)
                </span>
              </div>
            )}
          </div>

          {/* Size Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="size-section">
              <h3 className="section-title">
                Select Size
              </h3>
              <div className="size-grid">
                {getAllAvailableSizes().map(size => (
                  <button
                    key={size}
                    onClick={() => handleSizeSelect(size)}
                    className={`size-button ${selectedSize === size ? 'selected' : ''}`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              <p className="size-guide-text">
                Size guide available
              </p>
            </div>
          )}

          {/* Color Selection */}
          {product.variants && product.variants.length > 0 && (
            <div className="color-section">
              <h3 className="section-title">
                Select Color
              </h3>
              <div className="color-options">
                {getAllAvailableColors().map(color => (
                  <button
                    key={color}
                    onClick={() => handleColorSelect(color)}
                    className={`color-option-button ${selectedColor === color ? 'selected' : ''}`}
                  >
                    <div 
                      className="color-indicator"
                      style={{ background: color.toLowerCase() }}
                    ></div>
                    <span className="color-name">{color}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selection */}
          {selectedVariant && (
            <div className="quantity-section">
              <h3 className="section-title">
                Quantity
              </h3>
              <div className="quantity-controls">
                <div className="quantity-selector">
                  <button
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                    className="quantity-button decrease"
                  >
                    −
                  </button>
                  <span className="quantity-display">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= selectedVariant.quantity}
                    className="quantity-button increase"
                  >
                    +
                  </button>
                </div>
                <span className="quantity-available">
                  {selectedVariant.quantity} available
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}
              className="buy-now-button"
              disabled={!selectedVariant}
            >
              {selectedVariant ? "Buy Now" : "Select Size & Color"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
              className="add-to-cart-button"
              disabled={!selectedVariant}
            >
              Add to Cart
            </button>
          </div>

          {/* Product Details */}
          <div className="product-details-section">
            <h3 className="product-details-title">
              Product Details
            </h3>
            <p className="product-description">
              {product.pdescription}
            </p>
            
            {/* Specifications */}
            <div className="specifications-section">
              <h4 className="specifications-title">
                Specifications
              </h4>
              <div className="specifications-list">
                <p className="specification-item"><strong>Style Code:</strong> {product.pcode}</p>
                <p className="specification-item"><strong>Price:</strong> ${product.pamount}</p>
                {product.variants && product.variants.length > 0 && (
                  <p className="specification-item">
                    <strong>Available Variants:</strong> {product.variants.length} combinations
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
