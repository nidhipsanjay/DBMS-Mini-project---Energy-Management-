import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/home';
import Plants from './components/plants';
import Regions from './components/regions';
import EnergyTypes from './components/EnergyType';
import Employees from './components/employees';
import Production from './components/Production';
import Distribution from './components/Distribution';
import Reports from './components/reports';
import './App.css';

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-5 pt-4">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/energytypes" element={<EnergyTypes />} />
          <Route path="/regions" element={<Regions />} />
          <Route path="/plants" element={<Plants />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/production" element={<Production />} />
          <Route path="/distribution" element={<Distribution />} />
          <Route path="/reports" element={<Reports />} />
        </Routes>
      </div>
    </Router>
  );
}
