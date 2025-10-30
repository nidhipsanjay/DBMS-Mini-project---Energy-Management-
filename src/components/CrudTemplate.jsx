import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

export default function CrudTemplate({ title, apiEndpoint, columns, idField }) {
  const [data, setData] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [editMode, setEditMode] = useState(false);

  // 🔹 Fetch data from backend
  const fetchData = () => {
    fetch(apiEndpoint)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData([]));
  };

  useEffect(() => {
    fetchData();
  }, [apiEndpoint]);

  // 🔹 Handle field change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Open modal for Add/Edit
  const openModal = (item = null) => {
    setFormData(item || {});
    setEditMode(!!item);
    setShowModal(true);
  };

  // 🔹 Save new or updated record
  const handleSave = async () => {
    const method = editMode ? "PUT" : "POST";
    const url = editMode
      ? `${apiEndpoint}/${formData[idField]}`
      : apiEndpoint;

    try {
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      setShowModal(false);
      fetchData(); // refresh after save
    } catch (err) {
      console.error("❌ Save failed:", err);
    }
  };

  // 🔹 Delete record
  const handleDelete = async (item) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      await fetch(`${apiEndpoint}/${item[idField]}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error("❌ Delete failed:", err);
    }
  };

  return (
    <div className="fade-page">
      <h3 className="mb-4 fw-bold">{title}</h3>
      <Button className="mb-3 btn-primary" onClick={() => openModal()}>+ Add New</Button>

      <div className="table-responsive">
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              {columns.map(col => <th key={col}>{col}</th>)}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? data.map((row, idx) => (
              <tr key={idx}>
                {columns.map(col => <td key={col}>{row[col]}</td>)}
                <td>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="me-2"
                    onClick={() => openModal(row)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDelete(row)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={columns.length + 1} className="text-center text-muted">No records found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? "Edit" : "Add New"} {title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {columns.map((col) => (
            <div key={col} className="mb-2">
              <label className="form-label">{col}</label>
              <input
                className="form-control"
                name={col}
                value={formData[col] || ""}
                onChange={handleChange}
                disabled={col === idField} // prevent editing ID field
              />
            </div>
          ))}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleSave}>Save</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
