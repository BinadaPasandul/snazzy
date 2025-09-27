import React, { useState } from 'react';
import Nav from '../Navbar/nav';
import Footer from '../Footer/Footer';
import axios from 'axios';
import './ContactUs.css';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  // Check if user is logged in
  const isLoggedIn = localStorage.getItem('token');
  const userData = isLoggedIn ? JSON.parse(localStorage.getItem('user') || '{}') : null;

  // Pre-fill form if user is logged in
  React.useEffect(() => {
    if (isLoggedIn && userData) {
      setFormData(prev => ({
        ...prev,
        name: userData.name || '',
        email: userData.gmail || '' // Use gmail field from localStorage
      }));
    }
  }, [isLoggedIn, userData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function to decode JWT token and get user ID
  const getUserIdFromToken = () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      
      // Decode JWT token (simple base64 decode for payload)
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload));
      return decoded.id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      const response = await axios.post('http://localhost:5000/contact/submit', {
        ...formData,
        userId: isLoggedIn ? getUserIdFromToken() : null,
        isRegisteredUser: !!isLoggedIn
      });

      if (response.data.status === 'success') {
        setSubmitStatus('success');
        // Reset form but keep pre-filled data for logged-in users
        setFormData(prev => ({
          name: isLoggedIn && userData ? userData.name : '',
          email: isLoggedIn && userData ? userData.gmail : '',
          subject: '',
          message: '',
          phone: ''
        }));
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Contact form error:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-us-page">
      <Nav />
      
      <div className="contact-container">
        <div className="contact-header">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">
            We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
          {isLoggedIn && (
            <div className="user-info">
              <p className="user-status">✓ Logged in as: {userData?.name || 'User'}</p>
              <p className="user-note">Your name and email are pre-filled below</p>
            </div>
          )}
        </div>

        <div className="contact-content">
          <div className="contact-form-section">
            <div className="form-container">
              <h2 className="form-title">Send us a Message</h2>
              
              {submitStatus === 'success' && (
                <div className="alert alert-success">
                  <strong>Message sent successfully!</strong> We'll get back to you soon.
                </div>
              )}
              
              {submitStatus === 'error' && (
                <div className="alert alert-error">
                  <strong>Error sending message.</strong> Please try again or contact us directly.
                </div>
              )}

              <form className="contact-form" onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name" className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your full name"
                      readOnly={isLoggedIn}
                      style={isLoggedIn ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Email Address <span className="required">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="form-input"
                      placeholder="Enter your email address"
                      readOnly={isLoggedIn}
                      style={isLoggedIn ? { backgroundColor: '#f8f9fa', cursor: 'not-allowed' } : {}}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input"
                      placeholder="Enter your phone number (optional)"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="subject" className="form-label">
                      Subject <span className="required">*</span>
                    </label>
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="form-select"
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="support">Technical Support</option>
                      <option value="order">Order Related</option>
                      <option value="return">Returns & Refunds</option>
                      <option value="feedback">Feedback</option>
                      <option value="complaint">Complaint</option>
                      <option value="partnership">Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Message <span className="required">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    className="form-textarea"
                    placeholder="Please describe your inquiry in detail..."
                    rows="6"
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>

          <div className="contact-info-section">
            <div className="info-card">
              <h3 className="info-title">Get in Touch</h3>
              <div className="info-content">
                <div className="info-item">
                  <div className="info-icon">📧</div>
                  <div className="info-text">
                    <h4>Email</h4>
                    <p>mrhks145@gmail.com</p>
                    <p>info@snazzy.com</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">📞</div>
                  <div className="info-text">
                    <h4>Phone</h4>
                    <p>+1 (555) 123-4567</p>
                    <p>Mon-Fri: 9AM-6PM EST</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">📍</div>
                  <div className="info-text">
                    <h4>Address</h4>
                    <p>123 Fashion Street</p>
                    <p>New York, NY 10001</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">💬</div>
                  <div className="info-text">
                    <h4>Live Chat</h4>
                    <p>Available 24/7</p>
                    <p>Click the chat icon below</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="faq-card">
              <h3 className="faq-title">Frequently Asked Questions</h3>
              <div className="faq-content">
                <div className="faq-item">
                  <h4>How long does shipping take?</h4>
                  <p>Standard shipping takes 3-5 business days, express shipping takes 1-2 business days.</p>
                </div>
                <div className="faq-item">
                  <h4>What is your return policy?</h4>
                  <p>We offer a 30-day return policy for all items in original condition.</p>
                </div>
                <div className="faq-item">
                  <h4>How can I track my order?</h4>
                  <p>You'll receive a tracking number via email once your order ships.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ContactUs;
