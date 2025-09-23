import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

function EditPromotion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount: '',
        bannerImage: ''
    });

    useEffect(() => {
        const fetchById = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`http://localhost:5000/Promotions/${id}`);
                const p = res.data?.Promotions;
                if (p) {
                    setFormData({
                        title: p.title || '',
                        description: p.description || '',
                        discount: p.discount ?? '',
                        bannerImage: p.bannerImage || ''
                    });
                }
            } catch (err) {
                setError(err?.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchById();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.title || formData.discount === '') {
            alert('Title and Discount are required');
            return;
        }
        try {
            await axios.put(`http://localhost:5000/Promotions/${id}`, {
                title: String(formData.title),
                description: String(formData.description),
                discount: Number(formData.discount),
                bannerImage: String(formData.bannerImage)
            });
            alert('Changes saved');
            navigate('/promotion');
        } catch (err) {
            alert(`Failed to save: ${err?.response?.data?.message || err.message}`);
        }
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 16px' }}>
            <h2>Edit Promotion</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input id="title" name="title" type="text" value={formData.title} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea id="description" name="description" rows={4} value={formData.description} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label htmlFor="discount">Discount (%)</label>
                    <input id="discount" name="discount" type="number" min="0" step="0.01" value={formData.discount} onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label htmlFor="bannerImage">Banner Image URL</label>
                    <input id="bannerImage" name="bannerImage" type="text" value={formData.bannerImage} onChange={handleChange} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => navigate('/promotion')}>Cancel</button>
                    <button type="submit">Save Changes</button>
                </div>
            </form>
        </div>
    );
}

export default EditPromotion;



