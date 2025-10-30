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
  password: "appa2amma", // your MySQL password
  database: "EnergyManagement",
});

db.connect((err) => {
  if (err) console.error("❌ MySQL connection failed:", err);
  else console.log("✅ Connected to MySQL database!");
});

// ----------------------------
// CRUD + Data endpoints
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

// 📊 Reports by Region (Chart.js)
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

// 📈 Dashboard Summary (for Home.jsx)
app.get("/api/summary", (req, res) => {
  const sql = `
    SELECT 
      (SELECT COUNT(*) FROM PowerPlant) AS totalPlants,
      (SELECT COUNT(*) FROM Employee) AS totalEmployees,
      (SELECT IFNULL(SUM(energyProduced),0) FROM ProductionLog) AS totalEnergy
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// ================== ENERGY TYPE ==================
app.post("/api/energy-types", (req, res) => {
  db.query("INSERT INTO EnergyType SET ?", req.body, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ energyTypeID: result.insertId });
  });
});

app.put("/api/energy-types/:id", (req, res) => {
  db.query("UPDATE EnergyType SET ? WHERE energyTypeID = ?", [req.body, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

app.delete("/api/energy-types/:id", (req, res) => {
  db.query("DELETE FROM EnergyType WHERE energyTypeID = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});


// ================== REGION ==================
app.post("/api/regions", (req, res) => {
  db.query("INSERT INTO Region SET ?", req.body, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ regionID: result.insertId });
  });
});

app.put("/api/regions/:id", (req, res) => {
  db.query("UPDATE Region SET ? WHERE regionID = ?", [req.body, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

app.delete("/api/regions/:id", (req, res) => {
  db.query("DELETE FROM Region WHERE regionID = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});


// ================== POWER PLANT ==================
app.post("/api/plants", (req, res) => {
  db.query("INSERT INTO PowerPlant SET ?", req.body, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ plantID: result.insertId });
  });
});

app.put("/api/plants/:id", (req, res) => {
  db.query("UPDATE PowerPlant SET ? WHERE plantID = ?", [req.body, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

app.delete("/api/plants/:id", (req, res) => {
  db.query("DELETE FROM PowerPlant WHERE plantID = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});


// ================== EMPLOYEE ==================
app.post("/api/employees", (req, res) => {
  db.query("INSERT INTO Employee SET ?", req.body, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ employeeID: result.insertId });
  });
});

app.put("/api/employees/:id", (req, res) => {
  db.query("UPDATE Employee SET ? WHERE employeeID = ?", [req.body, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

app.delete("/api/employees/:id", (req, res) => {
  db.query("DELETE FROM Employee WHERE employeeID = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});


// ================== PRODUCTION LOG ==================
app.post("/api/production-logs", (req, res) => {
  db.query("INSERT INTO ProductionLog SET ?", req.body, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ logID: result.insertId });
  });
});

app.put("/api/production-logs/:id", (req, res) => {
  db.query("UPDATE ProductionLog SET ? WHERE logID = ?", [req.body, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

app.delete("/api/production-logs/:id", (req, res) => {
  db.query("DELETE FROM ProductionLog WHERE logID = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});


// ================== DISTRIBUTION ==================
app.post("/api/distributions", (req, res) => {
  db.query("INSERT INTO Distribution SET ?", req.body, (err, result) => {
    if (err) return res.status(500).send(err);
    res.json({ distributionID: result.insertId });
  });
});

app.put("/api/distributions/:id", (req, res) => {
  db.query("UPDATE Distribution SET ? WHERE distributionID = ?", [req.body, req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});

app.delete("/api/distributions/:id", (req, res) => {
  db.query("DELETE FROM Distribution WHERE distributionID = ?", [req.params.id], (err) => {
    if (err) return res.status(500).send(err);
    res.json({ success: true });
  });
});


// ✅ Start backend server
app.listen(5000, () => {
  console.log("🚀 Backend running at http://localhost:5000");
});
