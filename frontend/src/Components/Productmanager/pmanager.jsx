import React, { useState } from "react";
import axios from "axios";

export default function AddShoeForm() {
  const [shoe, setShoe] = useState({
    name: "",
    brand: "",
    price: "",
    size: "",
    color: "",
    imageUrl: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setShoe((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      await axios.post("/api/shoes", shoe);
      setMessage("✅ Shoe added successfully!");
      setShoe({
        name: "",
        brand: "",
        price: "",
        size: "",
        color: "",
        imageUrl: "",
        description: "",
      });
    } catch (err) {
      setMessage("❌ Error adding shoe. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-300 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Add New Shoe
        </h1>

        {message && (
          <div
            className={`mb-4 text-center font-medium ${
              message.startsWith("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <InputField label="Name" name="name" value={shoe.name} onChange={handleChange} required />
          <InputField label="Brand" name="brand" value={shoe.brand} onChange={handleChange} required />
          <InputField
            label="Price ($)"
            name="price"
            value={shoe.price}
            onChange={handleChange}
            type="number"
            required
          />
          <InputField label="Size" name="size" value={shoe.size} onChange={handleChange} required />
          <InputField label="Color" name="color" value={shoe.color} onChange={handleChange} />
          <InputField
            label="Image URL"
            name="imageUrl"
            value={shoe.imageUrl}
            onChange={handleChange}
            placeholder="https://..."
          />
          <div>
            <label className="block text-gray-700 font-medium mb-1">Description</label>
            <textarea
              name="description"
              value={shoe.description}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 p-2"
              placeholder="Short description of the shoe"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? "Adding..." : "Add Shoe"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Reusable input field component
function InputField({ label, ...props }) {
  return (
    <div>
      <label className="block text-gray-700 font-medium mb-1">{label}</label>
      <input
        {...props}
        className="w-full rounded-lg border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 p-2"
      />
    </div>
  );
}

