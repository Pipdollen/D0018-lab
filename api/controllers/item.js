import db from "../../db/mysql.js";
import jwt from "jsonwebtoken";

/**
 * Retrieve a single item by ID.
 * TODO: Implement item retrieval logic
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} Product data or error message
 */
export const getItem = (req, res) => {
    return(null);
}

/**
 * Add a new product to the catalog.
 * Requires admin authentication. Validates all product fields, verifies category/brand/size
 * exist in database, and inserts product with stock information.
 * 
 * @param {Object} req - Express request object
 * @param {string} req.cookies.access_token - JWT authentication token
 * @param {Object} req.body - Request body
 * @param {string} req.body.productname - Name of the product
 * @param {number} req.body.price - Product price
 * @param {number|string} req.body.category - Category ID or name
 * @param {number|string} req.body.brand - Brand ID or name
 * @param {number|string} req.body.size - Size ID or size value
 * @param {number} req.body.stock - Available stock quantity
 * @param {string} req.body.productimage - Product image URL
 * @param {Object} res - Express response object
 * @returns {Object} Success message or error message
 */
export const addItem = async (req, res) => {
    const connection = db.promise();

    try {
        const token = req.cookies?.access_token;

        if (!token) {
            return res.status(401).json("Not authenticated.");
        }

        let userInfo;
        try {
            userInfo = jwt.verify(token, "secretkey");
        } catch (error) {
            return res.status(401).json("Invalid token.");
        }

        
        const requesterId = userInfo.userId;

        if (!requesterId) {
            return res.status(401).json("Invalid token payload.");
        }

        // Verify user exists and is admin
        const [userRows] = await connection.query(
            "SELECT is_admin FROM Users WHERE idUsers = ?",
            [requesterId]
        );

        if (!userRows.length) {
            return res.status(401).json("User not found.");
        }

        if (Number(userRows[0].is_admin) !== 1) {
            return res.status(403).json("Only admins can add items.");
        }

        // Extract product information from request
        const {
            productname,
            price,
            category,
            brand,
            size,
            stock,
            productimage,
        } = req.body;

        // Validate all required fields are present
        if (!productname || !price || !category || !brand || !size || !stock || !productimage) {
            return res.status(400).json("All product fields are required.");
        }


        // Verify category, brand, and size exist in database 
        const [categoryRows] = await connection.query(
            "SELECT idCategories FROM Categories WHERE idCategories = ?",
            [category]
        );
        const [brandRows] = await connection.query(
            "SELECT idBrands FROM Brands WHERE idBrands = ?",
            [brand]
        );
        const [sizeRows] = await connection.query(
            "SELECT idSizes FROM Sizes WHERE idSizes = ?",
            [size]
        );

        if (!categoryRows.length || !brandRows.length || !sizeRows.length) {
            return res.status(400).json("Invalid category, brand, or size value.");
        }

        const q = "INSERT INTO Products (`product_name`, `price`, `idProductCategorie`, `idProductBrand`, `idProductSize`, `stock`, `image`) VALUES (?, ?, ?, ?, ?, ?, ?)";
        const values = [
            productname,
            price,
            categoryRows[0].idCategories,
            brandRows[0].idBrands,
            sizeRows[0].idSizes,
            stock,
            productimage,
        ];

        await connection.query(q, values);

        return res.status(200).json("Product has been created.");
    } catch (err) {
        console.error("Database error:", err);
        return res.status(500).json(err.message || "Database error");
    }
}

/**
 * Retrieve all products from the catalog.
 * Returns complete product information including pricing and stock.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} Array of all products or error message
 */
export const getAllItems = (req, res) => {
    // Fetch all products
    const q = "SELECT * FROM Products";

    db.query(q, (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json(err);
        }
        return res.status(200).json(data);
    });
}

/**
 * Retrieve all product categories.
 * Returns list of available categories for filtering and classification.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} Array of all categories or error message
 */
export const getCategories = (req, res) => {
    // Fetch all categories
    const q = "SELECT * FROM Categories";
    
    db.query(q, (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json(err);
        }
        return res.status(200).json(Array.isArray(data) ? data : []);
    });
}

/**
 * Retrieve all product brands.
 * Returns list of available brands for filtering and selection.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} Array of all brands or error message
 */
export const getBrands = (req, res) => {
    // Fetch all brands
    const q = "SELECT * FROM Brands";
    
    db.query(q, (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json(err);
        }
        return res.status(200).json(Array.isArray(data) ? data : []);
    });
}

/**
 * Retrieve all available product sizes.
 * Returns list of size options for product selection.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Array} Array of all sizes or error message
 */
export const getSizes = (req, res) => {
    // Fetch all sizes
    const q = "SELECT * FROM Sizes";
    
    db.query(q, (err, data) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json(err);
        }
        return res.status(200).json(Array.isArray(data) ? data : []);
    });
}
    