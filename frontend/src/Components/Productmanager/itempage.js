import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Navbar/nav"; 
import Footer from "../Footer/Footer";
import './itempage8.css';

const DisplayProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter 
  const [filters, setFilters] = useState({
    color: '',
    size: '',
    brand: '',
    priceRange: [0, 1000]
  });
  
  // Available filters
  const [filterOptions, setFilterOptions] = useState({
    colors: [],
    sizes: [],
    brands: []
  });

  // Extract filter options
  const extractFilterOptions = (products) => {
    const colors = new Set();
    const sizes = new Set();
    const brands = new Set();
    
    products.forEach(product => {
      // Extract brand 
      const brand = product.pname.split(' ')[0];
      brands.add(brand);
      
      // Extract colors and sizes
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          if (variant.color) colors.add(variant.color);
          if (variant.size) sizes.add(variant.size);
        });
      }
    });
    
    return {
      colors: Array.from(colors).sort(),
      sizes: Array.from(sizes).sort((a, b) => a - b),
      brands: Array.from(brands).sort()
    };
  };

  // Filter products 
  const applyFilters = (products, filters) => {
    return products.filter(product => {
      // Color 
      if (filters.color && product.variants) {
        const hasColor = product.variants.some(variant => 
          variant.color.toLowerCase().includes(filters.color.toLowerCase())
        );
        if (!hasColor) return false;
      }
      
      // Size 
      if (filters.size && product.variants) {
        const hasSize = product.variants.some(variant => 
          variant.size === parseInt(filters.size)
        );
        if (!hasSize) return false;
      }
      
      // Brand 
      if (filters.brand) {
        const productBrand = product.pname.split(' ')[0].toLowerCase();
        if (!productBrand.includes(filters.brand.toLowerCase())) return false;
      }
      
      // Price range
      const price = product.hasActivePromotion ? product.discountedPrice : product.pamount;
      if (price < filters.priceRange[0] || price > filters.priceRange[1]) return false;
      
      return true;
    });
  };

  // Fetch products 
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/products");
        const productsData = res.data.products || [];
        setProducts(productsData);
        setFilteredProducts(productsData);
        
        // Extract filter options
        const options = extractFilterOptions(productsData);
        setFilterOptions(options);
        
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

  // Apply filters when filters change
  useEffect(() => {
    const filtered = applyFilters(products, filters);
    setFilteredProducts(filtered);
  }, [filters, products]);

  // Navigate to product detail page
  const handleProductClick = (id) => {
    navigate(`/products/${id}`); 
  };

  // filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  // Handle price range change
  const handlePriceRangeChange = (index, value) => {
    setFilters(prev => ({
      ...prev,
      priceRange: [
        index === 0 ? parseInt(value) : prev.priceRange[0],
        index === 1 ? parseInt(value) : prev.priceRange[1]
      ]
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      color: '',
      size: '',
      brand: '',
      priceRange: [0, 1000]
    });
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

      {/* Filter Section */}
      <section className="filter-section8">
        <div className="container8">
          <div className="filter-container8">
            <h3 className="filter-title8">Filter Shoes</h3>
            
            <div className="filter-grid8">
              {/* Brand Filter */}
              <div className="filter-group8">
                <label className="filter-label8">Brand</label>
                <select 
                  className="filter-select8"
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                >
                  <option value="">All Brands</option>
                  {filterOptions.brands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>

              {/* Color Filter */}
              <div className="filter-group8">
                <label className="filter-label8">Color</label>
                <select 
                  className="filter-select8"
                  value={filters.color}
                  onChange={(e) => handleFilterChange('color', e.target.value)}
                >
                  <option value="">All Colors</option>
                  {filterOptions.colors.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              {/* Size Filter */}
              <div className="filter-group8">
                <label className="filter-label8">Size</label>
                <select 
                  className="filter-select8"
                  value={filters.size}
                  onChange={(e) => handleFilterChange('size', e.target.value)}
                >
                  <option value="">All Sizes</option>
                  {filterOptions.sizes.map(size => (
                    <option key={size} value={size}>Size {size}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="filter-group8 price-range-group8">
                <label className="filter-label8">Price Range</label>
                <div className="price-range-container8">
                  <input
                    type="number"
                    className="price-input8"
                    placeholder="Min"
                    value={filters.priceRange[0]}
                    onChange={(e) => handlePriceRangeChange(0, e.target.value)}
                    min="0"
                  />
                  <span className="price-separator8">to</span>
                  <input
                    type="number"
                    className="price-input8"
                    placeholder="Max"
                    value={filters.priceRange[1]}
                    onChange={(e) => handlePriceRangeChange(1, e.target.value)}
                    min="0"
                  />
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="filter-group8">
                <button className="clear-filters-btn8" onClick={clearFilters}>
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Results Count */}
            <div className="results-info8">
              <p className="results-text8">
                Showing {filteredProducts.length} of {products.length} products
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Products*/}
      <section className="products-section8">
        <div className="container8">
          <div className="section-header8">
            <h2 className="section-title8">All from SNAZZY</h2>
            <p className="section-subtitle8">Find the perfect fit for your lifestyle</p>
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
            
            {!loading && !error && filteredProducts.length === 0 && products.length > 0 && (
              <div className="empty-state8">No products match your current filters. Try adjusting your search criteria.</div>
            )}
            
            {!loading && !error && products.length === 0 && (
              <div className="empty-state8">No products available.</div>
            )}
            
            {!loading && !error && filteredProducts.map((p, index) => (
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
