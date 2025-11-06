import React, { useState, useEffect } from "react";
import { Button, Modal, Table } from "react-bootstrap";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Reports() {
  const [data, setData] = useState([]);
  const [show, setShow] = useState(false);

  const [energySummary, setEnergySummary] = useState([]);
  const [selectedEnergyType, setSelectedEnergyType] = useState(1);

  // ✅ Fetch overall report (existing)
  const fetchReport = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/overall-report`);
      if (!res.ok) throw new Error("Server returned " + res.status);
      const json = await res.json();

      if (!json.success) throw new Error(json.error || "Unknown error");
      setData(json.data || []);
      setShow(true);
    } catch (err) {
      console.error("❌ Report fetch failed:", err);
      alert("Error fetching overall report. Check console for details.");
    }
  };

  // ✅ Fetch energy summary for Pie chart
  useEffect(() => {
    fetch(`http://localhost:5000/api/energy-summary/${selectedEnergyType}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          const row = data.data[0];
          setEnergySummary([
            { name: "Avg Capacity (MW)", value: row.avgCapacity },
            { name: "Total Supplied (MW)", value: row.totalSupplied },
            { name: "Avg Demand (MW)", value: row.avgDemand },
          ]);
        } else {
          setEnergySummary([]);
        }
      })
      .catch((err) => console.error("❌ Energy summary fetch failed:", err));
  }, [selectedEnergyType]);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658"];

  return (
    <div className="fade-page p-4">
      {/* ---- Overall Power Plant Report Section ---- */}
      <h3 className="fw-bold mb-3">📊 Overall Power Plant Report</h3>
      <Button onClick={fetchReport} className="mb-3">
        Generate Report
      </Button>

      <Modal show={show} onHide={() => setShow(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>⚡ Power Plant Performance Summary</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {data.length > 0 ? (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Plant</th>
                  <th>Total Produced</th>
                  <th>Total Distributed</th>
                  <th>Production Logs</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    <td>{row.plantName}</td>
                    <td>{row.totalProduced || 0}</td>
                    <td>{row.totalDistributed || 0}</td>
                    <td>{row.productionLogs || 0}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p>No records found.</p>
          )}
        </Modal.Body>
      </Modal>

      {/* ---- Energy Summary Pie Chart Section ---- */}
      <div className="mt-5 p-4 border rounded shadow-sm bg-white">
        <h4 className="text-center mb-4">🔸 Energy Type Summary</h4>

        {/* Energy Type Selector */}
        <div className="d-flex justify-content-center mb-4">
          <select
            value={selectedEnergyType}
            onChange={(e) => setSelectedEnergyType(e.target.value)}
            className="form-select w-auto"
          >
            <option value={1}>Solar</option>
            <option value={2}>Wind</option>
            <option value={3}>Hydro</option>
            <option value={4}>Thermal</option>
          </select>
        </div>

        {/* Pie Chart */}
        <div style={{ width: "100%", height: 350 }}>
          {energySummary.length > 0 ? (
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={energySummary}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label
                >
                  {energySummary.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted">
              No data available for this energy type.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
