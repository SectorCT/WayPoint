import React, { useEffect, useState, useRef } from 'react';
import { fetchPackages, createPackage } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { quickActions } from './Dashboard';
import MapPickerModal from './MapPickerModal';
// @ts-ignore
import { Map, Marker } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
// If you get a linter error for date-fns, run: npm install date-fns
import { format, isToday, parseISO } from 'date-fns';

const GEOAPIFY_API_KEY = process.env.REACT_APP_GEOAPIFY_API_KEY || '';

const PackagesPage: React.FC = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');
  const [recipient, setRecipient] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [weight, setWeight] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState('');
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null);
  const [mapMarker, setMapMarker] = useState<{ lat: number; lng: number } | null>(null);
  const mapRef = useRef<any>(null);
  const navigate = useNavigate();
  const [mapPopupIdx, setMapPopupIdx] = useState<string | null>(null);
  const popupRef = useRef<HTMLDivElement | null>(null);

  // Close popup on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setMapPopupIdx(null);
      }
    }
    if (mapPopupIdx !== null) {
      document.addEventListener('mousedown', handleClick);
    }
    return () => document.removeEventListener('mousedown', handleClick);
  }, [mapPopupIdx]);

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

  useEffect(() => {
    fetchAll();
  }, []);

  const handleMapConfirm = async (lat: number, lng: number) => {
    setLat(lat);
    setLng(lng);
    setMapOpen(false);
    setLoadingAddress(true);
    setAddressError('');
    // Reverse geocode
    try {
      const resp = await fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&lang=en&apiKey=${GEOAPIFY_API_KEY}`);
      const data = await resp.json();
      console.log('Geoapify reverse geocode response:', data);
      let formatted = '';
      if (data.results && data.results[0] && data.results[0].formatted) {
        formatted = data.results[0].formatted;
      } else if (data.features && data.features[0] && data.features[0].properties && data.features[0].properties.formatted) {
        formatted = data.features[0].properties.formatted;
      }
      if (formatted) {
        setAddress(formatted);
      } else {
        setAddress('');
        setAddressError('No address found for this location.');
        alert('Geoapify response: ' + JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setAddress('');
      setAddressError('Failed to fetch address.');
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleAddPackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    if (!recipient.trim() || !recipientPhone.trim() || !weight.trim() || !deliveryDate.trim() || !address.trim() || lat === null || lng === null) {
      setAddError('Please fill in all fields, including address.');
      return;
    }
    setAddLoading(true);
    try {
      const token = localStorage.getItem('access');
      if (!token) throw new Error('Not authenticated');
      // Format lat/lng to 6 decimal places as float, like the app
      const formattedLat = lat !== null ? parseFloat(lat.toFixed(6)) : null;
      const formattedLng = lng !== null ? parseFloat(lng.toFixed(6)) : null;
      if (formattedLat === null || formattedLng === null) throw new Error('Invalid coordinates');
      await createPackage(token, recipient.trim(), recipientPhone.trim(), parseFloat(weight), deliveryDate, address, formattedLat, formattedLng);
      setRecipient('');
      setRecipientPhone('');
      setWeight('');
      setDeliveryDate('');
      setAddress('');
      setLat(null);
      setLng(null);
      await fetchAll();
    } catch (e: any) {
      console.error('Add package error:', e);
      if (e && e.message) {
        setAddError(e.message);
      } else if (typeof e === 'object') {
        setAddError(JSON.stringify(e));
      } else {
        setAddError('Failed to add package');
      }
    } finally {
      setAddLoading(false);
    }
  };

  // Helper to group packages by date
  function groupPackagesByDate(packages: any[]) {
    const today = new Date();
    const groups: { [key: string]: any[] } = {};
    packages.forEach(pkg => {
      let dateStr = pkg.deliveryDate;
      let dateObj: Date | null = null;
      if (dateStr) {
        // Try to parse as ISO or YYYY-MM-DD
        dateObj = dateStr.length > 10 ? parseISO(dateStr) : new Date(dateStr);
      }
      if (dateObj && isToday(dateObj)) {
        if (!groups['Today']) groups['Today'] = [];
        groups['Today'].push(pkg);
      } else if (dateObj) {
        const label = format(dateObj, 'yyyy-MM-dd');
        if (!groups[label]) groups[label] = [];
        groups[label].push(pkg);
      } else {
        if (!groups['Unknown']) groups['Unknown'] = [];
        groups['Unknown'].push(pkg);
      }
    });
    return groups;
  }

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
            <h2>Packages</h2>
            <form className={styles.addForm} onSubmit={handleAddPackage}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                  placeholder="Delivery Address"
                  className={styles.input}
                  value={loadingAddress ? 'Loading address...' : address}
                  onChange={e => setAddress(e.target.value)}
                  disabled={addLoading || loadingAddress}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={() => setMapOpen(true)} style={{ background: '#F39358', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 12px', fontWeight: 600 }}>
                  Choose on Map
                </button>
              </div>
              {addressError && <div style={{ color: 'red', fontSize: 13, marginBottom: 4 }}>{addressError}</div>}
              <input
                placeholder="Recipient Name"
                className={styles.input}
                value={recipient}
                onChange={e => setRecipient(e.target.value)}
                disabled={addLoading}
              />
              <input
                placeholder="Recipient Phone Number"
                className={styles.input}
                value={recipientPhone}
                onChange={e => setRecipientPhone(e.target.value)}
                disabled={addLoading}
              />
              <input
                placeholder="Delivery Date (YYYY-MM-DD)"
                className={styles.input}
                value={deliveryDate}
                onChange={e => setDeliveryDate(e.target.value)}
                type="date"
                disabled={addLoading}
              />
              <input
                placeholder="Weight (kg)"
                className={styles.input}
                value={weight}
                onChange={e => setWeight(e.target.value)}
                type="number"
                min={0}
                disabled={addLoading}
              />
              {addError && <div style={{ color: 'red', fontSize: 14 }}>{addError}</div>}
              <button type="submit" className={styles.gradientButton} disabled={addLoading}>
                {addLoading ? 'Adding...' : 'Add Package'}
              </button>
            </form>
            <MapPickerModal
              open={mapOpen}
              onClose={() => setMapOpen(false)}
              onConfirm={handleMapConfirm}
              initialLat={lat || undefined}
              initialLng={lng || undefined}
            />
          </div>
        </div>
        <div className={styles.rightCol}>
          <div className={styles.listCard}>
            <h3>All Packages</h3>
            <div style={{ maxHeight: '60vh', overflowY: 'auto' }}>
              {loading ? <div>Loading...</div> : error ? <div style={{ color: 'red' }}>{error}</div> : (
                (() => {
                  const grouped = groupPackagesByDate(packages);
                  const order = ['Today', ...Object.keys(grouped).filter(k => k !== 'Today' && k !== 'Unknown').sort((a, b) => b.localeCompare(a)), 'Unknown'];
                  return order.filter(label => grouped[label] && grouped[label].length > 0).map(label => (
                    <div key={label} style={{ marginBottom: 18 }}>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#F39358', margin: '8px 0 4px 0' }}>{label === 'Unknown' ? 'Other' : label}</div>
                      <ul className={styles.list} style={{ marginBottom: 0 }}>
                        {grouped[label].map((p, idx) => (
                          <li key={p.packageID + (p.deliveryDate || '')} className={styles.listItem} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, position: 'relative' }}>
                            <span>
                              <b>{p.packageID}</b> — {p.address} — <span style={{ color: p.status === 'delivered' ? '#4CAF50' : '#F39358' }}>{p.status}</span>
                            </span>
                            {p.latitude && p.longitude && (
                              <>
                                <button
                                  style={{ background: '#F39358', color: '#fff', border: 'none', borderRadius: 6, padding: '4px 12px', fontWeight: 600, cursor: 'pointer', position: 'relative', zIndex: 2 }}
                                  onClick={() => setMapPopupIdx(label + '-' + idx)}
                                >
                                  Show on Map
                                </button>
                                {mapPopupIdx === label + '-' + idx && (
                                  <div
                                    ref={popupRef}
                                    style={{
                                      position: 'absolute',
                                      top: '110%',
                                      right: 0,
                                      zIndex: 10,
                                      background: '#fff',
                                      borderRadius: 10,
                                      boxShadow: '0 4px 16px rgba(0,0,0,0.13)',
                                      padding: 8,
                                      minWidth: 220,
                                    }}
                                  >
                                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                      <button onClick={() => setMapPopupIdx(null)} style={{ background: 'none', border: 'none', color: '#F39358', fontWeight: 700, fontSize: 18, cursor: 'pointer', marginBottom: 2 }}>&times;</button>
                                    </div>
                                    <div style={{ width: 220, height: 180, borderRadius: 8, overflow: 'hidden' }}>
                                      <Map
                                        initialViewState={{
                                          latitude: p.latitude,
                                          longitude: p.longitude,
                                          zoom: 14,
                                          bearing: 0,
                                          pitch: 0,
                                        }}
                                        style={{ width: '100%', height: '100%', borderRadius: 8 }}
                                        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                                      >
                                        <Marker longitude={p.longitude} latitude={p.latitude} color="#F39358" />
                                      </Map>
                                    </div>
                                  </div>
                                )}
                              </>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PackagesPage; 