import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Nav from '../Navbar/nav';
import api from '../../utils/api';
import './promotiondashboard.css';

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
        <>
            <Nav />

            <div style={{ padding: '20px', maxWidth: '1200px', margin: 'auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h2>Promotion Manager Dashboard</h2>
                    <button 
                        onClick={() => navigate('/insertpromotion')} 
                        style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#6c63ff', color: '#fff', border: 'none', cursor: 'pointer' }}
                    >
                        Add Promotion
                    </button>
                </div>

                {/* Search Bar */}
                <div style={{ marginBottom: '20px' }}>
                    <div style={{ position: 'relative', maxWidth: '400px' }}>
                        <input
                            type="text"
                            placeholder="Search promotions by title, description, product ID, discount, or date..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '12px 16px 12px 40px',
                                border: '2px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                backgroundColor: '#f8fafc'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#6c63ff';
                                e.target.style.backgroundColor = '#fff';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#e2e8f0';
                                e.target.style.backgroundColor = '#f8fafc';
                            }}
                        />
                        <div style={{
                            position: 'absolute',
                            left: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#6b7280',
                            fontSize: '16px'
                        }}>
                            🔍
                        </div>
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                style={{
                                    position: 'absolute',
                                    right: '12px',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    background: 'none',
                                    border: 'none',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    padding: '4px'
                                }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                    {searchTerm && (
                        <div style={{ marginTop: '8px', fontSize: '14px', color: '#6b7280' }}>
                            Showing {filteredPromotions.length} of {promotions.length} promotions
                        </div>
                    )}
                </div>

                {/* Promotion Performance Summary */}
                {!loading && promotions.length > 0 && (
                    <div style={{ 
                        marginBottom: '20px',
                        backgroundColor: '#f8fafc',
                        borderRadius: '12px',
                        padding: '20px',
                        border: '1px solid #e2e8f0'
                    }}>
                        <h3 style={{ 
                            margin: '0 0 16px 0', 
                            color: '#1f2937',
                            fontSize: '1.25rem',
                            fontWeight: '600'
                        }}>
                            📈 Promotion Performance Summary
                        </h3>
                        
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
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                                    gap: '16px'
                                }}>
                                    <div style={{
                                        backgroundColor: '#fff',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                                            {totalPromotionOrders}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            Total Promotion Orders
                                        </div>
                                    </div>
                                    <div style={{
                                        backgroundColor: '#fff',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                                            {overallConversionRate.toFixed(1)}%
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            Overall Conversion Rate
                                        </div>
                                    </div>
                                    <div style={{
                                        backgroundColor: '#fff',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                                            ${totalPromotionRevenue.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            Total Promotion Revenue
                                        </div>
                                    </div>
                                    <div style={{
                                        backgroundColor: '#fff',
                                        padding: '16px',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb',
                                        textAlign: 'center'
                                    }}>
                                        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>
                                            ${totalDiscountGiven.toFixed(2)}
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                                            Total Discounts Given
                                        </div>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}

                {loading ? (
                    <div>Loading promotions...</div>
                ) : error ? (
                    <div style={{ color: 'red' }}>Error loading promotions: {error}</div>
                ) : filteredPromotions.length === 0 ? (
                    <div style={{ 
                        textAlign: 'center', 
                        padding: '40px', 
                        color: '#6b7280',
                        backgroundColor: '#f8fafc',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0'
                    }}>
                        {searchTerm ? (
                            <>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>🔍</div>
                                <div>No promotions found matching "{searchTerm}"</div>
                                <button 
                                    onClick={() => setSearchTerm('')}
                                    style={{
                                        marginTop: '12px',
                                        padding: '8px 16px',
                                        backgroundColor: '#6c63ff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '6px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Clear Search
                                </button>
                            </>
                        ) : (
                            <>
                                <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                                <div>No promotions found.</div>
                            </>
                        )}
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {filteredPromotions.map((p) => (
                            <div key={p._id} style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                {p.bannerImage ? (
                                    <img
                                        src={`http://localhost:5000${p.bannerImage}`} // full URL to display image
                                        alt={p.title}
                                        style={{ width: '100%', height: '150px', objectFit: 'cover' }}
                                    />
                                ) : (
                                    <div style={{ width: '100%', height: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>No Image</div>
                                )}
                                <div style={{ padding: '12px' }}>
                                    <h3 style={{ margin: '0 0 8px 0' }}>{p.title}</h3>
                                    
                                    {/* Product Details */}
                                    {(() => {
                                        const product = getProductByCode(p.productId);
                                        if (product) {
                                            const originalPrice = product.pamount;
                                            const discountedPrice = originalPrice - (originalPrice * p.discount / 100);
                                            return (
                                                <div style={{ 
                                                    background: '#f8f9fa', 
                                                    padding: '8px', 
                                                    borderRadius: '6px', 
                                                    marginBottom: '8px',
                                                    border: '1px solid #e9ecef'
                                                }}>
                                                    <p style={{ margin: '0 0 4px 0', fontSize: '14px', fontWeight: 'bold', color: '#495057' }}>
                                                        📦 {product.pname}
                                                    </p>
                                                    <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6c757d' }}>
                                                        Code: {product.pcode} | Size: {product.psize} | Color: {product.pcolor}
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <span style={{ 
                                                            color: '#e53e3e', 
                                                            textDecoration: 'line-through', 
                                                            fontSize: '12px' 
                                                        }}>
                                                            ${originalPrice}
                                                        </span>
                                                        <span style={{ 
                                                            color: '#38a169', 
                                                            fontWeight: 'bold', 
                                                            fontSize: '14px' 
                                                        }}>
                                                            ${discountedPrice.toFixed(2)}
                                                        </span>
                                                        <span style={{ 
                                                            background: '#dc3545', 
                                                            color: 'white', 
                                                            padding: '2px 6px', 
                                                            borderRadius: '4px', 
                                                            fontSize: '10px',
                                                            fontWeight: 'bold'
                                                        }}>
                                                            SAVE ${(originalPrice - discountedPrice).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return <p><strong>Product ID:</strong> {p.productId} (Product not found)</p>;
                                    })()}
                                    
                                    <p><strong>Promotion Description:</strong> {p.description || 'N/A'}</p>
                                    <p><strong>Discount:</strong> {p.discount}%</p>
                                    <p><strong>Start:</strong> {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'}</p>
                                    <p><strong>End:</strong> {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}</p>
                                    
                                    {/* Promotion Performance Tracking */}
                                    {(() => {
                                        const performance = getPromotionPerformance(p);
                                        return (
                                            <div style={{ 
                                                background: '#f0f9ff', 
                                                padding: '12px', 
                                                borderRadius: '8px', 
                                                marginTop: '12px',
                                                border: '1px solid #bae6fd'
                                            }}>
                                                <h4 style={{ 
                                                    margin: '0 0 8px 0', 
                                                    fontSize: '14px', 
                                                    fontWeight: 'bold', 
                                                    color: '#0369a1' 
                                                }}>
                                                    📊 Performance Metrics
                                                </h4>
                                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', color: '#0369a1' }}>Orders:</span>
                                                        <span style={{ marginLeft: '4px', color: '#0c4a6e' }}>
                                                            {performance.orderCount}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', color: '#0369a1' }}>Conversion:</span>
                                                        <span style={{ marginLeft: '4px', color: '#0c4a6e' }}>
                                                            {performance.conversionRate.toFixed(1)}%
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', color: '#0369a1' }}>Revenue:</span>
                                                        <span style={{ marginLeft: '4px', color: '#0c4a6e' }}>
                                                            ${performance.totalRevenue.toFixed(2)}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <span style={{ fontWeight: 'bold', color: '#0369a1' }}>Avg Order:</span>
                                                        <span style={{ marginLeft: '4px', color: '#0c4a6e' }}>
                                                            ${performance.avgOrderValue.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>
                                                {performance.totalDiscountGiven > 0 && (
                                                    <div style={{ 
                                                        marginTop: '8px', 
                                                        padding: '6px 8px', 
                                                        backgroundColor: '#fef3c7', 
                                                        borderRadius: '4px',
                                                        fontSize: '11px',
                                                        color: '#92400e'
                                                    }}>
                                                        💰 Total Discount Given: ${performance.totalDiscountGiven.toFixed(2)}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })()}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px' }}>
                                        <button 
                                            onClick={() => handleEdit(p)} 
                                            style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#00b894', color: '#fff', border: 'none', cursor: 'pointer' }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(p._id)} 
                                            style={{ padding: '5px 10px', borderRadius: '5px', backgroundColor: '#ff4d4d', color: '#fff', border: 'none', cursor: 'pointer' }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default PromotionDashboard;
