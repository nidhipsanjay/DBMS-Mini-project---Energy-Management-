import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

// ✅ Reusable TableViewer component
function TableViewer({ title, endpoint }) {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/${endpoint}`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => setError(err.message));
  }, [endpoint]);

  if (error) return <p className="text-danger">Error loading {title}</p>;
  if (data.length === 0) return <p>Loading {title}...</p>;

  const headers = Object.keys(data[0]);

  return (
    <div className="table-responsive mt-4">
      <h5>{title}</h5>
      <table className="table table-bordered table-striped table-sm">
        <thead className="table-light">
          <tr>
            {headers.map((h) => (
              <th key={h}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr key={i}>
              {headers.map((h) => (
                <td key={h}>{row[h]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function Home() {
  const [summary, setSummary] = useState({ plants: 0, employees: 0, energy: 0 });

  useEffect(() => {
    fetch('http://localhost:5000/api/report/aggregate')
      .then((r) => r.json())
      .then((data) => {
        setSummary({
          plants: data.totalPlants || 0,
          employees: data.totalEmployees || 0,
          energy: data.totalEnergy || 0
        });
      })
      .catch(() => {
        setSummary({ plants: 5, employees: 48, energy: 123456 });
      });
  }, []);

  return (
    <div className="fade-page">
      {/* Header + Cards */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontWeight: 700 }}>Dashboard</h3>
          <p className="small-muted">Overview of your energy network</p>
        </div>
        <div>
          <Link to="/reports" className="btn btn-light btn-sm">View Reports</Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card p-3 card-summary app-bg-hero">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Plants</h5>
                <h2 style={{ margin: 0 }}>{summary.plants}</h2>
                <p className="small-muted">Active power generation sites</p>
              </div>
              <i className="fa-solid fa-industry fa-2x text-muted"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 card-summary app-bg-hero">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Employees</h5>
                <h2 style={{ margin: 0 }}>{summary.employees}</h2>
                <p className="small-muted">Staff across all regions</p>
              </div>
              <i className="fa-solid fa-users fa-2x text-muted"></i>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card p-3 card-summary app-bg-hero">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Energy Produced</h5>
                <h2 style={{ margin: 0 }}>{summary.energy.toLocaleString()}</h2>
                <p className="small-muted">MWh (lifetime)</p>
              </div>
              <i className="fa-solid fa-chart-line fa-2x text-muted"></i>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="row mt-4">
        <div className="col-md-8">
          <div className="card p-3">
            <h6>Energy Snapshot</h6>
            <p className="small-muted">Preview of production by region</p>
            <div style={{ height: 260 }}>
              <canvas id="previewChart"></canvas>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Database Tables Section */}
      <div className="mt-5">
        <h4>Database Tables Overview</h4>
        <p className="small-muted">Live data from MySQL backend</p>
        <TableViewer title="Energy Types" endpoint="energytypes" />
        <TableViewer title="Regions" endpoint="regions" />
        <TableViewer title="Power Plants" endpoint="plants" />
        <TableViewer title="Employees" endpoint="employees" />
        <TableViewer title="Production Logs" endpoint="production" />
        <TableViewer title="Distributions" endpoint="distribution" />
      </div>
    </div>
  );
}
