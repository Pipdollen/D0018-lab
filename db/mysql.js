const mysql = require("mysql2");

const db = mysql.createPool({
  host: "localhost",
  user: "appuser",
  password: "Strongpassword",
  database: "SkiStore",
  waitForConnections: true,
  connectionLimit: 5
});

module.exports = db;

