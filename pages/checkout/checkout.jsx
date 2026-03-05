import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "./checkout.scss";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

const Checkout = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [shoppingCart, setShoppingCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        address: "",
        city: "",
        country: "",
        zipCode: "",
        cardName: "",
        cardNumber: "",
        expiryDate: "",
        cvv: ""
    });

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        fetchShoppingCart();
    }, [currentUser, navigate]);

    const fetchShoppingCart = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get("/api/shoppingcart", { withCredentials: true });
            const cartData = Array.isArray(res.data) ? res.data : [];
            
            if (cartData.length === 0) {
                setError("Your cart is empty. Please add items before checking out.");
            }
            
            setShoppingCart(cartData);
        } catch (err) {
            setError(err.response?.data || "Failed to load shopping cart.");
            setShoppingCart([]);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const calculateTotal = () => {
        return shoppingCart.reduce((sum, item) => {
            return sum + (Number(item.price) * Number(item.amount));
        }, 0).toFixed(2);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setProcessing(true);

        // Basic validation
        if (!formData.address || !formData.city || !formData.country || !formData.zipCode || !formData.cardName) {
            setError("Please fill in all required fields.");
            setProcessing(false);
            return;
        }

        try {
            const response = await axios.post("/api/checkout", formData, {
                withCredentials: true
            });

            // Success! Redirect to orders page or show success message
            alert(`Order placed successfully! Order ID: ${response.data.orderId}`);
            navigate("/orders");
        } catch (err) {
            setError(err.response?.data || "Failed to process payment. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (!currentUser) {
        return <div className="checkout">Please login to checkout.</div>;
    }

    if (loading) {
        return <div className="checkout">Loading...</div>;
    }

    if (shoppingCart.length === 0) {
        return (
            <div className="checkout">
                <h2>Checkout</h2>
                <p>Your cart is empty. Please add items before checking out.</p>
                <button onClick={() => navigate("/")}>Continue Shopping</button>
            </div>
        );
    }

    return (
        <div className="checkout">
            <h2>Checkout</h2>
            
            <div className="checkout-container">
                <div className="order-summary">
                    <h3>Order Summary</h3>
                    <div className="cart-items">
                        {shoppingCart.map((item) => (
                            <div key={item.idProduct} className="cart-item">
                                <img src={item.image} alt={item.product_name} />
                                <div className="item-details">
                                    <p className="item-name">{item.product_name}</p>
                                    <p className="item-quantity">Quantity: {item.amount}</p>
                                    <p className="item-price">${(Number(item.price) * Number(item.amount)).toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="total">
                        <h3>Total: ${calculateTotal()}</h3>
                    </div>
                </div>

                <div className="payment-form">
                    <h3>Payment Information</h3>
                    {error && <div className="error-message">{error}</div>}
                    
                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h4>Shipping Address</h4>
                            
                            <div className="form-group">
                                <label>Street Address *</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="123 Main St"
                                    required
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                        placeholder="New York"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Country *</label>
                                    <input
                                        type="text"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleInputChange}
                                        placeholder="NY"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Zip Code *</label>
                                    <input
                                        type="text"
                                        name="zipCode"
                                        value={formData.zipCode}
                                        onChange={handleInputChange}
                                        placeholder="10001"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <h4>Card Information</h4>
                            
                            <div className="form-group">
                                <label>Cardholder Name *</label>
                                <input
                                    type="text"
                                    name="cardName"
                                    value={formData.cardName}
                                    onChange={handleInputChange}
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Card Number</label>
                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={formData.cardNumber}
                                    onChange={handleInputChange}
                                    placeholder="1234 5678 9012 3456"
                                    maxLength="19"
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Expiry Date</label>
                                    <input
                                        type="text"
                                        name="expiryDate"
                                        value={formData.expiryDate}
                                        onChange={handleInputChange}
                                        placeholder="MM/YY"
                                        maxLength="5"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>CVV</label>
                                    <input
                                        type="text"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        placeholder="123"
                                        maxLength="4"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className="pay-button"
                            disabled={processing || shoppingCart.length === 0}
                        >
                            {processing ? "Processing..." : "Pay"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
