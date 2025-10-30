// backend/server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",       // your MySQL username
  password: "",       // your MySQL password
  database: "EnergyManagement"
});

db.connect(err => {
  if (err) {
    console.error("MySQL connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL database!");
  }
});

// --- Power Plants Endpoints ---
app.get("/api/plants", (req, res) => {
  db.query("SELECT * FROM PowerPlant", (err, results) => {
    if (err) res.status(500).send(err);
    else res.json(results);
  });
});

app.post("/api/plants", (req, res) => {
  const { plantName, location, capacity } = req.body;
  const sql = "INSERT INTO PowerPlant (plantName, location, capacity) VALUES (?, ?, ?)";
  db.query(sql, [plantName, location, capacity], (err, result) => {
    if (err) res.status(500).send(err);
    else res.json({ message: "Plant added!", id: result.insertId });
  });
});

app.put("/api/plants/:id", (req, res) => {
  const { id } = req.params;
  const { plantName, location, capacity } = req.body;
  const sql = "UPDATE PowerPlant SET plantName=?, location=?, capacity=? WHERE plantID=?";
  db.query(sql, [plantName, location, capacity, id], (err) => {
    if (err) res.status(500).send(err);
    else res.json({ message: "Plant updated!" });
  });
});

app.delete("/api/plants/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM PowerPlant WHERE plantID=?", [id], (err) => {
    if (err) res.status(500).send(err);
    else res.json({ message: "Plant deleted!" });
  });
});

//  --- Regions Endpoint Example ---
app.get("/api/regions", (req, res) => {
  db.query("SELECT * FROM Region", (err, results) => {
    if (err) res.status(500).send(err);
    else res.json(results);
  });
});

// --- Employees Endpoint Example ---
app.get("/api/employees", (req, res) => {
  db.query("SELECT * FROM Employee", (err, results) => {
    if (err) res.status(500).send(err);
    else res.json(results);
  });
});

// --- Reports Example ---
app.get("/api/report/aggregate", (req, res) => {
  const sql = `
    SELECT r.regionName, SUM(p.capacity) AS totalEnergy
    FROM PowerPlant p
    JOIN Region r ON p.regionID = r.regionID
    GROUP BY r.regionName
  `;
  db.query(sql, (err, results) => {
    if (err) res.status(500).send(err);
    else res.json(results);
  });
});

app.listen(5000, () => console.log("🚀 Server running on http://localhost:5000"));
