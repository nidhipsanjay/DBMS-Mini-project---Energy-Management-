// src/pages/Home.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [summary, setSummary] = useState({ plants: 0, employees: 0, energy: 0 });

  useEffect(() => {
    fetch('http://localhost:5000/api/report/aggregate')
      .then(r => r.json())
      .then(data => {
        const totalPlants = data.length;
        const totalEnergy = data.reduce((sum, r) => sum + (r.totalProduced || 0), 0);
        setSummary({ plants: totalPlants, employees: 10, energy: totalEnergy });
      })
      .catch(() => setSummary({ plants: 5, employees: 48, energy: 123456 }));
  }, []);

  return (
    <div className="fade-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 style={{ fontWeight: 700 }}>Dashboard</h3>
          <p className="small-muted">Overview of your energy network</p>
        </div>
        <div>
          <Link to="/reports" className="btn btn-primary btn-sm">View Reports</Link>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="card p-3 card-summary app-bg-hero">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5>Total Plants</h5>
                <h2>{summary.plants}</h2>
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
                <h2>{summary.employees}</h2>
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
                <h2>{summary.energy.toLocaleString()}</h2>
                <p className="small-muted">MWh (lifetime)</p>
              </div>
              <i className="fa-solid fa-chart-line fa-2x text-muted"></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
