import db from "../../db/mysql.js";
import jwt from "jsonwebtoken";

/**
 * Extract and verify user ID from JWT token in cookies.
 * 
 * @param {Object} req - Express request object
 * @returns {number|null} User ID if valid token found, null otherwise
 */
const getUserIdFromRequest = (req) => {
    const token = req.cookies?.access_token;

    if (!token) {
        return null;
    }

    try {
        const payload = jwt.verify(token, "secretkey");
        return payload.userId;
    } catch (error) {
        return null;
    }
};

/**
 * Process checkout: creates order, order items, payment record, and updates stock.
 * Uses database transaction to ensure atomicity - if any step fails, entire transaction
 * is rolled back. Validates stock availability before proceeding.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.cookies.access_token - JWT authentication token
 * @param {Object} req.body - Request body
 * @param {string} req.body.address - Shipping street address
 * @param {string} req.body.city - Shipping city
 * @param {string} req.body.country - Shipping country
 * @param {string} req.body.zipCode - Shipping zip/postal code
 * @param {string} req.body.cardName - Cardholder name
 * @param {string} [req.body.cardNumber] - Card number (optional)
 * @param {string} [req.body.expiryDate] - Card expiry date (optional)
 * @param {string} [req.body.cvv] - Card CVV (optional)
 * @param {Object} res - Express response object
 * @returns {Object} Order confirmation with order ID, payment ID, and total price or error message
 */
export const processCheckout = async (req, res) => {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        return res.status(401).json("Not authenticated.");
    }

    const connection = db.promise();

    try {
        const { address, city, country, zipCode, cardName, cardNumber, expiryDate, cvv } = req.body;

        // Validate required fields
        if (!address || !city || !country || !zipCode || !cardName || !cardNumber || !expiryDate || !cvv) {
            return res.status(400).json("All address and payment fields are required.");
        }

        // Start database transaction (ensures atomicity)
        await connection.query("START TRANSACTION");

        try {
            // Fetch user's shopping cart
            const [cartRows] = await connection.query(
                "SELECT idShoppingcarts FROM Shoppingcarts WHERE idShoppingcartUser = ?",
                [userId]
            );

            if (!cartRows.length) {
                await connection.query("ROLLBACK");
                return res.status(404).json("Shopping cart not found.");
            }

            const cartId = cartRows[0].idShoppingcarts;

            // Get cart items with product information, locked for update to prevent race conditions
            const [cartItems] = await connection.query(
                `SELECT 
                    sci.idShoppingcartProduct AS idProduct,
                    sci.amount,
                    p.price,
                    p.stock,
                    p.product_name
                FROM Shoppingcart_items sci
                INNER JOIN Products p ON p.idProducts = sci.idShoppingcartProduct
                WHERE sci.idShoppingcarts = ?
                FOR UPDATE`,
                [cartId]
            );

            if (!cartItems.length) {
                await connection.query("ROLLBACK");
                return res.status(400).json("Shopping cart is empty.");
            }

            // Check if any items are out of stock (stock <= 0)
            const unavailableItems = cartItems.filter((item) => Number(item.stock) <= 0);

            if (unavailableItems.length) {
                const unavailableNames = unavailableItems
                    .map((item) => item.product_name)
                    .join(", ");

                await connection.query("ROLLBACK");
                return res.status(400).json(`Checkout failed. Out of stock: ${unavailableNames}.`);
            }

            // Check if requested quantity exceeds available stock
            const insufficientItems = cartItems.filter(
                (item) => Number(item.amount) > Number(item.stock)
            );

            if (insufficientItems.length) {
                const insufficientNames = insufficientItems
                    .map((item) => `${item.product_name} (available: ${item.stock}, requested: ${item.amount})`)
                    .join(", ");

                await connection.query("ROLLBACK");
                return res.status(400).json(`Checkout failed. Insufficient stock: ${insufficientNames}.`);
            }

            // Calculate total order price
            const totalPrice = cartItems.reduce((sum, item) => {
                return sum + (Number(item.price) * Number(item.amount));
            }, 0);

            // Insert shipping address
            const [addressResult] = await connection.query(
                `INSERT INTO Adresses (idAdressUser, adress, Country, city, zipCode) 
                VALUES (?, ?, ?, ?, ?)`,
                [userId, address, country, city, zipCode]
            );

            const addressId = addressResult.insertId;

            // Create order with pending status and current timestamp
            const [orderResult] = await connection.query(
                `INSERT INTO Orders (idOrderUser, idOrderAdress, total_price, status, timePurchased) 
                VALUES (?, ?, ?, 'pending', NOW())`,
                [userId, addressId, totalPrice]
            );

            const orderId = orderResult.insertId;

            // Insert each cart item as an order item and update product stock
            for (const item of cartItems) {
                // Create order item record with price captured at time of purchase
                await connection.query(
                    `INSERT INTO Orders_items (idOrder, idProducts, quantity, PriceAtPurchase) 
                    VALUES (?, ?, ?, ?)`,
                    [orderId, item.idProduct, item.amount, item.price]
                );

                // Atomically decrement stock (prevents overselling in race conditions)
                const [stockUpdateResult] = await connection.query(
                    `UPDATE Products
                    SET stock = stock - ?
                    WHERE idProducts = ? AND stock >= ?`,
                    [item.amount, item.idProduct, item.amount]
                );

                if (stockUpdateResult.affectedRows === 0) {
                    await connection.query("ROLLBACK");
                    return res.status(400).json(`Checkout failed. Insufficient stock for product ID ${item.idProduct}.`);
                }
            }

            // Create payment record with completed status
            const [paymentResult] = await connection.query(
                `INSERT INTO Payments (idPaymentOrder, status) 
                VALUES (?, 'completed')`,
                [orderId]
            );

            // Clear shopping cart items for this user
            await connection.query(
                "DELETE FROM Shoppingcart_items WHERE idShoppingcarts = ?",
                [cartId]
            );

            // Commit all transaction changes to database
            await connection.query("COMMIT");

            return res.status(200).json({
                message: "Order placed successfully!",
                orderId: orderId,
                paymentId: paymentResult.insertId,
                totalPrice: totalPrice
            });

        } catch (error) {
            await connection.query("ROLLBACK");
            throw error;
        }

    } catch (error) {
        console.error("Checkout error:", error);
        return res.status(500).json(error.message || "Failed to process checkout.");
    }
};

/**
 * Retrieve all orders for authenticated user with order items and details.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.cookies.access_token - JWT authentication token
 * @param {Object} res - Express response object
 * @returns {Array} Array of user's orders with nested items or error message
 */
export const getOrders = async (req, res) => {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        return res.status(401).json("Not authenticated.");
    }

    const connection = db.promise();

    try {
        const [userRows] = await connection.query(
            "SELECT is_admin FROM Users WHERE idUsers = ?",
            [userId]
        );

        if (!userRows.length) {
            return res.status(404).json("User not found.");
        }

        const isAdmin = Number(userRows[0].is_admin) === 1;

        const ordersQuery = isAdmin
            ? `SELECT
                o.idOrders,
                o.idOrderUser,
                o.total_price,
                o.status,
                o.timePurchased,
                p.status AS paymentStatus,
                a.adress,
                a.city,
                a.Country,
                a.zipCode
            FROM Orders o
            LEFT JOIN Payments p ON p.idPaymentOrder = o.idOrders
            LEFT JOIN Adresses a ON a.idAdress = o.idOrderAdress
            ORDER BY o.timePurchased DESC`
            : `SELECT
                o.idOrders,
                o.idOrderUser,
                o.total_price,
                o.status,
                o.timePurchased,
                p.status AS paymentStatus,
                a.adress,
                a.city,
                a.Country,
                a.zipCode
            FROM Orders o
            LEFT JOIN Payments p ON p.idPaymentOrder = o.idOrders
            LEFT JOIN Adresses a ON a.idAdress = o.idOrderAdress
            WHERE o.idOrderUser = ?
            ORDER BY o.timePurchased DESC`;

        const queryParams = isAdmin ? [] : [userId];

        const [orderRows] = await connection.query(
            ordersQuery,
            queryParams
        );

        if (!orderRows.length) {
            return res.status(200).json([]);
        }

        // Extract all order IDs to fetch items for all orders in one query
        const orderIds = orderRows.map((order) => order.idOrders);

        // Fetch all order items for these orders with product details
        const [itemRows] = await connection.query(
            `SELECT
                oi.idOrder,
                oi.idProducts,
                oi.quantity,
                oi.PriceAtPurchase,
                pr.product_name,
                pr.image
            FROM Orders_items oi
            INNER JOIN Products pr ON pr.idProducts = oi.idProducts
            WHERE oi.idOrder IN (?)`,
            [orderIds]
        );

        // Organize items by order ID for easy lookup
        const itemsByOrder = itemRows.reduce((acc, item) => {
            if (!acc[item.idOrder]) {
                acc[item.idOrder] = [];
            }

            acc[item.idOrder].push({
                idProduct: item.idProducts,
                product_name: item.product_name,
                image: item.image,
                quantity: item.quantity,
                priceAtPurchase: item.PriceAtPurchase
            });

            return acc;
        }, {});

        const response = orderRows.map((order) => ({
            idOrder: order.idOrders,
            idOrderUser: order.idOrderUser,
            total_price: order.total_price,
            status: order.status,
            paymentStatus: order.paymentStatus,
            timePurchased: order.timePurchased,
            address: {
                adress: order.adress,
                city: order.city,
                country: order.Country,
                zipCode: order.zipCode
            },
            items: itemsByOrder[order.idOrders] || []
        }));

        return res.status(200).json(response);
    } catch (error) {
        console.error("Orders fetch error:", error);
        return res.status(500).json(error.message || "Failed to fetch orders.");
    }
};
