import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);


export default function Home() {
    const [summary, setSummary] = useState({ plants: 0, employees: 0, energy: 0 });
    useEffect(() => {
        // Fetch a simple aggregate endpoint - placeholder
        fetch('http://localhost:5000/api/report/aggregate')
            .then(r => r.json())
            .then(data => {
                setSummary({
                    plants: data.totalPlants || 0,
                    employees: data.totalEmployees || 0,
                    energy: data.totalEnergy || 0
                })
            }).catch(() => {
                // fallback dummy data
                setSummary({ plants: 5, employees: 48, energy: 123456 });
            })
    }, [])


    return (
        <div className="fade-page">
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


            {/* preview chart card */}
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
        </div>
    )
}