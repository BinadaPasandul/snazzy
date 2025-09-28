import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import Nav from "../Navbar/nav";

import Footer from "../Footer/Footer";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const DisplayProducts = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const [editingId, setEditingId] = useState(null); // id of product being edited
  const [editedProduct, setEditedProduct] = useState({
    pname: "",
    pcode: "",
    pamount: "",
    psize: "",
    pcolor: "",
    pdescription: "",
    quantity: "",
    image: null,
  });

  // Fetch all products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/products");
      setProducts(res.data.products || []);
      setFilteredProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products based on search query
  const handleSearch = (searchValue) => {
    setSearchQuery(searchValue);
    if (searchValue.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.pname.toLowerCase().includes(searchValue.toLowerCase()) ||
        product.pcode.toLowerCase().includes(searchValue.toLowerCase()) ||
        (product.pdescription && product.pdescription.toLowerCase().includes(searchValue.toLowerCase()))
      );
      setFilteredProducts(filtered);
    }
  };

  // Update filtered products when query changes
  useEffect(() => {
    handleSearch(searchQuery);
  }, [products]);

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts(); // refresh list
    } catch (err) {
      console.error(err);
      setError("Failed to delete product.");
    }
  };

  // Start editing
  const handleEdit = (product) => {
    navigate(`/products/${product._id}/edit`);
  };

  // Handle input changes for edit
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file change for edit
  const handleFileChange = (e) => {
    setEditedProduct((prev) => ({ ...prev, image: e.target.files[0] }));
  };

  // Submit edit
  const handleEditSubmit = async (id) => {
    try {
      const formData = new FormData();
      formData.append("pname", editedProduct.pname);
      formData.append("pcode", editedProduct.pcode);
      formData.append("pamount", editedProduct.pamount);
      formData.append("psize", editedProduct.psize);
      formData.append("pcolor", editedProduct.pcolor);
      formData.append("pdescription", editedProduct.pdescription);
      formData.append("quantity", editedProduct.quantity);
      if (editedProduct.image) {
        formData.append("image", editedProduct.image);
      }

      await axios.put(`http://localhost:5000/products/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error(err);
      setError("Failed to update product.");
    }
  };

  // Generate PDF
  const generatePDF = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text("Product Inventory Report", 14, 22);
    
    // Add generation date
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    // Calculate summary data first
    const totalProducts = products.length;
    const totalVariants = products.reduce((sum, product) => {
      return sum + (product.variants ? product.variants.length : 1);
    }, 0);
    const totalStock = products.reduce((sum, product) => {
      if (product.variants && product.variants.length > 0) {
        return sum + product.variants.reduce((variantSum, variant) => variantSum + variant.quantity, 0);
      } else {
        return sum + (product.quantity || 0);
      }
    }, 0);

    // summary 
    doc.setFontSize(12);
    doc.text("Summary:", 14, 45);
    
    doc.setFontSize(10);
    doc.text(`Total Products: ${totalProducts}`, 14, 55);
    doc.text(`Total Variants: ${totalVariants}`, 14, 63);
    doc.text(`Total Stock: ${totalStock}`, 14, 71);
    
    // Prepare table data
    const tableData = products.map(product => {
      if (product.variants && product.variants.length > 0) {
        // For products with variants, create a row for each variant
        return product.variants.map(variant => [
          product.pname,
          product.pcode,
          variant.size,
          variant.color,
          variant.quantity,
          `$${product.pamount}`
        ]);
      } else {
        // For legacy products without variants
        return [[
          product.pname,
          product.pcode,
          product.psize || "N/A",
          product.pcolor || "N/A",
          product.quantity || 0,
          `$${product.pamount}`
        ]];
      }
    }).flat();

    // Define table columns
    const columns = ["Product Name", "Code", "Size", "Color", "Quantity", "Price"];
    
    // Generate table starting after summary
    autoTable(doc, {
      head: [columns],
      body: tableData,
      startY: 85, // Start table after summary
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [79, 70, 229], // Blue color
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [248, 249, 250],
      },
      columnStyles: {
        0: { cellWidth: 40 }, // Product Name
        1: { cellWidth: 25 }, // Code
        2: { cellWidth: 20 }, // Size
        3: { cellWidth: 25 }, // Color
        4: { cellWidth: 20 }, // Quantity
        5: { cellWidth: 20 }, // Price
      },
    });

    // Save the PDF
    doc.save(`product-inventory-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  // Calculate product statistics
  const productStats = {
    total: products.length,
    withVariants: products.filter(p => p.variants && p.variants.length > 0).length,
    totalStock: products.reduce((sum, product) => {
      if (product.variants && product.variants.length > 0) {
        return sum + product.variants.reduce((variantSum, variant) => variantSum + variant.quantity, 0);
      } else {
        return sum + (product.quantity || 0);
      }
    }, 0),
    averagePrice: products.length > 0 ? products.reduce((sum, p) => sum + parseFloat(p.pamount || 0), 0) / products.length : 0
  };

  if (loading) return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Nav />
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "inline-block"
        }}>
          <p style={{ fontSize: "18px", color: "#666", margin: 0 }}>Loading products...</p>
        </div>
      </div>
      <Footer />
    </div>
  );
  
  if (error) return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Nav />
      <div style={{ padding: "40px 20px", textAlign: "center" }}>
        <div style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "40px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          display: "inline-block"
        }}>
          <p style={{ fontSize: "18px", color: "#ef4444", margin: 0 }}>{error}</p>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Nav />
      <div style={{ padding: "40px 20px" }}>
        {/* Header Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h1 style={{ 
            fontSize: "36px", 
            fontWeight: "700", 
            color: "#1e293b", 
            margin: "0 0 16px 0",
            background: "linear-gradient(135deg, #1e293b, #334155)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text"
          }}>
            Product Manager
          </h1>
          <div style={{
            width: "100px",
            height: "4px",
            background: "linear-gradient(90deg, #3b82f6, #1e40af)",
            borderRadius: "2px",
            margin: "0 auto 30px auto"
          }}></div>
          
          {/* Search Bar */}
          <div style={{ marginBottom: "20px" }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search by name, code, description..."
              style={{
                width: "400px",
                maxWidth: "90vw",
                padding: "14px 20px",
                border: "2px solid #e2e8f0",
                borderRadius: "12px",
                outline: "none",
                fontSize: "16px",
                background: "#ffffff",
                color: "#1e293b",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease"
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#3b82f6";
                e.target.style.boxShadow = "0 0 0 4px rgba(59, 130, 246, 0.1), 0 4px 12px rgba(0, 0, 0, 0.15)";
                e.target.style.transform = "translateY(-1px)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "#e2e8f0";
                e.target.style.boxShadow = "0 1px 3px rgba(0, 0, 0, 0.1)";
                e.target.style.transform = "translateY(0)";
              }}
            />
          </div>

          {/* PDF Generation Button */}
          <button
            onClick={generatePDF}
            style={{
              padding: "12px 24px",
              background: "linear-gradient(135deg, #dc3545, #c82333)",
              color: "#fff",
              border: "none",
              borderRadius: "12px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 4px 12px rgba(220, 53, 69, 0.3)",
              transition: "all 0.3s ease",
              marginBottom: "30px"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 8px 20px rgba(220, 53, 69, 0.4)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 12px rgba(220, 53, 69, 0.3)";
            }}
          >
            📄 Download PDF Report
          </button>
        </div>

        {/* Statistics Cards */}
        {products.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "20px",
            marginBottom: "40px"
          }}>
            <div style={{
              background: "linear-gradient(135deg, #e6f3ff, #cce7ff)",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
              border: "2px solid #bfdbfe",
              transition: "all 0.3s ease",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-8px)";
              e.target.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.08)";
            }}>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Total Products
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#2d3748", margin: 0, lineHeight: 1 }}>
                  {productStats.total}
                </div>
              </div>
              <div style={{ fontSize: "2.5rem", opacity: 0.8 }}>📦</div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #fef3c7, #fde68a)",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
              border: "2px solid #fde68a",
              transition: "all 0.3s ease",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-8px)";
              e.target.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.08)";
            }}>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  With Colors & Sizes
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#f59e0b", margin: 0, lineHeight: 1 }}>
                  {productStats.withVariants}
                </div>
              </div>
              <div style={{ fontSize: "2.5rem", opacity: 0.8 }}>🎨</div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #f0fff4, #e6ffed)",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
              border: "2px solid #a7f3d0",
              transition: "all 0.3s ease",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-8px)";
              e.target.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.08)";
            }}>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Total Stock
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#10b981", margin: 0, lineHeight: 1 }}>
                  {productStats.totalStock}
                </div>
              </div>
              <div style={{ fontSize: "2.5rem", opacity: 0.8 }}>📊</div>
            </div>

            <div style={{
              background: "linear-gradient(135deg, #fee2e2, #fecaca)",
              borderRadius: "20px",
              padding: "25px",
              boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
              border: "2px solid #fecaca",
              transition: "all 0.3s ease",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-8px)";
              e.target.style.boxShadow = "0 15px 35px rgba(0, 0, 0, 0.15)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 8px 25px rgba(0, 0, 0, 0.08)";
            }}>
              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: "600", color: "#4a5568", margin: "0 0 8px 0", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  Average Price
                </div>
                <div style={{ fontSize: "2.2rem", fontWeight: "800", color: "#ef4444", margin: 0, lineHeight: 1 }}>
                  ${productStats.averagePrice.toFixed(2)}
                </div>
              </div>
              <div style={{ fontSize: "2.5rem", opacity: 0.8 }}>💰</div>
            </div>
          </div>
        )}

        {/* Products Count */}
        <div style={{ 
          textAlign: "center", 
          marginBottom: "20px",
          background: "linear-gradient(135deg, #e6f3ff, #cce7ff)",
          color: "#1e40af",
          padding: "8px 16px",
          borderRadius: "20px",
          fontSize: "0.9rem",
          fontWeight: "600",
          border: "2px solid #bfdbfe",
          display: "inline-block",
          marginLeft: "50%",
          transform: "translateX(-50%)"
        }}>
          {filteredProducts.length} of {products.length} products
        </div>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        {/* Products Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "20px",
        }}>
          {filteredProducts.map((p) => (
            <div
              key={p._id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "16px",
                textAlign: "center",
                transition: "all 0.3s ease",
                border: "2px solid transparent"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-8px)";
                e.target.style.boxShadow = "0 20px 40px rgba(0, 0, 0, 0.15)";
                e.target.style.borderColor = "#e2e8f0";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                e.target.style.borderColor = "transparent";
              }}
            >
              {/* IMAGE */}
              {(p.images && p.images.length > 0) ? (
                <img
                  src={`http://localhost:5000${p.images[0]}`}
                  alt={p.pname}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    transition: "all 0.3s ease",
                    border: "2px solid #f1f5f9"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.borderColor = "#f1f5f9";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ) : p.image ? (
                <img
                  src={`http://localhost:5000${p.image}`}
                  alt={p.pname}
                  style={{
                    width: "100%",
                    height: "200px",
                    objectFit: "cover",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    transition: "all 0.3s ease",
                    border: "2px solid #f1f5f9"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.transform = "scale(1.05)";
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 8px 20px rgba(59, 130, 246, 0.2)";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.transform = "scale(1)";
                    e.target.style.borderColor = "#f1f5f9";
                    e.target.style.boxShadow = "none";
                  }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: "200px",
                    background: "linear-gradient(135deg, #f8fafc, #e2e8f0)",
                    borderRadius: "8px",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#64748b",
                    fontSize: "14px",
                    fontWeight: "500",
                    border: "2px dashed #cbd5e1",
                    transition: "all 0.3s ease"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #e2e8f0, #cbd5e1)";
                    e.target.style.color = "#4a5568";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "linear-gradient(135deg, #f8fafc, #e2e8f0)";
                    e.target.style.color = "#64748b";
                  }}
                >
                  No Image
                </div>
              )}

              {editingId === p._id ? (
                // EDIT FORM
                <>
                  {["pname", "pcode", "pamount", "psize", "pcolor", "pdescription", "quantity"].map(
                    (field) => (
                      <input
                        key={field}
                        type={field.includes("amount") || field.includes("size") ? "number" : "text"}
                        name={field}
                        value={editedProduct[field]}
                        onChange={handleInputChange}
                        placeholder={field}
                        style={{ 
                          width: "100%", 
                          margin: "6px 0", 
                          padding: "8px 12px",
                          border: "2px solid #e2e8f0",
                          borderRadius: "8px",
                          fontSize: "14px",
                          background: "#f8fafc",
                          transition: "all 0.3s ease",
                          outline: "none"
                        }}
                        onFocus={(e) => {
                          e.target.style.borderColor = "#3b82f6";
                          e.target.style.background = "#ffffff";
                          e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                        }}
                        onBlur={(e) => {
                          e.target.style.borderColor = "#e2e8f0";
                          e.target.style.background = "#f8fafc";
                          e.target.style.boxShadow = "none";
                        }}
                      />
                    )
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ 
                      width: "100%", 
                      margin: "6px 0",
                      padding: "8px",
                      border: "2px dashed #cbd5e1",
                      borderRadius: "8px",
                      background: "#f8fafc",
                      cursor: "pointer"
                    }}
                  />
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "12px" }}>
                    <button
                      onClick={() => handleEditSubmit(p._id)}
                      style={{
                        padding: "8px 16px",
                        background: "linear-gradient(135deg, #4f46e5, #3730a3)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(79, 70, 229, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(79, 70, 229, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(79, 70, 229, 0.3)";
                      }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      style={{
                        padding: "8px 16px",
                        background: "linear-gradient(135deg, #6b7280, #4b5563)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(107, 114, 128, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(107, 114, 128, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(107, 114, 128, 0.3)";
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h2 style={{ 
                    margin: "8px 0", 
                    fontSize: "20px", 
                    color: "#333",
                    fontWeight: "700",
                    background: "linear-gradient(135deg, #1e293b, #334155)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text"
                  }}>
                    {p.pname}
                  </h2>
                  <p style={{ margin: "4px 0", fontSize: "14px", color: "#4a5568" }}>
                    <strong style={{ color: "#1e293b" }}>Code:</strong> {p.pcode}
                  </p>
                  <p style={{ margin: "4px 0", fontSize: "14px", color: "#4a5568" }}>
                    <strong style={{ color: "#1e293b" }}>Amount:</strong> ${p.pamount}
                  </p>
                  
                  {/* Display variants or legacy fields */}
                  {p.variants && p.variants.length > 0 ? (
                    <div style={{ margin: "8px 0" }}>
                      <p style={{ margin: "8px 0 4px 0", fontSize: "14px", fontWeight: "600", color: "#1e293b" }}>
                        <strong>Available Variants:</strong>
                      </p>
                      <div style={{ 
                        maxHeight: "120px", 
                        overflowY: "auto", 
                        background: "linear-gradient(135deg, #f8f9fa, #f1f5f9)", 
                        padding: "8px", 
                        borderRadius: "6px",
                        border: "1px solid #e9ecef"
                      }}>
                        {p.variants.map((variant, index) => (
                          <div key={index} style={{ 
                            display: "flex", 
                            justifyContent: "space-between", 
                            alignItems: "center",
                            padding: "4px 0",
                            borderBottom: index < p.variants.length - 1 ? "1px solid #dee2e6" : "none"
                          }}>
                            <span style={{ fontSize: "12px", color: "#495057", fontWeight: "500" }}>
                              Size {variant.size} - {variant.color}
                            </span>
                            <span style={{ 
                              fontSize: "12px", 
                              fontWeight: "bold",
                              color: variant.quantity > 0 ? "#28a745" : "#dc3545",
                              background: variant.quantity > 0 ? "linear-gradient(135deg, #d1fae5, #a7f3d0)" : "linear-gradient(135deg, #fee2e2, #fecaca)",
                              padding: "2px 6px",
                              borderRadius: "8px"
                            }}>
                              Qty: {variant.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p style={{ 
                        fontSize: "12px", 
                        color: "#6c757d", 
                        margin: "4px 0 0 0",
                        fontWeight: "600",
                        background: "linear-gradient(135deg, #e6f3ff, #cce7ff)",
                        padding: "4px 8px",
                        borderRadius: "6px",
                        display: "inline-block"
                      }}>
                        Total Stock: {p.variants.reduce((sum, variant) => sum + variant.quantity, 0)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#4a5568" }}>
                        <strong style={{ color: "#1e293b" }}>Size:</strong> {p.psize || "N/A"}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#4a5568" }}>
                        <strong style={{ color: "#1e293b" }}>Color:</strong> {p.pcolor || "N/A"}
                      </p>
                      <p style={{ margin: "4px 0", fontSize: "14px", color: "#4a5568" }}>
                        <strong style={{ color: "#1e293b" }}>Quantity:</strong> {p.quantity || 0}
                      </p>
                    </>
                  )}
                  
                  <p style={{ 
                    margin: "8px 0", 
                    fontSize: "14px", 
                    color: "#666",
                    fontStyle: "italic",
                    lineHeight: "1.4"
                  }}>
                    {p.pdescription}
                  </p>
                  
                  {/* ACTION BUTTONS */}
                  <div style={{ display: "flex", gap: "8px", justifyContent: "center", marginTop: "16px" }}>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{
                        padding: "8px 16px",
                        background: "linear-gradient(135deg, #0a0a0aff, #080808ff)",
                        color: "#f8f3f3ff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(242, 209, 78, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(242, 209, 78, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(242, 209, 78, 0.3)";
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{
                        padding: "8px 16px",
                        background: "linear-gradient(135deg, #e86060, #dc2626)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 8px rgba(232, 96, 96, 0.3)"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow = "0 4px 12px rgba(232, 96, 96, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow = "0 2px 8px rgba(232, 96, 96, 0.3)";
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && products.length > 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            marginTop: "20px"
          }}>
            <p style={{ fontSize: "18px", color: "#64748b", margin: 0 }}>
              No products match your search.
            </p>
          </div>
        )}

        {products.length === 0 && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
            marginTop: "20px"
          }}>
            <p style={{ fontSize: "18px", color: "#64748b", margin: 0 }}>
              No products found
            </p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default DisplayProducts;
