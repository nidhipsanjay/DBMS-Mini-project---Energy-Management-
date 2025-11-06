import React, { useState } from "react";
import CrudTemplate from "./CrudTemplate";
import { Button, Modal, Form } from "react-bootstrap";

export default function Employees() {
  const [showPromote, setShowPromote] = useState(false);
  const [minProduction, setMinProduction] = useState("");

  const handleEmployeeRowClick = async (employee) => {
    const res = await fetch(`http://localhost:5000/api/employee/details/${employee.empID}`);
    const data = await res.json();
    return data.data || {};
  };

  const promotePerformers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/promote-performers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ minProduction: parseFloat(minProduction) }),
      });
      const data = await res.json();
      alert(data.message || "Promotion executed successfully!");
      setShowPromote(false);
    } catch (err) {
      console.error("❌ Promotion failed:", err);
      alert("Error promoting performers.");
    }
  };

  return (
    <>
      <CrudTemplate
        title="Employee"
        apiEndpoint="http://localhost:5000/api/employees"
        columns={["empID", "name", "role", "salary", "hireDate", "plantID", "email"]}
        idField="empID"
        onRowClick={handleEmployeeRowClick}
        customActions={() => (
          <Button
            variant="outline-success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowPromote(true);
            }}
          >
            🏅 Promote Performers
          </Button>
        )}
      />

      {/* Promotion Modal */}
      <Modal show={showPromote} onHide={() => setShowPromote(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>🏅 Promote High Performers</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Enter Minimum Avg Production (MW)</Form.Label>
            <Form.Control
              type="number"
              placeholder="e.g. 300"
              value={minProduction}
              onChange={(e) => setMinProduction(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPromote(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={promotePerformers}>
            Promote
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
