import React, { useEffect, useState } from 'react';
import { fetchDeliveryHistory, fetchDrivers, fetchAvailableTrucks, fetchPackages } from '../utils/api';
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

// ActiveRoutesBar component
const ActiveRoutesBar: React.FC<{ journeys: any[] }> = ({ journeys }) => {
  console.log('ActiveRoutesBar journeys:', journeys);
  // Filter for active routes (not completed/cancelled)
  const activeRoutes = journeys.filter(j => {
    const status = (j.status || '').toLowerCase();
    return status !== 'completed' && status !== 'cancelled' && status !== 'finished' && status !== 'done';
  });
  if (activeRoutes.length === 0) {
    return (
      <div style={{
        width: '100%',
        marginBottom: 16,
        display: 'flex',
        justifyContent: 'center',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '6px 18px',
          background: 'linear-gradient(90deg, #ff7e5f 0%, #feb47b 100%)',
          borderRadius: 24,
          boxShadow: '0 2px 8px rgba(255,126,95,0.08)',
          fontWeight: 500,
          fontSize: 15,
          color: '#fff',
          minHeight: 36,
        }}>
          <span style={{ fontSize: 20, marginRight: 6 }}>🛣️</span>
          <span style={{ fontWeight: 600 }}>No active routes at the moment!</span>
        </div>
      </div>
    );
  }
  return (
    <div style={{
      width: '100%',
      marginBottom: 24,
        display: 'flex',
        flexDirection: 'row',
      gap: 18,
      overflowX: 'auto',
      padding: '8px 0',
    }}>
        {activeRoutes.map((j, idx) => {
        const delivered = j.deliveredTrucks || 0;
        const undelivered = j.undeliveredTrucks || 0;
        const pending = j.pendingTrucks || 0;
        const total = (j.numTrucks || 0);
        const progress = total > 0 ? delivered / total : 0;
          return (
            <div key={idx} style={{
            minWidth: 240,
              background: '#fff',
            borderRadius: 14,
            boxShadow: '0 2px 8px rgba(240,80,51,0.10)',
            padding: 20,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
            border: '2px solid #F39358',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 22, color: '#F39358' }}>🚚</span>
              <span style={{ fontWeight: 700, fontSize: 18 }}>{j.driver || 'N/A'}</span>
            </div>
            <div style={{ fontSize: 15, color: '#F05033', fontWeight: 600 }}>
              {`Active route: ${delivered} delivered, ${undelivered} undelivered${pending > 0 ? `, ${pending} pending` : ''}`}
              </div>
            <div style={{ width: '100%', height: 10, background: '#eee', borderRadius: 5, margin: '8px 0' }}>
              <div style={{ width: `${progress * 100}%`, height: '100%', background: 'linear-gradient(90deg, #F39358 0%, #F05033 100%)', borderRadius: 5 }} />
            </div>
            <span style={{ fontSize: 13, color: '#888' }}>{Math.round(progress * 100)}% complete</span>
            </div>
          );
        })}
    </div>
  );
};

const DriverCard: React.FC<{ driver: any, token: string }> = ({ driver, token }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [status, setStatus] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setLoading(true);
    fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8000'}/delivery/route/checkDriverStatus/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ username: driver.username }),
    })
      .then(res => res.json())
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [driver.username, token]);

  let statusMsg = 'Unknown';
  let statusColor = '#888';
  let canAssign = false;
  if (status) {
    switch (status.status) {
      case 'active':
        statusMsg = 'Active route';
        statusColor = '#1976d2';
        break;
      case 'completed':
      case 'completed_today':
        statusMsg = 'Completed today';
        statusColor = '#4CAF50';
        break;
      case 'available':
        statusMsg = 'Available for assignment';
        statusColor = '#ff7e5f';
        canAssign = true;
        break;
      default:
        statusMsg = status.status;
    }
  }

  return (
    <div style={{
      border: '1px solid #eee',
      borderRadius: 16,
      marginBottom: 12,
      boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      background: '#fff',
      overflow: 'hidden',
      opacity: canAssign ? 1 : 0.6,
      transition: 'opacity 0.2s',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', padding: 16, cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <span style={{ fontWeight: 600, fontSize: 18, marginRight: 16 }}>{driver.username}</span>
        <span style={{ color: statusColor, fontWeight: 500, marginRight: 16 }}>{loading ? 'Checking...' : statusMsg}</span>
        <span style={{ marginLeft: 'auto', color: '#aaa', fontSize: 20 }}>{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div style={{ padding: '0 16px 16px 32px', color: '#444', fontSize: 15 }}>
          <div><b>Email:</b> {driver.email || 'N/A'}</div>
          <div><b>Phone:</b> {driver.phoneNumber || 'N/A'}</div>
          <div><b>Full Name:</b> {driver.firstName || ''} {driver.lastName || ''}</div>
        </div>
      )}
    </div>
  );
};

const JourneysPage: React.FC = () => {
  const [journeys, setJourneys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState<any[]>([]);
  const [driversLoading, setDriversLoading] = useState(false);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'start' | 'drivers'>('start');
  const [searchQuery, setSearchQuery] = useState('');
  const [availableTrucks, setAvailableTrucks] = useState<number>(0);
  const [todayPackages, setTodayPackages] = useState<number>(0);

  useEffect(() => {
    const fetchJourneys = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Not authenticated');
        const data = await fetchDeliveryHistory(token, 30);
        setJourneys(data);
        console.log('Fetched journeys:', data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch journeys');
      } finally {
        setLoading(false);
      }
    };
    fetchJourneys();
  }, []);

  useEffect(() => {
    const fetchDriversList = async () => {
      setDriversLoading(true);
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Not authenticated');
        const data = await fetchDrivers(token);
        setDrivers(data);
      } catch (e: any) {
        // Optionally handle error
      } finally {
        setDriversLoading(false);
      }
    };
    fetchDriversList();
  }, []);

  useEffect(() => {
    // Fetch available trucks and today's packages
    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) return;
        const trucks = await fetchAvailableTrucks(token);
        setAvailableTrucks(trucks.length);
        const packages = await fetchPackages(token);
        setTodayPackages(packages.length);
      } catch (e) {
        // Optionally handle error
      }
    };
    fetchCounts();
  }, []);

  // Start Journey logic
  const handleStartJourney = () => {
    if (selectedDrivers.size === 0) return;
    alert(`Start journey for drivers: ${Array.from(selectedDrivers).join(', ')}`);
    // TODO: Implement backend call
  };

  return (
    <div className={styles.fullScreenTwoCol}>
      <div style={{
        width: '100%',
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        {/* Top row: Active Routes */}
        <ActiveRoutesBar journeys={journeys} />
        {/* Main content: two columns */}
        <div className={styles.columnsWrapper} style={{ width: '100%', marginTop: 0 }}>
          {/* Left column: Tabs, driver selection, start journey */}
          <div className={styles.leftCol}>
            <div style={{ width: '100%', maxWidth: 400, marginTop: 0, paddingTop: 0 }}>
              {/* Counter row */}
              <div style={{ display: 'flex', flexDirection: 'row', gap: 18, marginBottom: 18, marginTop: 8 }}>
                <div style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: 16,
                  color: '#F05033',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 90,
                  justifyContent: 'center',
                }}>
                  🚚 {availableTrucks} Trucks
                </div>
                <div style={{
                  background: '#fff',
                  borderRadius: 12,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  padding: '10px 18px',
                  fontWeight: 600,
                  fontSize: 16,
                  color: '#F39358',
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 90,
                  justifyContent: 'center',
                }}>
                  📦 {todayPackages} Packages
                </div>
              </div>
              <div className={styles.tabs}>
                <button
                  className={activeTab === 'start' ? styles.activeTab : styles.tab}
                  onClick={() => setActiveTab('start')}
                >Start Journey</button>
                <button
                  className={activeTab === 'drivers' ? styles.activeTab : styles.tab}
                  onClick={() => setActiveTab('drivers')}
                >Drivers</button>
              </div>
              <div className={styles.tabContent}>
                {activeTab === 'start' && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 18, width: '100%' }}>
                    <h2 style={{ margin: '12px 0 0 0', textAlign: 'left' }}>Choose Driver</h2>
                    <input
                      type="text"
                      placeholder="Search drivers..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #F8D5B0',
                        fontSize: '1rem',
                        marginBottom: 2,
                        marginTop: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, width: '100%' }}>
                      {driversLoading ? <div>Loading drivers...</div> : (
                        drivers
                          .filter(driver =>
                            driver.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (driver.email && driver.email.toLowerCase().includes(searchQuery.toLowerCase()))
                          )
                          .map(driver => {
                            const isSelected = selectedDrivers.has(driver.username);
                            return (
                              <div
                                key={driver.username}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  border: isSelected ? '2px solid #F05033' : '1px solid #eee',
                                  borderRadius: 16,
                                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                                  background: '#fff',
                                  padding: '14px 20px',
                                  cursor: 'pointer',
                                  transition: 'border 0.2s',
                                  fontWeight: isSelected ? 600 : 500,
                                  color: isSelected ? '#F05033' : '#222',
                                  width: '100%',
                                }}
                              >
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left' }}>
                                  <span style={{ fontSize: 17 }}>{driver.username}</span>
                                  {driver.email && <span style={{ fontSize: 13, color: '#888' }}>{driver.email}</span>}
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedDrivers(prev => {
                                      const newSet = new Set(prev);
                                      if (newSet.has(driver.username)) {
                                        newSet.delete(driver.username);
                                      } else {
                                        newSet.add(driver.username);
                                      }
                                      return newSet;
                                    });
                                  }}
                                  style={{
                                    background: isSelected ? 'linear-gradient(90deg, #F39358 0%, #F05033 100%)' : '#f5f6fa',
                                    color: isSelected ? '#fff' : '#F05033',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22,
                                    fontWeight: 700,
                                    boxShadow: isSelected ? '0 2px 8px rgba(240,80,51,0.13)' : 'none',
                                    cursor: 'pointer',
                                    transition: 'background 0.2s, color 0.2s',
                                    outline: 'none',
                                  }}
                                  aria-label={isSelected ? 'Deselect driver' : 'Select driver'}
                                >
                                  {isSelected ? '✓' : '+'}
          </button>
        </div>
                            );
                          })
                      )}
                    </div>
                    <button
                      className={styles.gradientButton}
                      style={{ width: '100%', marginTop: 8, opacity: selectedDrivers.size > 0 ? 1 : 0.5, cursor: selectedDrivers.size > 0 ? 'pointer' : 'not-allowed' }}
                      onClick={handleStartJourney}
                      disabled={selectedDrivers.size === 0}
                    >Start Journey</button>
                  </div>
                )}
                {activeTab === 'drivers' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                    <h2 style={{ margin: '12px 0 0 0' }}>Drivers</h2>
                    <input
                      type="text"
                      placeholder="Search drivers..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: 8,
                        border: '1px solid #F8D5B0',
                        fontSize: '1rem',
                        marginBottom: 2,
                        marginTop: 0,
                      }}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {driversLoading ? <div>Loading drivers...</div> : (
                        drivers
                          .filter(driver =>
                            driver.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (driver.email && driver.email.toLowerCase().includes(searchQuery.toLowerCase()))
                          )
                          .map(driver => (
                            <DriverCard key={driver.username} driver={driver} token={localStorage.getItem('access') || ''} />
                          ))
                      )}
                    </div>
                  </div>
                )}
        </div>
            </div>
          </div>
          {/* Right column: Map */}
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
        {/* Quick action buttons and top right button remain as before */}
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

export default JourneysPage; 