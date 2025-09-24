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
        productId: '',
        description: '',
        discount: '',
        startDate: '',
        endDate: '',
        bannerImage: ''
    });

    useEffect(() => {
        const fetchById = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`http://localhost:5000/Promotions/${id}`);
                console.log('Backend response:', res.data); // Debugging

                const p = res.data?.promotion; // match backend
                if (p) {
                    setFormData({
                        title: p.title || '',
                        productId: p.productId || '',
                        description: p.description || '',
                        discount: p.discount ?? '',
                        startDate: p.startDate ? p.startDate.split('T')[0] : '',
                        endDate: p.endDate ? p.endDate.split('T')[0] : '',
                        bannerImage: p.bannerImage || ''
                    });
                } else {
                    setError('Promotion not found');
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
        const { title, productId, discount, startDate, endDate } = formData;

        if (!title || !productId || discount === '' || !startDate || !endDate) {
            alert('Title, Product ID, Discount, Start Date, and End Date are required');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert('End Date must be after Start Date');
            return;
        }

        try {
            await axios.put(`http://localhost:5000/Promotions/${id}`, {
                title,
                productId,
                description: formData.description,
                discount: Number(discount),
                startDate,
                endDate,
                bannerImage: formData.bannerImage
            });

            alert('Changes saved successfully');
            navigate('/promotiondashboard');
        } catch (err) {
            alert(`Failed to save: ${err?.response?.data?.message || err.message}`);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ maxWidth: 720, margin: '24px auto', padding: '0 16px' }}>
            <h2>Edit Promotion</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        id="title"
                        name="title"
                        type="text"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="productId">Product ID</label>
                    <input
                        id="productId"
                        name="productId"
                        type="text"
                        value={formData.productId}
                        onChange={handleChange}
                        placeholder="Enter Product ID"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        rows={4}
                        value={formData.description}
                        onChange={handleChange}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="discount">Discount (%)</label>
                    <input
                        id="discount"
                        name="discount"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.discount}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="startDate">Start Date</label>
                    <input
                        id="startDate"
                        name="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="endDate">End Date</label>
                    <input
                        id="endDate"
                        name="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="bannerImage">Banner Image URL</label>
                    <input
                        id="bannerImage"
                        name="bannerImage"
                        type="text"
                        value={formData.bannerImage}
                        onChange={handleChange}
                    />
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                    <button type="button" onClick={() => navigate('/promotiondashboard')}>Cancel</button>
                    <button type="submit">Save Changes</button>
                </div>
            </form>
        </div>
    );
}

export default EditPromotion;

