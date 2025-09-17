import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../utils/api';

const UpdateCard = () => {
  const { cardId } = useParams();
  const stripe = useStripe();
  const elements = useElements();

  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  const navigate = useNavigate();

  // Fetch card details
  useEffect(() => {
    const fetchCard = async () => {
      try {
        const res = await api.get(`/payment/card/${cardId}`); // JWT auto-attached
        setCardData(res.data);
      } catch (err) {
        setError('Error fetching card details');
      }
    };
    fetchCard();
  }, [cardId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const cardNumberElement = elements.getElement(CardNumberElement);

    if (cardNumberElement) {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
      });

      if (stripeError) {
        setError(stripeError.message);
        return;
      }

      try {
        await api.put(`payment/card/${cardId}`, { paymentMethodId: paymentMethod.id }); // no withCredentials
        setSuccess('Card updated successfully!');
        setError(null);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/CardList');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Error updating card');
      }
    }
  };

  if (!cardData) return <p>Loading card...</p>;

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <h3>Update Card</h3>

      <div className="mb-3">
        <label>Saved Card</label>
        <input
          type="text"
          value={`**** **** **** ${cardData.last4}`}
          className="form-control"
          readOnly
        />
      </div>

      <p className="text-muted">Enter new card details</p>

      <div className="mb-3">
        <label>Card Number</label>
        <CardNumberElement className="form-control p-2 border rounded" />
      </div>

      <div className="mb-3">
        <label>Expiry Date</label>
        <CardExpiryElement className="form-control p-2 border rounded" />
      </div>

      <div className="mb-3">
        <label>CVC</label>
        <CardCvcElement className="form-control p-2 border rounded" />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <button type="submit" className="btn btn-warning" disabled={!stripe}>
        Update Card
      </button>
    </form>
  );
};

export default UpdateCard;
