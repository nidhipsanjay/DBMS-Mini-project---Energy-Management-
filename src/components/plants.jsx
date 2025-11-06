import React, { useState } from "react";
import CrudTemplate from "./CrudTemplate";
import { Button, Modal } from "react-bootstrap";

export default function Plants() {
  // Existing salary modal state
  const [salaryModal, setSalaryModal] = useState(false);
  const [totalSalary, setTotalSalary] = useState(0);
  const [plantName, setPlantName] = useState("");

  // 🆕 Average production modal state
  const [avgModal, setAvgModal] = useState(false);
  const [avgProduction, setAvgProduction] = useState(0);

  // 💰 Existing: Fetch total salary using stored function
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

  // ⚡ New: Fetch average production
  const viewAvgProduction = async (plant) => {
    try {
      const res = await fetch(`http://localhost:5000/api/avg-production/${plant.plantID}`);
      const data = await res.json();
      setAvgProduction(data.avgProduction || 0);
      setPlantName(plant.name);
      setAvgModal(true);
    } catch (err) {
      console.error("❌ Avg production fetch failed:", err);
      alert("Error fetching average production.");
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
          <>
            {/* Existing salary button */}
            <Button
              variant="outline-success"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                viewSalary(plant);
              }}
              className="me-2"
            >
              💰 View Salary
            </Button>

            {/* 🆕 New avg production button */}
            <Button
              variant="outline-info"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                viewAvgProduction(plant);
              }}
            >
              ⚡ Avg Production
            </Button>
          </>
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

      {/* ⚡ Average Production Modal */}
      <Modal show={avgModal} onHide={() => setAvgModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>⚡ Average Production</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>🏭 Plant:</strong> {plantName}</p>
          <p><strong>Average Energy Produced:</strong> {Number(avgProduction).toLocaleString()} units</p>
        </Modal.Body>
      </Modal>
    </>
  );
}
