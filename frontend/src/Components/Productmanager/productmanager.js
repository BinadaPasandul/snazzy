import React, { useState } from "react";
import Nav from "../Navbar/nav";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const AddProducts = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState({
    pname: "",
    pcode: "",
    pamount: "",
    psize: "",
    pcolor: "",
    pdescription: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState(null);

  // handle text fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProduct((prev) => ({ ...prev, [name]: value }));
  };

  // handle file
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // basic validation
    for (const key of Object.keys(product)) {
      if (!product[key]) {
        setError("All fields are required");
        return;
      }
    }
    if (!imageFile) {
      setError("Product image is required");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("pname", product.pname);
      formData.append("pcode", product.pcode);
      formData.append("pamount", product.pamount);
      formData.append("psize", product.psize);
      formData.append("pcolor", product.pcolor);
      formData.append("pdescription", product.pdescription);
      formData.append("image", imageFile); // field name must match upload.single("image")

      const res = await axios.post("http://localhost:5000/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.status === 201 || res.status === 200) {
        alert("Product added successfully!");
        navigate("/"); // adjust the redirect path as needed
      } else {
        setError("Failed to add product");
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Error adding product");
    }
  };

  return (
    <div style={{ background: "#f5f7fa", minHeight: "100vh" }}>
      <Nav />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "40px 20px",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            background: "#ffffff",
            padding: "30px 40px",
            borderRadius: "12px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
            width: "100%",
            maxWidth: "420px",
          }}
          encType="multipart/form-data"
        >
          <h1 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
            Add Product
          </h1>

          {[
            { label: "Product Name", name: "pname", type: "text" },
            { label: "Product Code", name: "pcode", type: "text" },
            { label: "Price", name: "pamount", type: "number" },
            { label: "Size", name: "psize", type: "number" },
            { label: "Color", name: "pcolor", type: "text" },
            { label: "Description", name: "pdescription", type: "text" },
          ].map((field) => (
            <div key={field.name} style={{ marginBottom: "16px" }}>
              <label
                htmlFor={field.name}
                style={{ display: "block", marginBottom: "6px" }}
              >
                {field.label}:
              </label>
              <input
                type={field.type}
                id={field.name}
                name={field.name}
                value={product[field.name]}
                onChange={handleInputChange}
                required
                placeholder={`Enter ${field.label}`}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          ))}

          {/* Image input */}
          <div style={{ marginBottom: "16px" }}>
            <label htmlFor="image" style={{ display: "block", marginBottom: "6px" }}>
              Product Image:
            </label>
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              required
              style={{ display: "block" }}
            />
          </div>

          {error && (
            <p style={{ color: "red", marginBottom: "16px", textAlign: "center" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px",
              backgroundColor: "#4f46e5",
              color: "#fff",
              fontWeight: "bold",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              transition: "background-color 0.2s ease",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.backgroundColor = "#4338ca")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.backgroundColor = "#4f46e5")
            }
          >
            Add Item
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProducts;
