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

// ✅ Helper to refresh data
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

// ✅ Generic CRUD routes
function createCrudRoutes(endpoint, table, idField) {
  // READ
  app.get(`/api/${endpoint}`, (_, res) => {
    db.query(`SELECT * FROM ${table}`, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(results);
    });
  });

  // CREATE
  app.post(`/api/${endpoint}`, (req, res) => {
    const data = req.body;
    console.log(`🟢 POST /api/${endpoint}`, data);
    db.query(`INSERT INTO ${table} SET ?`, data, (err) =>
      refreshData(table, res, err)
    );
  });

  // UPDATE
  app.put(`/api/${endpoint}/:id`, (req, res) => {
    const { id } = req.params;
    const data = req.body;
    if (!id || id === "undefined" || id === "null") {
      console.warn(`⚠️ Invalid ID for PUT /api/${endpoint}:`, id);
      return res.status(400).json({ error: "Invalid or missing ID" });
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
      return res.status(400).json({ error: "Invalid or missing ID" });
    }

    console.log(`🔴 DELETE /api/${endpoint}/${id}`);
    db.query(`DELETE FROM ${table} WHERE ${idField} = ?`, [id], (err) =>
      refreshData(table, res, err)
    );
  });
}

// ✅ Define CRUD endpoints
createCrudRoutes("energytypes", "EnergyType", "energyTypeID");
createCrudRoutes("regions", "Region", "regionID");
createCrudRoutes("plants", "PowerPlant", "plantID");
createCrudRoutes("production", "ProductionLog", "logID");
createCrudRoutes("distribution", "Distribution", "distributionID");
createCrudRoutes("employees", "Employee", "empID");

// ✅ Stored function: Get total salary
app.get("/api/total-salary/:plantID", (req, res) => {
  const { plantID } = req.params;
  db.query("SELECT GetTotalSalary(?) AS totalSalary", [plantID], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results[0]);
  });
});

// ✅ Stored procedure: Add employee
app.post("/api/add-employee-procedure", (req, res) => {
  const { name, role, salary, hireDate, plantID, email } = req.body;
  const sql = "CALL AddEmployee(?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, role, salary, hireDate, plantID, email], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: "Employee added successfully via procedure" });
  });
});

// ✅ Get employee details (fixed, consistent name)
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
      return res.status(500).json({ error: err.message });
    }

    console.log("🔍 Employee details result:", results);
    res.json(results[0] || {});
  });
});

// ✅ Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
