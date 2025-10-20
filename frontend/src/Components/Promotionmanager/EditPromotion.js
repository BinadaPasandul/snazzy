import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Nav from '../Navbar/nav';
import api from '../../utils/api';
import './editpromotion.css';

function EditPromotion() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
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


    useEffect(() => {
        const fetchPromotion = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await api.get(`/Promotions/${id}`);
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

        // Date validation - no past dates allowed
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to start of day
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);

        if (startDateObj < today) {
            alert('Start Date cannot be in the past. Please select today or a future date.');
            return;
        }

        if (endDateObj < today) {
            alert('End Date cannot be in the past. Please select today or a future date.');
            return;
        }

        if (endDateObj < startDateObj) {
            alert('End Date must be after Start Date');
            return;
        }

        setIsSubmitting(true);

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

            await api.put(`/Promotions/${id}`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert('Changes saved successfully');
            navigate('/promotiondashboard');
        } catch (err) {
            alert(`Failed to save: ${err?.response?.data?.message || err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-promotion-container">
                <Nav />
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading promotion details...</p>
                </div>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="edit-promotion-container">
                <Nav />
                <div className="error-container">
                    <div className="error-icon">⚠️</div>
                    <h3>Oops! Something went wrong</h3>
                    <p>{error}</p>
                    <button onClick={() => window.location.reload()} className="retry-btn">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <Nav />
            <div className="edit-promotion-container">
                <div className="promotion-form-wrapper">
                    {/* Form Container (Left Side) */}
                    <div className="form-container">
                        <div className="form-header">
                            <div className="header-icon">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </div>
                            <h2 className="form-title">Edit Promotion</h2>
                            <p className="form-subtitle">Update your promotion details below</p>
                        </div>
                        
                        <div className="form-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label className="form-label" htmlFor="title">
                                            <svg className="label-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                                            </svg>
                                            Promotion Title
                                        </label>
                                        <input
                                            id="title"
                                            name="title"
                                            type="text"
                                            className="form-input"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="Enter promotion title"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="productId">
                                            <svg className="label-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                <polyline points="3.27,6.96 12,12.01 20.73,6.96"></polyline>
                                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                            </svg>
                                            Product ID
                                        </label>
                                        <input
                                            id="productId"
                                            name="productId"
                                            type="text"
                                            className="form-input"
                                            value={formData.productId}
                                            onChange={handleChange}
                                            placeholder="Enter product ID"
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label" htmlFor="description">
                                            <svg className="label-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                                <polyline points="14,2 14,8 20,8"></polyline>
                                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                                <polyline points="10,9 9,9 8,9"></polyline>
                                            </svg>
                                            Description
                                        </label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            rows={4}
                                            className="form-textarea"
                                            value={formData.description}
                                            onChange={handleChange}
                                            placeholder="Enter promotion description"
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="discount">
                                            <svg className="label-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                                            </svg>
                                            Discount %
                                        </label>
                                        <input
                                            id="discount"
                                            name="discount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            className="form-input"
                                            value={formData.discount}
                                            onChange={handleChange}
                                            placeholder="e.g., 10"
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="startDate">
                                            <svg className="label-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            Start Date
                                        </label>
                                        <input
                                            id="startDate"
                                            name="startDate"
                                            type="date"
                                            className="form-input"
                                            value={formData.startDate}
                                            onChange={handleChange}
                                            min={new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                    <div className="form-group">
                                        <label className="form-label" htmlFor="endDate">
                                            <svg className="label-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="16" y1="2" x2="16" y2="6"></line>
                                                <line x1="8" y1="2" x2="8" y2="6"></line>
                                                <line x1="3" y1="10" x2="21" y2="10"></line>
                                            </svg>
                                            End Date
                                        </label>
                                        <input
                                            id="endDate"
                                            name="endDate"
                                            type="date"
                                            className="form-input"
                                            value={formData.endDate}
                                            onChange={handleChange}
                                            min={formData.startDate || new Date().toISOString().split('T')[0]}
                                            required
                                        />
                                    </div>

                                    <div className="form-group full-width">
                                        <label className="form-label" htmlFor="bannerImage">
                                            <svg className="label-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21,15 16,10 5,21"></polyline>
                                            </svg>
                                            Banner Image
                                        </label>
                                        {formData.bannerImage && (
                                            <div className="current-banner">
                                                <img
                                                    src={`http://localhost:5000${formData.bannerImage}`}
                                                    alt="Current Banner"
                                                    className="current-banner-img"
                                                />
                                                <span className="current-banner-label">Current Banner</span>
                                            </div>
                                        )}
                                        <div className="file-input-wrapper">
                                            <input
                                                type="file"
                                                id="bannerImage"
                                                accept="image/*"
                                                className="file-input"
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor="bannerImage" className="file-input-label">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="7,10 12,15 17,10"></polyline>
                                                    <line x1="12" y1="15" x2="12" y2="3"></line>
                                                </svg>
                                                {formData.bannerFile ? formData.bannerFile.name : 'Choose new banner image...'}
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-actions">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => navigate('/promotiondashboard')}
                                    >
                                        <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <line x1="19" y1="12" x2="5" y2="12"></line>
                                            <polyline points="12,19 5,12 12,5"></polyline>
                                        </svg>
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <div className="btn-spinner"></div>
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                                                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                                                    <polyline points="7,3 7,8 15,8"></polyline>
                                                </svg>
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Preview Container (Right Side) */}
                    <div className="preview-container">
                        <div className="preview-header">
                            <div className="preview-icon">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                    <circle cx="12" cy="12" r="3"></circle>
                                </svg>
                            </div>
                            <h3>Live Preview</h3>
                            <p>See how your changes will look</p>
                        </div>
                        
                        <div className="preview-card">
                            <div className="preview-banner">
                                {formData.bannerFile ? (
                                    <img 
                                        src={URL.createObjectURL(formData.bannerFile)} 
                                        alt="Banner preview" 
                                        className="banner-preview"
                                    />
                                ) : formData.bannerImage ? (
                                    <img 
                                        src={`http://localhost:5000${formData.bannerImage}`}
                                        alt="Current banner" 
                                        className="banner-preview"
                                    />
                                ) : (
                                    <div className="banner-placeholder">
                                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21,15 16,10 5,21"></polyline>
                                        </svg>
                                        <span>Banner Preview</span>
                                    </div>
                                )}
                                {formData.discount && (
                                    <div className="discount-badge">
                                        <span className="discount-percent">{formData.discount}%</span>
                                        <span className="discount-text">OFF</span>
                                    </div>
                                )}
                            </div>

                            <div className="preview-content">
                                <h3 className="preview-title">
                                    {formData.title || 'Promotion Title'}
                                </h3>
                                <p className="preview-description">
                                    {formData.description || 'Enter a description for your promotion...'}
                                </p>
                                
                                <div className="preview-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Product ID</span>
                                        <span className="detail-value">{formData.productId || 'Not specified'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Discount</span>
                                        <span className="detail-value">{formData.discount ? `${formData.discount}%` : 'Not set'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Start Date</span>
                                        <span className="detail-value">{formData.startDate || 'Not set'}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">End Date</span>
                                        <span className="detail-value">{formData.endDate || 'Not set'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default EditPromotion;
