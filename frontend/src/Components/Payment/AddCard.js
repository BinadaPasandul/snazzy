import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../utils/api';

const AddCard = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (stripeError) {
      setError(stripeError.message);
      return;
    }

    try {
      // Send paymentMethod.id to backend to attach to user
      await api.post('/payment/add', { paymentMethodId: paymentMethod.id }); // no withCredentials
      setSuccess('Card added successfully!');
      setError(null);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/CardList');
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || 'Error adding card');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <h3>Add Card</h3>

      <CardElement className="form-control mb-3" />
      
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <button type="submit" className="btn btn-primary" disabled={!stripe}>
        Add Card
      </button>
    </form>
  );
};

export default AddCard;
