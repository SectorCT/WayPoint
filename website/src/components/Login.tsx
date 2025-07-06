import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/api';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      console.log('[Login] Attempting login for', email);
      const data = await login(email, password);
      if (!data.user.isManager) {
        setError('Access denied: Only managers can log in.');
        console.warn('[Login] Not a manager:', data.user);
        setLoading(false);
        return;
      }
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('user', JSON.stringify(data.user));
      console.log('[Login] Login successful, redirecting to dashboard');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
      console.error('[Login] Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px #ccc', minWidth: 320 }}>
      <h2>Manager Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 16 }}>{error}</div>}
        <button type="submit" style={{ width: '100%', padding: 10, borderRadius: 4, background: '#282c34', color: '#fff', border: 'none' }} disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
};

export default Login; 