import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/home';
import Plants from './components/plants';
import Regions from './components/regions';
import EnergyTypes from './components/EnergyType';
import Employees from './components/employees';
import Production from './components/Production';
import Distribution from './components/Distribution';
import Reports from './components/reports';
import Login from './components/Login';
import './App.css';

export default function App() {
  const isAuthenticated = localStorage.getItem("auth") === "true";

  return (
    <Router>
      {isAuthenticated && <Navbar />}
      <div className="container mt-5 pt-4">
        <Routes>
          <Route path="/login" element={<Login />} />
          {isAuthenticated ? (
            <>
              <Route path="/" element={<Home />} />
              <Route path="/energytypes" element={<EnergyTypes />} />
              <Route path="/regions" element={<Regions />} />
              <Route path="/plants" element={<Plants />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/production" element={<Production />} />
              <Route path="/distribution" element={<Distribution />} />
              <Route path="/reports" element={<Reports />} />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" />} />
          )}
        </Routes>
      </div>
    </Router>
  );
}
