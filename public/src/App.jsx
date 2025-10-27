import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/home';
import Plants from './components/plants';
import Regions from './components/regions';
import Employees from './components/employees';
import Reports from './components/reports';

export default function App(){
  return (
    <Router>
      <div className="app-root">
        <Navbar />
        <main className="container-fluid mt-4">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/plants" element={<Plants/>} />
            <Route path="/regions" element={<Regions/>} />
            <Route path="/employees" element={<Employees/>} />
            <Route path="/reports" element={<Reports/>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}