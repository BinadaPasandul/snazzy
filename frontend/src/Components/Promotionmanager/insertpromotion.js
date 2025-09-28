import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './insertpromotion.css';
import api from '../../utils/api';
import Nav from '../Navbar/nav';

function InsertPromotion() {
  const [formData, setFormData] = useState({
    title: '',
    productId: '',
    description: '',
    discount: '',
    startDate: '',
    endDate: '',
  });

  const [bannerFile, setBannerFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setBannerFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, productId, description, discount, startDate, endDate } = formData;

    if (!title || !productId || !discount || !startDate || !endDate) {
      alert('Title, Product ID, Discount, Start Date, and End Date are required');
      return;
    }

    const discountNumber = Number(discount);
    if (isNaN(discountNumber) || discountNumber <= 0) {
      alert('Discount must be a positive number');
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      alert('End Date must be after Start Date');
      return;
    }

    if (!bannerFile) {
      alert('Please select a banner image');
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', title);
      data.append('productId', productId);
      data.append('description', description);
      data.append('discount', discountNumber);
      data.append('startDate', startDate);
      data.append('endDate', endDate);
      data.append('bannerImage', bannerFile); // attach file

      await api.post('/Promotions', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      alert('Promotion added successfully');
      navigate('/promotiondashboard');

      setFormData({
        title: '',
        productId: '',
        description: '',
        discount: '',
        startDate: '',
        endDate: '',
      });
      setBannerFile(null);
    } catch (error) {
      alert(`Failed to add promotion: ${error?.response?.data?.message || error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Nav />
      <div className="insert-promotion-container">
        <div className="promotion-form-wrapper">
          {/* Form Container (Left Side) */}
          <div className="form-container">
            <div className="form-header">
              <div className="header-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                </svg>
              </div>
              <h2 className="form-title">Create New Promotion</h2>
              <p className="form-subtitle">Fill in the details below to create an amazing promotion</p>
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
                      type="text" 
                      id="title"
                      name="title" 
                      className="form-input"
                      placeholder="Enter a catchy promotion title" 
                      value={formData.title} 
                      onChange={handleChange} 
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
                      type="text" 
                      id="productId"
                      name="productId" 
                      className="form-input"
                      placeholder="Enter the product ID" 
                      value={formData.productId} 
                      onChange={handleChange} 
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
                      className="form-textarea"
                      placeholder="Describe your promotion in detail..." 
                      value={formData.description} 
                      onChange={handleChange}
                      rows={4}
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
                      type="number" 
                      id="discount"
                      name="discount" 
                      className="form-input"
                      placeholder="e.g., 25" 
                      value={formData.discount} 
                      onChange={handleChange} 
                      min="0"
                      max="100"
                      step="0.01"
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
                      type="date" 
                      id="startDate"
                      name="startDate" 
                      className="form-input"
                      value={formData.startDate} 
                      onChange={handleChange} 
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
                      type="date" 
                      id="endDate"
                      name="endDate" 
                      className="form-input"
                      value={formData.endDate} 
                      onChange={handleChange} 
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
                    <div className="file-input-wrapper">
                      <input 
                        type="file" 
                        id="bannerImage"
                        name="bannerImage" 
                        className="file-input"
                        accept="image/*" 
                        onChange={handleFileChange} 
                        required
                      />
                      <label htmlFor="bannerImage" className="file-input-label">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7,10 12,15 17,10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        {bannerFile ? bannerFile.name : 'Choose banner image...'}
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
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="btn-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                        </svg>
                        Create Promotion
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
              <p>See how your promotion will look</p>
            </div>
            
            <div className="preview-card">
              <div className="preview-banner">
                {bannerFile ? (
                  <img 
                    src={URL.createObjectURL(bannerFile)} 
                    alt="Banner preview" 
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

export default InsertPromotion;
