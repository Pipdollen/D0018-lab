import db from "../../db/mysql.js";
import jwt from "jsonwebtoken";

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

export const getProductReviews = async (req, res) => {
    const idProduct = Number(req.params.idProducts);

    if (Number.isNaN(idProduct)) {
        return res.status(400).json("Invalid product id.");
    }

    const connection = db.promise();

    try {
        const [rows] = await connection.query(
            `SELECT
                r.idReviews,
                r.idReviewUser,
                r.idReviewProduct,
                r.rating,
                r.comment,
                u.username
            FROM Reviews r
            INNER JOIN Users u ON u.idUsers = r.idReviewUser
            WHERE r.idReviewProduct = ?
            ORDER BY r.idReviews DESC`,
            [idProduct]
        );

        return res.status(200).json(Array.isArray(rows) ? rows : []);
    } catch (error) {
        console.error("Reviews fetch error:", error);
        return res.status(500).json(error.message || "Failed to load reviews.");
    }
};

export const createReview = async (req, res) => {
    const idProduct = Number(req.params.idProducts);
    const userId = getUserIdFromRequest(req);

    if (!userId) {
        return res.status(401).json("Not authenticated.");
    }

    if (Number.isNaN(idProduct)) {
        return res.status(400).json("Invalid product id.");
    }

    const rating = Number(req.body?.rating);
    const comment = String(req.body?.comment || "").trim();

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json("Rating must be an integer from 1 to 5.");
    }

    if (!comment || comment.length > 250) {
        return res.status(400).json("Comment is required and must be 250 characters or less.");
    }

    const connection = db.promise();

    try {
        const [productRows] = await connection.query(
            "SELECT idProducts FROM Products WHERE idProducts = ?",
            [idProduct]
        );

        if (!productRows.length) {
            return res.status(404).json("Product not found.");
        }

        const [purchaseRows] = await connection.query(
            `SELECT 1
            FROM Orders o
            INNER JOIN Orders_items oi ON oi.idOrder = o.idOrders
            WHERE o.idOrderUser = ? AND oi.idProducts = ?`,
            [userId, idProduct]
        );

        const [rentalRows] = await connection.query(
            `SELECT 1
            FROM Rentals r
            INNER JOIN Rental_items ri ON ri.idRentals = r.idRentals
            WHERE r.idRentalUser = ? AND ri.idRentalProduct = ?`,
            [userId, idProduct]
        );

        if (!purchaseRows.length && !rentalRows.length) {
            return res.status(403).json("You can only review products you have purchased or rented.");
        }

        const [insertResult] = await connection.query(
            `INSERT INTO Reviews (idReviewUser, idReviewProduct, rating, comment)
            VALUES (?, ?, ?, ?)`,
            [userId, idProduct, rating, comment]
        );

        const [reviewRows] = await connection.query(
            `SELECT
                r.idReviews,
                r.idReviewUser,
                r.idReviewProduct,
                r.rating,
                r.comment,
                u.username
            FROM Reviews r
            INNER JOIN Users u ON u.idUsers = r.idReviewUser
            WHERE r.idReviews = ?`,
            [insertResult.insertId]
        );

        return res.status(201).json(reviewRows[0]);
    } catch (error) {
        console.error("Create review error:", error);
        return res.status(500).json(error.message || "Failed to create review.");
    }
};
