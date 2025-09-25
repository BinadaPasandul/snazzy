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
      await api.post('/payment/add', { paymentMethodId: paymentMethod.id });
      setSuccess('✅ Card added successfully!');
      setError(null);

      setTimeout(() => {
        navigate('/CardList');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || '⚠️ Error adding card');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Add Card</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border border-gray-300 rounded-md p-3">
            <CardElement className="outline-none" />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-md p-2">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 text-sm rounded-md p-2">
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={!stripe}
            className="w-full bg-indigo-600 text-white font-medium py-2 px-4 rounded-md shadow-sm transition hover:bg-indigo-700 disabled:opacity-50"
          >
            Add Card
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddCard;
