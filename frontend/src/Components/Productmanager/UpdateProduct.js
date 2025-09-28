import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/api";
import Nav from "../Navbar/nav";
import "./UpdateProduct.css";

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
  const [existingImages, setExistingImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [deletedImages, setDeletedImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

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

        // Load existing images
        if (p?.images && Array.isArray(p.images)) {
          setExistingImages(p.images);
        } else if (p?.image) {
          setExistingImages([p.image]);
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

  // Handle file changes for new images
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  // Remove image from new files preview
  const removeNewImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Delete existing image
  const deleteExistingImage = (index) => {
    const imageToDelete = existingImages[index];
    setDeletedImages(prev => [...prev, imageToDelete]);
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Restore deleted image
  const restoreImage = (deletedImage) => {
    setExistingImages(prev => [...prev, deletedImage]);
    setDeletedImages(prev => prev.filter(img => img !== deletedImage));
  };

  // Handle drag and drop
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
    setIsSubmitting(true);
    
    // Basic validation
    for (const key of Object.keys(product)) {
      if (!product[key]) {
        setError("All fields are required");
        setIsSubmitting(false);
        return;
      }
    }
    
    // Validate variants
    if (variants.length === 0) {
      setError("At least one size/color combination is required");
      setIsSubmitting(false);
      return;
    }

    for (const variant of variants) {
      if (variant.quantity < 0) {
        setError("Quantity cannot be negative");
        setIsSubmitting(false);
        return;
      }
    }

    // Check if there are any images (existing or new)
    if (existingImages.length === 0 && imageFiles.length === 0) {
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
      
      // Append new image files
      imageFiles.forEach((file, index) => {
        formData.append("images", file);
      });

      // Append deleted images info
      if (deletedImages.length > 0) {
        formData.append("deletedImages", JSON.stringify(deletedImages));
      }

      const res = await api.put(`/products/${id}`, formData);
      
      if (res.status === 200 || res.status === 201) {
        alert("Product updated successfully!");
        navigate("/products");
      } else {
        setError("Failed to update product");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="product-manager-container">
      <Nav />
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading product...</p>
      </div>
    </div>
  );

  return (
    <div className="product-manager-container">
      {/* Background Decoration */}
      <div className="background-decoration" />
      
      <Nav />
      
      <div className="content-wrapper">
        {/* Left Container - Form Fields */}
        <div className="form-container">
          <div className="form-headerup">
            <h1 className="form-title">
              Update Product
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

        {/* Right Container - Images and Variants */}
        <div className="image-container">
          {/* Existing Images Section */}
          {existingImages.length > 0 && (
            <div className="existing-images-section">
              <div className="section-header">
                <h3 className="section-titleup">Current Images</h3>
                <span className="image-count">({existingImages.length} images)</span>
              </div>
              <div className="existing-images-grid">
                {existingImages.map((image, index) => (
                  <div key={index} className="existing-image-item">
                    <img
                      src={`http://localhost:5000/${image}`}
                      alt={`Product ${index + 1}`}
                      className="existing-image"
                    />
                    <button
                      type="button"
                      onClick={() => deleteExistingImage(index)}
                      className="delete-image-btn"
                    >
                      ✕
                    </button>
                    <div className="image-label">Current #{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Deleted Images Section */}
          {deletedImages.length > 0 && (
            <div className="deleted-images-section">
              <div className="section-header">
                <h3 className="section-titleup">Deleted Images</h3>
                <span className="image-count">({deletedImages.length} images)</span>
              </div>
              <div className="deleted-images-grid">
                {deletedImages.map((image, index) => (
                  <div key={index} className="deleted-image-item">
                    <img
                      src={`http://localhost:5000/${image}`}
                      alt={`Deleted ${index + 1}`}
                      className="deleted-image"
                    />
                    <button
                      type="button"
                      onClick={() => restoreImage(image)}
                      className="restore-image-btn"
                    >
                      ↶
                    </button>
                    <div className="image-label">Deleted #{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Variants Section */}
          <div className="variants-section">
            <div className="variants-header">
              <h3 className="variants-titleup">Size & Color</h3>
              <button
                type="button"
                onClick={addVariant}
                className="add-variant-btnup"
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
          
          {/* New Images Upload Area */}
          <div className="image-upload-area">
            <label htmlFor="images" className="upload-label">
              Add New Images (Multiple):
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
                className="file-input"
              />
              <div className="upload-icon">📁</div>
              <div className="upload-text">Drop your images here or click to browse</div>
              <div className="upload-subtext">Supports: JPG, PNG, GIF (Max 3MB each, up to 10 images)</div>
            </div>
          </div>

          {/* New Images Preview */}
          {imageFiles.length > 0 && (
            <div className="image-preview-container">
              <div className="preview-label">New Images Preview ({imageFiles.length} images):</div>
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
                      onClick={() => removeNewImage(index)}
                      className="remove-image-btn"
                    >
                      ✕
                    </button>
                    <div className="image-order">New #{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} encType="multipart/form-data" style={{ width: "100%" }}>
            <div className="button-group">
              <button
                type="submit"
                className="submit-buttonup"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="loading-spinner" />
                    Updating Product...
                  </>
                ) : (
                  "Update Product"
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate("/products")}
                className="cancel-button"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateProduct;
