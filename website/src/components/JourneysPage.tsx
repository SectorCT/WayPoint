import React, { useEffect, useState, useRef } from 'react';
import { fetchDeliveryHistory, fetchDrivers, fetchAvailableTrucks, fetchPackages, fetchActiveRoutes } from '../utils/api';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { quickActions } from './Dashboard';
// @ts-ignore
import { Map, Marker, Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { Feature, LineString } from 'geojson';
import { Helmet } from 'react-helmet';

// Function to generate a color based on a value (same as mobile app)
const generateColorFromValue = (value: string): string => {
  const colors = [
    '#FF4136', // Red
    '#2ECC40', // Green
    '#0074D9', // Blue
    '#FF851B', // Orange
    '#B10DC9', // Purple
    '#01FF70', // Neon Green
    '#F012BE', // Magenta
    '#7FDBFF', // Light Blue
    '#FFD700', // Gold
    '#39CCCC', // Teal
  ];

  let total = 0;
  for (let i = 0; i < value.length; i++) {
    total = (total + value.charCodeAt(i) * (i + 1)) % colors.length;
  }

  return colors[Math.abs(total)];
};

// Custom marker component for packages
const PackageMarker: React.FC<{ 
  number: number, 
  isDelivered: boolean, 
  isUndelivered: boolean, 
  isWarehouse?: boolean 
}> = ({ number, isDelivered, isUndelivered, isWarehouse }) => {
  if (isWarehouse) {
    return (
      <div style={{
        width: 30,
        height: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 20,
      }}>
        🏠
      </div>
    );
  }

  let backgroundColor = '#fff';
  let borderColor = '#000';
  let textColor = '#000';

  if (isDelivered) {
    backgroundColor = '#E8F5E9';
    borderColor = '#4CAF50';
  } else if (isUndelivered) {
    backgroundColor = '#FFEBEE';
    borderColor = '#FF4136';
  }

  return (
    <div style={{
      backgroundColor,
      borderRadius: '50%',
      width: 30,
      height: 30,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: `2px solid ${borderColor}`,
      fontSize: 12,
      fontWeight: 'bold',
      color: textColor,
    }}>
      {isDelivered ? '✓' : isUndelivered ? '✗' : number}
    </div>
  );
};

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
const ActiveRoutesBar: React.FC<{ routes: any[], selectedRoute: string | null, onRouteSelect: (routeId: string) => void }> = ({ routes, selectedRoute, onRouteSelect }) => {
  const [packageStatuses, setPackageStatuses] = useState<{[key: string]: any}>({});
  
  // Fetch package statuses for all routes
  useEffect(() => {
    const fetchPackageStatuses = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) return;
        
        const packages = await fetchPackages(token);
        const statusMap: {[key: string]: any} = {};
        
        packages.forEach((pkg: any) => {
          statusMap[pkg.packageID] = pkg.status;
        });
        
        setPackageStatuses(statusMap);
      } catch (error) {
        console.error('Failed to fetch package statuses:', error);
      }
    };
    
    fetchPackageStatuses();
  }, []);

  const getPackageCounts = (route: any) => {
    if (!route.packageSequence) return { delivered: 0, undelivered: 0, total: 0 };
    
    let delivered = 0;
    let undelivered = 0;
    let total = 0;
    
    route.packageSequence.forEach((pkg: any) => {
      if (pkg.packageID && pkg.packageID !== 'ADMIN') {
        total++;
        const status = packageStatuses[pkg.packageID];
        if (status === 'delivered') {
          delivered++;
        } else if (status === 'undelivered') {
          undelivered++;
        }
      }
    });
    
    return { delivered, undelivered, total };
  };

  if (!routes || routes.length === 0) {
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
  // Only show horizontal scroll if more than 2 routes
  const isScrollable = routes.length > 2;
  return (
    <div style={{
      width: '100%',
      marginBottom: 24,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px 0',
    }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: 16,
          overflowX: isScrollable ? 'auto' : 'visible',
          maxWidth: '100%',
          padding: '0 20px',
          scrollbarWidth: isScrollable ? 'thin' : undefined,
          msOverflowStyle: isScrollable ? 'auto' : undefined,
          WebkitOverflowScrolling: isScrollable ? 'touch' : undefined,
          position: 'relative',
        }}
      >
        {routes.map((route, idx) => {
          const { delivered, undelivered, total } = getPackageCounts(route);
          const isSelected = selectedRoute === route.routeID;
          const routeColor = generateColorFromValue(route.user);

          return (
            <button
              key={idx}
              onClick={() => onRouteSelect(route.routeID)}
              style={{
                minWidth: 280,
                maxWidth: 320,
                background: isSelected 
                  ? 'linear-gradient(135deg, #FF4136 0%, #DC143C 100%)' 
                  : 'linear-gradient(135deg, #F39358 0%, #F05033 100%)',
                borderRadius: 16,
                padding: '12px 16px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                boxShadow: isSelected 
                  ? '0 6px 20px rgba(255,65,54,0.4)' 
                  : '0 4px 12px rgba(240,80,51,0.25)',
                transition: 'all 0.2s ease',
                position: 'relative',
                overflow: 'hidden',
                border: isSelected ? '2px solid #FF4136' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(240,80,51,0.35)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSelected) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(240,80,51,0.25)';
                }
              }}
            >
              {/* Active indicator */}
              <div style={{
                position: 'absolute',
                top: 6,
                right: 6,
                width: 6,
                height: 6,
                background: '#4CAF50',
                borderRadius: '50%',
                boxShadow: '0 0 4px rgba(76,175,80,0.6)',
              }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 20, color: '#fff' }}>🚚</span>
                <span style={{ 
                  fontWeight: 700, 
                  fontSize: 15, 
                  color: '#fff',
                  lineHeight: 1.2,
                }}>
                  {route.user || 'N/A'}
                </span>
              </div>
              
              <div style={{ 
              display: 'flex',
              flexDirection: 'column',
                alignItems: 'flex-end',
                gap: 2,
              }}>
                <div style={{ 
                  fontSize: 13, 
                  color: '#fff', 
                  fontWeight: 600,
                  background: 'rgba(0,0,0,0.3)',
                  padding: '3px 10px',
                  borderRadius: 10,
                  backdropFilter: 'blur(10px)',
                  whiteSpace: 'nowrap',
                }}>
                  {total} Total
                </div>
                <div style={{
                  display: 'flex',
              gap: 8,
                  fontSize: 11,
                  color: '#fff',
                  fontWeight: 500,
                }}>
                  <span style={{ color: '#fff' }}>✓ {delivered}</span>
                  <span style={{ color: '#fff' }}>✗ {undelivered}</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
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

const TruckSelectionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAssign: (driverUsername: string, truck: any) => void;
  drivers: any[];
  assignments: {[key: string]: any};
  remainingTrucks: any[];
  setAssignments: React.Dispatch<React.SetStateAction<{[key: string]: any}>>;
  setRemainingTrucks: React.Dispatch<React.SetStateAction<any[]>>;
}> = ({ isOpen, onClose, onAssign, drivers, assignments, remainingTrucks, setAssignments, setRemainingTrucks }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDrivers = drivers.filter(driver =>
    driver.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (driver.email && driver.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredRemainingTrucks = remainingTrucks.filter(truck =>
    truck.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 24,
        width: '90%',
        maxWidth: 600,
        maxHeight: '90%',
        overflowY: 'auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      }} onClick={(e) => e.stopPropagation()}>
        <h2 style={{ marginBottom: 20, textAlign: 'center' }}>Assign Trucks</h2>
        <input
          type="text"
          placeholder="Search drivers or trucks..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 8,
            border: '1px solid #F8D5B0',
            fontSize: '1rem',
            marginBottom: 20,
            marginTop: 0,
          }}
        />
        <h3 style={{ marginBottom: 15 }}>Available Drivers</h3>
        {filteredDrivers.length === 0 ? (
          <p>No drivers found.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredDrivers.map(driver => (
              <div key={driver.username} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                border: '1px solid #eee',
                borderRadius: 12,
                background: '#f9f9f9',
              }}>
                <span style={{ fontWeight: 600 }}>{driver.username}</span>
                <span style={{ color: '#888', fontSize: 14 }}>{driver.email || 'N/A'}</span>
              </div>
            ))}
          </div>
        )}

        <h3 style={{ marginTop: 20, marginBottom: 15 }}>Available Trucks</h3>
        {filteredRemainingTrucks.length === 0 ? (
          <p>No trucks available.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filteredRemainingTrucks.map(truck => (
              <div key={truck.licensePlate} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                border: '1px solid #eee',
                borderRadius: 12,
                background: '#f9f9f9',
              }}>
                <span style={{ fontWeight: 600 }}>{truck.licensePlate}</span>
                <span style={{ color: '#888', fontSize: 14 }}>{truck.model || 'N/A'}</span>
                <button
                  onClick={() => onAssign(filteredDrivers[0].username, truck)} // Assuming the first driver is selected for assignment
                  style={{
                    background: '#4CAF50',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                    boxShadow: '0 2px 6px rgba(76,175,80,0.3)',
                  }}
                >
                  Assign
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-around', marginTop: 20 }}>
          <button
            onClick={onClose}
            style={{
              background: '#f05033',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(240,80,51,0.2)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => {
              // This button should ideally trigger the final assignment logic
              // For now, it just closes the modal
              onClose();
            }}
            style={{
              background: 'linear-gradient(90deg, #FF4136 0%, #DC143C 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(255,65,54,0.2)',
            }}
          >
            Confirm Assignments
          </button>
        </div>
      </div>
    </div>
  );
};

const ErrorModal = ({ open, message, onClose }: { open: boolean, message: string, onClose: () => void }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.35)',
      zIndex: 2000,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 14,
        padding: '32px 32px 24px 32px',
        minWidth: 320,
        boxShadow: '0 4px 24px rgba(0,0,0,0.13)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#F05033', marginBottom: 12 }}>Error</div>
        <div style={{ color: '#333', fontSize: 16, marginBottom: 24, textAlign: 'center', maxWidth: 350 }}>{message}</div>
        <button
          onClick={onClose}
          style={{
            background: 'linear-gradient(90deg, #F39358 0%, #F05033 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '10px 32px',
            fontWeight: 600,
            fontSize: 16,
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(240,80,51,0.13)',
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
};

const JourneysPage: React.FC = () => {
  const [routes, setRoutes] = useState<any[]>([]);
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
  const [packages, setPackages] = useState<any[]>([]);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const mapRef = useRef<any>(null);
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [assignments, setAssignments] = useState<{[key: string]: any}>({});
  const [remainingTrucks, setRemainingTrucks] = useState<any[]>([]);
  const [isStartingJourney, setIsStartingJourney] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [trucksData, setTrucksData] = useState<any[]>([]);
  const [errorModal, setErrorModal] = useState<{ open: boolean, message: string }>({ open: false, message: '' });

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Not authenticated');
        const data = await fetchActiveRoutes(token);
        setRoutes(data);
      } catch (e: any) {
        // Optionally handle error
      }
    };
    fetchRoutes();
  }, []);

  useEffect(() => {
    const fetchPackagesData = async () => {
      try {
        const token = localStorage.getItem('access');
        if (!token) return;
        const packagesData = await fetchPackages(token);
        setPackages(packagesData);
      } catch (e) {
        console.error('Failed to fetch packages:', e);
      }
    };
    fetchPackagesData();
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
        setTrucksData(trucks);
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
    if (selectedDrivers.size === 0) {
      alert('Please select at least one driver');
      return;
    }
    
    // Initialize assignments and remaining trucks
    const initialAssignments: {[key: string]: any} = {};
    Array.from(selectedDrivers).forEach(driver => {
      initialAssignments[driver] = null;
    });
    
    setAssignments(initialAssignments);
    setRemainingTrucks([...trucksData]);
    setShowTruckModal(true);
  };

  const handleAssignTruck = (driverUsername: string, truck: any) => {
    setAssignments(prev => ({
      ...prev,
      [driverUsername]: truck
    }));
    
    setRemainingTrucks(prev => prev.filter(t => t.licensePlate !== truck.licensePlate));
  };

  const handleConfirmAssignments = async () => {
    // Check if all drivers have trucks assigned
    const unassignedDrivers = Array.from(selectedDrivers).filter(driver => !assignments[driver]);
    if (unassignedDrivers.length > 0) {
      setErrorModal({ open: true, message: `Please assign trucks to: ${unassignedDrivers.join(', ')}` });
      return;
    }

    setIsStartingJourney(true);
    setLoadingMessage('Planning routes for your drivers...');

    try {
      // Get driver usernames
      const driverUsernames = Array.from(selectedDrivers);
      
      // Start journey with selected drivers
      const token = localStorage.getItem('access');
      if (!token) throw new Error('Not authenticated');

      // Step 1: Plan routes for the drivers
      const routePlanningResponse = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8000'}/delivery/route/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          drivers: driverUsernames,
        }),
      });

      if (!routePlanningResponse.ok) {
        const errorData = await routePlanningResponse.json();
        throw new Error(errorData.error || 'Failed to plan routes');
      }

      const plannedRoutes = await routePlanningResponse.json();

      setLoadingMessage('Assigning trucks and starting journeys...');
      
      // Step 2: For each driver, assign truck and start journey using the planned route data
      for (const driverUsername of driverUsernames) {
        const truck = assignments[driverUsername];
        // Find the planned route for this driver (robust string comparison)
        const plannedRoute = plannedRoutes.find((route: any) =>
          String(route.driverUsername).trim() === String(driverUsername).trim()
        );
        if (!plannedRoute) {
          continue; // Silently skip this driver
        }

        // Call the backend to assign truck and start journey with the planned route data
        const response = await fetch(`${process.env.REACT_APP_API_BASE || 'http://localhost:8000'}/delivery/route/assign/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            driverUsername,
            truckLicensePlate: truck.licensePlate,
            packageSequence: plannedRoute.route.map((wp: any) => wp.package_info),
            mapRoute: plannedRoute.route.flatMap((wp: any) => wp.route),
          }),
        });

        if (!response.ok) {
          let errorMsg = '';
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || JSON.stringify(errorData);
          } catch (jsonErr) {
            // Try to parse as text (HTML error)
            const text = await response.text();
            if (text.includes('already assigned') || text.includes('already taken')) {
              errorMsg = text;
            } else if (text.includes('<!DOCTYPE')) {
              errorMsg = 'A resource (driver, truck, or package) is already assigned or taken.';
            } else {
              errorMsg = text;
            }
          }
          setErrorModal({ open: true, message: errorMsg });
          setIsStartingJourney(false);
          return;
        }
      }

      // Success - close modal and refresh data
      setShowTruckModal(false);
      setIsStartingJourney(false);
      setSelectedDrivers(new Set());
      setAssignments({});
      
      // Refresh routes and trucks
      if (token) {
        const [routesData, trucksData] = await Promise.all([
          fetchActiveRoutes(token),
          fetchAvailableTrucks(token)
        ]);
        setRoutes(routesData);
        setAvailableTrucks(trucksData.length);
      }
      
    } catch (error: any) {
      setIsStartingJourney(false);
      setErrorModal({ open: true, message: `Error starting journey: ${error.message}` });
    }
  };

  // Create route polylines and markers
  const createRouteFeatures = () => {
    const features: any[] = [];
    
    routes.forEach((route, routeIndex) => {
      if (route.mapRoute && route.mapRoute.length > 0) {
        // Create polyline for the route
        const isSelected = selectedRoute === route.routeID;
        const routeColor = isSelected ? '#FF4136' : generateColorFromValue(route.user);
        
        const polylineFeature: Feature<LineString> = {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: route.mapRoute,
          },
          properties: {
            routeId: route.routeID,
            driver: route.user,
            color: routeColor,
            isSelected,
          },
        };
        
        features.push(polylineFeature);
      }
    });
    
    return features;
  };

  // Get package status by ID
  const getPackageStatus = (packageId: string) => {
    const pkg = packages.find(p => p.packageID === packageId);
    return pkg ? pkg.status : 'pending';
  };

  // Focus map on selected route
  const focusOnRoute = (routeId: string) => {
    const route = routes.find(r => r.routeID === routeId);
    if (route && route.mapRoute && route.mapRoute.length > 0 && mapRef.current) {
      // Calculate bounds for the route
      let minLat = route.mapRoute[0][1];
      let maxLat = route.mapRoute[0][1];
      let minLng = route.mapRoute[0][0];
      let maxLng = route.mapRoute[0][0];

      route.mapRoute.forEach((point: [number, number]) => {
        minLat = Math.min(minLat, point[1]);
        maxLat = Math.max(maxLat, point[1]);
        minLng = Math.min(minLng, point[0]);
        maxLng = Math.max(maxLng, point[0]);
      });

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = (maxLat - minLat) * 1.5;
      const lngDelta = (maxLng - minLng) * 1.5;

      mapRef.current.fitBounds(
        [
          [minLng, minLat],
          [maxLng, maxLat]
        ],
        { padding: 50, duration: 1000 }
      );
    }
  };

  // Handle route selection
  const handleRouteSelect = (routeId: string) => {
    setSelectedRoute(routeId);
    focusOnRoute(routeId);
  };

  // In the journey start tab, filter out drivers with active routes (case-insensitive, trimmed)
  const selectableDrivers = drivers.filter(driver => {
    const routeAssigned = routes.some(route =>
      String(route.user).trim().toLowerCase() === String(driver.username).trim().toLowerCase() &&
      String(route.status).trim().toLowerCase() === 'active'
    );
    return !routeAssigned;
  });

  return (
    <div className={styles.fullScreenTwoCol}>
      <Helmet>
        <title>Waypoint - Start a Journey</title>
      </Helmet>
      <div style={{
        width: '100%',
        maxWidth: '1600px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        {/* Main content: two columns */}
        <div className={styles.columnsWrapper} style={{ width: '100%', marginTop: 0 }}>
          {/* Left column: Tabs, driver selection, start journey */}
          <div className={styles.leftCol} style={{ alignItems: 'flex-start', justifyContent: 'flex-start' }}>
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
                        selectableDrivers
                          .map(driver => {
                            const isSelected = selectedDrivers.has(driver.username);
                            const routeAssigned = routes.some(route =>
                              String(route.user).trim().toLowerCase() === String(driver.username).trim().toLowerCase() &&
                              String(route.status).trim().toLowerCase() === 'active'
                            );
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
                                  cursor: routeAssigned ? 'not-allowed' : 'pointer',
                                  transition: 'border 0.2s',
                                  fontWeight: isSelected ? 600 : 500,
                                  color: isSelected ? '#F05033' : '#222',
                                  width: '100%',
                                  opacity: routeAssigned ? 0.5 : 1,
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
                                    cursor: routeAssigned ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s, color 0.2s',
                                    outline: 'none',
                                  }}
                                  aria-label={isSelected ? 'Deselect driver' : 'Select driver'}
                                  disabled={routeAssigned}
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
                      style={{ width: '100%', marginTop: 8, opacity: selectedDrivers.size > 0 && selectableDrivers.length > 0 ? 1 : 0.5, cursor: selectedDrivers.size > 0 && selectableDrivers.length > 0 ? 'pointer' : 'not-allowed' }}
                      onClick={handleStartJourney}
                      disabled={selectedDrivers.size === 0 || selectableDrivers.length === 0}
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
          {/* Right column: Active routes bar above the map */}
          <div className={styles.rightCol}>
            <div style={{ width: '100%', marginBottom: 16 }}>
              <ActiveRoutesBar routes={routes} selectedRoute={selectedRoute} onRouteSelect={handleRouteSelect} />
            </div>
            <div style={{ height: '80vh', width: '80vh', maxWidth: '100%', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', margin: '0 auto' }}>
              <Map
                initialViewState={{
                  latitude: 42.6977,
                  longitude: 23.3219,
                  zoom: 12,
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                ref={mapRef}
              >
                {/* Render route polylines */}
                {createRouteFeatures().map((feature, index) => (
                  <Source key={`route-${index}`} id={`route-${index}`} type="geojson" data={feature}>
                    <Layer
                      id={`line-${index}`}
                      type="line"
                      paint={{ 
                        'line-color': feature.properties.color, 
                        'line-width': feature.properties.isSelected ? 6 : 4,
                        'line-opacity': feature.properties.isSelected ? 1 : 0.8
                      }}
                    />
                  </Source>
                ))}
                
                {/* Render package markers */}
                {routes.map((route, routeIndex) => {
                  if (!route.packageSequence) return null;
                  
                  return route.packageSequence.map((pkg: any, pkgIndex: number) => {
                    if (!pkg.latitude || !pkg.longitude) return null;
                    
                    const status = getPackageStatus(pkg.packageID);
                    const isDelivered = status === 'delivered';
                    const isUndelivered = status === 'undelivered';
                    const isWarehouse = pkg.packageID === 'ADMIN';
                    
                    return (
                      <Marker 
                        key={`marker-${route.routeID}-${pkgIndex}`}
                        longitude={pkg.longitude} 
                        latitude={pkg.latitude}
                      >
                        <PackageMarker
                          number={pkgIndex}
                          isDelivered={isDelivered}
                          isUndelivered={isUndelivered}
                          isWarehouse={isWarehouse}
                        />
                      </Marker>
                    );
                  });
                })}
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

      {/* Truck Selection Modal */}
      {showTruckModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
        }} onClick={() => setShowTruckModal(false)}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: 24,
            width: '90%',
            maxWidth: 800,
            maxHeight: '90%',
            overflowY: 'auto',
            boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }} onClick={(e) => e.stopPropagation()}>
            
            {isStartingJourney ? (
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ fontSize: 48, marginBottom: 20 }}>🚚</div>
                <h2 style={{ marginBottom: 10 }}>Starting Journey...</h2>
                <p style={{ color: '#666', marginBottom: 20 }}>{loadingMessage}</p>
                <div style={{
                  width: '100%',
                  height: 4,
                  background: '#eee',
                  borderRadius: 2,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: '60%',
                    height: '100%',
                    background: 'linear-gradient(90deg, #F39358 0%, #F05033 100%)',
                    borderRadius: 2,
                    animation: 'pulse 1.5s ease-in-out infinite',
                  }} />
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 style={{ margin: 0 }}>Assign Trucks to Drivers</h2>
                  <button
                    onClick={() => setShowTruckModal(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: 24,
                      cursor: 'pointer',
                      color: '#666',
                    }}
                  >
                    ×
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  {/* Drivers Column */}
                  <div>
                    <h3 style={{ marginBottom: 15, color: '#333' }}>Selected Drivers</h3>
                    {Array.from(selectedDrivers).map(driverUsername => {
                      const driver = drivers.find(d => d.username === driverUsername);
                      const assignedTruck = assignments[driverUsername];
                      
                      return (
                        <div key={driverUsername} style={{
                          padding: 16,
                          border: '2px solid',
                          borderColor: assignedTruck ? '#4CAF50' : '#ddd',
                          borderRadius: 12,
                          marginBottom: 12,
                          background: assignedTruck ? '#f0f9f0' : '#f9f9f9',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <span style={{ fontWeight: 600, fontSize: 16 }}>{driverUsername}</span>
                            {assignedTruck && (
                              <span style={{ 
                                background: '#4CAF50', 
                                color: '#fff', 
                                padding: '4px 8px', 
                                borderRadius: 6, 
                                fontSize: 12,
                                fontWeight: 600,
                              }}>
                                ✓ Assigned
                              </span>
                            )}
                          </div>
                          {driver?.email && (
                            <div style={{ color: '#666', fontSize: 14, marginBottom: 8 }}>
                              {driver.email}
                            </div>
                          )}
                          {assignedTruck ? (
                            <div style={{ 
                              background: '#4CAF50', 
                              color: '#fff', 
                              padding: '8px 12px', 
                              borderRadius: 8,
                              fontSize: 14,
                              fontWeight: 600,
                            }}>
                              🚚 {assignedTruck.licensePlate} ({assignedTruck.kilogramCapacity} kg)
                            </div>
                          ) : (
                            <div style={{ color: '#999', fontSize: 14, fontStyle: 'italic' }}>
                              No truck assigned
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Available Trucks Column */}
                  <div>
                    <h3 style={{ marginBottom: 15, color: '#333' }}>
                      Available Trucks ({remainingTrucks.length})
                    </h3>
                    {remainingTrucks.length === 0 ? (
                      <div style={{ 
                        padding: 20, 
                        textAlign: 'center', 
                        color: '#666',
                        background: '#f9f9f9',
                        borderRadius: 12,
                      }}>
                        <div style={{ fontSize: 32, marginBottom: 10 }}>🚚</div>
                        <p>No trucks available</p>
                        <p style={{ fontSize: 14, marginTop: 5 }}>All trucks have been assigned</p>
                      </div>
                    ) : (
                      <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                        {remainingTrucks.map(truck => (
                          <div key={truck.licensePlate} style={{
                            padding: 16,
                            border: '1px solid #ddd',
                            borderRadius: 12,
                            marginBottom: 12,
                            background: '#fff',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                          }} 
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-2px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                          onClick={() => {
                            // Find first unassigned driver
                            const unassignedDriver = Array.from(selectedDrivers).find(driver => !assignments[driver]);
                            if (unassignedDriver) {
                              handleAssignTruck(unassignedDriver, truck);
                            }
                          }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontWeight: 600, fontSize: 16 }}>🚚 {truck.licensePlate}</span>
                              <span style={{ 
                                background: '#2196F3', 
                                color: '#fff', 
                                padding: '4px 8px', 
                                borderRadius: 6, 
                                fontSize: 12,
                                fontWeight: 600,
                              }}>
                                {truck.kilogramCapacity} kg
                              </span>
                            </div>
                            <div style={{ color: '#666', fontSize: 14 }}>
                              Click to assign to next available driver
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginTop: 30,
                  paddingTop: 20,
                  borderTop: '1px solid #eee',
                }}>
                  <div style={{ color: '#666' }}>
                    {Object.values(assignments).filter(Boolean).length} of {selectedDrivers.size} drivers assigned
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <button
                      onClick={() => setShowTruckModal(false)}
                      style={{
                        background: '#f5f5f5',
                        color: '#333',
                        border: '1px solid #ddd',
                        borderRadius: 12,
                        padding: '12px 24px',
                        cursor: 'pointer',
                        fontSize: '1rem',
                        fontWeight: 600,
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleConfirmAssignments}
                      disabled={Object.values(assignments).some(a => !a)}
                      style={{
                        background: Object.values(assignments).every(a => a) 
                          ? 'linear-gradient(90deg, #F39358 0%, #F05033 100%)' 
                          : '#ccc',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 12,
                        padding: '12px 24px',
                        cursor: Object.values(assignments).every(a => a) ? 'pointer' : 'not-allowed',
                        fontSize: '1rem',
                        fontWeight: 600,
                        boxShadow: Object.values(assignments).every(a => a) 
                          ? '0 4px 12px rgba(240,80,51,0.3)' 
                          : 'none',
                      }}
                    >
                      Start Journey
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <ErrorModal open={errorModal.open} message={errorModal.message} onClose={() => setErrorModal({ open: false, message: '' })} />
    </div>
  );
};

export default JourneysPage;

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(style); 