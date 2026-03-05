import React, { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./shoppingCart.scss";
import { AuthContext } from "../../context/authContext";
import { useNavigate } from "react-router-dom";

const ShoppingCart = () => {
    const { currentUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const [shoppingCart, setShoppingCart] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

    useEffect(() => {
        if (!currentUser) {
            setShoppingCart([]);
            setLoading(false);
            return;
        }
        fetchShoppingCart();
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
            {error && <p>{error}</p>}
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
        </div>
    );
};

export default ShoppingCart;