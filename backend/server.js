// server.js
import express from "express";
import cors from "cors";
import mysql from "mysql2";
import bodyParser from "body-parser";

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MySQL Connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "sql123$",
  database: "EnergyManagement",
});

db.connect((err) => {
  if (err) console.error("❌ DB Connection Failed:", err);
  else console.log("✅ Connected to MySQL Database");
});

// Helper to return refreshed data in a consistent shape
const refreshData = (table, res, err) => {
  if (err) {
    console.error("❌ SQL Error:", err);
    return res.status(500).json({ success: false, error: err.message });
  }
  db.query(`SELECT * FROM ${table}`, (err2, results) => {
    if (err2) return res.status(500).json({ success: false, error: err2.message });
    res.json({ success: true, data: results });
  });
};

// Generic CRUD generator (returns consistent JSON)
function createCrudRoutes(endpoint, table, idField) {
  // READ (Get all)
  app.get(`/api/${endpoint}`, (_, res) => {
    db.query(`SELECT * FROM ${table}`, (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, data: results });
    });
  });

  // CREATE (Add new)
  app.post(`/api/${endpoint}`, (req, res) => {
    const data = req.body;
    console.log(`🟢 POST /api/${endpoint}`, data);
    db.query(`INSERT INTO ${table} SET ?`, data, (err, insertResult) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      // Return refreshed table
      db.query(`SELECT * FROM ${table}`, (err2, results) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, data: results, insertedId: insertResult.insertId });
      });
    });
  });

  // UPDATE (Edit record)
  app.put(`/api/${endpoint}/:id`, (req, res) => {
    const { id } = req.params;
    const data = req.body;

    if (!id || id === "undefined" || id === "null") {
      console.warn(`⚠️ Invalid ID for PUT /api/${endpoint}:`, id);
      return res.status(400).json({ success: false, error: "Invalid or missing ID parameter" });
    }

    console.log(`🟡 PUT /api/${endpoint}/${id}`, data);
    db.query(`UPDATE ${table} SET ? WHERE ${idField} = ?`, [data, id], (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      db.query(`SELECT * FROM ${table}`, (err2, results) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, data: results });
      });
    });
  });

  // DELETE
  app.delete(`/api/${endpoint}/:id`, (req, res) => {
    const { id } = req.params;

    if (!id || id === "undefined" || id === "null") {
      console.warn(`⚠️ Invalid ID for DELETE /api/${endpoint}:`, id);
      return res.status(400).json({ success: false, error: "Invalid or missing ID parameter" });
    }

    console.log(`🔴 DELETE /api/${endpoint}/${id}`);
    db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id], (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      db.query(`SELECT * FROM ${table}`, (err2, results) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, data: results });
      });
    });
  });
}

// Define CRUD endpoints
createCrudRoutes("energytypes", "EnergyType", "energyTypeID");
createCrudRoutes("regions", "Region", "regionID");
createCrudRoutes("plants", "PowerPlant", "plantID");
createCrudRoutes("production", "ProductionLog", "logID");
createCrudRoutes("distribution", "Distribution", "distributionID");
createCrudRoutes("employees", "Employee", "empID");

// Get total salary for a plant (calls your function)
app.get("/api/total-salary/:plantID", (req, res) => {
  const { plantID } = req.params;
  const query = `SELECT GetTotalSalary(?) AS totalSalary;`;

  db.query(query, [plantID], (err, result) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({ success: false, error: err.message, totalSalary: 0 });
    }
    const total = result && result[0] && typeof result[0].totalSalary !== "undefined" ? result[0].totalSalary : 0;
    res.json({ success: true, totalSalary: total });
  });
});

// Stored procedure: Add employee (kept for your use)
app.post("/api/add-employee-procedure", (req, res) => {
  const { name, role, salary, hireDate, plantID, email } = req.body;
  const sql = "CALL AddEmployee(?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, role, salary, hireDate, plantID, email], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Employee added successfully via procedure" });
  });
});

// Get employee details (keeps the same output shape)
app.get("/api/employee/details/:empID", (req, res) => {
  const { empID } = req.params;

  const query = `
    SELECT 
      e.name AS employeeName,
      COALESCE(r.regionName, 'N/A') AS regionName,
      COALESCE(p.name, 'N/A') AS plantName,
      COALESCE(et.typeName, 'N/A') AS energyType
    FROM Employee e
    LEFT JOIN PowerPlant p ON e.plantID = p.plantID
    LEFT JOIN Region r ON p.regionID = r.regionID
    LEFT JOIN EnergyType et ON p.energyTypeID = et.energyTypeID
    WHERE e.empID = ?;
  `;

  db.query(query, [empID], (err, results) => {
    if (err) {
      console.error("❌ SQL Error:", err);
      return res.status(500).json({ success: false, error: err.message });
    }

    // return an object (not array) for ease of frontend consumption
    res.json({ success: true, data: results[0] || {} });
  });
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
