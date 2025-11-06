import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  User,
  MapPin,
  Factory,
  Zap,
  IndianRupee,
} from "lucide-react";


export default function CrudTemplate({ title, apiEndpoint, columns: initialColumns = [], idField, onRowClick }) {
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState(initialColumns);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // Row click modals
  const [employeeInfo, setEmployeeInfo] = useState(null);
  const [plantInfo, setPlantInfo] = useState(null);
  const [regionSummary, setRegionSummary] = useState(null);
  const [totalSalary, setTotalSalary] = useState(0);

  // Dropdowns
  const [dropdownData, setDropdownData] = useState({
    regions: [],
    plants: [],
    energytypes: [],
    employees: []
  });

  // -------------------- Fetch Table Data --------------------
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiEndpoint);
      const json = await res.json();
      const rows = (json?.success && json.data) || (Array.isArray(json) ? json : []);
      setData(rows);

      if (rows.length > 0 && columns.length === 0) {
        setColumns(Object.keys(rows[0]));
      }
    } catch (err) {
      console.error("❌ Fetch failed:", err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Fetch Dropdowns --------------------
  const fetchDropdowns = async () => {
    try {
      const [r, p, e, emp] = await Promise.all([
        axios.get("http://localhost:5000/api/regions").catch(() => ({ data: [] })),
        axios.get("http://localhost:5000/api/plants").catch(() => ({ data: [] })),
        axios.get("http://localhost:5000/api/energytypes").catch(() => ({ data: [] })),
        axios.get("http://localhost:5000/api/employees").catch(() => ({ data: [] })),
      ]);

      setDropdownData({
        regions: r.data.data || r.data || [],
        plants: p.data.data || p.data || [],
        energytypes: e.data.data || e.data || [],
        employees: emp.data.data || emp.data || [],
      });
    } catch (err) {
      console.error("⚠️ Failed to fetch dropdown data:", err);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDropdowns();
  }, [apiEndpoint]);

  // -------------------- Form Handling --------------------
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const openModal = (item = null) => {
    const record = { ...item };
    setFormData(record || {});
    setEditMode(!!item);
    setShowModal(true);
  };

  const handleSave = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode ? `${apiEndpoint}/${formData[idField]}` : apiEndpoint;

    try {
      const cleanedData = { ...formData };
      Object.keys(cleanedData).forEach((key) => {
        if (cleanedData[key] instanceof Date) cleanedData[key] = cleanedData[key].toISOString().split("T")[0];
      });

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      const json = await res.json();
      if (!json || json.success !== true) throw new Error(json?.error || "Save failed");

      // Refresh salary if plant info is open
      if (plantInfo && formData.plantID && Number(formData.plantID) === Number(plantInfo.plantID)) {
        try {
          const s = await axios.get(`http://localhost:5000/api/total-salary/${plantInfo.plantID}`);
          setTotalSalary(s.data?.totalSalary || 0);
        } catch (e) { console.error("Failed to refresh salary:", e); }
      }

      alert(editMode ? "✅ Record updated successfully!" : "✅ Record added successfully!");
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("⚠️ Error saving record. See console.");
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm("Delete this record?")) return;
    try {
      const res = await fetch(`${apiEndpoint}/${item[idField]}`, { method: "DELETE" });
      const json = await res.json();
      if (!json || json.success !== true) throw new Error(json?.error || "Delete failed");
      alert("🗑️ Deleted successfully!");
      fetchData();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("⚠️ Error deleting record. See console.");
    }
  };

  // -------------------- Row Click Handlers --------------------
  const handleEmployeeClick = async (employee) => {
    if (!title.toLowerCase().includes("employee") || !onRowClick) return;
    try {
      const result = await onRowClick(employee);
      if (result?.success && result.data) setEmployeeInfo(result.data);
      else if (typeof result === "object") setEmployeeInfo(result);
      else setEmployeeInfo(null);
    } catch (err) { console.error("❌ Employee info failed:", err); }
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

  const handleRowClick = async (row) => {
    if (title.toLowerCase().includes("employee")) handleEmployeeClick(row);
    else if (title.toLowerCase().includes("plant")) handlePlantClick(row);
    else if (title.toLowerCase().includes("region")) {
      try {
        const res = await axios.get(`http://localhost:5000/api/region-summary/${row.regionID}`);
        setRegionSummary(res.data?.data?.[0] || null);
      } catch (err) {
        console.error("❌ Region summary fetch failed:", err);
      }
    }
  };

  // -------------------- Render Field --------------------
  const renderField = (col) => {
    const lower = col.toLowerCase();

    if (lower === idField.toLowerCase()) return null;

    if (lower.includes("date")) {
      const selectedDate = formData[col] ? new Date(formData[col]) : null;
      return (
        <>
          <label className="form-label fw-semibold">{col}</label>
          <DatePicker
            selected={selectedDate}
            onChange={(date) => setFormData({ ...formData, [col]: date })}
            dateFormat="yyyy-MM-dd"
            className="form-control"
          />
        </>
      );
    }

    if (lower.endsWith("id") && lower !== idField.toLowerCase()) {
      let options = [];
      if (lower.includes("region")) options = dropdownData.regions;
      else if (lower.includes("plant")) options = dropdownData.plants;
      else if (lower.includes("energy")) options = dropdownData.energytypes;
      else if (lower.includes("employee")) options = dropdownData.employees;

      return (
        <>
          <label className="form-label fw-semibold">{col}</label>
          <select
            className="form-select"
            name={col}
            value={formData[col] ?? ""}
            onChange={handleChange}
          >
            <option value="">Select {col}</option>
            {options.map((opt) => {
              const key = Object.keys(opt).find(k => k.toLowerCase().includes("id"));
              const nameKey = Object.keys(opt).find(k => k.toLowerCase().includes("name")) || key;
              return <option key={opt[key]} value={opt[key]}>{opt[nameKey]}</option>;
            })}
          </select>
        </>
      );
    }

    return (
      <>
        <label className="form-label fw-semibold">{col}</label>
        <input
          className="form-control"
          name={col}
          value={formData[col] ?? ""}
          onChange={handleChange}
        />
      </>
    );
  };

  // -------------------- Render --------------------
  return (
    <div className="fade-page">
      <h3 className="mb-4 fw-bold">{title}</h3>

      <Button className="mb-3 btn-primary" onClick={() => openModal()}>+ Add New</Button>

      <div className="table-responsive">
        {loading ? <p className="text-center text-muted">Loading...</p> : (
          <table className="table table-striped table-hover align-middle">
            <thead className="table-dark">
              <tr>
                {columns.map((col) => <th key={col}>{col}</th>)}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map((row, idx) => (
                <tr key={idx} onClick={() => handleRowClick(row)} style={{ cursor: "pointer" }}>
                  {columns.map((col) => (
                    <td key={col}>
                      {row[col] && typeof row[col] === "object" ? JSON.stringify(row[col]) : row[col]}
                    </td>
                  ))}
                  <td>
                    <Button variant="outline-secondary" size="sm" className="me-2" onClick={e => { e.stopPropagation(); openModal(row); }}>Edit</Button>
                    <Button variant="outline-danger" size="sm" onClick={e => { e.stopPropagation(); handleDelete(row); }}>Delete</Button>
                  </td>
                </tr>
              )) : <tr><td colSpan={columns.length + 1} className="text-center text-muted">No records found</td></tr>}
            </tbody>
          </table>
        )}
      </div>

      
      {/* Add/Edit Modal */}
<Modal show={showModal} onHide={() => setShowModal(false)} centered>
  <Modal.Header closeButton>
    <Modal.Title>{editMode ? `Edit ${title}` : `Add New ${title}`}</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {columns.map((col) => (
      <div key={col} className="mb-3">
        {renderField(col)}
      </div>
    ))}
  </Modal.Body>
  <Modal.Footer>
    <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
    <Button variant="primary" onClick={handleSave}>
      {editMode ? "Save Changes" : "Add Record"}
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
        <p><User size={18} className="me-2 text-primary" /> <strong>Employee:</strong> {employeeInfo.employeeName}</p>
        <p><MapPin size={18} className="me-2 text-danger" /> <strong>Region:</strong> {employeeInfo.regionName}</p>
        <p><Factory size={18} className="me-2 text-secondary" /> <strong>Power Plant:</strong> {employeeInfo.plantName}</p>
        <p><Zap size={18} className="me-2 text-warning" /> <strong>Energy Type:</strong> {employeeInfo.energyType || "N/A"}</p>
      </div>
    ) : <p>Loading...</p>}
  </Modal.Body>
</Modal>

{/* Plant Modal */}
<Modal show={!!plantInfo} onHide={() => setPlantInfo(null)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Power Plant Details</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {plantInfo ? (
      <div className="p-3 bg-light rounded">
        <p><Factory size={18} className="me-2 text-secondary" /> <strong>Plant:</strong> {plantInfo.name}</p>
        <p><MapPin size={18} className="me-2 text-danger" /> <strong>Location:</strong> {plantInfo.location}</p>
        <p><Zap size={18} className="me-2 text-warning" /> <strong>Capacity:</strong> {plantInfo.capacity}</p>
        <p><IndianRupee size={18} className="me-2 text-success" /> <strong>Total Salary:</strong> ₹{Number(totalSalary || 0).toLocaleString()}</p>
      </div>
    ) : <p>Loading...</p>}
  </Modal.Body>
</Modal>

{/* Region Modal */}
<Modal show={!!regionSummary} onHide={() => setRegionSummary(null)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Region Energy Summary</Modal.Title>
  </Modal.Header>
  <Modal.Body>
    {regionSummary ? (
      <div className="p-3 bg-light rounded">
        <p><MapPin size={18} className="me-2 text-danger" /> <strong>Region:</strong> {regionSummary.regionName}</p>
        <p><Factory size={18} className="me-2 text-secondary" /> <strong>Plants Serving:</strong> {regionSummary.plantsServing ?? 0}</p>
      </div>
    ) : <p>Loading...</p>}
  </Modal.Body>
</Modal>

    </div>
  );
}
