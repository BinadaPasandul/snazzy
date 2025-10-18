import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Navbar/nav"; 
import Footer from "../Footer/Footer";
import './itempage8.css';

const DisplayProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch products 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/products");
        setProducts(res.data.products || []);
        setError(null);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Navigate to product detail page
  const handleProductClick = (id) => {
    navigate(`/products/${id}`); 
  };

  return (
    <div className="itempage-container8">
      <Nav />

      
      <section className="itempage-hero8">
        <div className="hero-background8">
          <div className="hero-overlay8"></div>
          <div className="hero-particles8"></div>
        </div>
        <div className="itempage-hero-content8">
          <h1 className="itempage-title8">
            Discover <span className="title-highlight8">Amazing Products</span>
          </h1>
          <p className="itempage-subtitle8">
            Explore our curated collection of premium products. Quality guaranteed, 
            competitive prices, and exceptional customer service.
          </p>
        </div>
      </section>

      {/* Products*/}
      <section className="products-section8">
        <div className="container8">
          <div className="section-header8">
            <h2 className="section-title8">Shop All Products</h2>
            <p className="section-subtitle8">Find the perfect items for your lifestyle</p>
          </div>
          
          <div className="products-grid8">
            {loading && (
              <div className="loading-state8">
                <div className="loading-spinner8"></div>
                <p className="loading-text8">Loading products...</p>
              </div>
            )}
            
            {!loading && error && (
              <div className="error-state8">{error}</div>
            )}
            
            {!loading && !error && products.length === 0 && (
              <div className="empty-state8">No products available.</div>
            )}
            
            {!loading && !error && products.map((p, index) => (
              <div 
                key={p._id} 
                className="product-card8" 
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Product Image */}
                <div className="product-image8">
                  {(p.images && p.images.length > 0) ? (
                    <img
                      src={`http://localhost:5000${p.images[0]}`}
                      alt={p.pname}
                    />
                  ) : p.image ? (
                    <img
                      src={`http://localhost:5000${p.image}`}
                      alt={p.pname}
                    />
                  ) : (
                    <div className="image-placeholder8">
                      No Image Available
                    </div>
                  )}
                </div>

                {/* Product Info */}
                <div className="product-info8">
                  <h3 className="product-name8">{p.pname}</h3>
                  <p className="product-code8">Code: {p.pcode}</p>
                  
                  {/* Price Display with Promotion */}
                  <div className="price-container8">
                    {p.hasActivePromotion ? (
                      <>
                        <div className="price-row8">
                          <span className="original-price8">${p.originalPrice}</span>
                          <span className="current-price8">${p.discountedPrice}</span>
                          <span className="discount-badge8">{p.promotion.discount}% OFF</span>
                        </div>
                        <div className="promotion-info8">
                          <p className="promotion-text8">🎉 Special Promotion!</p>
                        </div>
                      </>
                    ) : (
                      <div className="price-row8">
                        <span className="regular-price8">${p.pamount}</span>
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <button 
                    className="view-btn8" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleProductClick(p._id);
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default DisplayProducts;
