import db from "../../db/mysql.js";
import jwt from "jsonwebtoken";

const getUserIdFromRequest = (req) => {
    const token = req.cookies?.access_token;
    if (!token) return null;
    try {
        const payload = jwt.verify(token, "secretkey");
        return payload.userId ?? null;
    } catch {
        return null;
    }
};

const getOrCreateRentalCartId = async (connection, userId) => {
    const [cartRows] = await connection.query(
        "SELECT idRentalCarts FROM RentalCarts WHERE idRentalCartUser = ?",
        [userId]
    );

    if (cartRows.length) {
        const cartId = cartRows[0].idRentalCarts;
        await connection.query(
            "UPDATE RentalCarts SET timeCreatedOrRefreshed = NOW() WHERE idRentalCarts = ?",
            [cartId]
        );
        return cartId;
    }

    const [insertResult] = await connection.query(
        "INSERT INTO RentalCarts (idRentalCartUser, timeCreatedOrRefreshed) VALUES (?, NOW())",
        [userId]
    );

    return insertResult.insertId;
};

/**
 * Get all items currently in the user's rental cart (stored in Rental_cart / session table).
 * We reuse a lightweight approach: rental cart items are stored in a dedicated
 * Rental_cart_items table keyed by userId until checkout commits them to Rentals.
 */
export const getRentalCart = async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json("Not authenticated.");

    const connection = db.promise();
    try {
        const [cartRows] = await connection.query(
            "SELECT idRentalCarts FROM RentalCarts WHERE idRentalCartUser = ?",
            [userId]
        );

        if (!cartRows.length) {
            return res.status(200).json([]);
        }

        const cartId = cartRows[0].idRentalCarts;

        const [rows] = await connection.query(
            `SELECT
                rci.idRentalProduct AS idProduct,
                rci.quantity,
                p.product_name,
                p.image,
                p.price
            FROM Rental_cart_items rci
            INNER JOIN Products p ON p.idProducts = rci.idRentalProduct
            WHERE rci.idRentalCarts = ?`,
            [cartId]
        );
        return res.status(200).json(rows);
    } catch (error) {
        console.error("Rental cart fetch error:", error);
        return res.status(500).json(error.message || "Failed to fetch rental cart.");
    }
};

/**
 * Add an item to the rental cart (or increment quantity if already present).
 */
export const addRentalCartItem = async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json("Not authenticated.");

    const { idProduct, quantity = 1 } = req.body;
    const parsedQty = Number(quantity);

    if (!idProduct || Number.isNaN(parsedQty) || parsedQty <= 0) {
        return res.status(400).json("idProduct and a positive quantity are required.");
    }

    const connection = db.promise();
    try {
        const [productRows] = await connection.query(
            "SELECT idProducts FROM Products WHERE idProducts = ?",
            [idProduct]
        );
        if (!productRows.length) return res.status(404).json("Product not found.");

        const [existing] = await connection.query(
            "SELECT idRentalCarts FROM RentalCarts WHERE idRentalCartUser = ?",
            [userId]
        );

        const cartId = existing.length ? existing[0].idRentalCarts : await getOrCreateRentalCartId(connection, userId);

        const [existingItem] = await connection.query(
            "SELECT quantity FROM Rental_cart_items WHERE idRentalCarts = ? AND idRentalProduct = ?",
            [cartId, idProduct]
        );

        if (existingItem.length) {
            await connection.query(
                "UPDATE Rental_cart_items SET quantity = quantity + ? WHERE idRentalCarts = ? AND idRentalProduct = ?",
                [parsedQty, cartId, idProduct]
            );
        } else {
            await connection.query(
                "INSERT INTO Rental_cart_items (idRentalCarts, idRentalProduct, quantity) VALUES (?, ?, ?)",
                [cartId, idProduct, parsedQty]
            );
        }

        await connection.query(
            "UPDATE RentalCarts SET timeCreatedOrRefreshed = NOW() WHERE idRentalCarts = ?",
            [cartId]
        );

        return res.status(200).json("Item added to rental cart.");
    } catch (error) {
        console.error("Rental cart add error:", error);
        return res.status(500).json(error.message || "Failed to add item to rental cart.");
    }
};

/**
 * Update quantity of a rental cart item.
 */
export const updateRentalCartItem = async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json("Not authenticated.");

    const idProduct = Number(req.params.idProduct);
    const quantity = Number(req.body.quantity);

    if (Number.isNaN(idProduct) || Number.isNaN(quantity) || quantity <= 0) {
        return res.status(400).json("Valid idProduct and positive quantity are required.");
    }

    const connection = db.promise();
    try {
        const [cartRows] = await connection.query(
            "SELECT idRentalCarts FROM RentalCarts WHERE idRentalCartUser = ?",
            [userId]
        );

        if (!cartRows.length) {
            return res.status(404).json("Rental cart not found.");
        }

        const cartId = cartRows[0].idRentalCarts;

        const [result] = await connection.query(
            "UPDATE Rental_cart_items SET quantity = ? WHERE idRentalCarts = ? AND idRentalProduct = ?",
            [quantity, cartId, idProduct]
        );
        if (result.affectedRows === 0) return res.status(404).json("Item not found in rental cart.");

        await connection.query(
            "UPDATE RentalCarts SET timeCreatedOrRefreshed = NOW() WHERE idRentalCarts = ?",
            [cartId]
        );

        return res.status(200).json("Rental cart item updated.");
    } catch (error) {
        console.error("Rental cart update error:", error);
        return res.status(500).json(error.message || "Failed to update rental cart item.");
    }
};

/**
 * Remove an item from the rental cart.
 */
export const deleteRentalCartItem = async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json("Not authenticated.");

    const idProduct = Number(req.params.idProduct);
    if (Number.isNaN(idProduct)) return res.status(400).json("Invalid product ID.");

    const connection = db.promise();
    try {
        const [cartRows] = await connection.query(
            "SELECT idRentalCarts FROM RentalCarts WHERE idRentalCartUser = ?",
            [userId]
        );

        if (!cartRows.length) {
            return res.status(200).json("Item removed from rental cart.");
        }

        const cartId = cartRows[0].idRentalCarts;

        await connection.query(
            "DELETE FROM Rental_cart_items WHERE idRentalCarts = ? AND idRentalProduct = ?",
            [cartId, idProduct]
        );

        await connection.query(
            "UPDATE RentalCarts SET timeCreatedOrRefreshed = NOW() WHERE idRentalCarts = ?",
            [cartId]
        );

        return res.status(200).json("Item removed from rental cart.");
    } catch (error) {
        console.error("Rental cart delete error:", error);
        return res.status(500).json(error.message || "Failed to remove rental cart item.");
    }
};

/**
 * Process rental checkout.
 * Expects body: { address, city, country, zipCode, cardName, cardNumber, expiryDate, cvv, startDate, endDate }
 * Inserts an address, a Rentals record, and Rental_items for each cart item,
 * then clears the rental cart. Wrapped in a transaction for atomicity.
 */
export const processRentalCheckout = async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json("Not authenticated.");

    const { address, city, country, zipCode, cardName, cardNumber, expiryDate, cvv, startDate, endDate } = req.body;

    if (!address || !city || !country || !zipCode || !cardName || !cardNumber || !expiryDate || !cvv || !startDate || !endDate) {
        return res.status(400).json("All address, payment and rental date fields are required.");
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end <= start) {
        return res.status(400).json("endDate must be after startDate.");
    }

    const rentalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));

    const connection = db.promise();
    try {
        await connection.query("START TRANSACTION");

        try {
            const [cartRows] = await connection.query(
                "SELECT idRentalCarts FROM RentalCarts WHERE idRentalCartUser = ? FOR UPDATE",
                [userId]
            );

            if (!cartRows.length) {
                await connection.query("ROLLBACK");
                return res.status(404).json("Rental cart not found.");
            }

            const rentalCartId = cartRows[0].idRentalCarts;

            // Fetch rental cart items with product price (used as pricePerDay)
            const [cartItems] = await connection.query(
                `SELECT
                    rci.idRentalProduct AS idProduct,
                    rci.quantity,
                    p.price,
                    p.stock,
                    p.product_name
                FROM Rental_cart_items rci
                INNER JOIN Products p ON p.idProducts = rci.idRentalProduct
                WHERE rci.idRentalCarts = ?
                FOR UPDATE`,
                [rentalCartId]
            );

            if (!cartItems.length) {
                await connection.query("ROLLBACK");
                return res.status(400).json("Rental cart is empty.");
            }

            // Stock validation
            const insufficientItems = cartItems.filter(
                (item) => Number(item.quantity) > Number(item.stock)
            );
            if (insufficientItems.length) {
                const names = insufficientItems
                    .map((i) => `${i.product_name} (available: ${i.stock}, requested: ${i.quantity})`)
                    .join(", ");
                await connection.query("ROLLBACK");
                return res.status(400).json(`Insufficient stock for rental: ${names}.`);
            }

            // Insert address
            const [addrResult] = await connection.query(
                "INSERT INTO Adresses (idAdressUser, adress, Country, city, zipCode) VALUES (?, ?, ?, ?, ?)",
                [userId, address, country, city, zipCode]
            );
            const addressId = addrResult.insertId;

            // Insert Rental record
            const [rentalResult] = await connection.query(
                `INSERT INTO Rentals (idRentalUser, idRentalAdress, StartDate, endDate, status)
                VALUES (?, ?, ?, ?, 'pending')`,
                [userId, addressId, startDate, endDate]
            );
            const rentalId = rentalResult.insertId;

            // Insert Rental_items and decrement stock
            for (const item of cartItems) {
                const pricePerDay = Number(item.price) / 15;
                await connection.query(
                    `INSERT INTO Rental_items (idRentals, idRentalProduct, quantity, pricePerDay)
                    VALUES (?, ?, ?, ?)`,
                    [rentalId, item.idProduct, item.quantity, pricePerDay]
                );

                const [stockUpdate] = await connection.query(
                    "UPDATE Products SET stock = stock - ? WHERE idProducts = ? AND stock >= ?",
                    [item.quantity, item.idProduct, item.quantity]
                );
                if (stockUpdate.affectedRows === 0) {
                    await connection.query("ROLLBACK");
                    return res.status(400).json(`Insufficient stock for ${item.product_name}.`);
                }
            }

            // Clear rental cart
            await connection.query(
                "DELETE FROM Rental_cart_items WHERE idRentalCarts = ?",
                [rentalCartId]
            );

            await connection.query("COMMIT");

            const totalCost = cartItems.reduce(
                (sum, item) => sum + (Number(item.price) / 15) * Number(item.quantity) * rentalDays,
                0
            );

            return res.status(200).json({
                rentalId,
                rentalDays,
                totalCost: totalCost.toFixed(2),
                message: "Rental confirmed successfully."
            });
        } catch (innerError) {
            await connection.query("ROLLBACK");
            throw innerError;
        }
    } catch (error) {
        console.error("Rental checkout error:", error);
        return res.status(500).json(error.message || "Failed to process rental checkout.");
    }
};

/**
 * Get all rentals for the current user (or all rentals if admin).
 */
export const getRentals = async (req, res) => {
    const userId = getUserIdFromRequest(req);
    if (!userId) return res.status(401).json("Not authenticated.");

    const connection = db.promise();
    try {
        const [userRows] = await connection.query(
            "SELECT is_admin FROM Users WHERE idUsers = ?",
            [userId]
        );
        if (!userRows.length) return res.status(404).json("User not found.");
        const isAdmin = Number(userRows[0].is_admin) === 1;

        const query = isAdmin
            ? `SELECT
                r.idRentals,
                r.idRentalUser, 
                r.StartDate, 
                r.endDate, 
                r.status,
                a.adress,
                a.city, 
                a.Country, 
                a.zipCode
            FROM Rentals r
            LEFT JOIN Adresses a ON a.idAdress = r.idRentalAdress
            ORDER BY r.StartDate DESC`
            : `SELECT 
                r.idRentals, 
                r.idRentalUser, 
                r.StartDate, 
                r.endDate, 
                r.status,
                a.adress, 
                a.city, 
                a.Country, 
                a.zipCode
            FROM Rentals r
            LEFT JOIN Adresses a ON a.idAdress = r.idRentalAdress
            WHERE r.idRentalUser = ?
            ORDER BY r.StartDate DESC`;

        const [rentalRows] = await connection.query(query, isAdmin ? [] : [userId]);

        if (!rentalRows.length) return res.status(200).json([]);

        const rentalIds = rentalRows.map((r) => r.idRentals);
        const [itemRows] = await connection.query(
            `SELECT ri.idRentals, ri.idRentalProduct, ri.quantity, ri.pricePerDay,
                    p.product_name, p.image
             FROM Rental_items ri
             INNER JOIN Products p ON p.idProducts = ri.idRentalProduct
             WHERE ri.idRentals IN (?)`,
            [rentalIds]
        );

        const itemsByRental = itemRows.reduce((acc, item) => {
            if (!acc[item.idRentals]) acc[item.idRentals] = [];
            acc[item.idRentals].push({
                idProduct: item.idRentalProduct,
                product_name: item.product_name,
                image: item.image,
                quantity: item.quantity,
                pricePerDay: item.pricePerDay,
            });
            return acc;
        }, {});

        const response = rentalRows.map((r) => ({
            idRental: r.idRentals,
            idRentalUser: r.idRentalUser,
            startDate: r.StartDate,
            endDate: r.endDate,
            status: r.status,
            address: { adress: r.adress, city: r.city, country: r.Country, zipCode: r.zipCode },
            items: itemsByRental[r.idRentals] || [],
        }));

        return res.status(200).json(response);
    } catch (error) {
        console.error("Rentals fetch error:", error);
        return res.status(500).json(error.message || "Failed to fetch rentals.");
    }
};
