import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const CardList = () => {
  const [cards, setCards] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]); // Refund request objects
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch cards
  const fetchCards = async () => {
    try {
      const res = await api.get('/payment/cards'); 
      setCards(res.data.paymentMethods);
    } catch (err) {
      console.error('Fetch cards error:', err);
      setError('Error fetching cards');
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const res = await api.get('/payment/payments');
      setPayments(res.data.payments);
    } catch (err) {
      console.error('Fetch payments error:', err);
      setError('Error fetching payments');
    }
  };

  // Fetch refund requests for this user
  const fetchRefunds = async () => {
    try {
      const res = await api.get('/refund/my-requests'); // backend endpoint
      setRefunds(res.data.refunds);
    } catch (err) {
      console.error('Fetch refunds error:', err);
      setError('Error fetching refund requests');
    }
  };

  // Delete card
  const handleDelete = async (cardId) => {
    try {
      await api.delete(`/payment/card/${cardId}`);
      setCards((prev) => prev.filter((c) => c._id !== cardId));
    } catch (err) {
      console.error('Delete card error:', err);
      setError('Error deleting card');
    }
  };

  // Create refund request
  const handleRefund = async (paymentId) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post(`/refund/request/${paymentId}`, { reason: '' }); // optional reason
      setSuccess(`Refund request submitted! Status: ${res.data.refundRequest.status}`);
      fetchRefunds(); // refresh refund requests
    } catch (err) {
      console.error('Refund request error:', err);
      setError(err.response?.data?.message || 'Refund request failed');
    }
  };

  useEffect(() => {
    fetchCards();
    fetchPayments();
    fetchRefunds();
  }, []);

  // Get refund status for a payment
  const getRefundStatus = (paymentId) => {
    const req = refunds.find((r) => r.paymentId._id === paymentId); // populated payment
    return req ? req.status : null;
  };

  return (
    <div>
      <h2>Saved Cards</h2>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {success && <div style={{ color: 'green' }}>{success}</div>}

      <ul>
        {cards.map((card) => (
          <li key={card._id}>
            {card.cardBrand} •••• {card.last4}
            <Link to={`/update-card/${card._id}`}>
              <button>Update</button>
            </Link>
            <button 
              style={{ marginLeft: '10px', color: 'red' }} 
              onClick={() => handleDelete(card._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: '20px' }}>
        <Link to="/add-card">
          <button>Add New Card</button>
        </Link>
        <Link to="/pay">
          <button style={{ marginLeft: '10px' }}>Make Payment</button>
        </Link>
      </div>

      <h2 style={{ marginTop: '40px' }}>Your Payments</h2>
      <ul>
        {payments.map((payment) => {
          const refundStatus = getRefundStatus(payment._id);
          return (
            <li key={payment._id}>
              <strong>ID:</strong> {payment._id} - ${payment.amount} - {new Date(payment.createdAt).toLocaleString()}
              
              {refundStatus ? (
                <span style={{ marginLeft: '20px' }}>
                  Refund Status: 
                  {refundStatus === 'pending' && <span style={{ color: 'orange' }}> Pending</span>}
                  {refundStatus === 'approved' && <span style={{ color: 'green' }}> Approved</span>}
                  {refundStatus === 'rejected' && <span style={{ color: 'red' }}> Rejected</span>}
                </span>
              ) : (
                <button 
                  style={{ marginLeft: '30px' }} 
                  onClick={() => handleRefund(payment._id)}
                >
                  Request Refund
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default CardList;
