import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Nav from "../Navbar/nav"; // keep/remove based on project

const ProductDetail = () => {
  const { id } = useParams();               // grabs the :id from URL
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/products/${id}`);
        setProduct(res.data.product);        // make sure backend returns { product: {...} }
      } catch (err) {
        console.error(err);
        setError("Failed to load product details.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleBuyNow = () => {
    // Replace with real checkout logic
    alert(`Proceeding to buy: ${product.pname}`);
  };

  const handleAddToCart = () => {
    // Replace with cart API or global state
    alert(`${product.pname} added to cart!`);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error)   return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!product) return null;

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Nav />
      <div style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "40px",
            background: "#fff",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            padding: "24px",
          }}
        >
          {/* --- IMAGE --- */}
          <div>
            {product.image ? (
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.pname}
                style={{
                  width: "100%",
                  height: "400px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "400px",
                  background: "#eee",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "8px",
                  color: "#777",
                }}
              >
                No Image
              </div>
            )}
          </div>

          {/* --- DETAILS --- */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            <h1 style={{ marginBottom: "12px", fontSize: "28px" }}>
              {product.pname}
            </h1>
            <p style={{ margin: "6px 0" }}><strong>Code:</strong> {product.pcode}</p>
            <p style={{ margin: "6px 0" }}><strong>Amount:</strong> {product.pamount}</p>
            <p style={{ margin: "6px 0" }}><strong>Size:</strong> {product.psize}</p>
            <p style={{ margin: "6px 0" }}><strong>Color:</strong> {product.pcolor}</p>
            <p style={{ margin: "6px 0" }}><strong>Quantity:</strong> {product.quantity}</p>
            <p style={{ margin: "12px 0", color: "#555" }}>{product.pdescription}</p>

            <div style={{ marginTop: "20px", display: "flex", gap: "16px" }}>
              <button
                onClick={handleBuyNow}
                style={{
                  background: "#4CAF50",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Buy Now
              </button>
              <button
                onClick={handleAddToCart}
                style={{
                  background: "#2196F3",
                  color: "#fff",
                  padding: "10px 20px",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "16px",
                }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
