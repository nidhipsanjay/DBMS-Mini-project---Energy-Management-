import React, { useState } from "react";
import CrudTemplate from "./CrudTemplate";
import { Button, Modal } from "react-bootstrap";

export default function Regions() {
  const [summaryModal, setSummaryModal] = useState(false);
  const [regionName, setRegionName] = useState("");
  const [summaryData, setSummaryData] = useState(null);

  // 📊 Fetch region summary via stored procedure
  const viewRegionSummary = async (region) => {
    try {
      const res = await fetch(`http://localhost:5000/api/region-summary/${region.regionID}`);
      const data = await res.json();

      if (data.success && data.data && data.data.length > 0) {
        setSummaryData(data.data[0]); // data.data is usually an array from SQL procedure
      } else {
        setSummaryData(null);
      }

      setRegionName(region.regionName);
      setSummaryModal(true);
    } catch (err) {
      console.error("❌ Error fetching region summary:", err);
      alert("Error fetching region summary.");
    }
  };

  return (
    <>
      <CrudTemplate
        title="Regions"
        apiEndpoint="http://localhost:5000/api/regions"
        columns={["regionID", "regionName", "avgDemand", "country", "currentConsumption"]}
        idField="regionID"
        customActions={(region) => (
          <Button
            variant="outline-primary"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              viewRegionSummary(region);
            }}
          >
            📊 View Summary
          </Button>
        )}
      />

      {/* 📍 Region Summary Modal */}
      <Modal show={summaryModal} onHide={() => setSummaryModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>📍 Region Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p><strong>🌍 Region:</strong> {regionName}</p>

          {summaryData ? (
            <>
              <p><strong>Total Plants:</strong> {summaryData.totalPlants}</p>
              <p><strong>Total Production:</strong> {Number(summaryData.totalProduction || 0).toLocaleString()} units</p>
              <p><strong>Average Demand:</strong> {Number(summaryData.avgDemand || 0).toLocaleString()} MW</p>
              <p><strong>Active Employees:</strong> {summaryData.activeEmployees}</p>
            </>
          ) : (
            <p>No summary data available for this region.</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
}
