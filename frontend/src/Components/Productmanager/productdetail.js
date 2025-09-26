import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Nav from "../Navbar/nav"; // keep/remove based on project
import Footer from "../Footer/Footer";

const ProductDetail = () => {
  const { id } = useParams();               // grabs the :id from URL
  const navigate = useNavigate();
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
  // ✅ Pass product code and price to checkout (use discounted price if available)
  const finalPrice = product.hasActivePromotion ? product.discountedPrice : product.pamount;
  navigate("/checkout", { 
    state: { 
      productCode: product.pcode, 
      productPrice: finalPrice,
      originalPrice: product.pamount,
      productname: product.pname,
      hasPromotion: product.hasActivePromotion,
      promotion: product.hasActivePromotion ? product.promotion : null
    } 
  });
};


  const handleAddToCart = () => {
    // Replace with cart API or global state
    alert(`${product.pname} added to cart!`);
  };

  if (loading) return <p style={{ textAlign: "center" }}>Loading...</p>;
  if (error)   return <p style={{ color: "red", textAlign: "center" }}>{error}</p>;
  if (!product) return null;

  const handleContainerClick = () => {
    navigate("/items");
  };

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
          onClick={handleContainerClick}
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
            
            {/* Price Display with Promotion */}
            {product.hasActivePromotion ? (
              <div style={{ margin: "6px 0" }}>
                <p style={{ margin: "0", color: "#e53e3e", textDecoration: "line-through" }}>
                  <strong>Original Price:</strong> ${product.originalPrice}
                </p>
                <p style={{ margin: "0", color: "#38a169", fontSize: "20px", fontWeight: "bold" }}>
                  <strong>Sale Price:</strong> ${product.discountedPrice}
                </p>
                <div style={{ 
                  background: "#fef5e7", 
                  padding: "8px 12px", 
                  borderRadius: "6px", 
                  margin: "8px 0",
                  border: "1px solid #f6ad55"
                }}>
                  <p style={{ margin: "0", color: "#c05621", fontSize: "14px" }}>
                    🎉 <strong>{product.promotion.title}</strong> - {product.promotion.discount}% OFF!
                  </p>
                  <p style={{ margin: "4px 0 0 0", color: "#744210", fontSize: "12px" }}>
                    Valid until: {new Date(product.promotion.endDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ) : (
              <p style={{ margin: "6px 0" }}><strong>Price:</strong> ${product.pamount}</p>
            )}
            <p style={{ margin: "6px 0" }}><strong>Size:</strong> {product.psize}</p>
            <p style={{ margin: "6px 0" }}><strong>Color:</strong> {product.pcolor}</p>
            <p style={{ margin: "6px 0" }}><strong>Quantity:</strong> {product.quantity}</p>
            <p style={{ margin: "12px 0", color: "#555" }}>{product.pdescription}</p>

            <div style={{ marginTop: "20px", display: "flex", gap: "16px" }}>
              <button
                onClick={(e) => { e.stopPropagation(); handleBuyNow(); }}
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
                onClick={(e) => { e.stopPropagation(); handleAddToCart(); }}
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
      <Footer />
    </div>
  );
};

export default ProductDetail;
