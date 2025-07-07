import React, { useEffect, useState } from 'react';
import { fetchDeliveryHistory } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { quickActions } from './Dashboard';
// @ts-ignore
import { Map, Marker, Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, LineString } from 'geojson';

// RouteSummaryBar component
const RouteSummaryBar: React.FC<{ journeys: any[] }> = ({ journeys }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 24,
      padding: '16px 24px',
      background: '#f7f7f7',
      borderBottom: '1px solid #e0e0e0',
      overflowX: 'auto',
    }}>
      {journeys.map((j, idx) => {
        const progress = j.numTrucks && j.numTrucks > 0 ? (j.deliveredTrucks || 0) / j.numTrucks : 0;
        return (
          <div key={idx} style={{
            minWidth: 220,
            background: '#fff',
            borderRadius: 12,
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 8,
          }}>
            <b>Driver:</b> {j.driver || 'N/A'}<br/>
            <b>Status:</b> {j.status}<br/>
            <div style={{ width: '100%', height: 8, background: '#eee', borderRadius: 4, margin: '8px 0' }}>
              <div style={{ width: `${progress * 100}%`, height: '100%', background: '#4caf50', borderRadius: 4 }} />
            </div>
            <span style={{ fontSize: 12, color: '#888' }}>{Math.round(progress * 100)}% complete</span>
          </div>
        );
      })}
    </div>
  );
};

const examplePath1: Feature<LineString> = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      [23.3219, 42.6977], // Sofia center
      [23.35, 42.70],     // East
      [23.37, 42.68],     // Southeast
    ],
  },
  properties: {},
};
const examplePath2: Feature<LineString> = {
  type: 'Feature',
  geometry: {
    type: 'LineString',
    coordinates: [
      [23.3219, 42.6977], // Sofia center
      [23.30, 42.71],     // Northwest
      [23.28, 42.69],     // West
    ],
  },
  properties: {},
};

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
      <RouteSummaryBar journeys={journeys} />
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
        {/* Left column: journey input form */}
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
        {/* Map on the right, now a large square */}
        <div className={styles.rightCol}>
          <div style={{ height: '80vh', width: '80vh', maxWidth: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', margin: '0 auto' }}>
            <Map
              initialViewState={{
                latitude: 42.6977,
                longitude: 23.3219,
                zoom: 12,
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
            >
              {/* Marker at Sofia center */}
              <Marker longitude={23.3219} latitude={42.6977} color="#d32f2f" />
              {/* Path 1: Red */}
              <Source id="path1" type="geojson" data={examplePath1}>
                <Layer
                  id="line1"
                  type="line"
                  paint={{ 'line-color': '#d32f2f', 'line-width': 4 }}
                />
              </Source>
              {/* Path 2: Blue */}
              <Source id="path2" type="geojson" data={examplePath2}>
                <Layer
                  id="line2"
                  type="line"
                  paint={{ 'line-color': '#1976d2', 'line-width': 4, 'line-dasharray': [2,2] }}
                />
              </Source>
            </Map>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JourneysPage; 