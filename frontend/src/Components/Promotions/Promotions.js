import React, { useEffect, useState } from 'react';
import axios from 'axios';

function Promotions() {
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPromotions = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await axios.get('http://localhost:5000/Promotions');
            setPromotions(res.data?.Promotions || []);
        } catch (err) {
            setError(err?.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    if (loading) {
        return <div>Loading promotions...</div>;
    }

    if (error) {
        return <div>Error loading promotions: {error}</div>;
    }

    return (
        <div style={{ maxWidth: 1100, margin: '24px auto', padding: '0 16px' }}>
            <h2>Current Promotions</h2>
            {promotions.length === 0 ? (
                <div>No promotions available.</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {promotions.map((p) => (
                        <div key={p._id} style={{ border: '1px solid #e5e7eb', borderRadius: 10, overflow: 'hidden', background: '#fff' }}>
                            {p.bannerImage ? (
                                <img src={p.bannerImage} alt={p.title} style={{ width: '100%', height: 160, objectFit: 'cover' }} />
                            ) : (
                                <div style={{ width: '100%', height: 160, background: '#f3f4f6' }} />
                            )}
                            <div style={{ padding: 12 }}>
                                <h3 style={{ margin: '0 0 6px 0' }}>{p.title}</h3>
                                {p.description && <p style={{ margin: '6px 0' }}>{p.description}</p>}
                                <p style={{ margin: '6px 0' }}><strong>Discount:</strong> {p.discount}%</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default Promotions;


