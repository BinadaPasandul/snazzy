import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import ChatPopup from "./ChatPopup";

const CardList = () => {
  const [cards, setCards] = useState([]);
  const [payments, setPayments] = useState([]);
  const [refunds, setRefunds] = useState([]);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [openChatForPayment, setOpenChatForPayment] = useState(null);

  // Fetch cards
  const fetchCards = async () => {
    try {
      const res = await api.get("/payment/cards");
      setCards(res.data.paymentMethods);
    } catch (err) {
      setError("Error fetching cards");
    }
  };

  // Fetch payments
  const fetchPayments = async () => {
    try {
      const res = await api.get("/payment/payments");
      setPayments(res.data.payments);
    } catch (err) {
      setError("Error fetching payments");
    }
  };

  // Fetch refund requests
  const fetchRefunds = async () => {
    try {
      const res = await api.get("/refund/my-requests");
      setRefunds(res.data.refunds);
    } catch (err) {
      setError("Error fetching refund requests");
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

  // Refund request
  const handleRefund = async (paymentId) => {
    setError(null);
    setSuccess(null);
    try {
      const res = await api.post(`/refund/request/${paymentId}`, {
        reason: "",
      });
      setSuccess(`Refund requested! Status: ${res.data.refundRequest.status}`);
      fetchRefunds();
    } catch (err) {
      setError(err.response?.data?.message || "Refund request failed");
    }
  };

  useEffect(() => {
    fetchCards();
    fetchPayments();
    fetchRefunds();
  }, []);

  const getRefundStatus = (paymentId) => {
    const req = refunds.find((r) => r.paymentId._id === paymentId);
    return req ? req.status : null;
  };

  return (
    <div>
      <h2>Saved Cards</h2>
      {error && <div style={{ color: "red" }}>{error}</div>}
      {success && <div style={{ color: "green" }}>{success}</div>}

      <ul>
        {cards.map((card) => (
          <li key={card._id}>
            {card.cardBrand} •••• {card.last4}
            <Link to={`/update-card/${card._id}`}>
              <button>Update</button>
            </Link>
            <button
              style={{ marginLeft: 10, color: "red" }}
              onClick={() => handleDelete(card._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 20 }}>
        <Link to="/add-card">
          <button>Add New Card</button>
        </Link>
        <Link to="/pay">
          <button style={{ marginLeft: 10 }}>Make Payment</button>
        </Link>
      </div>

      <h2 style={{ marginTop: 40 }}>Your Payments</h2>
      <ul>
        {payments.map((payment) => {
          const refundStatus = getRefundStatus(payment._id);
          return (
            <li key={payment._id}>
              <strong>ID:</strong> {payment._id} - ${payment.amount} -{" "}
              {new Date(payment.createdAt).toLocaleString()}
              {refundStatus ? (
                <>
                  <span style={{ marginLeft: 20 }}>
                    Refund Status:{" "}
                    {refundStatus === "pending" && (
                      <span style={{ color: "orange" }}>Pending</span>
                    )}
                    {refundStatus === "approved" && (
                      <span style={{ color: "green" }}>Approved</span>
                    )}
                    {refundStatus === "rejected" && (
                      <span style={{ color: "red" }}>Rejected</span>
                    )}
                  </span>
                  <button
                    style={{ marginLeft: 10 }}
                    onClick={() => setOpenChatForPayment(payment._id)}
                  >
                    💬 Chat
                  </button>
                </>
              ) : (
                <button
                  style={{ marginLeft: 10 }}
                  onClick={() => handleRefund(payment._id)}
                >
                  Request Refund
                </button>
              )}
            </li>
          );
        })}
      </ul>

      {openChatForPayment && (
        <ChatPopup
          paymentId={openChatForPayment}
          onClose={() => setOpenChatForPayment(null)}
        />
      )}
    </div>
  );
};

export default CardList;
