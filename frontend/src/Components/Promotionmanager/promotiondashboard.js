import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PromotionDashboard() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPromotions = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get('http://localhost:5000/Promotions');
                console.log('API Response:', res.data); // Check response
                // Safely access the array regardless of casing
                const promos = res.data.Promotions || res.data.promotions || [];
                setPromotions(promos);
            } catch (err) {
                setError(err?.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchPromotions();
    }, []);

    const refresh = async () => {
        try {
            const res = await axios.get('http://localhost:5000/Promotions');
            const promos = res.data.Promotions || res.data.promotions || [];
            setPromotions(promos);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        }
    };

    const handleDelete = async (promotionId) => {
        const confirmed = window.confirm('Are you sure you want to delete this promotion?');
        if (!confirmed) return;
        try {
            await axios.delete(`http://localhost:5000/Promotions/${promotionId}`);
            await refresh();
            alert('Promotion deleted');
        } catch (err) {
            alert(`Failed to delete: ${err?.response?.data?.message || err.message}`);
        }
    };

    const handleEdit = (promotion) => {
        navigate(`/EditPromotion/${promotion._id}`);
    };

    if (loading) return <div>Loading promotions...</div>;
    if (error) return <div>Error loading promotions: {error}</div>;

    return (
        <div className="promotion-dashboard">
            <div className="toolbar">
                <h2>Promotion Manager Dashboard</h2>
                <button onClick={() => navigate('/insertpromotion')}>Add Promotion</button>
            </div>

            {promotions.length === 0 ? (
                <div>No promotions found.</div>
            ) : (
                <div className="promotion-grid">
                    {promotions.map((p) => (
                        <div key={p._id} className="promotion-card">
                            {p.bannerImage ? (
                                <img
                                    src={p.bannerImage}
                                    alt={p.title ?? 'Promotion'}
                                    className="promotion-banner"
                                    style={{ width: '100%', height: 160, objectFit: 'cover' }}
                                />
                            ) : (
                                <div
                                    className="promotion-banner placeholder"
                                    style={{ width: '100%', height: 160, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    No Image
                                </div>
                            )}

                            <div className="promotion-content">
                                <h3>{p.title ?? 'No Title'}</h3>
                                <p><strong>Product ID:</strong> {p.productId ?? 'N/A'}</p>
                                {p.description ? <p>{p.description}</p> : <p>No Description</p>}
                                <p><strong>Discount:</strong> {p.discount ?? 0}%</p>
                                <p><strong>Start Date:</strong> {p.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'}</p>
                                <p><strong>End Date:</strong> {p.endDate ? new Date(p.endDate).toLocaleDateString() : 'N/A'}</p>

                                <div className="promotion-actions" style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                                    <button onClick={() => handleEdit(p)}>Edit</button>
                                    <button onClick={() => handleDelete(p._id)} style={{ color: '#b00' }}>Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default PromotionDashboard;
