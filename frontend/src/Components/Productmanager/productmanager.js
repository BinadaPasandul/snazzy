import React, { useState } from 'react';
import Nav from '../Navbar/nav';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AddProducts = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        pname: "",
        pcode: "",
        pamount: "",
    });
    const [error, setError] = useState(null);
        
    const handleInputChangep = (e) => {
        const { name, value } = e.target;
        setProduct((prevUser) => ({ ...prevUser, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

    

        // Validate inputs
        if (!product || !product.pname || !product.pcode || !product.pamount) {
            setError("All fields are required");
            return;
        }

        try {
            const response = await sendRequest();
            if (response.message === "ok") {
                alert("Adding Success");
                //navigate("/login");
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
        }).then((res) => res.data);
    };

    return (
        <div>
            <Nav />
            <h1>Add Product</h1>
            <form className="product-form" onSubmit={handleSubmit}>
                <h2>Product Information</h2>

                <div className="form-group">
                    <label htmlFor="pname">Product Name:</label>
                    <input
                        type="text"
                        id="pname"
                        name="pname"
                        onChange={handleInputChangep}
                        value={product.pname}
                        required
                        placeholder="Enter Product Name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="pcode">Product Code:</label>
                    <input
                        type="text"
                        id="pcode"
                        name="pcode"
                        onChange={handleInputChangep}
                        value={product.pcode}
                        required
                        placeholder="Enter Product Code"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="pamount">Amount:</label>
                    <input
                        type="number"
                        id="pamount"
                        name="pamount"
                        onChange={handleInputChangep}
                        value={product.pamount}
                        required
                        placeholder="Enter Amount"
                    />
                </div>

              

                {error && <p style={{ color: 'red' }}>{error}</p>}

                <button type="submit" className="submit-btn">
                    Add Item
                </button>
            </form>
        </div>
    );
};

export default AddProducts;