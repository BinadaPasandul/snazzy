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
      </div>
    </div>
  );
};

export default CardList;
