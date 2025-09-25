import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './insertpromotion.css';

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

      await axios.post('http://localhost:5000/Promotions', data, {
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
    <div className="promotion-form-container">
      <div className="promotion-form">
        <div className="form-header">
          <h2>Create New Promotion</h2>
          <p>Fill in the details below to create an amazing promotion</p>
        </div>
        
        <div className="form-body">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
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

            <div className="form-group">
              <label htmlFor="startDate">Start Date</label>
              <input 
                type="date" 
                id="startDate"
                name="startDate" 
                value={formData.startDate} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date</label>
              <input 
                type="date" 
                id="endDate"
                name="endDate" 
                value={formData.endDate} 
                onChange={handleChange} 
                required 
              />
            </div>

            <div className="form-group">
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
              className={`submit-btn ${isSubmitting ? 'loading' : ''}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating Promotion...' : 'Create Promotion'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default InsertPromotion;
