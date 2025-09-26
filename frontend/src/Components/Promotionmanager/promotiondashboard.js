import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Nav from '../Navbar/nav';

function PromotionDashboard() {
    const [promotions, setPromotions] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const BACKEND_URL = 'http://localhost:5000'; // your backend host

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            try {
                // Fetch both promotions and products
                const [promotionsRes, productsRes] = await Promise.all([
                    axios.get(`${BACKEND_URL}/Promotions`),
                    axios.get(`${BACKEND_URL}/products`)
                ]);
                
                const promos = promotionsRes.data.promotions || [];
                const prods = productsRes.data.products || [];
                
                setPromotions(promos);
                setProducts(prods);
            } catch (err) {
                setError(err?.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const refresh = async () => {
        try {
            const [promotionsRes, productsRes] = await Promise.all([
                axios.get(`${BACKEND_URL}/Promotions`),
                axios.get(`${BACKEND_URL}/products`)
            ]);
            
            const promos = promotionsRes.data.promotions || [];
            const prods = productsRes.data.products || [];
            
            setPromotions(promos);
            setProducts(prods);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        }
    };

    // Helper function to get product details by product code
    const getProductByCode = (productCode) => {
        return products.find(product => product.pcode === productCode);
    };

    const handleDelete = async (promotionId) => {
        const confirmed = window.confirm('Are you sure you want to delete this promotion?');
        if (!confirmed) return;
        try {
            await axios.delete(`${BACKEND_URL}/Promotions/${promotionId}`);
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

                {loading ? (
                    <div>Loading promotions...</div>
                ) : error ? (
                    <div style={{ color: 'red' }}>Error loading promotions: {error}</div>
                ) : promotions.length === 0 ? (
                    <div>No promotions found.</div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                        {promotions.map((p) => (
                            <div key={p._id} style={{ border: '1px solid #ddd', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                                {p.bannerImage ? (
                                    <img
                                        src={`${BACKEND_URL}${p.bannerImage}`} // full URL to display image
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
