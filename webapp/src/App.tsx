import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import ProtectedRoute from '@/components/ProtectedRoute';
import SessionManager from '@/components/SessionManager';

// Pages
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Journeys from '@/pages/Journeys';
import Packages from '@/pages/Packages';
import Trucks from '@/pages/Trucks';
import VerifyUsers from '@/pages/VerifyUsers';
import Statistics from '@/pages/Statistics';
import NotFound from '@/pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <SessionManager />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/journeys"
          element={
            <ProtectedRoute>
              <Journeys />
            </ProtectedRoute>
          }
        />
        <Route
          path="/packages"
          element={
            <ProtectedRoute>
              <Packages />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trucks"
          element={
            <ProtectedRoute>
              <Trucks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/verifyusers"
          element={
            <ProtectedRoute>
              <VerifyUsers />
            </ProtectedRoute>
          }
        />
        <Route
          path="/statistics"
          element={
            <ProtectedRoute>
              <Statistics />
            </ProtectedRoute>
          }
        />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;

