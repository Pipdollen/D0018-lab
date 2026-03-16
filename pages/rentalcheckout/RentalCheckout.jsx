import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import "../checkout/checkout.scss";
import { AuthContext } from "../../context/authContext";
import { useLocation, useNavigate } from "react-router-dom";

const RentalCheckout = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const [rentalCart, setRentalCart] = useState([]);
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
        cvv: "",
        startDate: location.state?.startDate || "",
        endDate: location.state?.endDate || "",
    });

    useEffect(() => {
        if (!currentUser) {
            navigate("/login");
            return;
        }
        const fetchRentalCart = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await axios.get("/api/rentals/cart", { withCredentials: true });
                const data = Array.isArray(res.data) ? res.data : [];
                if (data.length === 0) {
                    setError("Your rental cart is empty. Please add items before checking out.");
                }
                setRentalCart(data);
            } catch (err) {
                setError(err.response?.data || "Failed to load rental cart.");
            } finally {
                setLoading(false);
            }
        };
        fetchRentalCart();
    }, [currentUser, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const rentalDays =
        formData.startDate && formData.endDate
            ? Math.max(
                  0,
                  Math.ceil(
                      (new Date(formData.endDate) - new Date(formData.startDate)) /
                          (1000 * 60 * 60 * 24)
                  )
              )
            : 0;

    const estimatedTotal = rentalCart
        .reduce((sum, item) => sum + (Number(item.price) / 15) * Number(item.quantity) * rentalDays, 0)
        .toFixed(2);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setProcessing(true);

        const { address, city, country, zipCode, cardName, startDate, endDate } = formData;

        if (!address || !city || !country || !zipCode || !cardName) {
            setError("Please fill in all required address and payment fields.");
            setProcessing(false);
            return;
        }
        if (!startDate || !endDate) {
            setError("Please select start and end dates.");
            setProcessing(false);
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            setError("End date must be after start date.");
            setProcessing(false);
            return;
        }

        try {
            const response = await axios.post(
                "/api/rentals/checkout",
                { address, city, country, zipCode, cardName, startDate, endDate },
                { withCredentials: true }
            );
            alert(
                `Rental confirmed! Rental ID: ${response.data.rentalId} — ${response.data.rentalDays} day(s), total: $${response.data.totalCost}`
            );
            navigate("/orders");
        } catch (err) {
            setError(err.response?.data || "Failed to process rental. Please try again.");
        } finally {
            setProcessing(false);
        }
    };

    if (!currentUser) return <div className="checkout">Please login to checkout.</div>;
    if (loading) return <div className="checkout">Loading...</div>;

    if (rentalCart.length === 0) {
        return (
            <div className="checkout">
                <h2>Rental Checkout</h2>
                <p>Your rental cart is empty. Please add items before checking out.</p>
                <button onClick={() => navigate("/shoppingcart")}>Go to Cart</button>
            </div>
        );
    }

    return (
        <div className="checkout">
            <h2>Rental Checkout</h2>

            <div className="checkout-container">
                <div className="order-summary">
                    <h3>Rental Summary</h3>
                    <div className="cart-items">
                        {rentalCart.map((item) => (
                            <div key={item.idProduct} className="cart-item">
                                <img src={item.image} alt={item.product_name} />
                                <div className="item-details">
                                    <p className="item-name">{item.product_name}</p>
                                    <p className="item-quantity">Quantity: {item.quantity}</p>
                                    <p className="item-price">
                                        ${(Number(item.price) / 15).toFixed(2)} / day
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="form-section">
                        <h4>Rental Period</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Start Date *</label>
                                <input
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    min={new Date().toISOString().split("T")[0]}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>End Date *</label>
                                <input
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    min={formData.startDate || new Date().toISOString().split("T")[0]}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    <div className="total">
                        {rentalDays > 0 ? (
                            <h3>
                                Estimated Total ({rentalDays} day{rentalDays !== 1 ? "s" : ""}): $
                                {estimatedTotal}
                            </h3>
                        ) : (
                            <p>Select dates to see estimated total.</p>
                        )}
                    </div>
                </div>

                <div className="payment-form">
                    <h3>Payment Information</h3>
                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-section">
                            <h4>Shipping / Delivery Address</h4>

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
                                        placeholder="US"
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
                                    placeholder="**** **** **** ****"
                                    maxLength={19}
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
                                        maxLength={5}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>CVV</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        placeholder="***"
                                        maxLength={4}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="checkoutButton"
                            disabled={processing || rentalCart.length === 0}
                        >
                            {processing ? "Processing..." : "Confirm Rental"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RentalCheckout;
