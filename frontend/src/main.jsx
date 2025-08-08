import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import Login from './pages/Login';      // baru
import Admin from './pages/Admin';
import Stats from './pages/StatsPage';
import Lucky from './pages/LuckyNumberPage';
import Schedule from './pages/SchedulePage';
import LiveDraw from './pages/LiveDrawPage';

const requireAuth = (Component) => {
  const token = localStorage.getItem('token');
  return token ? <Component /> : <Navigate to="/login" replace />;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
<Route path="/stats" element={<Stats />} />
<Route path="/lucky" element={<Lucky />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/livedraw" element={<LiveDraw />} />

        {/* Protected Admin */}
        <Route path="/admin" element={requireAuth(Admin)} />

        {/* Fallback ke Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
