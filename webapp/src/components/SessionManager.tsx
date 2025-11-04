import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isSessionValid, logout } from '@/lib/auth';

const SessionManager = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      if (!isSessionValid()) {
        setShowModal(true);
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 3000);
      }
    };

    // Check every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [navigate]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card p-6 rounded-lg shadow-medium max-w-md">
        <h2 className="text-xl font-bold mb-4">Session Expired</h2>
        <p className="text-muted-foreground">
          Your session has expired due to inactivity. You will be redirected to the login page.
        </p>
      </div>
    </div>
  );
};

export default SessionManager;

