import React, { useEffect, useState } from 'react';
import { fetchAvailableTrucks, createTruck } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { quickActions } from './Dashboard';

const TrucksPage: React.FC = () => {
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [capacity, setCapacity] = useState('');
  const navigate = useNavigate();

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

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddTruck = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!licensePlate.trim() || !capacity.trim()) {
      setAddError('Please enter both license plate and capacity.');
      return;
    }
    setAddLoading(true);
    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('Not authenticated');
      await createTruck(token, licensePlate.trim(), parseInt(capacity, 10));
      setLicensePlate('');
      setCapacity('');
      await fetchAll();
    } catch (e: any) {
      setAddError(e.message || 'Failed to add truck');
    } finally {
      setAddLoading(false);
    }
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
          return (
            <button className={styles.quickActionButton} key={action.label} onClick={() => navigate(action.path)}>
              <Icon />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>
      <div className={styles.columnsWrapper}>
        <div className={styles.leftCol}>
          <div className={styles.formCard}>
            <h2>Trucks</h2>
            <form className={styles.addForm} onSubmit={handleAddTruck}>
              <input
                placeholder="License Plate"
                className={styles.input}
                value={licensePlate}
                onChange={e => setLicensePlate(e.target.value)}
                disabled={addLoading}
              />
              <input
                placeholder="Max Capacity (kg)"
                className={styles.input}
                value={capacity}
                onChange={e => setCapacity(e.target.value)}
                type="number"
                min={0}
                disabled={addLoading}
              />
              {addError && <div style={{ color: 'red', fontSize: 14 }}>{addError}</div>}
              <button type="submit" className={styles.gradientButton} disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add Truck'}
              </button>
            </form>
          </div>
        </div>
        <div className={styles.rightCol}>
          <div className={styles.listCard}>
            <h3>Available Trucks</h3>
            {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
              <ul className={styles.list}>
                {trucks.map((t, idx) => (
                  <li key={idx} className={styles.listItem}>
                    <b>{t.licensePlate}</b> — {t.kilogramCapacity}kg — <span style={{ color: t.isUsed ? '#F39358' : '#4CAF50' }}>{t.isUsed ? 'In Use' : 'Available'}</span>
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

export default TrucksPage; 