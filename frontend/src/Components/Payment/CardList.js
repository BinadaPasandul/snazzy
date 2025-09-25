import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

const CardList = () => {
  const [cards, setCards] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch cards
  const fetchCards = async () => {
    try {
      const res = await api.get("/payment/cards");
      setCards(res.data.paymentMethods);
    } catch (err) {
      setError("Error fetching cards");
    }
  };

  // Delete card
  const handleDelete = async (cardId) => {
    try {
      await api.delete(`/payment/card/${cardId}`);
      setCards((prev) => prev.filter((c) => c._id !== cardId));
      setSuccess("Card deleted successfully");
    } catch (err) {
      setError("Error deleting card");
    }
  };



  useEffect(() => {
    fetchCards();
  }, []);

  const getCardBrandIcon = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return '💳';
      case 'mastercard':
        return '💳';
      case 'amex':
        return '💳';
      case 'discover':
        return '💳';
      default:
        return '💳';
    }
  };

  const getCardBrandColor = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'from-blue-600 to-blue-800';
      case 'mastercard':
        return 'from-red-500 to-yellow-500';
      case 'amex':
        return 'from-green-600 to-blue-600';
      case 'discover':
        return 'from-orange-500 to-red-500';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  const getCardBrandGradient = (brand) => {
    switch (brand?.toLowerCase()) {
      case 'visa':
        return 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)';
      case 'mastercard':
        return 'linear-gradient(135deg, #ef4444 0%, #eab308 100%)';
      case 'amex':
        return 'linear-gradient(135deg, #16a34a 0%, #2563eb 100%)';
      case 'discover':
        return 'linear-gradient(135deg, #f97316 0%, #ef4444 100%)';
      default:
        return 'linear-gradient(135deg, #4b5563 0%, #1f2937 100%)';
    }
  };

  const formatExpirationDate = (expMonth, expYear) => {
    if (!expMonth || !expYear) return 'N/A';
    const month = expMonth.toString().padStart(2, '0');
    const year = expYear.toString().slice(-2); // Show only last 2 digits of year
    return `${month}/${year}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>Payment Methods</h1>
          <p style={{ color: '#6b7280' }}>Manage your saved payment cards</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div style={{
            marginBottom: '1.5rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#dc2626',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        
        {success && (
          <div style={{
            marginBottom: '1.5rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            color: '#16a34a',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            display: 'flex',
            alignItems: 'center'
          }}>
            <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        {/* Cards Grid */}
        {cards.length > 0 ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem'
          }}>
            {cards.map((card) => (
              <div
                key={card._id}
                style={{
                  background: getCardBrandGradient(card.cardBrand),
                  borderRadius: '0.75rem',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                  padding: '1.5rem',
                  color: 'white',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                {/* Card Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '8rem',
                  height: '8rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  marginRight: '-4rem',
                  marginTop: '-4rem'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '6rem',
                  height: '6rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '50%',
                  marginLeft: '-3rem',
                  marginBottom: '-3rem'
                }}></div>
                
                {/* Card Content */}
                <div style={{ position: 'relative', zIndex: 10 }}>
                  {/* Card Brand */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{getCardBrandIcon(card.cardBrand)}</span>
                      <span style={{ fontSize: '1.125rem', fontWeight: '600', textTransform: 'uppercase' }}>{card.cardBrand}</span>
                    </div>
                    <div style={{ fontSize: '0.875rem', opacity: 0.8, textAlign: 'right' }}>
                      <div style={{ fontSize: '0.75rem', marginBottom: '0.25rem' }}>EXP</div>
                      {formatExpirationDate(card.expMonth, card.expYear)}
                    </div>
                  </div>

                  {/* Card Number */}
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{
                      fontSize: '1.5rem',
                      fontFamily: 'monospace',
                      letterSpacing: '0.1em'
                    }}>
                      •••• •••• •••• {card.last4}
                    </div>
                  </div>

                  {/* Card Actions */}
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Link
                      to={`/update-card/${card._id}`}
                      style={{
                        flex: 1,
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        color: 'white',
                        fontWeight: '500',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        textAlign: 'center',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        transition: 'all 0.2s',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                      onMouseOut={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                    >
                      Update
                    </Link>
                    <button
                      onClick={() => handleDelete(card._id)}
                      style={{
                        flex: 1,
                        backgroundColor: '#ef4444',
                        color: 'white',
                        fontWeight: '500',
                        padding: '0.5rem 1rem',
                        borderRadius: '0.5rem',
                        fontSize: '0.875rem',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.target.style.backgroundColor = '#dc2626'}
                      onMouseOut={(e) => e.target.style.backgroundColor = '#ef4444'}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div style={{ textAlign: 'center', padding: '3rem 0' }}>
            <div style={{
              width: '6rem',
              height: '6rem',
              margin: '0 auto 1rem',
              backgroundColor: '#e5e7eb',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg style={{ width: '3rem', height: '3rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '500', color: '#111827', marginBottom: '0.5rem' }}>No payment methods</h3>
            <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>You haven't added any payment cards yet.</p>
          </div>
        )}

        {/* Add New Card Button */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link
            to="/add-card"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '0.75rem 1.5rem',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '500',
              borderRadius: '0.5rem',
              color: 'white',
              backgroundColor: '#4f46e5',
              textDecoration: 'none',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
            onMouseOver={(e) => {
              e.target.style.backgroundColor = '#4338ca';
              e.target.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
            }}
            onMouseOut={(e) => {
              e.target.style.backgroundColor = '#4f46e5';
              e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
            }}
          >
            <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Card
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CardList;
