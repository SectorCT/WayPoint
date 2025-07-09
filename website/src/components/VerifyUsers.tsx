import React, { useEffect, useState } from 'react';
import { fetchUnverifiedTruckers, verifyTrucker } from '../utils/api';

const VerifyUsers: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState<string | null>(null);

  const token = localStorage.getItem('access') || '';

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchUnverifiedTruckers(token);
      setUsers(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line
  }, []);

  const handleAccept = async (username: string) => {
    setAccepting(username);
    try {
      await verifyTrucker(token, username);
      setUsers(users => users.filter(u => u.username !== username));
    } catch (e: any) {
      alert(e.message || 'Failed to accept user');
    } finally {
      setAccepting(null);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
      <h2 style={{ marginBottom: 24 }}>Verify Users</h2>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : users.length === 0 ? (
        <div>No new users to verify.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {users.map(user => (
            <li key={user.username} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #eee' }}>
              <span>
                <strong>{user.username}</strong> &lt;{user.email}&gt;
              </span>
              <button
                onClick={() => handleAccept(user.username)}
                disabled={accepting === user.username}
                style={{
                  background: 'linear-gradient(90deg, #F39358 0%, #F05033 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '8px 18px',
                  fontWeight: 600,
                  cursor: accepting === user.username ? 'not-allowed' : 'pointer',
                  opacity: accepting === user.username ? 0.7 : 1,
                }}
              >
                {accepting === user.username ? 'Accepting...' : 'Accept'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default VerifyUsers; 