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

// ✅ MySQL pool setup
const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "sql123$",
  database: "EnergyManagement",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// ✅ Promise-based version (for async/await routes)
const promiseDb = db.promise();

// ✅ Properly test connection using promise wrapper
(async () => {
  try {
    const [rows] = await promiseDb.query("SELECT 1");
    console.log("✅ Database connected successfully.");
  } catch (err) {
    console.error("❌ Database connection failed:", err);
  }
})();

// -----------------------------
// Helper Functions
// -----------------------------
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

// -----------------------------
// NEW: Get next available ID (fills gaps)
const getNextAvailableID = async (table, idField) => {
  try {
    const [rows] = await promiseDb.query(`SELECT ${idField} FROM ${table} ORDER BY ${idField}`);
    const usedIDs = rows.map(r => r[idField]);
    let nextID = 1;
    while (usedIDs.includes(nextID)) nextID++;
    return nextID;
  } catch (err) {
    console.error("❌ Error computing next available ID:", err);
    return null;
  }
};

// -----------------------------
// Generic CRUD generator
// -----------------------------
function createCrudRoutes(endpoint, table, idField) {
  // READ
  app.get(`/api/${endpoint}`, (_, res) => {
    db.query(`SELECT * FROM ${table}`, (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, data: results });
    });
  });

  // CREATE
  app.post(`/api/${endpoint}`, async (req, res) => {
    let data = req.body;

    // ✅ Assign next available ID automatically
    const nextID = await getNextAvailableID(table, idField);
    if (nextID === null) return res.status(500).json({ success: false, error: "Could not compute next ID" });
    data[idField] = nextID;

    console.log(`🟢 POST /api/${endpoint}`, data);
    db.query(`INSERT INTO ${table} SET ?`, data, (err, insertResult) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      db.query(`SELECT * FROM ${table}`, (err2, results) => {
        if (err2) return res.status(500).json({ success: false, error: err2.message });
        res.json({ success: true, data: results, insertedId: insertResult.insertId });
      });
    });
  });

  // UPDATE
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

// -----------------------------
// CRUD Endpoints
// -----------------------------
createCrudRoutes("energytypes", "EnergyType", "energyTypeID");
createCrudRoutes("regions", "Region", "regionID");
createCrudRoutes("plants", "PowerPlant", "plantID");
createCrudRoutes("production", "ProductionLog", "logID");
createCrudRoutes("distribution", "Distribution", "distributionID");
createCrudRoutes("employees", "Employee", "empID");

// -----------------------------
// Utility Routes
// -----------------------------
app.get("/api/total-salary/:plantID", (req, res) => {
  const { plantID } = req.params;
  const query = `SELECT GetTotalSalary(?) AS totalSalary;`;

  db.query(query, [plantID], (err, result) => {
    if (err) {
      console.error("SQL Error:", err);
      return res.status(500).json({ success: false, error: err.message, totalSalary: 0 });
    }
    const total = result?.[0]?.totalSalary ?? 0;
    res.json({ success: true, totalSalary: total });
  });
});

app.post("/api/add-employee-procedure", (req, res) => {
  const { name, role, salary, hireDate, plantID, email } = req.body;
  const sql = "CALL AddEmployee(?, ?, ?, ?, ?, ?)";
  db.query(sql, [name, role, salary, hireDate, plantID, email], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "Employee added successfully via procedure" });
  });
});

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
    res.json({ success: true, data: results[0] || {} });
  });
});

app.get("/api/avg-production/:plantID", (req, res) => {
  const { plantID } = req.params;
  db.query("SELECT GetAverageProduction(?) AS avgProduction;", [plantID], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, avgProduction: result[0]?.avgProduction || 0 });
  });
});

app.get("/api/region-summary/:regionID", (req, res) => {
  const { regionID } = req.params;
  db.query(
    `
    SELECT 
      r.regionName,
      COUNT(DISTINCT p.plantID) AS plantsServing
    FROM Region r
    LEFT JOIN PowerPlant p ON r.regionID = p.regionID
    WHERE r.regionID = ?
    GROUP BY r.regionName;
    `,
    [regionID],
    (err, results) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, data: results });
    }
  );
});

// -----------------------------
// Reports
// -----------------------------
app.get("/api/overall-report", (req, res) => {
  const query = `
    SELECT 
        p.name AS plantName,
        IFNULL(SUM(pl.energyProduced), 0) AS totalProduced,
        IFNULL(SUM(d.energySupplied), 0) AS totalDistributed,
        COUNT(pl.logID) AS productionLogs
    FROM PowerPlant p
    LEFT JOIN ProductionLog pl ON p.plantID = pl.plantID
    LEFT JOIN Distribution d ON p.plantID = d.fromPlantID
    GROUP BY p.name;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error("❌ Report query failed:", err);
      return res.status(500).json({ success: false, error: err.message });
    }
    res.json({ success: true, data: results });
  });
});

// -----------------------------
// Energy Summary (async route using promiseDb)
// -----------------------------
app.get("/api/energy-summary/:energyTypeID", async (req, res) => {
  const { energyTypeID } = req.params;

  try {
    const [rows] = await promiseDb.query(
      `
      SELECT 
          et.energyTypeID,
          et.typeName AS energyType,
          ROUND(AVG(p.capacity), 2) AS avgCapacity,
          COUNT(p.plantID) AS plantsServing,
          ROUND(SUM(p.capacity * 0.85), 2) AS totalSupplied
      FROM EnergyType et
      LEFT JOIN PowerPlant p ON et.energyTypeID = p.energyTypeID
      WHERE et.energyTypeID = ?
      GROUP BY et.energyTypeID, et.typeName;
      `,
      [energyTypeID]
    );

    if (!rows || rows.length === 0) {
      console.log("⚠️ No records found for energyTypeID:", energyTypeID);
      return res.json({ success: true, data: [] });
    }

    console.log("✅ Energy summary data:", rows);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ Error fetching energy summary:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =========================
// 📊 Home Dashboard Summary (FINAL FIX — FRONTEND SAFE)
// =========================
app.get("/api/report/aggregate", async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT
        (SELECT COUNT(*) FROM PowerPlant) AS totalPlants,
        (SELECT COUNT(*) FROM Employee) AS totalEmployees,
        (SELECT IFNULL(SUM(energyProduced), 0) FROM ProductionLog) AS totalEnergy;
    `);

    // ✅ Make sure data structure matches Home.jsx expectations
    res.json({ success: true, totals: rows[0] });
  } catch (err) {
    console.error("❌ Error fetching dashboard summary:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// =======================
// 🧠 LOGIN ENDPOINT
// =======================
app.post("/api/login", async (req, res) => {
  console.log("📩 Login request received:", req.body);

  const { email } = req.body;

  if (!email) return res.status(400).json({ success: false, message: "Email is required" });

  try {
    const [rows] = await promiseDb.query(
      "SELECT empID, name, role, email FROM Employee WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: "Email not found" });
    }

    const user = rows[0];
    res.json({
      success: true,
      message: "Login successful",
      user: {
        empID: user.empID,
        name: user.name,
        role: user.role,
        email: user.email,
      },
    });
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});




// -----------------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
