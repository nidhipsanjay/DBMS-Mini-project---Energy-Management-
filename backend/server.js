// server.js
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

// ✅ Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",          // change if needed
  password: "sql123$",   // your MySQL password
  database: "EnergyManagement", // main DB
});

db.connect((err) => {
  if (err) console.error("❌ DB Connection Failed:", err);
  else console.log("✅ Connected to MySQL Database");
});

// ✅ Helper to return refreshed data
const refreshData = (table, res, err) => {
  if (err) {
    console.error("❌ SQL Error:", err);
    return res.status(500).json({ error: err.message });
  }
  db.query(`SELECT * FROM ${table}`, (err2, results) => {
    if (err2) return res.status(500).json({ error: err2.message });
    res.json(results);
  });
};

// ✅ Generic CRUD generator (auto creates endpoints)
function createCrudRoutes(endpoint, table, idField) {
  // READ (Get all)
  app.get(`/api/${endpoint}`, (_, res) => {
    db.query(`SELECT * FROM ${table}`, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // CREATE (Add new)
  app.post(`/api/${endpoint}`, (req, res) => {
    const data = req.body;
    console.log(`🟢 POST /api/${endpoint}`, data);
    db.query(`INSERT INTO ${table} SET ?`, data, (err) =>
      refreshData(table, res, err)
    );
  });

  // UPDATE (Edit record)
  app.put(`/api/${endpoint}/:id`, (req, res) => {
    const { id } = req.params;
    const data = req.body;

    if (!id || id === "undefined" || id === "null") {
      console.warn(`⚠️ Invalid ID for PUT /api/${endpoint}:`, id);
      return res.status(400).json({ error: "Invalid or missing ID parameter" });
    }

    console.log(`🟡 PUT /api/${endpoint}/${id}`, data);
    db.query(`UPDATE ${table} SET ? WHERE ${idField} = ?`, [data, id], (err) =>
      refreshData(table, res, err)
    );
  });

  // DELETE
  app.delete(`/api/${endpoint}/:id`, (req, res) => {
    const { id } = req.params;

    if (!id || id === "undefined" || id === "null") {
      console.warn(`⚠️ Invalid ID for DELETE /api/${endpoint}:`, id);
      return res.status(400).json({ error: "Invalid or missing ID parameter" });
    }

    console.log(`🔴 DELETE /api/${endpoint}/${id}`);
    db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id], (err) =>
      refreshData(table, res, err)
    );
  });
}

// ✅ Define all CRUD endpoints (based on your schema)
createCrudRoutes("energytypes", "EnergyType", "energyTypeID");
createCrudRoutes("regions", "Region", "regionID");
createCrudRoutes("plants", "PowerPlant", "plantID");
// ✅ fixed (matches frontend names)
createCrudRoutes("production", "ProductionLog", "logID");
createCrudRoutes("distribution", "Distribution", "distributionID");
createCrudRoutes("employees", "Employee", "empID");

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
