import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { quickActions } from './Dashboard';
import { fetchDrivers, verifyUser } from '../utils/api';

const AcceptButton: React.FC<{ onClick: () => void; loading?: boolean }> = ({ onClick, loading }) => (
  <button
    onClick={onClick}
    disabled={loading}
    style={{
      background: 'linear-gradient(90deg, #F39358 0%, #F05033 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: 10,
      padding: '10px 24px',
      fontSize: 16,
      fontWeight: 600,
      cursor: loading ? 'not-allowed' : 'pointer',
      boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
      transition: 'opacity 0.2s',
      opacity: loading ? 0.6 : 1,
    }}
  >{loading ? 'Accepting...' : 'Accept'}</button>
);

const VerifyUsersPage: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUnverified = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Not authenticated');
        const allDrivers = await fetchDrivers(token);
        const unverified = allDrivers.filter((u: any) => u.verified === false && u.isManager === false);
        setUsers(unverified);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };
    fetchUnverified();
  }, []);

  const handleAccept = async (idOrUsername: string | number) => {
    const user = users.find(u => u.id === idOrUsername || u.username === idOrUsername);
    if (!user) return;
    setAccepting(user.username);
    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('Not authenticated');
      await verifyUser(token, user.username);
      setUsers(prev => prev.filter(u => u.username !== user.username));
    } catch (e: any) {
      alert(e.message || 'Failed to verify user');
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div className={styles.fullScreenTwoCol}>
      <div style={{
        width: '100%',
        maxWidth: '900px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        <h2 style={{ margin: '32px 0 24px 0', fontWeight: 700, color: '#F05033' }}>Verify New Users</h2>
        <div style={{ background: '#fff', borderRadius: 14, boxShadow: '0 2px 8px rgba(240,80,51,0.10)', padding: 32 }}>
          {loading ? (
            <div style={{ color: '#888', fontSize: 18 }}>Loading...</div>
          ) : error ? (
            <div style={{ color: 'red', fontSize: 18 }}>{error}</div>
          ) : users.length === 0 ? (
            <div style={{ color: '#888', fontSize: 18 }}>No new users to verify.</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {users.map(user => (
                <li key={user.id || user.username} style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '18px 0',
                  borderBottom: '1px solid #F8D5B0',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 17 }}>{user.username}</div>
                    <div style={{ color: '#888', fontSize: 14 }}>{user.email}</div>
                  </div>
                  <AcceptButton onClick={() => handleAccept(user.id || user.username)} loading={accepting === user.username} />
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className={styles.topRightScreenButton}>
          <button onClick={() => navigate('/dashboard')} className={styles.logoutButton}>
            ← Back to Dashboard
          </button>
        </div>
        <div className={styles.quickActionsCorner}>
          {quickActions.map((action) => {
            const Icon = action.Icon as unknown as React.FC<any>;
            return (
              <button className={styles.quickActionButton} key={action.label} onClick={() => navigate(action.path)}>
                <Icon />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VerifyUsersPage; 