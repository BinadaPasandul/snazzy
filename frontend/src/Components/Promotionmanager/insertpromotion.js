import React, { useState } from 'react';
import axios from 'axios';

function InsertPromotion() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        discount: '',
        bannerImage: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

   const handleSubmit = async (e) => {
    e.preventDefault();

    const { title, description, discount, bannerImage } = formData;

    if (!title || !description || !discount || !bannerImage) {
        alert('All fields are required');
        return;
    }

    const discountNumber = Number(discount);
    if (isNaN(discountNumber) || discountNumber <= 0) {
        alert('Discount must be a positive number');
        return;
    }

    setIsSubmitting(true);
    try {
        await axios.post('http://localhost:5000/Promotions', {
            title,
            description,
            discount: discountNumber,
            bannerImage
        });
        alert('Promotion added successfully');
        setFormData({ title: '', description: '', discount: '', bannerImage: '' });
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



