import React from 'react';
import { NavLink } from 'react-router-dom';
// import '..App.css';

export default function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top">
      <div className="container-fluid">
        <NavLink className="navbar-brand fw-bold" to="/">⚡ Energy Manager</NavLink>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            <li className="nav-item"><NavLink to="/" className="nav-link">🏠 Home</NavLink></li>
            <li className="nav-item"><NavLink to="/energytypes" className="nav-link">🌿 Energy Types</NavLink></li>
            <li className="nav-item"><NavLink to="/regions" className="nav-link">🗺️ Regions</NavLink></li>
            <li className="nav-item"><NavLink to="/plants" className="nav-link">⚙️ Power Plants</NavLink></li>
            <li className="nav-item"><NavLink to="/employees" className="nav-link">👩‍🔧 Employees</NavLink></li>
            <li className="nav-item"><NavLink to="/production" className="nav-link">📈 Production Logs</NavLink></li>
            <li className="nav-item"><NavLink to="/distribution" className="nav-link">🔄 Distribution</NavLink></li>
            <li className="nav-item"><NavLink to="/reports" className="nav-link">📊 Reports</NavLink></li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
