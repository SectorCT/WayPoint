import React, { useEffect, useState } from 'react';
import { fetchPackages } from '../utils/api';

const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Not authenticated');
        const data = await fetchPackages(token);
        setPackages(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch packages');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Placeholder for package creation
  const handleAddPackage = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Package creation not implemented (backend required)');
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: 32 }}>
      <h2>Packages</h2>
      <form onSubmit={handleAddPackage} style={{ marginBottom: 32 }}>
        <h4>Add New Package</h4>
        <input placeholder="Address" style={{ marginRight: 8, padding: 8 }} />
        <input placeholder="Recipient" style={{ marginRight: 8, padding: 8 }} />
        <button type="submit">Add Package</button>
      </form>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <ul>
          {packages.map((p, idx) => (
            <li key={idx}>{p.packageID} - {p.address} - {p.status}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PackagesPage; 