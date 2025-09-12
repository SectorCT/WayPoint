import React, { ReactElement, useEffect, useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import JourneysPage from './components/JourneysPage';
import PackagesPage from './components/PackagesPage';
import TrucksPage from './components/TrucksPage';
import VerifyUsers from './components/VerifyUsers';
import VerifyUsersPage from './components/VerifyUsersPage';
import StatisticsPage from './components/StatisticsPage';

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

function AppRoutes() {
  const [sessionExpired, setSessionExpired] = useState(false);
  const location = useLocation();

  // Session timeout logic
  useEffect(() => {
    const checkSession = () => {
      const loginTime = localStorage.getItem('loginTime');
      const user = localStorage.getItem('user');
      if (!user || !loginTime) {
        setSessionExpired(true);
        return;
      }
      const now = Date.now();
      const elapsed = now - parseInt(loginTime, 10);
      if (elapsed > 30 * 60 * 1000) { // 30 minutes
        localStorage.removeItem('user');
        localStorage.removeItem('access');
        localStorage.removeItem('loginTime');
        setSessionExpired(true);
      }
    };
    checkSession();
    const interval = setInterval(checkSession, 60 * 1000); // check every minute
    return () => clearInterval(interval);
  }, []);

  // Reset sessionExpired if user logs in and session is valid
  useEffect(() => {
    const loginTime = localStorage.getItem('loginTime');
    const user = localStorage.getItem('user');
    const now = Date.now();
    if (user && loginTime && (now - parseInt(loginTime, 10) <= 30 * 60 * 1000)) {
      setSessionExpired(false);
    }
  }, [location.pathname]);

  // Blur and modal overlay if session expired or not logged in
  return (
    <>
      {sessionExpired && location.pathname !== '/login' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          zIndex: 2000,
          background: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
            padding: '40px 32px',
            minWidth: 320,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 18,
          }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: '#F05033', marginBottom: 8 }}>You are not logged in</div>
            <div style={{ color: '#888', fontSize: 16, marginBottom: 12 }}>Your session has expired or you are not logged in. Please log in to continue.</div>
            <button
              style={{
                background: 'linear-gradient(90deg, #F39358 0%, #F05033 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: 10,
                padding: '12px 32px',
                fontSize: 18,
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
              }}
              onClick={() => { window.location.href = '/login'; }}
            >Login</button>
          </div>
        </div>
      )}
      <div style={sessionExpired && location.pathname !== '/login' ? { filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none' } : {}}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/journeys" element={<ProtectedRoute><JourneysPage /></ProtectedRoute>} />
          <Route path="/packages" element={<ProtectedRoute><PackagesPage /></ProtectedRoute>} />
          <Route path="/trucks" element={<ProtectedRoute><TrucksPage /></ProtectedRoute>} />
          <Route path="/verifyusers" element={<ProtectedRoute><VerifyUsersPage /></ProtectedRoute>} />
          <Route path="/statistics" element={<ProtectedRoute><StatisticsPage /></ProtectedRoute>} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </>
  );
}

function App() {
  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App;
