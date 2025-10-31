import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function CrudTemplate({ title, apiEndpoint, columns, idField, onRowClick }) { // 🔹 added onRowClick
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);

  // ✅ Fetch data from backend
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await fetch(apiEndpoint);
      const result = await res.json();
      setData(result || []);
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

  // ✅ Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ✅ Open modal (add or edit)
  const openModal = (item = null) => {
    setFormData(item || {});
    setEditMode(!!item);
    setShowModal(true);
  };

  // ✅ Save (Create or Update)
  const handleSave = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `${apiEndpoint}/${formData[idField]}`
      : apiEndpoint;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        alert("❌ Failed to save record. Please check backend logs.");
        return;
      }

      alert(editMode ? "✅ Record updated successfully!" : "✅ Record added successfully!");
      setShowModal(false);
      fetchData();
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("⚠️ An error occurred while saving. Check console for details.");
    }
  };

  // ✅ Delete record
  const handleDelete = async (item) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;

    try {
      const res = await fetch(`${apiEndpoint}/${item[idField]}`, {
        method: "DELETE",
      });

      const result = await res.json();

      if (!res.ok || result.success === false) {
        alert("❌ Delete failed. Please check backend logs.");
        return;
      }

      alert("🗑️ Record deleted successfully!");
      fetchData();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("⚠️ An error occurred while deleting. Check console for details.");
    }
  };
  const [employeeInfo, setEmployeeInfo] = useState(null);

// Fetch and show details when an employee row is clicked
const handleEmployeeClick = async (employee) => {
  if (title !== "Employee" || !onRowClick) return;
  const data = await onRowClick(employee);
  if (data) setEmployeeInfo(data);
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
                  style={{ cursor: "pointer" }}
                  onClick={() => handleEmployeeClick(row)} // 👈 make row clickable
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

    {/* ✅ Add/Edit Modal */}
    <Modal show={showModal} onHide={() => setShowModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>{editMode ? "Edit" : "Add New"} {title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {columns.map((col) => (
          <div key={col} className="mb-2">
            <label className="form-label fw-semibold">{col}</label>
            <input
              className="form-control"
              name={col}
              value={formData[col] || ""}
              onChange={handleChange}
              disabled={col === idField}
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

    {/* ✅ Employee Info Modal */}
    {/* ✅ Employee Info Modal */}
<Modal show={!!employeeInfo} onHide={() => setEmployeeInfo(null)} centered>
  <Modal.Header closeButton>
    <Modal.Title>Employee Assignment</Modal.Title>
  </Modal.Header>
  <Modal.Body>
  {employeeInfo ? (
    <div className="p-3 bg-light rounded shadow-sm">
      <p><strong>👤 Employee:</strong> {employeeInfo.employeeName}</p>
      <p><strong>📍 Region:</strong> {employeeInfo.regionName}</p>
      <p><strong>🏭 Power Plant:</strong> {employeeInfo.plantName}</p>
      <p><strong>⚡ Energy Type:</strong> {employeeInfo.energyType || "N/A"}</p>
    </div>
  ) : (
    <p>Loading details...</p>
  )}
</Modal.Body>

</Modal>

  </div>
);

 
}
