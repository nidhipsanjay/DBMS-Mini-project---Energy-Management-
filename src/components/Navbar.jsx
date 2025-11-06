import React from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Leaf,
  Map,
  Settings,
  Users,
  BarChart3,
  RefreshCcw,
  LogOut,
  Factory,
  Zap,
} from "lucide-react";

export default function Navbar() {
  const role = localStorage.getItem("role");
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? storedUser.replace(/['"]+/g, "") : "User";

  const logout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-dark bg-dark fixed-top shadow-sm"
      style={{
        height: "60px",
        padding: "0 1rem",
      }}
    >
      <div className="container-fluid">
        <NavLink
          className="navbar-brand fw-bold d-flex align-items-center"
          to="/"
          style={{ fontSize: "1.25rem" }}
        >
          <Zap size={22} className="me-2 text-warning" />
          Energy Manager
        </NavLink>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse justify-content-end"
          id="navbarNav"
        >
          <ul className="navbar-nav align-items-center">
            <li className="nav-item">
              <NavLink to="/" className="nav-link d-flex align-items-center">
                <Home size={18} className="me-2" /> Home
              </NavLink>
            </li>

            {role === "Manager" && (
              <>
                <li className="nav-item">
                  <NavLink
                    to="/energytypes"
                    className="nav-link d-flex align-items-center"
                  >
                    <Leaf size={18} className="me-2" /> Energy Types
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/regions"
                    className="nav-link d-flex align-items-center"
                  >
                    <Map size={18} className="me-2" /> Regions
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/plants"
                    className="nav-link d-flex align-items-center"
                  >
                    <Factory size={18} className="me-2" /> Power Plants
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/employees"
                    className="nav-link d-flex align-items-center"
                  >
                    <Users size={18} className="me-2" /> Employees
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/production"
                    className="nav-link d-flex align-items-center"
                  >
                    <BarChart3 size={18} className="me-2" /> Production Logs
                  </NavLink>
                </li>
                <li className="nav-item">
                  <NavLink
                    to="/distribution"
                    className="nav-link d-flex align-items-center"
                  >
                    <RefreshCcw size={18} className="me-2" /> Distribution
                  </NavLink>
                </li>
              </>
            )}

            <li className="nav-item">
              <NavLink
                to="/reports"
                className="nav-link d-flex align-items-center"
              >
                <BarChart3 size={18} className="me-2" /> Reports
              </NavLink>
            </li>

            <li
              className="nav-item d-flex align-items-center ms-3"
              style={{ color: "#ccc", fontSize: "0.9rem" }}
            >
              <span className="me-2">👋 {user}</span>
              <button
                className="btn btn-sm btn-outline-danger d-flex align-items-center"
                onClick={logout}
                style={{
                  padding: "4px 10px",
                  fontSize: "0.8rem",
                  borderRadius: "6px",
                }}
              >
                <LogOut size={16} className="me-1" /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
