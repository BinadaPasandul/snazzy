import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';

const PaymentForm = () => {
  const [cards, setCards] = useState([]);
  const [amount, setAmount] = useState(null); 
  const [selectedCard, setSelectedCard] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const amt = queryParams.get('amount');
    const formComplete = queryParams.get('formComplete');
    
    if (amt) {
      setAmount(parseFloat(amt));
    }
    
    
    if (formComplete !== 'true') {
      setError('Please complete all required fields in the checkout form before proceeding with payment.');
    }
  }, []);

  //  Fetch cards for user
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const res = await api.get('/payment/cards'); 
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
    setIsLoading(true);

    // Check if form is complete
    const queryParams = new URLSearchParams(window.location.search);
    const formComplete = queryParams.get('formComplete');
    const orderData = queryParams.get('orderData'); // Get order data from URL
    
    if (formComplete !== 'true') {
      setError('Please complete all required fields in the checkout form before proceeding with payment.');
      setIsLoading(false);
      return;
    }

    if (!selectedCard) {
      setError('Please select a card');
      alert(error);
      setIsLoading(false);
      return;
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      setError('Invalid amount');
      setIsLoading(false);
      return;
    }

    try {
      // Parse order data if available
      let parsedOrderData = null;
      if (orderData) {
        try {
          parsedOrderData = JSON.parse(decodeURIComponent(orderData));
        } catch (parseError) {
          console.error('Error parsing order data:', parseError);
        }
      }

      const res = await api.post('/payment/pay', {
        amount, 
        paymentMethodId: selectedCard,
        orderData: parsedOrderData // Include order data for invoice
      });

      setSuccess(`Payment of $${res.data.payment.amount} successful!`);
      setSelectedCard('');

      // Send success message
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'PAYMENT_SUCCESS',
          payment: res.data.payment,
          paymentId: res.data.payment._id, 
          amount: res.data.payment.amount
        }, '*');
        console.log('Payment success message sent to parent:', {
          type: 'PAYMENT_SUCCESS',
          payment: res.data.payment,
          paymentId: res.data.payment._id,
          amount: res.data.payment.amount
        });
      } 
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setIsLoading(false);
    }
  };

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

  const formatExpirationDate = (expMonth, expYear) => {
    if (!expMonth || !expYear) return 'N/A';
    const month = expMonth.toString().padStart(2, '0');
    const year = expYear.toString().slice(-2);
    return `${month}/${year}`;
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <h1 style={{
            fontSize: '1.875rem',
            fontWeight: 'bold',
            color: '#111827',
            marginBottom: '0.5rem'
          }}>Complete Payment</h1>
          <p style={{ color: '#6b7280' }}>Select your payment method and complete your purchase</p>
        </div>

        {/* Payment Form Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          border: '1px solid #e5e7eb'
        }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Amount Display */}
            {amount !== null && (
              <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                borderRadius: '0.75rem',
                padding: '1.5rem',
                color: 'white',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}>
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '6rem',
                  height: '6rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: '50%',
                  marginRight: '-3rem',
                  marginTop: '-3rem'
                }}></div>
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '4rem',
                  height: '4rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  borderRadius: '50%',
                  marginLeft: '-2rem',
                  marginBottom: '-2rem'
                }}></div>
                
                <div style={{ position: 'relative', zIndex: 10 }}>
                  <div style={{ fontSize: '0.875rem', opacity: 0.9, marginBottom: '0.5rem' }}>
                    Amount to Pay
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                    ${amount.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

            {/* Card Selection */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '0.5rem'
              }}>
                Select Payment Method
              </label>
              
              {cards.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {cards.map((card) => (
                    <div
                      key={card._id}
                      style={{
                        border: selectedCard === card.stripePaymentMethodId ? '2px solid #4f46e5' : '2px solid #e5e7eb',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        backgroundColor: selectedCard === card.stripePaymentMethodId ? '#f8fafc' : 'white'
                      }}
                      onClick={() => setSelectedCard(card.stripePaymentMethodId)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span style={{ fontSize: '1.25rem' }}>{getCardBrandIcon(card.cardBrand)}</span>
                          <div>
                            <div style={{ fontWeight: '500', color: '#111827' }}>
                              {card.cardBrand} •••• {card.last4}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                              Expires {formatExpirationDate(card.expMonth, card.expYear)}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          width: '1.25rem',
                          height: '1.25rem',
                          borderRadius: '50%',
                          border: selectedCard === card.stripePaymentMethodId ? '2px solid #4f46e5' : '2px solid #d1d5db',
                          backgroundColor: selectedCard === card.stripePaymentMethodId ? '#4f46e5' : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {selectedCard === card.stripePaymentMethodId && (
                            <div style={{
                              width: '0.5rem',
                              height: '0.5rem',
                              borderRadius: '50%',
                              backgroundColor: 'white'
                            }}></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  border: '2px dashed #d1d5db',
                  borderRadius: '0.75rem',
                  padding: '2rem',
                  textAlign: 'center',
                  color: '#6b7280'
                }}>
                  <svg style={{ width: '3rem', height: '3rem', margin: '0 auto 1rem', color: '#9ca3af' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p style={{ margin: 0, fontSize: '0.875rem' }}>No payment methods available</p>
                  <p style={{ margin: '0.5rem 0 1.5rem 0', fontSize: '0.75rem' }}>Please add a card first</p>
                  
                  <Link
                    to="/add-card"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      padding: '0.75rem 1.5rem',
                      backgroundColor: '#4f46e5',
                      color: 'white',
                      textDecoration: 'none',
                      borderRadius: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      transition: 'all 0.2s',
                      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.backgroundColor = '#4338ca';
                      e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.backgroundColor = '#4f46e5';
                      e.target.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
                    }}
                  >
                    <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Payment Method
                  </Link>
                </div>
              )}
            </div>

            {/* Alert Messages */}
            {error && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#dc2626',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}
            
            {success && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                color: '#16a34a',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem'
              }}>
                <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', flexShrink: 0 }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {success}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!amount || amount <= 0 || cards.length === 0 || !selectedCard || isLoading}
              style={{
                width: '100%',
                backgroundColor: isLoading ? '#9ca3af' : '#4f46e5',
                color: 'white',
                fontWeight: '500',
                padding: '0.875rem 1.5rem',
                borderRadius: '0.75rem',
                border: 'none',
                fontSize: '1rem',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
              onMouseOver={(e) => {
                if (!isLoading && amount && amount > 0 && cards.length > 0 && selectedCard) {
                  e.target.style.backgroundColor = '#4338ca';
                  e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading && amount && amount > 0 && cards.length > 0 && selectedCard) {
                  e.target.style.backgroundColor = '#4f46e5';
                  e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <svg style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Processing Payment...
                </>
              ) : (
                <>
                  <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  Pay ${amount ? amount.toFixed(2) : '0.00'}
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PaymentForm;
