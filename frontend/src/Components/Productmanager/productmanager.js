import React, { useEffect, useState } from 'react';
import Nav from '../Navbar/nav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
//import ImgUploader from '../Image/ImgUploader';

const AddProducts = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        pname: "",
        pcode: "",
        pamount: "",
        psize:"",
        pcolor:"",
        pdescription:""
    });
    const [error, setError] = useState(null);

    const handleInputChangep = (e) => {
        const { name, value } = e.target;
        setProduct((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        if (!product || !product.pname || !product.pcode || !product.pamount || !product.psize || !product.pcolor || !product.pdescription) {
            setError("All fields are required");
            return;
        }

        try {
            const response = await sendRequest();
            if (response.message === "ok") {
                alert("Adding Success");
                // navigate("/login");
            } else {
                alert("Adding Success");
            }
        } catch (err) {
            setError(err.message || "Error during Adding Items");
        }
    };

    const sendRequest = async () => {
        return await axios.post("http://localhost:5000/products", {
            pname: String(product.pname),
            pcode: String(product.pcode),
            pamount: Number(product.pamount),
            psize: Number(product.psize),
            pcolor: String(product.pcolor),
            pdescription: String(product.pdescription), 
        }).then((res) => res.data);
    };

    

        return (
        <div style={{ background: '#f5f7fa', minHeight: '100vh' }}>
            <Nav />
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '40px 20px'
            }}>
                <form
                    className="product-form"
                    onSubmit={handleSubmit}
                    style={{
                        background: '#ffffff',
                        padding: '30px 40px',
                        borderRadius: '12px',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                        width: '100%',
                        maxWidth: '420px'
                    }}
                >
                    <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>
                        Add Product
                    </h1>

                    <h2 style={{ fontSize: '18px', marginBottom: '20px', color: '#555' }}>
                        Product Information
                    </h2>

                    {/*<div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <ImgUploader />
                        </div>
                    </div>*/}
                    
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="pname" style={{ display: 'block', marginBottom: '6px' }}>
                            Product Name:
                        </label>
                        <input
                            type="text"
                            id="pname"
                            name="pname"
                            onChange={handleInputChangep}
                            value={product.pname}
                            required
                            placeholder="Enter Product Name"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="pcode" style={{ display: 'block', marginBottom: '6px' }}>
                            Product Code:
                        </label>
                        <input
                            type="text"
                            id="pcode"
                            name="pcode"
                            onChange={handleInputChangep}
                            value={product.pcode}
                            required
                            placeholder="Enter Product Code"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>

                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="pamount" style={{ display: 'block', marginBottom: '6px' }}>
                            Amount:
                        </label>
                        <input
                            type="number"
                            id="pamount"
                            name="pamount"
                            onChange={handleInputChangep}
                            value={product.pamount}
                            required
                            placeholder="Enter Amount"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '20px' }}>
                        <label htmlFor="psize" style={{ display: 'block', marginBottom: '6px' }}>
                            Size:
                        </label>
                        <input
                            type="number"
                            id="psize"
                            name="psize"
                            onChange={handleInputChangep}
                            value={product.psize}
                            required
                            placeholder="Enter Sizes"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="pcolor" style={{ display: 'block', marginBottom: '6px' }}>
                            Product Colors:
                        </label>
                        <input
                            type="text"
                            id="pcolor"
                            name="pcolor"
                            onChange={handleInputChangep}
                            value={product.pcolor}
                            required
                            placeholder="Enter Product Colors"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    <div className="form-group" style={{ marginBottom: '16px' }}>
                        <label htmlFor="pdescription" style={{ display: 'block', marginBottom: '6px' }}>
                            Product Description:
                        </label>
                        <input
                            type="text"
                            id="pdescription"
                            name="pdescription"
                            onChange={handleInputChangep}
                            value={product.pdescription}
                            required
                            placeholder="Enter Product Description"
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '6px',
                                border: '1px solid #ccc'
                            }}
                        />
                    </div>
                    

                    {error && (
                        <p style={{ color: 'red', marginBottom: '16px', textAlign: 'center' }}>
                            {error}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="submit-btn"
                        style={{
                            width: '100%',
                            padding: '12px',
                            backgroundColor: '#4f46e5',
                            color: '#fff',
                            fontWeight: 'bold',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s ease'
                        }}
                        onMouseOver={e => e.currentTarget.style.backgroundColor = '#4338ca'}
                        onMouseOut={e => e.currentTarget.style.backgroundColor = '#4f46e5'}
                    >
                        Add Item
                    </button>
                </form>
            </div>
        </div>
         );
    };
export default AddProducts;
