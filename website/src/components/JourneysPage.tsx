import React, { useEffect, useState } from 'react';
import { fetchDeliveryHistory } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { quickActions } from './Dashboard';

const JourneysPage: React.FC = () => {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
    <div className={styles.fullScreenTwoCol}>
      <div className={styles.topRightScreenButton}>
        <button onClick={() => navigate('/dashboard')} className={styles.logoutButton}>
          ← Back to Dashboard
        </button>
      </div>
      <div className={styles.quickActionsCorner}>
        {quickActions.map((action) => {
          const Icon = action.Icon as unknown as React.FC<any>;
          let onClick;
          switch (action.label) {
            case 'Dashboard':
              onClick = () => navigate('/dashboard');
              break;
            case 'Journeys':
              onClick = () => navigate('/journeys');
              break;
            case 'Packages':
              onClick = () => navigate('/packages');
              break;
            case 'Trucks':
              onClick = () => navigate('/trucks');
              break;
            default:
              onClick = () => {};
          }
          return (
            <button className={styles.quickActionButton} key={action.label} onClick={onClick}>
              <Icon />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.columnsWrapper}>
        <div className={styles.leftCol}>
          <div className={styles.formCard}>
            <h2>Journeys</h2>
            <form className={styles.addForm}>
              <input placeholder="Driver Username" className={styles.input} />
              {/* Future: add truck and package assignment UI here */}
              <button type="button" className={styles.gradientButton}>Add Journey</button>
            </form>
          </div>
        </div>
        <div className={styles.rightCol}>
          <div className={styles.listCard}>
            <h3>All Journeys</h3>
            {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
              <ul className={styles.list}>
                {journeys.map((j, idx) => (
                  <li key={idx} className={styles.listItem}>
                    <b>{j.date}</b> — {j.status} — {j.numTrucks} trucks
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneysPage; 