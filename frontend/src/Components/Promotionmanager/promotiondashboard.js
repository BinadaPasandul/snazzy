import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import api from '../../utils/api';
import './promotionmanager.css';

function PromotionDashboard() {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPromotions, setFilteredPromotions] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch promotions, products, and orders for performance tracking
                const [promotionsRes, productsRes, ordersRes] = await Promise.all([
                    api.get('/Promotions'),
                    api.get('/products'),
                    api.get('/orders')
                ]);
                
                const promos = promotionsRes.data.promotions || [];
                const prods = productsRes.data.products || [];
                const orderData = ordersRes.data.orders || [];
                
                setPromotions(promos);
                setProducts(prods);
                setOrders(orderData);
                setFilteredPromotions(promos); // Initialize filtered promotions
            } catch (err) {
                setError(err?.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Filter promotions based on search term
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredPromotions(promotions);
        } else {
            const filtered = promotions.filter(promotion => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    promotion.title.toLowerCase().includes(searchLower) ||
                    promotion.description?.toLowerCase().includes(searchLower) ||
                    promotion.productId.toLowerCase().includes(searchLower) ||
                    promotion.discount.toString().includes(searchTerm) ||
                    (promotion.startDate && new Date(promotion.startDate).toLocaleDateString().includes(searchTerm)) ||
                    (promotion.endDate && new Date(promotion.endDate).toLocaleDateString().includes(searchTerm))
                );
            });
            setFilteredPromotions(filtered);
        }
    }, [searchTerm, promotions]);

    const refresh = async () => {
        try {
            const [promotionsRes, productsRes, ordersRes] = await Promise.all([
                api.get('/Promotions'),
                api.get('/products'),
                api.get('/orders')
            ]);
            
            const promos = promotionsRes.data.promotions || [];
            const prods = productsRes.data.products || [];
            const orderData = ordersRes.data.orders || [];
            
            setPromotions(promos);
            setProducts(prods);
            setOrders(orderData);
            setFilteredPromotions(promos); // Update filtered promotions after refresh
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        }
    };

    // Helper function to get product details by product code
    const getProductByCode = (productCode) => {
        return products.find(product => product.pcode === productCode);
    };

    // Function to calculate promotion performance metrics
    const getPromotionPerformance = (promotion) => {
        const product = getProductByCode(promotion.productId);
        
        // Find orders that used this specific promotion
        const promotionOrders = orders.filter(order => 
            order.has_promotion && order.promotion_id === promotion._id
        );
        
        // Calculate metrics
        const orderCount = promotionOrders.length;
        const totalRevenue = promotionOrders.reduce((sum, order) => sum + order.total_price, 0);
        const totalDiscountGiven = promotionOrders.reduce((sum, order) => sum + (order.promotion_discount || 0), 0);
        
        // Calculate conversion rate
        // For conversion rate, we'll use the total orders for this product vs promotion orders
        const totalProductOrders = orders.filter(order => order.product_id === promotion.productId).length;
        const conversionRate = totalProductOrders > 0 ? (orderCount / totalProductOrders) * 100 : 0;
        
        // Calculate average order value
        const avgOrderValue = orderCount > 0 ? totalRevenue / orderCount : 0;
        
        return {
            orderCount,
            totalRevenue,
            totalDiscountGiven,
            conversionRate,
            avgOrderValue,
            totalProductOrders
        };
    };

    const handleDelete = async (promotionId) => {
        const confirmed = window.confirm('Are you sure you want to delete this promotion?');
        if (!confirmed) return;
        try {
            await api.delete(`/Promotions/${promotionId}`);
            await refresh();
            alert('Promotion deleted');
        } catch (err) {
            alert(`Failed to delete: ${err?.response?.data?.message || err.message}`);
        }
    };

    const handleEdit = (promotion) => {
        navigate(`/EditPromotion/${promotion._id}`);
    };

    return (
        <div className="promotion-dashboard">
            <Nav />
            
            <div className="promotion-header">
                <h1 className="promotion-title">Promotion Dashboard</h1>
                <p className="promotion-subtitle">Manage promotions and track performance metrics</p>
            </div>
            
            <div className="promotion-content">
                {/* Statistics Section */}
                {!loading && promotions.length > 0 && (
                    <div className="promotion-stats">
                        {(() => {
                            // Calculate overall performance metrics
                            const totalPromotionOrders = orders.filter(order => order.has_promotion).length;
                            const totalOrders = orders.length;
                            const overallConversionRate = totalOrders > 0 ? (totalPromotionOrders / totalOrders) * 100 : 0;
                            const totalPromotionRevenue = orders
                                .filter(order => order.has_promotion)
                                .reduce((sum, order) => sum + order.total_price, 0);
                            const totalDiscountGiven = orders
                                .filter(order => order.has_promotion)
                                .reduce((sum, order) => sum + (order.promotion_discount || 0), 0);
                            
                            return (
                                <>
                                    <div className="promotion-stat">
                                        <div className="promotion-stat-info">
                                            <div className="promotion-stat-label">Total Promotions</div>
                                            <div className="promotion-stat-value">{promotions.length}</div>
                                        </div>
                                        <div className="promotion-stat-icon">🎯</div>
                                    </div>
                                    
                                    <div className="promotion-stat">
                                        <div className="promotion-stat-info">
                                            <div className="promotion-stat-label">Promotion Orders</div>
                                            <div className="promotion-stat-value">{totalPromotionOrders}</div>
                                        </div>
                                        <div className="promotion-stat-icon">📈</div>
                                    </div>
                                    
                                    <div className="promotion-stat">
                                        <div className="promotion-stat-info">
                                            <div className="promotion-stat-label">Conversion Rate</div>
                                            <div className="promotion-stat-value">{overallConversionRate.toFixed(1)}%</div>
                                        </div>
                                        <div className="promotion-stat-icon">💰</div>
                                    </div>
                                    
                                    <div className="promotion-stat">
                                        <div className="promotion-stat-info">
                                            <div className="promotion-stat-label">Total Discounts</div>
                                            <div className="promotion-stat-value">${totalDiscountGiven.toFixed(2)}</div>
                                        </div>
                                        <div className="promotion-stat-icon">💸</div>
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                )}

                {/* Search Section */}
                <div className="promotion-search">
                    <div className="promotion-search-header">
                        <h2 className="promotion-search-title">Search Promotions</h2>
                        <button 
                            className="add-promotion-btn"
                            onClick={() => navigate('/insertpromotion')}
                        >
                            + Add Promotion
                        </button>
                    </div>
                    
                    <div className="promotion-search-container">
                        <input
                            type="text"
                            placeholder="Search promotions by title, description, product ID, discount, or date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="promotion-search-input"
                        />
                        <div className="promotion-search-icon">🔍</div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="promotion-search-clear"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    
                    {searchTerm && (
                        <div className="promotion-search-info">
                            Showing {filteredPromotions.length} of {promotions.length} promotions
                        </div>
                    )}
                </div>

                {/* Promotions Section */}
                <div className="promotions-section">
                    <div className="promotions-header">
                        <h2 className="promotions-title">Active Promotions</h2>
                        <div className="promotions-count">
                            {filteredPromotions.length} promotions
                        </div>
                    </div>

                    {loading ? (
                        <div className="loading-container">
                            <div className="loading-spinner"></div>
                            <div className="loading-text">Loading promotions...</div>
                        </div>
                    ) : error ? (
                        <div className="error-container">
                            <div className="error-icon">⚠️</div>
                            <div className="error-title">Error Loading Promotions</div>
                            <div className="error-message">{error}</div>
                        </div>
                    ) : filteredPromotions.length === 0 ? (
                        <div className="empty-state-container">
                            <div className="empty-state-icon">
                                {searchTerm ? '🔍' : '📋'}
                            </div>
                            <div className="empty-state-title">
                                {searchTerm ? 'No promotions found' : 'No promotions available'}
                            </div>
                            <div className="empty-state-message">
                                {searchTerm ? `No promotions found matching "${searchTerm}"` : 'Start by creating your first promotion'}
                            </div>
                            {searchTerm && (
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    className="clear-search-btn"
                                >
                                    Clear Search
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="promotions-grid">
                            {filteredPromotions.map((p) => (
                                <div key={p._id} className="promotion-card">
                                    {p.bannerImage ? (
                                        <img
                                            src={`http://localhost:5000${p.bannerImage}`}
                                            alt={p.title}
                                            className="promotion-card-image"
                                        />
                                    ) : (
                                        <div className="promotion-card-no-image">
                                            📷 No Image
                                        </div>
                                    )}
                                    
                                    <div className="promotion-card-content">
                                        <h3 className="promotion-card-title">{p.title}</h3>
                                        
                                        {/* Product Details */}
                                        {(() => {
                                            const product = getProductByCode(p.productId);
                                            if (product) {
                                                const originalPrice = product.pamount;
                                                const discountedPrice = originalPrice - (originalPrice * p.discount / 100);
                                                return (
                                                    <div className="promotion-product-info">
                                                        <p className="promotion-product-name">
                                                            📦 {product.pname}
                                                        </p>
                                                        <p className="promotion-product-details">
                                                            Code: {product.pcode} | Size: {product.psize} | Color: {product.pcolor}
                                                        </p>
                                                        <div className="promotion-price-section">
                                                            <span className="promotion-original-price">
                                                                ${originalPrice}
                                                            </span>
                                                            <span className="promotion-discounted-price">
                                                                ${discountedPrice.toFixed(2)}
                                                            </span>
                                                            <span className="promotion-save-badge">
                                                                Save ${(originalPrice - discountedPrice).toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return <p><strong>Product ID:</strong> {p.productId} (Product not found)</p>;
                                        })()}
                                        
                                        <div className="promotion-details">
                                            <div className="promotion-detail-item">
                                                <span className="promotion-detail-label">Description:</span>
                                                <span className="promotion-detail-value">{p.description || 'N/A'}</span>
                                            </div>
                                            <div className="promotion-detail-item">
                                                <span className="promotion-detail-label">Discount:</span>
                                                <span className="promotion-detail-value">{p.discount}%</span>
                                            </div>
                                            <div className="promotion-detail-item">
                                                <span className="promotion-detail-label">Start Date:</span>
                                                <span className="promotion-detail-value">
                                                    {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="promotion-detail-item">
                                                <span className="promotion-detail-label">End Date:</span>
                                                <span className="promotion-detail-value">
                                                    {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Promotion Performance Tracking */}
                                        {(() => {
                                            const performance = getPromotionPerformance(p);
                                            return (
                                                <div className="promotion-performance">
                                                    <h4 className="promotion-performance-title">
                                                        📊 Performance Metrics
                                                    </h4>
                                                    <div className="promotion-performance-grid">
                                                        <div className="promotion-performance-item">
                                                            <span className="promotion-performance-label">Orders:</span>
                                                            <span className="promotion-performance-value">
                                                                {performance.orderCount}
                                                            </span>
                                                        </div>
                                                        <div className="promotion-performance-item">
                                                            <span className="promotion-performance-label">Conversion:</span>
                                                            <span className="promotion-performance-value">
                                                                {performance.conversionRate.toFixed(1)}%
                                                            </span>
                                                        </div>
                                                        <div className="promotion-performance-item">
                                                            <span className="promotion-performance-label">Revenue:</span>
                                                            <span className="promotion-performance-value">
                                                                ${performance.totalRevenue.toFixed(2)}
                                                            </span>
                                                        </div>
                                                        <div className="promotion-performance-item">
                                                            <span className="promotion-performance-label">Avg Order:</span>
                                                            <span className="promotion-performance-value">
                                                                ${performance.avgOrderValue.toFixed(2)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {performance.totalDiscountGiven > 0 && (
                                                        <div className="promotion-discount-total">
                                                            💰 Total Discount Given: ${performance.totalDiscountGiven.toFixed(2)}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })()}
                                        
                                        <div className="promotion-actions">
                                            <button 
                                                onClick={() => handleEdit(p)} 
                                                className="promotion-btn promotion-btn-edit"
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(p._id)} 
                                                className="promotion-btn promotion-btn-delete"
                                            >
                                                🗑️ Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            
            <Footer />
        </div>
    );
}

export default PromotionDashboard;
