import React, {useContext, useState, useEffect} from 'react'
import "./orders.scss";
import axios from "axios";
import { AuthContext } from "../../context/authContext";

const Orders = () => {
    const { currentUser } = useContext(AuthContext);
    const [orders, setOrders] = useState([]);
    const [rentals, setRentals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const isAdmin = Number(currentUser?.is_admin) === 1;

    useEffect(() => {
        const fetchAll = async () => {
            try {
                setLoading(true);
                setError("");
                const [ordersRes, rentalsRes] = await Promise.all([
                    axios.get("/api/checkout/orders", { withCredentials: true }),
                    axios.get("/api/rentals/", { withCredentials: true }),
                ]);
                setOrders(Array.isArray(ordersRes.data) ? ordersRes.data : []);
                setRentals(Array.isArray(rentalsRes.data) ? rentalsRes.data : []);
            } catch (err) {
                setError(err.response?.data || "Failed to load orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

    const formatDateTime = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleString();
    };

    const formatDate = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleDateString();
    };

    const rentalDays = (startDate, endDate) => {
        if (!startDate || !endDate) return 0;
        return Math.max(0, Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)));
    };

    if (loading) {
        return <div className="orders">Loading previous orders...</div>;
    }

    if (error) {
        return <div className="orders">{error}</div>;
    }

    return (
        <div className="orders">
            <h2>{isAdmin ? "All Orders" : "Your Orders"}</h2>

            {!orders.length ? (
                <p>{isAdmin ? "No orders have been placed yet." : "You have no previous orders yet."}</p>
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

            <h2 style={{ marginTop: "40px" }}>{isAdmin ? "All Rentals" : "Your Rentals"}</h2>

            {!rentals.length ? (
                <p>{isAdmin ? "No rentals have been placed yet." : "You have no previous rentals yet."}</p>
            ) : (
                <div className="orders-list">
                    {rentals.map((rental) => {
                        const days = rentalDays(rental.startDate, rental.endDate);
                        const rentalTotal = rental.items?.reduce(
                            (sum, item) => sum + Number(item.pricePerDay) * Number(item.quantity) * days,
                            0
                        ) ?? 0;
                        return (
                            <div key={rental.idRental} className="order-card">
                                <div className="order-header">
                                    <h3>Rental #{rental.idRental}</h3>
                                    <span className="order-status">{rental.status}</span>
                                </div>

                                <div className="order-meta">
                                    <p><strong>Rental Period:</strong> {formatDate(rental.startDate)} — {formatDate(rental.endDate)} ({days} day{days !== 1 ? "s" : ""})</p>
                                    <p>
                                        <strong>Address:</strong> {rental.address?.adress}, {rental.address?.city}, {rental.address?.country} {rental.address?.zipCode}
                                    </p>
                                </div>

                                <div className="order-items">
                                    {rental.items?.map((item) => (
                                        <div key={`${rental.idRental}-${item.idProduct}`} className="order-item">
                                            <img src={item.image} alt={item.product_name} />
                                            <div className="item-details">
                                                <p>{item.product_name}</p>
                                                <p>Qty: {item.quantity}</p>
                                                <p>${Number(item.pricePerDay).toFixed(2)} / day</p>
                                            </div>
                                            <div className="item-price">
                                                ${(Number(item.pricePerDay) * Number(item.quantity) * days).toFixed(2)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="order-total">
                                    <strong>Total: ${rentalTotal.toFixed(2)}</strong>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    )
}

export default Orders;