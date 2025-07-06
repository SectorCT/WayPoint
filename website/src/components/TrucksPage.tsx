import React, { useEffect, useState } from 'react';
import { fetchAvailableTrucks } from '../utils/api';

const TrucksPage: React.FC = () => {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Not authenticated');
        const data = await fetchAvailableTrucks(token);
        setTrucks(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch trucks');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Placeholder for truck creation
  const handleAddTruck = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Truck creation not implemented (backend required)');
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: 32 }}>
      <h2>Trucks</h2>
      <form onSubmit={handleAddTruck} style={{ marginBottom: 32 }}>
        <h4>Add New Truck</h4>
        <input placeholder="License Plate" style={{ marginRight: 8, padding: 8 }} />
        <input placeholder="Capacity (kg)" style={{ marginRight: 8, padding: 8 }} />
        <button type="submit">Add Truck</button>
      </form>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <ul>
          {trucks.map((t, idx) => (
            <li key={idx}>{t.licensePlate} - {t.kilogramCapacity}kg - {t.isUsed ? 'In Use' : 'Available'}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TrucksPage; 