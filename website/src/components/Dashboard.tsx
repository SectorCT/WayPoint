import React, { useEffect, useState } from 'react';
import { fetchPackages } from '../utils/api';

interface Package {
  packageID: string;
  address: string;
  latitude: number;
  longitude: number;
  recipient: string;
  status: string;
}

const Dashboard: React.FC = () => {
  const [packages, setPackages] = useState<Package[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access');
    if (!token) {
      setError('Not authenticated');
      console.warn('[Dashboard] No access token found');
      setLoading(false);
      return;
    }
    fetchPackages(token)
      .then(data => {
        setPackages(data);
        setError('');
        console.log('[Dashboard] Packages loaded:', data);
      })
      .catch(err => {
        setError(err.message || 'Failed to fetch packages');
        console.error('[Dashboard] Fetch packages error:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 8px #ccc', minWidth: 600, minHeight: 400 }}>
      <h2>Manager Dashboard</h2>
      <div style={{ margin: '24px 0', height: 300, background: '#e3e3e3', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Map Placeholder
      </div>
      <div>
        <h3>Deliveries</h3>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <ul>
          {packages.map(pkg => (
            <li key={pkg.packageID}>
              <b>{pkg.address}</b> ({pkg.latitude}, {pkg.longitude}) - {pkg.recipient} [{pkg.status}]
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Dashboard; 