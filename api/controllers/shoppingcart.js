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
        return payload.userId ?? null;
    } catch (error) {
        return null;
    }
};

/**
 * Get existing shopping cart or create a new one for user.
 * Updates timeCreatedOrRefreshed timestamp if cart already exists.
 * 
 * @param {Promise} connection - MySQL promise connection
 * @param {number} userId - User ID to get/create cart for
 * @returns {number} Shopping cart ID
 */
const getOrCreateCartId = async (connection, userId) => {
    // Check if user has existing cart
    const [cartRows] = await connection.query(
        "SELECT idShoppingcarts FROM Shoppingcarts WHERE idShoppingcartUser = ?",
        [userId]
    );

    if (cartRows.length) {
        const cartId = cartRows[0].idShoppingcarts;
        // Update timestamp for existing cart
        await connection.query(
            "UPDATE Shoppingcarts SET timeCreatedOrRefreshed = NOW() WHERE idShoppingcarts = ?",
            [cartId]
        );
        return cartId;
    }

    // Create new cart if none exists
    const [insertResult] = await connection.query(
        "INSERT INTO Shoppingcarts (`idShoppingcartUser`, `timeCreatedOrRefreshed`) VALUES (?, NOW())",
        [userId]
    );

    return insertResult.insertId;
};

/**
 * Retrieve authenticated user's shopping cart items.
 * Returns all items in cart with product details (price, image, quantity).
 * 
 * @param {Object} req - Express request object
 * @param {string} req.cookies.access_token - JWT authentication token
 * @param {Object} res - Express response object
 * @returns {Array} Array of cart items with product info or error message
 */
export const getShoppingCart = async (req, res) => {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        return res.status(401).json("Not authenticated.");
    }

    const connection = db.promise();

    try {
        // Fetch all items in user's shopping cart with product details
        // Joins Shoppingcart_items with Products to get product name, price, image, and quantity
        const [rows] = await connection.query(
            `SELECT
                sci.idShoppingcartProduct AS idProduct,
                sci.amount,
                p.idProducts,
                p.product_name,
                p.price,
                p.image
            FROM Shoppingcart_items sci
            INNER JOIN Shoppingcarts sc ON sc.idShoppingcarts = sci.idShoppingcarts
            INNER JOIN Products p ON p.idProducts = sci.idShoppingcartProduct
            WHERE sc.idShoppingcartUser = ?`,
            [userId]
        );

        return res.status(200).json(rows);
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json(error.message || "Database error");
    }
};

/**
 * Add an item to user's shopping cart (or increase quantity if already present).
 * Gets or creates a new shopping cart for the user.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.cookies.access_token - JWT authentication token
 * @param {Object} req.body - Request body
 * @param {number} req.body.idProduct - Product ID to add
 * @param {number} [req.body.amount=1] - Quantity to add (default 1)
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error message
 */
export const addShoppingCartItem = async (req, res) => {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        return res.status(401).json("Not authenticated.");
    }

    const connection = db.promise();

    try {
        const { idProduct, amount = 1 } = req.body;
        const parsedAmount = Number(amount);

        // Validate product ID and quantity
        if (!idProduct || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json("idProduct and a positive amount are required.");
        }

        // Verify product exists
        const [productRows] = await connection.query(
            "SELECT idProducts FROM Products WHERE idProducts = ?",
            [idProduct]
        );

        if (!productRows.length) {
            return res.status(404).json("Product not found.");
        }

        // Get or create shopping cart for user
        const cartId = await getOrCreateCartId(connection, userId);

        // Check if item already in cart
        const [existingRows] = await connection.query(
            "SELECT amount FROM Shoppingcart_items WHERE idShoppingcarts = ? AND idShoppingcartProduct = ?",
            [cartId, idProduct]
        );

        // Update quantity if item exists, otherwise insert new item
        if (existingRows.length) {
            await connection.query(
                "UPDATE Shoppingcart_items SET amount = amount + ? WHERE idShoppingcarts = ? AND idShoppingcartProduct = ?",
                [parsedAmount, cartId, idProduct]
            );
        } else {
            await connection.query(
                "INSERT INTO Shoppingcart_items (`idShoppingcarts`, `idShoppingcartProduct`, `amount`) VALUES (?, ?, ?)",
                [cartId, idProduct, parsedAmount]
            );
        }

        await connection.query(
            "UPDATE Shoppingcarts SET timeCreatedOrRefreshed = NOW() WHERE idShoppingcarts = ?",
            [cartId]
        );

        return res.status(200).json("Item added to shopping cart.");
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json(error.message || "Database error");
    }
};

/**
 * Update the quantity of an item in user's shopping cart.
 * Sets the item quantity to the specified amount (replaces, not adds).
 * 
 * @param {Object} req - Express request object
 * @param {string} req.cookies.access_token - JWT authentication token
 * @param {Object} req.params - Route parameters
 * @param {number} req.params.idProduct - Product ID to update
 * @param {Object} req.body - Request body
 * @param {number} req.body.amount - New quantity for the item
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error message
 */
export const updateShoppingCartItem = async (req, res) => {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        return res.status(401).json("Not authenticated.");
    }

    const connection = db.promise();

    try {
        const idProduct = Number(req.params.idProduct);
        const amount = Number(req.body.amount);

        // Validate product ID and new quantity
        if (Number.isNaN(idProduct) || Number.isNaN(amount) || amount <= 0) {
            return res.status(400).json("Valid idProduct and positive amount are required.");
        }

        // Get user's current shopping cart
        const [cartRows] = await connection.query(
            "SELECT idShoppingcarts FROM Shoppingcarts WHERE idShoppingcartUser = ?",
            [userId]
        );

        if (!cartRows.length) {
            return res.status(404).json("Shopping cart not found.");
        }

        const cartId = cartRows[0].idShoppingcarts;

        // Update item quantity in cart
        const [result] = await connection.query(
            "UPDATE Shoppingcart_items SET amount = ? WHERE idShoppingcarts = ? AND idShoppingcartProduct = ?",
            [amount, cartId, idProduct]
        );

        // Return error if item not found in cart
        if (result.affectedRows === 0) {
            return res.status(404).json("Cart item not found.");
        }

        await connection.query(
            "UPDATE Shoppingcarts SET timeCreatedOrRefreshed = NOW() WHERE idShoppingcarts = ?",
            [cartId]
        );

        return res.status(200).json("Cart item updated.");
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json(error.message || "Database error");
    }
};

/**
 * Remove an item from user's shopping cart.
 * Completely deletes the cart item entry.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.cookies.access_token - JWT authentication token
 * @param {Object} req.params - Route parameters
 * @param {number} req.params.idProduct - Product ID to remove from cart
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error message
 */
export const deleteShoppingCartItem = async (req, res) => {
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        return res.status(401).json("Not authenticated.");
    }

    const connection = db.promise();

    try {
        const idProduct = Number(req.params.idProduct);

        // Validate product ID
        if (Number.isNaN(idProduct)) {
            return res.status(400).json("Valid idProduct is required.");
        }

        // Get user's current shopping cart
        const [cartRows] = await connection.query(
            "SELECT idShoppingcarts FROM Shoppingcarts WHERE idShoppingcartUser = ?",
            [userId]
        );

        if (!cartRows.length) {
            return res.status(404).json("Shopping cart not found.");
        }

        const cartId = cartRows[0].idShoppingcarts;

        // Delete item from shopping cart
        const [result] = await connection.query(
            "DELETE FROM Shoppingcart_items WHERE idShoppingcarts = ? AND idShoppingcartProduct = ?",
            [cartId, idProduct]
        );

        // Return error if item not found in cart
        if (result.affectedRows === 0) {
            return res.status(404).json("Cart item not found.");
        }

        await connection.query(
            "UPDATE Shoppingcarts SET timeCreatedOrRefreshed = NOW() WHERE idShoppingcarts = ?",
            [cartId]
        );

        return res.status(200).json("Cart item removed.");
    } catch (error) {
        console.error("Database error:", error);
        return res.status(500).json(error.message || "Database error");
    }
};