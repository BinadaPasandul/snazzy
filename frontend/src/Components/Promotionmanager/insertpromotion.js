import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function InsertPromotion() {
    const [formData, setFormData] = useState({
        title: '',
        productId: '',
        description: '',
        discount: '',
        startDate: '',
        endDate: '',
        bannerImage: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { title, productId, description, discount, startDate, endDate, bannerImage } = formData;

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

        setIsSubmitting(true);
        try {
            await axios.post('http://localhost:5000/Promotions', {
                title,
                productId,
                description,
                discount: discountNumber,
                startDate,
                endDate,
                bannerImage
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
                bannerImage: ''
            });
        } catch (error) {
            alert(`Failed to add promotion: ${error?.response?.data?.message || error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="promotion-form-container">
            <h2>Add Promotion</h2>
            <form onSubmit={handleSubmit} className="promotion-form">
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
                        placeholder="Enter related product ID"
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Enter promotion description"
                        rows={4}
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
                    <label htmlFor="bannerImage">Banner Image URL</label>
                    <input
                        id="bannerImage"
                        name="bannerImage"
                        type="text"
                        value={formData.bannerImage}
                        onChange={handleChange}
                        placeholder="https://example.com/banner.jpg"
                    />
                </div>

                <button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : 'Add Promotion'}
                </button>
            </form>
        </div>
    );
}

export default InsertPromotion;
