import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Nav from '../Navbar/nav';
import './EditPromotion.css'; // Ensure correct path

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
        bannerImage: '', // current image path
        bannerFile: null // new file to upload
    });

    const BACKEND_URL = 'http://localhost:5000';

    useEffect(() => {
        const fetchPromotion = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await axios.get(`${BACKEND_URL}/Promotions/${id}`);
                const p = res.data?.promotion;
                if (p) {
                    setFormData({
                        title: p.title || '',
                        productId: p.productId || '',
                        description: p.description || '',
                        discount: p.discount ?? '',
                        startDate: p.startDate ? p.startDate.split('T')[0] : '',
                        endDate: p.endDate ? p.endDate.split('T')[0] : '',
                        bannerImage: p.bannerImage || '',
                        bannerFile: null
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
        fetchPromotion();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData((prev) => ({ ...prev, bannerFile: file }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { title, productId, discount, startDate, endDate, description, bannerFile } = formData;

        if (!title || !productId || discount === '' || !startDate || !endDate) {
            alert('Title, Product ID, Discount, Start Date, and End Date are required');
            return;
        }

        if (new Date(endDate) < new Date(startDate)) {
            alert('End Date must be after Start Date');
            return;
        }

        try {
            const data = new FormData();
            data.append('title', title);
            data.append('productId', productId);
            data.append('description', description || '');
            data.append('discount', discount);
            data.append('startDate', startDate);
            data.append('endDate', endDate);

            if (bannerFile) {
                data.append('bannerImage', bannerFile);
            }

            await axios.put(`${BACKEND_URL}/Promotions/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Changes saved successfully');
            navigate('/promotiondashboard');
        } catch (err) {
            alert(`Failed to save: ${err?.response?.data?.message || err.message}`);
        }
    };

    if (loading) return (
        <div className="edit-promotion-container">
            <div className="loading">Loading...</div>
        </div>
    );
    
    if (error) return (
        <div className="edit-promotion-container">
            <div className="error">Error: {error}</div>
        </div>
    );

    return (
        <>
            <Nav />
            <div className="edit-promotion-container">
                <div className="edit-promotion-form">
                    <div className="form-header">
                        <h2>Edit Promotion</h2>
                        <p>Update your promotion details below</p>
                    </div>
                    
                    <div className="form-body">
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="title">Title</label>
                                <input
                                    id="title"
                                    name="title"
                                    type="text"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Enter promotion title"
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
                                    placeholder="Enter product ID"
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
                                    placeholder="Enter promotion description"
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
                                    placeholder="e.g., 10"
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
                                <label htmlFor="bannerImage">Banner Image</label>
                                {formData.bannerImage && (
                                    <div style={{ marginBottom: '12px', borderRadius: '8px', overflow: 'hidden' }}>
                                        <img
                                            src={`${BACKEND_URL}${formData.bannerImage}`}
                                            alt="Current Banner"
                                            style={{
                                                width: '200px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '8px',
                                                border: '2px solid #e2e8f0'
                                            }}
                                        />
                                    </div>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{
                                        padding: '12px',
                                        border: '2px dashed #e2e8f0',
                                        borderRadius: '8px',
                                        backgroundColor: '#f7fafc',
                                        cursor: 'pointer'
                                    }}
                                />
                            </div>

                            <div className="button-container">
                                <button
                                    type="button"
                                    onClick={() => navigate('/promotiondashboard')}
                                    className="btn-cancel"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn-save"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditPromotion;
