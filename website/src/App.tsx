import React, { ReactElement } from 'react';
import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JourneysPage from './components/JourneysPage';
import PackagesPage from './components/PackagesPage';
import TrucksPage from './components/TrucksPage';

function ProtectedRoute({ children }: { children: ReactElement }): React.JSX.Element | null {
  const user = localStorage.getItem('user');
  if (!user) {
    console.warn('[ProtectedRoute] No user found, redirecting to login');
    return <Navigate to="/login" />;
  }
  try {
    const parsed = JSON.parse(user);
    if (!parsed.isManager) {
      console.warn('[ProtectedRoute] User is not a manager, redirecting to login');
      return <Navigate to="/login" />;
    }
    return children;
  } catch (e) {
    console.error('[ProtectedRoute] Error parsing user:', e);
    return <Navigate to="/login" />;
  }
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/journeys" element={<JourneysPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/trucks" element={<TrucksPage />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
