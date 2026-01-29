const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "app_user",
  password: "strongpassword",
  database: "SkiShop_db",
  waitForConnections: true,
  connectionLimit: 5
});

module.exports = db;

