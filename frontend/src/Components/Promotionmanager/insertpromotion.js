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
    // Discount validation 
    const discountNumber = Number(discount);
    if (isNaN(discountNumber) || discountNumber <= 0) {
      alert('Discount must be a positive number');
      return;
    }

    // Check if start date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const startDateObj = new Date(startDate);
    
    if (startDateObj < today) {
      alert('Start Date cannot be in the past. Please select today or a future date.');
      return;
    }
    // End date must be after start date
    if (new Date(endDate) < new Date(startDate)) {
      alert('End Date must be after Start Date');
      return;
    }

    // File validation
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
      data.append('bannerImage', bannerFile);

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
      <div className="promotion-form-container6">
        <div className="background-decoration"></div>
        <div className="promotion-form6">
          <div className="form-container">
            <div className="form-header6">
              <h2>Create New Promotion</h2>
              <p>Fill in the details below to create an amazing promotion</p>
            </div>
            
            <div className="form-body6">
              <form onSubmit={handleSubmit}>
              <div className="form-group6">
                <label htmlFor="title">Promotion Title</label>
                <input 
                  type="text" 
                  id="title"
                  name="title" 
                  placeholder="Enter a catchy promotion title" 
                  value={formData.title} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group6">
                <label htmlFor="productId">Product ID</label>
                <input 
                  type="text" 
                  id="productId"
                  name="productId" 
                  placeholder="Enter the product ID" 
                  value={formData.productId} 
                  onChange={handleChange} 
                  required 
                />
              </div>

              <div className="form-group6">
                <label htmlFor="description">Description</label>
                <textarea 
                  id="description"
                  name="description" 
                  placeholder="Describe your promotion in detail..." 
                  value={formData.description} 
                  onChange={handleChange}
                  rows={4}
                />
              </div>

              <div className="form-group6">
                <label htmlFor="discount">Discount Percentage</label>
                <input 
                  type="number" 
                  id="discount"
                  name="discount" 
                  placeholder="e.g., 25" 
                  value={formData.discount} 
                  onChange={handleChange} 
                  min="0"
                  max="100"
                  step="0.01"
                  required 
                />
              </div>

              <div className="form-group6">
                <label htmlFor="startDate">Start Date</label>
                <input 
                  type="date" 
                  id="startDate"
                  name="startDate" 
                  value={formData.startDate} 
                  onChange={handleChange} 
                  min={new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>

              <div className="form-group6">
                <label htmlFor="endDate">End Date</label>
                <input 
                  type="date" 
                  id="endDate"
                  name="endDate" 
                  value={formData.endDate} 
                  onChange={handleChange} 
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  required 
                />
              </div>

              <div className="form-group6">
                <label htmlFor="bannerImage">Banner Image</label>
                <input 
                  type="file" 
                  id="bannerImage"
                  name="bannerImage" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  required
                />
              </div>

              <button 
                type="submit" 
                className={`submit-btn6 ${isSubmitting ? 'loading6' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating Promotion...' : 'Create Promotion'}
              </button>
              </form>
            </div>
          </div>

          {/* Preview Container (Right Side) */}
          <div className="preview-container">
            <div className="preview-header">
              <h3>Live Preview</h3>
              <p>See how your promotion will look</p>
            </div>
            
            <div className="preview-card">
              <div className="preview-banner">
                {bannerFile ? (
                  <img
                    src={URL.createObjectURL(bannerFile)}
                    alt="Banner Preview"
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
                <h4 className="preview-title">
                  {formData.title || "Promotion Title"}
                </h4>
                
                {formData.description && (
                  <p className="preview-description">{formData.description}</p>
                )}
                
                <div className="preview-details">
                  {formData.productId && (
                    <div className="detail-item">
                      <span className="detail-label">Product ID:</span>
                      <span className="detail-value">{formData.productId}</span>
                    </div>
                  )}
                  
                  {formData.discount && (
                    <div className="detail-item">
                      <span className="detail-label">Discount:</span>
                      <span className="detail-value">{formData.discount}%</span>
                    </div>
                  )}
                  
                  {formData.startDate && (
                    <div className="detail-item">
                      <span className="detail-label">Start Date:</span>
                      <span className="detail-value">{new Date(formData.startDate).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  {formData.endDate && (
                    <div className="detail-item">
                      <span className="detail-label">End Date:</span>
                      <span className="detail-value">{new Date(formData.endDate).toLocaleDateString()}</span>
                    </div>
                  )}
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
