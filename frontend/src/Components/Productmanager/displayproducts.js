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
  const [error, setError] = useState(null);
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
      const res = await api.get("/products");
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

    // Add summary above the table
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

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Nav />
      <div style={{ padding: "40px 20px" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>
          Product List
        </h1>

        {/* PDF Generation Button */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <button
            onClick={generatePDF}
            style={{
              padding: "12px 24px",
              background: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(220, 53, 69, 0.3)",
              transition: "all 0.3s ease",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#c82333";
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#dc3545";
              e.target.style.transform = "translateY(0)";
            }}
          >
            📄 Download PDF Report
          </button>
        </div>

        {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
          }}
        >
          {products.map((p) => (
            <div
              key={p._id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "16px",
                textAlign: "center",
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
                    fontSize: "14px",
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
                        style={{ width: "100%", margin: "6px 0", padding: "6px" }}
                      />
                    )
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ width: "100%", margin: "6px 0" }}
                  />
                  <button
                    onClick={() => handleEditSubmit(p._id)}
                    style={{
                      margin: "6px 4px",
                      padding: "8px",
                      background: "#4f46e5",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    style={{
                      margin: "6px 4px",
                      padding: "8px",
                      background: "#999",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <h2 style={{ margin: "8px 0", fontSize: "20px", color: "#333" }}>
                    {p.pname}
                  </h2>
                  <p><strong>Code:</strong> {p.pcode}</p>
                  <p><strong>Amount:</strong> ${p.pamount}</p>
                  
                  {/* Display variants or legacy fields */}
                  {p.variants && p.variants.length > 0 ? (
                    <div style={{ margin: "8px 0" }}>
                      <p><strong>Available Variants:</strong></p>
                      <div style={{ 
                        maxHeight: "120px", 
                        overflowY: "auto", 
                        background: "#f8f9fa", 
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
                            <span style={{ fontSize: "12px", color: "#495057" }}>
                              Size {variant.size} - {variant.color}
                            </span>
                            <span style={{ 
                              fontSize: "12px", 
                              fontWeight: "bold",
                              color: variant.quantity > 0 ? "#28a745" : "#dc3545"
                            }}>
                              Qty: {variant.quantity}
                            </span>
                          </div>
                        ))}
                      </div>
                      <p style={{ fontSize: "12px", color: "#6c757d", margin: "4px 0 0 0" }}>
                        Total Stock: {p.variants.reduce((sum, variant) => sum + variant.quantity, 0)}
                      </p>
                    </div>
                  ) : (
                    <>
                      <p><strong>Size:</strong> {p.psize || "N/A"}</p>
                      <p><strong>Color:</strong> {p.pcolor || "N/A"}</p>
                      <p><strong>Quantity:</strong> {p.quantity || 0}</p>
                    </>
                  )}
                  
                  <p style={{ margin: "8px 0", fontSize: "14px", color: "#666" }}>{p.pdescription}</p>
                  {/* ACTION BUTTONS */}
                  <div>
                    <button
                      onClick={() => handleEdit(p)}
                      style={{
                        margin: "4px",
                        padding: "8px",
                        background: "#f2d14eff",
                        color: "#000",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      style={{
                        margin: "4px",
                        padding: "8px",
                        background: "#e86060ff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer",
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
      </div>
      <Footer />
    </div>
  );
};

export default DisplayProducts;
