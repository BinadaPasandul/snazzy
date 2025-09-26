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
    psize: "",
    pcolor: "",
    pdescription: "",
    quantity: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          psize: p?.psize || "",
          pcolor: p?.pcolor || "",
          pdescription: p?.pdescription || "",
          quantity: p?.quantity ?? "",
        });
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(product).forEach(([k, v]) => formData.append(k, v));
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
        <form onSubmit={handleSubmit} style={{ background: "#fff", padding: 24, borderRadius: 12, width: "100%", maxWidth: 480 }}>
          <h2 style={{ marginTop: 0 }}>Edit Product</h2>
          {[{label:"Product Name",name:"pname",type:"text"},
            {label:"Product Code",name:"pcode",type:"text"},
            {label:"Price",name:"pamount",type:"number"},
            {label:"Size",name:"psize",type:"number"},
            {label:"Color",name:"pcolor",type:"text"},
            {label:"Quantity",name:"quantity",type:"number"},
            {label:"Description",name:"pdescription",type:"text"}].map(f => (
            <div key={f.name} style={{ marginBottom: 12 }}>
              <label htmlFor={f.name} style={{ display: "block", marginBottom: 6 }}>{f.label}</label>
              <input id={f.name} name={f.name} type={f.type} value={product[f.name]} onChange={handleInputChange} style={{ width: "100%", padding: 10, border: "1px solid #ccc", borderRadius: 6 }} />
            </div>
          ))}

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
