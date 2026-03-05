import React, {useState, useEffect} from 'react'
import "./orders.scss";
import axios from "axios";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setLoading(true);
                setError("");
                const res = await axios.get("/api/checkout/orders", { withCredentials: true });
                setOrders(Array.isArray(res.data) ? res.data : []);
            } catch (err) {
                setError(err.response?.data || "Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const formatDateTime = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString();
    };

    if (loading) {
        return <div className="orders">Loading previous orders...</div>;
    }

    if (error) {
        return <div className="orders">{error}</div>;
    }

    return (
        <div className="orders">
            <h2>Your Orders</h2>

            {!orders.length ? (
                <p>You have no previous orders yet.</p>
            ) : (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.idOrder} className="order-card">
                            <div className="order-header">
                                <h3>Order #{order.idOrder}</h3>
                                <span className="order-status">{order.status}</span>
                            </div>

                            <div className="order-meta">
                                <p><strong>Purchased:</strong> {formatDateTime(order.timePurchased)}</p>
                                <p><strong>Payment:</strong> {order.paymentStatus || "pending"}</p>
                                <p>
                                    <strong>Address:</strong> {order.address?.adress}, {order.address?.city}, {order.address?.country} {order.address?.zipCode}
                                </p>
                            </div>

                            <div className="order-items">
                                {order.items?.map((item) => (
                                    <div key={`${order.idOrder}-${item.idProduct}`} className="order-item">
                                        <img src={item.image} alt={item.product_name} />
                                        <div className="item-details">
                                            <p>{item.product_name}</p>
                                            <p>Qty: {item.quantity}</p>
                                        </div>
                                        <div className="item-price">
                                            ${(Number(item.priceAtPurchase) * Number(item.quantity)).toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-total">
                                <strong>Total: ${Number(order.total_price).toFixed(2)}</strong>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Orders;