import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Nav from "../Navbar/nav"; // optional depending on your project
import Footer from "../Footer/Footer";

const DisplayProducts = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);

  // Fetch products from backend
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get("http://localhost:5000/products");
        setProducts(res.data.products || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load products.");
      }
    };
    fetchProducts();
  }, []);

  // Navigate to product detail/edit page
  const handleProductClick = (id) => {
    navigate(`/products/${id}`); // adjust the route as needed
  };

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Nav />

      <div style={{ padding: "40px 20px", maxWidth: "1000px", margin: "0 auto" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Shop All</h1>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {!error && products.length === 0 && (
          <p style={{ textAlign: "center" }}>No products available.</p>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((p) => (
            <div
              key={p._id}
              onClick={() => handleProductClick(p._id)}
              style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "16px",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              {/* IMAGE */}
              {p.image ? (
                <img
                  src={`http://localhost:5000${p.image}`}
                  alt={p.pname}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "12px",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    background: "#eee",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#999",
                  }}
                >
                  No Image
                </div>
              )}

              <h2 style={{ margin: "8px 0", fontSize: "18px", color: "#333" }}>{p.pname}</h2>
              <p><strong>Code:</strong> {p.pcode}</p>
              
              {/* Price Display with Promotion */}
              {p.hasActivePromotion ? (
                <div style={{ margin: "6px 0" }}>
                  <p style={{ margin: "0", color: "#e53e3e", textDecoration: "line-through", fontSize: "14px" }}>
                    <strong>Original:</strong> ${p.originalPrice}
                  </p>
                  <p style={{ margin: "0", color: "#38a169", fontSize: "16px", fontWeight: "bold" }}>
                    <strong>Sale:</strong> ${p.discountedPrice}
                  </p>
                  <div style={{ 
                    background: "#fef5e7", 
                    padding: "4px 8px", 
                    borderRadius: "4px", 
                    margin: "4px 0",
                    border: "1px solid #f6ad55"
                  }}>
                    <p style={{ margin: "0", color: "#c05621", fontSize: "12px" }}>
                      🎉 {p.promotion.discount}% OFF!
                    </p>
                  </div>
                </div>
              ) : (
                <p><strong>Price:</strong> ${p.pamount}</p>
              )}
              <p style={{ color: "#777" }}>{p.pdescription}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DisplayProducts;
