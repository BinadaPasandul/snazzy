import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PaymentForm = () => {
  const [cards, setCards] = useState([]);
  const [amount, setAmount] = useState('');
  const [selectedCard, setSelectedCard] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const navigate = useNavigate();

  // Fetch cards for user
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

    if (!selectedCard) {
      setError('Please select a card');
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    try {
      const res = await api.post('/payment/pay', {
        amount: parseFloat(amount),
        paymentMethodId: selectedCard,
      });

      // Use amount from response
      setSuccess(`Payment of $${res.data.payment.amount} successful!`);
      setAmount('');
      setSelectedCard('');

      // Redirect to home after 2 seconds
      setTimeout(() => {
        navigate('/CardList');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-4">
      <h3>Make Payment</h3>

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

      <input
        type="number"
        placeholder="Amount (USD)"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="form-control mb-3"
        required
      />

      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <button type="submit" className="btn btn-primary">
        Pay
      </button>
    </form>
  );
};

export default PaymentForm;
