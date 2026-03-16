import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./shoppingCart.scss";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

const ShoppingCart = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [shoppingCart, setShoppingCart] = useState([]);
    const [rentalCart, setRentalCart] = useState([]);
    const [rentalDates, setRentalDates] = useState({ startDate: "", endDate: "" });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [rentalError, setRentalError] = useState("");

    const fetchShoppingCart = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await axios.get("/api/shoppingcart", { withCredentials: true });
            setShoppingCart(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setError(err.response?.data || "Failed to load shopping cart.");
            setShoppingCart([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchRentalCart = async () => {
        try {
            const res = await axios.get("/api/rentals/cart", { withCredentials: true });
            setRentalCart(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            setRentalError(err.response?.data || "Failed to load rental cart.");
            setRentalCart([]);
        }
    };

    useEffect(() => {
        if (!currentUser) {
            setShoppingCart([]);
            setRentalCart([]);
            setLoading(false);
            return;
        }
        fetchShoppingCart();
        fetchRentalCart();
    }, [currentUser]);

    const handleAmountChange = async (idProduct, nextAmount) => {
        try {
            if (nextAmount <= 0) {
                await axios.delete(`/api/shoppingcart/items/${idProduct}`, { withCredentials: true });
            } else {
                await axios.put(
                    `/api/shoppingcart/items/${idProduct}`,
                    { amount: nextAmount },
                    { withCredentials: true }
                );
            }
            fetchShoppingCart();
        } catch (err) {
            setError(err.response?.data || "Failed to update cart item.");
        }
    };

    const handleRemove = async (idProduct) => {
        try {
            await axios.delete(`/api/shoppingcart/items/${idProduct}`, { withCredentials: true });
            fetchShoppingCart();
        } catch (err) {
            setError(err.response?.data || "Failed to remove cart item.");
        }
    };

    const handleRentalQuantityChange = async (idProduct, nextQty) => {
        try {
            if (nextQty <= 0) {
                await axios.delete(`/api/rentals/cart/items/${idProduct}`, { withCredentials: true });
            } else {
                await axios.put(
                    `/api/rentals/cart/items/${idProduct}`,
                    { quantity: nextQty },
                    { withCredentials: true }
                );
            }
            fetchRentalCart();
        } catch (err) {
            setRentalError(err.response?.data || "Failed to update rental cart item.");
        }
    };

    const handleRentalRemove = async (idProduct) => {
        try {
            await axios.delete(`/api/rentals/cart/items/${idProduct}`, { withCredentials: true });
            fetchRentalCart();
        } catch (err) {
            setRentalError(err.response?.data || "Failed to remove rental cart item.");
        }
    };

    const handleRentalCheckout = async () => {
        setRentalError("");
        if (!rentalDates.startDate || !rentalDates.endDate) {
            setRentalError("Please select a start and end date for your rental.");
            return;
        }
        if (new Date(rentalDates.endDate) <= new Date(rentalDates.startDate)) {
            setRentalError("End date must be after start date.");
            return;
        }
        navigate("/rental-checkout", { state: rentalDates });
    };

    const rentalTotal = useMemo(() => {
        if (!rentalDates.startDate || !rentalDates.endDate) return 0;
        const days = Math.ceil(
            (new Date(rentalDates.endDate) - new Date(rentalDates.startDate)) / (1000 * 60 * 60 * 24)
        );
        if (days <= 0) return 0;
        return rentalCart.reduce((sum, item) => sum + (Number(item.price) / 15) * Number(item.quantity) * days, 0);
    }, [rentalCart, rentalDates]);

    const total = useMemo(
        () => shoppingCart.reduce((sum, item) => sum + Number(item.price) * Number(item.amount), 0),
        [shoppingCart]
    );

    if (!currentUser) {
        return <div className="shoppingcart">Please login to view your shopping cart.</div>;
    }

    if (loading) {
        return <div className="shoppingcart">Loading cart...</div>;
    }

    return (
        <div className="shoppingcart">
            <h2>Your Shopping Cart</h2>
            {error && <p className="cartError">{error}</p>}
            {shoppingCart.length === 0 ? (
                <p>Your cart is empty.</p>
            ) : (
                <div className="cartItems">
                    {shoppingCart.map((item) => (
                        <div key={item.idProduct} style={{ marginBottom: "12px" }}>
                            <img src={item.image} alt={item.product_name} width="120" />
                            <h3>{item.product_name}</h3>
                            <p>Price: ${item.price}</p>
                            <p>Amount: {item.amount}</p>
                            <button onClick={() => handleAmountChange(item.idProduct, Number(item.amount) - 1)}>-</button>
                            <button onClick={() => handleAmountChange(item.idProduct, Number(item.amount) + 1)}>+</button>
                            <button onClick={() => handleRemove(item.idProduct)}>Remove</button>
                        </div>
                    ))}
                    <button className="checkoutButton" onClick={() => navigate("/checkout")}>Proceed to Checkout</button>
                    <h3 className="total">Total: ${total.toFixed(2)}</h3>
                </div>
            )}

            <hr style={{ margin: "32px 0" }} />

            <h2>Your Rental Cart</h2>
            {rentalError && <p className="cartError">{rentalError}</p>}
            {rentalCart.length === 0 ? (
                <p>Your rental cart is empty.</p>
            ) : (
                <div className="rentalCartItems">
                    {rentalCart.map((item) => (
                        <div key={item.idProduct} style={{ marginBottom: "12px" }}>
                            <img src={item.image} alt={item.product_name} width="120" />
                            <h3>{item.product_name}</h3>
                            <p>Price per day: ${(Number(item.price) / 15).toFixed(2)}</p>
                            <p>Quantity: {item.quantity}</p>
                            <button onClick={() => handleRentalQuantityChange(item.idProduct, Number(item.quantity) - 1)}>-</button>
                            <button onClick={() => handleRentalQuantityChange(item.idProduct, Number(item.quantity) + 1)}>+</button>
                            <button onClick={() => handleRentalRemove(item.idProduct)}>Remove</button>
                        </div>
                    ))}

                    <div className="rentalDates">
                        <label>
                            Start Date:
                            <input
                                type="date"
                                value={rentalDates.startDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setRentalDates((prev) => ({ ...prev, startDate: e.target.value }))}
                            />
                        </label>
                        <label>
                            End Date:
                            <input
                                type="date"
                                value={rentalDates.endDate}
                                min={rentalDates.startDate || new Date().toISOString().split("T")[0]}
                                onChange={(e) => setRentalDates((prev) => ({ ...prev, endDate: e.target.value }))}
                            />
                        </label>
                    </div>

                    {rentalDates.startDate && rentalDates.endDate && rentalTotal > 0 && (
                        <h3 className="total">Estimated Rental Total: ${rentalTotal.toFixed(2)}</h3>
                    )}

                    <button className="checkoutButton" onClick={handleRentalCheckout}>
                        Proceed to Rental Checkout
                    </button>
                </div>
            )}
        </div>
    );
};

export default ShoppingCart;