import React, { useEffect, useState } from 'react';
import { fetchDeliveryHistory } from '../utils/api';

const JourneysPage: React.FC = () => {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJourneys = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Not authenticated');
        const data = await fetchDeliveryHistory(token, 30);
        setJourneys(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch journeys');
      } finally {
        setLoading(false);
      }
    };
    fetchJourneys();
  }, []);

  // Placeholder for journey creation
  const handleAddJourney = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Journey creation not implemented (backend required)');
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', background: '#fff', borderRadius: 10, boxShadow: '0 4px 16px rgba(0,0,0,0.10)', padding: 32 }}>
      <h2>Journeys</h2>
      <form onSubmit={handleAddJourney} style={{ marginBottom: 32 }}>
        <h4>Add New Journey</h4>
        <input placeholder="Driver Username" style={{ marginRight: 8, padding: 8 }} />
        <button type="submit">Add Journey</button>
      </form>
      {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
        <ul>
          {journeys.map((j, idx) => (
            <li key={idx}>{j.date} - {j.status} - {j.numTrucks} trucks</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default JourneysPage; 