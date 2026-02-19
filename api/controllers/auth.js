import db from "../../db/mysql.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const register = (req, res) => {
    //check if user exists
    if (!req.body.username || !req.body.password || !req.body.email) {
        return res.status(400).json("Username, password, and email are required!");
    }

    const q = "SELECT * FROM Users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length) return res.status(409).json("User already exists!");



        //create new user
        //hash password
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

export const login = (req, res) => {
    //todo
    //check if user exists
    const q = "SELECT * FROM Users WHERE username = ?";

    db.query(q, [req.body.username], (err, data) => {
        if (err) return res.status(500).json(err);
        if (data.length === 0) return res.status(404).json("User not found!");

        //check password
        const isPasswordCorrect = bcrypt.compareSync(req.body.password, data[0].password);
        if (!isPasswordCorrect) return res.status(400).json("Wrong password!");

        //create token
        const token = jwt.sign({ id: data[0].id }, "secretkey");


        //send token in cookie
        const { password, ...other } = data[0];

        res.cookie("access_token", token, {
            httpOnly: true
        }).status(200).json(other);
    });

};

export const logout = (req, res) => {
    res.clearCookie("access_token", {
        secure: true,
        sameSite: "none",
    }).status(200).json("User has been logged out.");

};