import React, { useState } from "react";
import CrudTemplate from "./CrudTemplate";
import { Button, Modal } from "react-bootstrap";

export default function Plants() {
  const [salaryModal, setSalaryModal] = useState(false);
  const [totalSalary, setTotalSalary] = useState(0);
  const [plantName, setPlantName] = useState("");

  // Fetch salary using your stored function
  const viewSalary = async (plant) => {
    try {
      const res = await fetch(`http://localhost:5000/api/total-salary/${plant.plantID}`);
      const data = await res.json();
      setTotalSalary(data.totalSalary || 0);
      setPlantName(plant.name);
      setSalaryModal(true);
    } catch (err) {
      console.error("❌ Salary fetch failed:", err);
      alert("Error fetching salary.");
    }
  };

  return (
    <>
      <CrudTemplate
        title="Power Plants"
        apiEndpoint="http://localhost:5000/api/plants"
        columns={["plantID", "name", "location", "capacity", "energyTypeID", "regionID"]}
        idField="plantID"
        customActions={(plant) => (
          <Button
            variant="outline-success"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              viewSalary(plant);
            }}
          >
            💰 View Salary
          </Button>
        )}
      />

      {/* 💰 Salary Modal */}
      <Modal show={salaryModal} onHide={() => setSalaryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>💰 Salary Expenses</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>🏭 Plant:</strong> {plantName}</p>
          <p><strong>Total Salary:</strong> ₹{Number(totalSalary).toLocaleString()}</p>
        </Modal.Body>
      </Modal>
    </>
  );
}
