import React, { useEffect, useState } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend);


export default function Reports() {
    const [regionData, setRegionData] = useState({ labels: [], datasets: [] });
    const [employeeData, setEmployeeData] = useState({ labels: [], datasets: [] });


    useEffect(() => {
        // placeholder API - expects {byRegion: [{region,energy}], byPlant: [{plant,employees}] }
        fetch('http://localhost:5000/api/report/aggregate')
            .then(r => r.json()).then(payload => {
                const byRegion = payload.byRegion || [{ region: 'North', energy: 400 }, { region: 'South', energy: 210 }, { region: 'East', energy: 340 }];
                const byPlant = payload.byPlant || [{ plant: 'North Solar', employees: 12 }, { plant: 'East Hydro', employees: 20 }];
                setRegionData({ labels: byRegion.map(x => x.region), datasets: [{ label: 'Energy (MWh)', data: byRegion.map(x => x.energy), tension: 0.4 }] });
                setEmployeeData({ labels: byPlant.map(x => x.plant), datasets: [{ label: 'Employees', data: byPlant.map(x => x.employees) }] });
            })
            .catch(() => {
                const byRegion = [{ region: 'North', energy: 400 }, { region: 'South', energy: 210 }, { region: 'East', energy: 340 }];
                const byPlant = [{ plant: 'North Solar', employees: 12 }, { plant: 'East Hydro', employees: 20 }];
                setRegionData({ labels: byRegion.map(x => x.region), datasets: [{ label: 'Energy (MWh)', data: byRegion.map(x => x.energy) }] });
                setEmployeeData({ labels: byPlant.map(x => x.plant), datasets: [{ label: 'Employees', data: byPlant.map(x => x.employees) }] });
            })
    }, [])
    return (
        <div className="fade-page">
            <div className="d-flex justify-content-between align-items-center mb-3"><h4 style={{ fontWeight: 700 }}>Reports</h4></div>
            <div className="row g-3">
                <div className="col-md-6">
                    <div className="card p-3">
                        <h6>Total Energy Produced per Region</h6>
                        <div style={{ height: 320 }}>
                            <Bar data={regionData} options={{ plugins: { legend: { display: false }, tooltip: { enabled: true } }, interaction: { mode: 'index' } }} />
                        </div>
                    </div>
                </div>
                <div className="col-md-6">
                    <div className="card p-3">
                        <h6>Employee Count per Power Plant</h6>
                        <div style={{ height: 320 }}>
                            <Pie data={employeeData} options={{ plugins: { legend: { position: 'bottom' }, tooltip: { enabled: true } } }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}