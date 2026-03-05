import db from "../../db/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Register a new user with username, password, and email.
 * Validates input, checks for duplicate usernames, hashes password with bcrypt,
 * and inserts new user into Users table.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username for new account
 * @param {string} req.body.password - Plain text password (will be hashed)
 * @param {string} req.body.email - Email address for new account
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error message
 */
export const register = (req, res) => {
    // Check if user exists
    if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json("Username, password, and email are required!");
    }

    const q = "SELECT * FROM Users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(409).json("User already exists!");

        // Create new user and hash password with bcrypt (10 salt rounds)
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(req.body.password, salt);
        const q = "INSERT INTO Users (`username`, `password`, `email`) VALUES (?, ?, ?)";

        const values = [
            req.body.username,
            hashedPassword,
            req.body.email
        ];

        db.query(q, values, (err, data) => {
            if (err) return res.status(500).json(err);
            return res.status(200).json("User has been created.");
            console.log(data);
        });

    });



};

/**
 * Authenticate user with username and password.
 * Verifies user exists, compares hashed password, generates JWT token,
 * and sends it as an HTTP-only cookie.
 * 
 * @param {Object} req - Express request object
 * @param {Object} req.body - Request body
 * @param {string} req.body.username - Username to authenticate
 * @param {string} req.body.password - Plain text password to verify
 * @param {Object} res - Express response object
 * @returns {Object} User data (excluding password) or error message
 */
export const login = (req, res) => {
    // Check if user exists
    const q = "SELECT * FROM Users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found!");

        // Compare provided password with stored hashed password
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);
        if (!isPasswordCorrect) return res.status(400).json("Wrong password!");

        // Create JWT token with user ID
        const token = jwt.sign({ userId: data[0].idUsers }, "secretkey");

        // Send token as HTTP-only cookie
        const { password, ...other } = data[0];

        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json(other);
    });

};

/**
 * Logout user by clearing the JWT access token cookie.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Success message
 */
export const logout = (req, res) => {
    res.clearCookie("access_token", {
        httpOnly: true,
    }).status(200).json("User has been logged out.");
};