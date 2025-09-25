import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PaymentForm = () => {
  const [cards, setCards] = useState([]);
  const [amount, setAmount] = useState(null); // ✅ amount comes from query param
  const [selectedCard, setSelectedCard] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  // ✅ Get amount and form completion status from query string (passed from Checkout)
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const amt = queryParams.get('amount');
    const formComplete = queryParams.get('formComplete');
    
    if (amt) {
      setAmount(parseFloat(amt));
    }
    
    // If formComplete is not true, show error
    if (formComplete !== 'true') {
      setError('Please complete all required fields in the checkout form before proceeding with payment.');
    }
  }, []);

  // ✅ Fetch cards for user
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get('/payment/cards'); // JWT token auto-attached
        setCards(res.data.paymentMethods);
      } catch (err) {
        console.error('Fetch cards error:', err);
        setError('Error fetching cards');
      }
    };
    fetchCards();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // Check if form is complete
    const queryParams = new URLSearchParams(window.location.search);
    const formComplete = queryParams.get('formComplete');
    
    if (formComplete !== 'true') {
      setError('Please complete all required fields in the checkout form before proceeding with payment.');
      return;
    }

    if (!selectedCard) {
      setError('Please select a card');
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Invalid amount');
      return;
    }

    try {
      const res = await api.post('/payment/pay', {
        amount, // ✅ already set from query param
        paymentMethodId: selectedCard,
      });

      setSuccess(`Payment of $${res.data.payment.amount} successful!`);
      setSelectedCard('');

      // Send success message to parent window (checkout) without navigating
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'PAYMENT_SUCCESS',
          payment: res.data.payment,
          amount: res.data.payment.amount
        }, '*');
      } else {
        // Only redirect if not in iframe
        setTimeout(() => {
          navigate('/CardList');
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <h3>Make Payment</h3>

      {/* ✅ Card selection */}
      <select
        value={selectedCard}
        onChange={(e) => setSelectedCard(e.target.value)}
        className="form-control mb-3"
        required
      >
        <option value="">Select Card</option>
        {cards.map((card) => (
          <option key={card._id} value={card.stripePaymentMethodId}>
            {card.cardBrand} ****{card.last4}
          </option>
        ))}
      </select>

      {/* ✅ Show amount (read-only, no input field) */}
      {amount !== null && (
        <div className="mb-3">
          <strong>Amount to Pay:</strong> ${amount}
        </div>
      )}

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={!amount || amount <= 0 || cards.length === 0 || !selectedCard}
      >
        Pay ${amount}
      </button>
    </form>
  );
};

export default PaymentForm;
