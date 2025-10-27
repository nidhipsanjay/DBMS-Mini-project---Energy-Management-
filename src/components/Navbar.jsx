import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar(){
  const loc = useLocation();
  const active = (path)=> loc.pathname === path ? 'active' : '';
  return (
    <nav className="navbar navbar-expand-lg navbar-custom px-4 py-3">
      <div className="container-fluid">
        <Link className="navbar-brand text-white d-flex align-items-center gap-2" to="/">
          <i className="fa-solid fa-bolt"></i>
          <span style={{fontWeight:700}}>Energy Management</span>
        </Link>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navmenu">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navmenu">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className={`nav-link ${active('/')} text-white`} to="/">Home</Link></li>
            <li className="nav-item"><Link className={`nav-link ${active('/plants')} text-white`} to="/plants">🌿 Plants</Link></li>
            <li className="nav-item"><Link className={`nav-link ${active('/regions')} text-white`} to="/regions">🗺️ Regions</Link></li>
            <li className="nav-item"><Link className={`nav-link ${active('/employees')} text-white`} to="/employees">👩‍🔧 Employees</Link></li>
            <li className="nav-item"><Link className={`nav-link ${active('/reports')} text-white`} to="/reports">📊 Reports</Link></li>
          </ul>
        </div>
      </div>
    </nav>
  )
}