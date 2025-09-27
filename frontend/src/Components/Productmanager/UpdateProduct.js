import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Nav from "../Navbar/nav";

const UpdateProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    pname: "",
    pcode: "",
    pamount: "",
    pdescription: "",
  });
  const [variants, setVariants] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Available sizes (35-44) and colors
  const availableSizes = Array.from({ length: 10 }, (_, i) => i + 35);
  const availableColors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Navy"];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/products/${id}`);
        const p = res.data?.product;
        setProduct({
          pname: p?.pname || "",
          pcode: p?.pcode || "",
          pamount: p?.pamount || "",
          pdescription: p?.pdescription || "",
        });
        
        // Handle both new variant structure and legacy structure
        if (p?.variants && Array.isArray(p.variants) && p.variants.length > 0) {
          setVariants(p.variants);
        } else {
          // Convert legacy structure to variant structure
          const legacyVariant = {
            size: p?.psize || 35,
            color: p?.pcolor || "Black",
            quantity: p?.quantity || 0
          };
          setVariants([legacyVariant]);
        }
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0] || null);
  };

  // Add new variant
  const addVariant = () => {
    setVariants([...variants, { size: 35, color: "Black", quantity: 0 }]);
  };

  // Remove variant
  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Update variant
  const updateVariant = (index, field, value) => {
    const updatedVariants = [...variants];
    updatedVariants[index][field] = value;
    setVariants(updatedVariants);
  };

  // Check if variant combination already exists
  const variantExists = (size, color, excludeIndex = -1) => {
    return variants.some((variant, index) => 
      index !== excludeIndex && variant.size === size && variant.color === color
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    // Validate variants
    if (variants.length === 0) {
      setError("At least one size/color combination is required");
      return;
    }

    for (const variant of variants) {
      if (variant.quantity < 0) {
        setError("Quantity cannot be negative");
        return;
      }
    }

    try {
      const formData = new FormData();
      formData.append("pname", product.pname);
      formData.append("pcode", product.pcode);
      formData.append("pamount", product.pamount);
      formData.append("pdescription", product.pdescription);
      formData.append("variants", JSON.stringify(variants));
      if (imageFile) formData.append("image", imageFile);

      await api.put(`/products/${id}`, formData);
      alert("Product updated");
      navigate("/products");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update product");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Nav />
      <div style={{ display: "flex", justifyContent: "center", padding: "40px 20px" }}>
        <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 24, borderRadius: 12, width: "100%", maxWidth: 600 }}>
          <h2 style={{ marginTop: 0 }}>Edit Product</h2>
          
          {/* Basic Product Fields */}
          {[{label:"Product Name",name:"pname",type:"text"},
            {label:"Product Code",name:"pcode",type:"text"},
            {label:"Price",name:"pamount",type:"number"},
            {label:"Description",name:"pdescription",type:"text"}].map(f => (
            <div key={f.name} style={{ marginBottom: 12 }}>
              <label htmlFor={f.name} style={{ display: "block", marginBottom: 6 }}>{f.label}</label>
              <input id={f.name} name={f.name} type={f.type} value={product[f.name]} onChange={handleInputChange} style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            </div>
          ))}

          {/* Variants Section */}
          <div style={{ marginTop: 20, padding: 20, background: "#f8fafc", borderRadius: 12, border: "2px solid #e2e8f0" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, color: "#4a5568" }}>Size & Color Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                style={{
                  background: "#4f46e5",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: 8,
                  cursor: "pointer"
                }}
              >
                + Add Variant
              </button>
            </div>

            {variants.length === 0 && (
              <div style={{ textAlign: "center", color: "#718096", fontStyle: "italic", padding: 20, background: "#edf2f7", borderRadius: 8, border: "2px dashed #cbd5e0" }}>
                Click "Add Variant" to add size/color combinations with quantities
              </div>
            )}

            {variants.map((variant, index) => (
              <div key={index} style={{ 
                display: "grid", 
                gridTemplateColumns: "1fr 1fr auto auto", 
                gap: 12, 
                alignItems: "end", 
                padding: 15, 
                background: "white", 
                borderRadius: 10, 
                border: "2px solid #e2e8f0", 
                marginBottom: 12,
                position: "relative"
              }}>
                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4a5568", marginBottom: 4 }}>Size:</label>
                  <select
                    value={variant.size}
                    onChange={(e) => updateVariant(index, "size", parseInt(e.target.value))}
                    style={{ width: "100%", padding: 8, border: "2px solid #e2e8f0", borderRadius: 8 }}
                  >
                    {availableSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4a5568", marginBottom: 4 }}>Color:</label>
                  <select
                    value={variant.color}
                    onChange={(e) => updateVariant(index, "color", e.target.value)}
                    style={{ width: "100%", padding: 8, border: "2px solid #e2e8f0", borderRadius: 8 }}
                  >
                    {availableColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#4a5568", marginBottom: 4 }}>Quantity:</label>
                  <input
                    type="number"
                    value={variant.quantity}
                    onChange={(e) => updateVariant(index, "quantity", parseInt(e.target.value) || 0)}
                    min="0"
                    style={{ width: "100%", padding: 8, border: "2px solid #e2e8f0", borderRadius: 8 }}
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  style={{
                    background: "#fed7d7",
                    color: "#c53030",
                    border: "none",
                    padding: 8,
                    borderRadius: 8,
                    cursor: "pointer",
                    minWidth: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  ✕
                </button>

                {variantExists(variant.size, variant.color, index) && (
                  <div style={{
                    position: "absolute",
                    top: -8,
                    left: 15,
                    background: "#fef5e7",
                    color: "#c05621",
                    padding: "4px 8px",
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 500,
                    border: "1px solid #f6ad55",
                    whiteSpace: "nowrap"
                  }}>
                    ⚠️ This size/color combination already exists
                  </div>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 12 }}>
            <label htmlFor="image" style={{ display: "block", marginBottom: 6 }}>Replace Image</label>
            <input id="image" name="image" type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {error && <p style={{ color: "red", marginBottom: 12 }}>{error}</p>}

          <div style={{ display: "flex", gap: 8 }}>
            <button type="submit" style={{ padding: "10px 14px", background: "#4f46e5", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer" }}>Save</button>
            <button type="button" onClick={() => navigate("/products")} style={{ padding: "10px 14px", background: "#e5e7eb", color: "#111827", border: "none", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProduct;
