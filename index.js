const express = require("express");
const http = require("http");
const path = require("path");
const db = require("./db/mysql");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/search", (req, res) => {
  const { query } = req.body;

  db.query(
    "SELECT * FROM items WHERE name = ?",
    [query],
    (err, results) => {
      if (err) return res.status(500).json({ error: "DB error" });
      if (results.length === 0)
        return res.json({ message: "No results found" });

      res.json(results[0]);
    }
  );
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
