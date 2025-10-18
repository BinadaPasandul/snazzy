import React, { useState } from "react";
import Nav from "../Navbar/nav";
import { useNavigate } from "react-router-dom";
import api from "../../utils/api";
import "./productmanager.css";

const AddProducts = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    pname: "",
    pcode: "",
    pamount: "",
    pdescription: ""
  });
  const [variants, setVariants] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Store the sizes in array
  const availableSizes = Array.from({ length: 10 }, (_, i) => i + 35);
  const availableColors = ["Black", "White", "Red", "Blue", "Green", "Yellow", "Pink", "Purple", "Orange", "Brown", "Gray", "Navy"];

  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Add,Remove,Update variant
  const addVariant = () => {
    setVariants([...variants, { size: 35, color: "Black", quantity: 0 }]);
  };


  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };


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

  // handling 
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  // Remove image 
  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    //validation
    for (const key of Object.keys(product)) {
      if (!product[key]) {
        setError("All fields are required");
        setIsSubmitting(false);
        return;
      }
    }
    
    if (variants.length === 0) {
      setError("At least one size/color combination is required");
      setIsSubmitting(false);
      return;
    }

    // Validate variants
    for (const variant of variants) {
      if (variant.quantity < 0) {
        setError("Quantity cannot be negative");
        setIsSubmitting(false);
        return;
      }
    }

    if (imageFiles.length === 0) {
      setError("At least one product image is required");
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pname", product.pname);
      formData.append("pcode", product.pcode);
      formData.append("pamount", product.pamount);
      formData.append("pdescription", product.pdescription);
      formData.append("variants", JSON.stringify(variants));
      
      // Append all images
      imageFiles.forEach((file, index) => {
        formData.append("images", file);
      });

      const res = await api.post("/products", formData);

      if (res.status === 201 || res.status === 200) {
        alert("Product added successfully!");
        navigate("/products");
      } else {
        setError("Failed to add product");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error adding product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="product-manager-container">
      {/* Background Decoration */}
      <div className="background-decoration" />
      
      <Nav />
      
      <div className="content-wrapper">
        {/* Left Container - Form Fields */}
        <div className="form-container">
          <div className="form-headerpd">
            <h1 className="form-title">
              Add New Product
            </h1>
            <div className="title-underline" />
          </div>

          {[
            { label: "Product Name", name: "pname", type: "text" },
            { label: "Product Code", name: "pcode", type: "text" },
            { label: "Price ($)", name: "pamount", type: "number" },
            { label: "Description", name: "pdescription", type: "text" },
          ].map((field) => (
            <div key={field.name} className="field-container">
              <label htmlFor={field.name} className="field-label">
                {field.label}:
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={product[field.name]}
                onChange={handleInputChange}
                required
                placeholder={`Enter ${field.label.toLowerCase()}`}
                className="field-input"
              />
            </div>
          ))}

          

          {error && (
            <div className="error-message">
              ⚠️ {error}
            </div>
          )}
        </div>

        {/* Right Container - Image Upload */}
        <div className="image-container">
          {/* Variants Section */}
          <div className="variants-section">
            <div className="variants-header">
              <h3 className="variants-titlepd">Size & Color</h3>
              <button
                type="button"
                onClick={addVariant}
                className="add-variant-btnpd"
              >
                + Add Colors & Sizes
              </button>
            </div>

            {variants.length === 0 && (
              <div className="no-variants-message">
                Click "Add Colors & Sizes" to add size/color combinations with quantities
              </div>
            )}

            {variants.map((variant, index) => (
              <div key={index} className="variant-row">
                <div className="variant-field">
                  <label className="variant-label">Size:</label>
                  <select
                    value={variant.size}
                    onChange={(e) => updateVariant(index, "size", parseInt(e.target.value))}
                    className="variant-select"
                  >
                    {availableSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                <div className="variant-field">
                  <label className="variant-label">Color:</label>
                  <select
                    value={variant.color}
                    onChange={(e) => updateVariant(index, "color", e.target.value)}
                    className="variant-select"
                  >
                    {availableColors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </select>
                </div>

                <div className="variant-field">
                  <label className="variant-label">Quantity:</label>
                  <input
                    type="number"
                    value={variant.quantity}
                    onChange={(e) => updateVariant(index, "quantity", parseInt(e.target.value) || 0)}
                    min="0"
                    className="variant-input"
                    placeholder="0"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => removeVariant(index)}
                  className="remove-variant-btn"
                >
                  ✕
                </button>

                {variantExists(variant.size, variant.color, index) && (
                  <div className="duplicate-warning">
                    ⚠️ This size/color combination already exists
                  </div>
                )}
              </div>
            ))}
          </div>
          

          {/* Image upload area */}
          <div className="image-upload-area">
            <label htmlFor="images" className="upload-label">
              Choose Product Images (Multiple):
            </label>
            
            <div 
              className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                required
                className="file-input"
              />
              <div className="upload-icon">📁</div>
              <div className="upload-text">Drop your images here or click to browse</div>
              <div className="upload-subtext">Supports: JPG, PNG, GIF (Max 3MB each, up to 10 images)</div>
            </div>
          </div>

          {/* Image previews */}
          {imageFiles.length > 0 && (
            <div className="image-preview-container">
              <div className="preview-label">Preview ({imageFiles.length} images):</div>
              <div className="image-preview-grid">
                {imageFiles.map((file, index) => (
                  <div key={index} className="image-preview-item">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Preview ${index + 1}`}
                      className="image-preview"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="remove-image-btn"
                    >
                      ✕
                    </button>
                    <div className="image-order">#{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ width: "100%" }}>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner" />
                  Adding Product...
                </>
              ) : (
                "Add Product"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddProducts;