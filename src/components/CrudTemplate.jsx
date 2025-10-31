import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';

export default function CrudTemplate({ title, apiEndpoint, columns, idField, onRowClick }) {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [plantInfo, setPlantInfo] = useState(null);
  const [totalSalary, setTotalSalary] = useState(0);

  // Fetch table data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiEndpoint);
      const json = await res.json();
      if (json && json.success) setData(json.data || []);
      else setData(Array.isArray(json) ? json : []);
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🧩 FIX 1: Preserve ID even if undefined due to casing
  const openModal = (item = null) => {
    const record = { ...item };
    if (item && !item[idField]) {
      // try to find the ID field ignoring case (empID vs EmpID etc)
      const keyMatch = Object.keys(item).find(k => k.toLowerCase() === idField.toLowerCase());
      if (keyMatch) record[idField] = item[keyMatch];
    }
    setFormData(record || {});
    setEditMode(!!item);
    setShowModal(true);
  };

  const handleSave = async () => {
  const method = editMode ? "PUT" : "POST";
  const url = editMode ? `${apiEndpoint}/${formData[idField]}` : apiEndpoint;

  try {
    // 🩵 Sanitize date fields before sending to backend
    const cleanedData = { ...formData };
    Object.keys(cleanedData).forEach((key) => {
      const value = cleanedData[key];
      if (value && typeof value === "string" && value.includes("T")) {
        // check if it's a valid date string
        const d = new Date(value);
        if (!isNaN(d)) cleanedData[key] = d.toISOString().split("T")[0]; // keep only YYYY-MM-DD
      }
    });

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cleanedData),
    });
    const json = await res.json();

    if (!json || json.success !== true) {
      console.error("Save failed response:", json);
      throw new Error(json?.error || "Save failed");
    }

    // Refresh total salary if relevant
    if (plantInfo && formData.plantID && Number(formData.plantID) === Number(plantInfo.plantID)) {
      try {
        const s = await axios.get(`http://localhost:5000/api/total-salary/${plantInfo.plantID}`);
        setTotalSalary(s.data?.totalSalary || 0);
      } catch (e) {
        console.error("Failed to refresh salary after save:", e);
      }
    }

    alert(editMode ? "✅ Record updated successfully!" : "✅ Record added successfully!");
    setShowModal(false);
    await fetchData();
  } catch (err) {
    console.error("❌ Save failed:", err);
    alert("⚠️ Error saving record. See console for details.");
  }
};

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${apiEndpoint}/${item[idField]}`, { method: "DELETE" });
      const json = await res.json();
      if (!json || json.success !== true) {
        console.error("Delete failed response:", json);
        throw new Error(json?.error || "Delete failed");
      }
      alert("🗑️ Deleted successfully!");
      await fetchData();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("⚠️ Error deleting record. See console.");
    }
  };

  const handleEmployeeClick = async (employee) => {
    if (!title.toLowerCase().includes("employee") || !onRowClick) return;
    try {
      const result = await onRowClick(employee);
      if (result && result.success && result.data) setEmployeeInfo(result.data);
      else if (result && typeof result === "object") setEmployeeInfo(result);
      else setEmployeeInfo(null);
    } catch (err) {
      console.error("❌ Employee info failed:", err);
    }
  };

  const handlePlantClick = async (plant) => {
    if (!title.toLowerCase().includes("plant")) return;
    setPlantInfo(plant);
    try {
      const res = await axios.get(`http://localhost:5000/api/total-salary/${plant.plantID}`);
      setTotalSalary(res.data?.totalSalary ?? 0);
    } catch (err) {
      console.error("❌ Salary fetch failed:", err);
      setTotalSalary(0);
    }
  };

  const handleRowClick = (row) => {
    if (title.toLowerCase().includes("employee")) handleEmployeeClick(row);
    else if (title.toLowerCase().includes("plant")) handlePlantClick(row);
  };

  return (
    <div className="fade-page">
      <h3 className="mb-4 fw-bold">{title}</h3>

      <Button className="mb-3 btn-primary" onClick={() => openModal()}>
        + Add New
      </Button>

      <div className="table-responsive">
        {loading ? (
          <p className="text-center text-muted">Loading...</p>
        ) : (
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? (
                data.map((row, idx) => (
                  <tr
                    key={idx}
                    onClick={() => handleRowClick(row)}
                    style={{ cursor: "pointer" }}
                  >
                    {columns.map((col) => (
                      <td key={col}>{row[col]}</td>
                    ))}
                    <td>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        className="me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(row);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(row);
                        }}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={columns.length + 1} className="text-center text-muted">
                    No records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal for Add/Edit */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? `Edit ${title}` : `Add New ${title}`}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {columns.map((col) => (
            <div key={col} className="mb-3">
              <label className="form-label fw-semibold">{col}</label>
              <input
                className="form-control"
                name={col}
                value={formData[col] ?? ""}
                onChange={handleChange}
                readOnly={col === idField}
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Employee Info Modal */}
      <Modal show={!!employeeInfo} onHide={() => setEmployeeInfo(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Employee Assignment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {employeeInfo ? (
            <div className="p-3 bg-light rounded">
              <p><strong>👤 Employee:</strong> {employeeInfo.employeeName}</p>
              <p><strong>📍 Region:</strong> {employeeInfo.regionName}</p>
              <p><strong>🏭 Power Plant:</strong> {employeeInfo.plantName}</p>
              <p><strong>⚡ Energy Type:</strong> {employeeInfo.energyType || "N/A"}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
      </Modal>

      {/* Power Plant Salary Modal */}
      <Modal show={!!plantInfo} onHide={() => setPlantInfo(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Power Plant Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {plantInfo ? (
            <div className="p-3 bg-light rounded">
              <p><strong>🏭 Plant:</strong> {plantInfo.name}</p>
              <p><strong>📍 Location:</strong> {plantInfo.location}</p>
              <p><strong>⚡ Capacity:</strong> {plantInfo.capacity}</p>
              <p><strong>💰 Total Salary:</strong> ₹{Number(totalSalary || 0).toLocaleString()}</p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}
