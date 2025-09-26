import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { CardNumberElement, CardExpiryElement, CardCvcElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../../utils/api';

const UpdateCard = () => {
  const { cardId } = useParams();
  const stripe = useStripe();
  const elements = useElements();

  const [cardData, setCardData] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
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

    setIsLoading(true);
    setError(null);

    const cardNumberElement = elements.getElement(CardNumberElement);
    const cardExpiryElement = elements.getElement(CardExpiryElement);
    const cardCvcElement = elements.getElement(CardCvcElement);

    if (cardNumberElement && cardExpiryElement && cardCvcElement) {
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardNumberElement,
      });

      if (stripeError) {
        setError(stripeError.message);
        setIsLoading(false);
        return;
      }

      try {
        await api.put(`payment/card/${cardId}`, { paymentMethodId: paymentMethod.id });
        setSuccess('Card updated successfully!');
        setError(null);

        // Redirect after 2 seconds
        setTimeout(() => {
          navigate('/CardList');
        }, 2000);
      } catch (err) {
        setError(err.response?.data?.message || 'Error updating card');
      } finally {
        setIsLoading(false);
      }
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

  if (!cardData) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#f9fafb',
        padding: '2rem 1rem',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '1rem',
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          padding: '2rem',
          border: '1px solid #e5e7eb',
          textAlign: 'center'
        }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            backgroundColor: '#e0e7ff',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <svg style={{ width: '1.5rem', height: '1.5rem', color: '#4f46e5', animation: 'spin 1s linear infinite' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <p style={{ color: '#6b7280', margin: 0 }}>Loading card details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      padding: '2rem 1rem',
      fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
            <Link
              to="/CardList"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '0.5rem',
                marginRight: '1rem',
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                color: '#6b7280',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
              }}
              onMouseOver={(e) => {
                e.target.style.backgroundColor = '#f3f4f6';
                e.target.style.color = '#374151';
              }}
              onMouseOut={(e) => {
                e.target.style.backgroundColor = 'white';
                e.target.style.color = '#6b7280';
              }}
            >
              <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#111827',
              margin: 0
            }}>Update Card</h1>
          </div>
          <p style={{ color: '#6b7280', marginLeft: '3rem' }}>Update your payment method details</p>
        </div>

        {/* Main Content */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          gap: '2rem'
        }}>
          {/* Form Card */}
          <div style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #e5e7eb'
          }}>
            {/* Current Card Display */}
            <div style={{
              background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
              borderRadius: '0.75rem',
              padding: '1.5rem',
              marginBottom: '2rem',
              color: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Card Background Pattern */}
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
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{getCardBrandIcon(cardData.cardBrand)}</span>
                  <span style={{ fontSize: '1.125rem', fontWeight: '600' }}>Current Card</span>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{
                    fontSize: '1.25rem',
                    fontFamily: 'monospace',
                    letterSpacing: '0.1em'
                  }}>
                    •••• •••• •••• {cardData.last4}
                  </div>
                </div>
                <div style={{ fontSize: '0.875rem', opacity: 0.9 }}>
                  Expires {formatExpirationDate(cardData.expMonth, cardData.expYear)}
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Update Card Details */}
              <div>
                <h3 style={{
                  fontSize: '1rem',
                  fontWeight: '600',
                  color: '#111827',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <svg style={{ width: '1.25rem', height: '1.25rem', marginRight: '0.5rem', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  New Card Details
                </h3>
                <p style={{
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  marginBottom: '1.5rem',
                  lineHeight: '1.5'
                }}>
                  Enter your new card information to update your payment method
                </p>
              </div>

              {/* Card Number */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#374151',
                  marginBottom: '0.5rem'
                }}>
                  Card Number
                </label>
                <div style={{
                  border: '2px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}>
                  <CardNumberElement 
                    options={{
                      style: {
                        base: {
                          fontSize: '16px',
                          color: '#374151',
                          fontFamily: 'Inter, system-ui, sans-serif',
                          '::placeholder': {
                            color: '#9ca3af',
                          },
                        },
                        invalid: {
                          color: '#ef4444',
                        },
                      },
                    }}
                  />
                </div>
              </div>

              {/* Expiry and CVC Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                {/* Expiry Date */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    Expiry Date
                  </label>
                  <div style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.2s'
                  }}>
                    <CardExpiryElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#374151',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            '::placeholder': {
                              color: '#9ca3af',
                            },
                          },
                          invalid: {
                            color: '#ef4444',
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                {/* CVC */}
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '0.5rem'
                  }}>
                    CVC
                  </label>
                  <div style={{
                    border: '2px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    backgroundColor: '#fafafa',
                    transition: 'all 0.2s'
                  }}>
                    <CardCvcElement 
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#374151',
                            fontFamily: 'Inter, system-ui, sans-serif',
                            '::placeholder': {
                              color: '#9ca3af',
                            },
                          },
                          invalid: {
                            color: '#ef4444',
                          },
                        },
                      }}
                    />
                  </div>
                </div>
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
                disabled={!stripe || isLoading}
                style={{
                  width: '100%',
                  backgroundColor: isLoading ? '#9ca3af' : '#f59e0b',
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
                  if (!isLoading && stripe) {
                    e.target.style.backgroundColor = '#d97706';
                    e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading && stripe) {
                    e.target.style.backgroundColor = '#f59e0b';
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <svg style={{ width: '1.25rem', height: '1.25rem', animation: 'spin 1s linear infinite' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Updating Card...
                  </>
                ) : (
                  <>
                    <svg style={{ width: '1.25rem', height: '1.25rem' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Update Card
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Info Panel */}
          <div style={{
            width: '100%',
            maxWidth: '400px',
            backgroundColor: 'white',
            borderRadius: '1rem',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            padding: '2rem',
            border: '1px solid #e5e7eb',
            height: 'fit-content'
          }}>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: '600',
              color: '#111827',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center'
            }}>
              <svg style={{ width: '1.5rem', height: '1.5rem', marginRight: '0.5rem', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Update Information
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.125rem'
                }}>
                  <svg style={{ width: '0.875rem', height: '0.875rem', color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: '0 0 0.25rem 0' }}>
                    Secure Update
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                    Your new card information is encrypted and processed securely by Stripe.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.125rem'
                }}>
                  <svg style={{ width: '0.875rem', height: '0.875rem', color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: '0 0 0.25rem 0' }}>
                    Instant Replacement
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                    Your old card will be replaced immediately with the new information.
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div style={{
                  width: '1.5rem',
                  height: '1.5rem',
                  backgroundColor: '#fef3c7',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '0.125rem'
                }}>
                  <svg style={{ width: '0.875rem', height: '0.875rem', color: '#f59e0b' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: '500', color: '#111827', margin: '0 0 0.25rem 0' }}>
                    No Interruption
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: 0, lineHeight: '1.4' }}>
                    Your payment methods will continue to work seamlessly after the update.
                  </p>
                </div>
              </div>
            </div>
          </div>
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

export default UpdateCard;
