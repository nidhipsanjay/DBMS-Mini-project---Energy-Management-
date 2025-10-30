// backend/server.js
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",  // <-- update this!
  database: "EnergyManagement"
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err);
  else console.log("✅ Connected to MySQL database!");
});

// ----------------------------
// CRUD endpoints for all tables
// ----------------------------

// 🌿 Energy Types
app.get("/api/energytypes", (req, res) => {
  db.query("SELECT * FROM EnergyType", (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

// 🗺️ Regions
app.get("/api/regions", (req, res) => {
  db.query("SELECT * FROM Region", (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

// ⚡ Power Plants
app.get("/api/plants", (req, res) => {
  const sql = `
    SELECT p.*, e.typeName, r.regionName
    FROM PowerPlant p
    LEFT JOIN EnergyType e ON p.energyTypeID = e.energyTypeID
    LEFT JOIN Region r ON p.regionID = r.regionID
  `;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

// 👩‍🔧 Employees
app.get("/api/employees", (req, res) => {
  const sql = `
    SELECT emp.*, p.name AS plantName
    FROM Employee emp
    LEFT JOIN PowerPlant p ON emp.plantID = p.plantID
  `;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

// ⚙️ Production Logs
app.get("/api/production", (req, res) => {
  const sql = `
    SELECT l.*, p.name AS plantName
    FROM ProductionLog l
    LEFT JOIN PowerPlant p ON l.plantID = p.plantID
  `;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

// 🔄 Distributions
app.get("/api/distribution", (req, res) => {
  const sql = `
    SELECT d.*, p.name AS fromPlant, r.regionName AS toRegion
    FROM Distribution d
    LEFT JOIN PowerPlant p ON d.fromPlantID = p.plantID
    LEFT JOIN Region r ON d.toRegionID = r.regionID
  `;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

// 📊 Reports (example aggregated)
app.get("/api/report/aggregate", (req, res) => {
  const sql = `
    SELECT r.regionName, SUM(pl.energyProduced) AS totalProduced
    FROM ProductionLog pl
    JOIN PowerPlant p ON pl.plantID = p.plantID
    JOIN Region r ON p.regionID = r.regionID
    GROUP BY r.regionName
  `;
  db.query(sql, (err, result) => {
    if (err) res.status(500).send(err);
    else res.json(result);
  });
});

// ✅ Start the backend server
app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
