import React, { useState, useEffect } from 'react';
import styles from './Dashboard.module.css';
// Import all icons from react-icons/fa for compatibility
import { FaTruck, FaBoxOpen, FaRoute, FaUserCheck, FaHistory as FaHistoryRaw, FaSignOutAlt as FaSignOutAltRaw, FaUserTie as FaUserTieRaw, FaTachometerAlt } from 'react-icons/fa';
import { MdHome, MdLocalShipping, MdInventory, MdPersonAdd } from 'react-icons/md';
import { fetchPackages, fetchAvailableTrucks, fetchDeliveryHistory, fetchUnverifiedTruckers } from '../utils/api';
import { useNavigate } from 'react-router-dom';

// TypeScript fix for react-icons JSX compatibility
const FaUserTie = FaUserTieRaw as unknown as React.FC<any>;
const FaSignOutAlt = FaSignOutAltRaw as unknown as React.FC<any>;
const FaHistory = FaHistoryRaw as unknown as React.FC<any>;

const managerName = 'Manager'; // Placeholder, replace with real user data if available

const TAB_JOURNEYS = 'Journeys';
const TAB_PACKAGES = 'Packages';
const TAB_TRUCKS = 'Trucks';
const TAB_TRACKING = 'Truck Tracking';
const TAB_VERIFY = 'Verify Truckers';
const TABS = [TAB_JOURNEYS, TAB_PACKAGES, TAB_TRUCKS, TAB_TRACKING, TAB_VERIFY];

export const quickActions = [
  { label: 'Dashboard', Icon: MdHome, path: '/dashboard' },
  { label: 'Journeys', Icon: MdLocalShipping, path: '/journeys' },
  { label: 'Packages', Icon: MdInventory, path: '/packages' },
  { label: 'Trucks', Icon: MdLocalShipping, path: '/trucks' },
  { label: 'Verify Users', Icon: MdPersonAdd, path: '/verifyusers' },
];

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [packages, setPackages] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<any[]>([]);
  const [unverifiedTruckers, setUnverifiedTruckers] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('access');
        if (!token) throw new Error('Not authenticated');
        const [pkgs, trks, hist, unver] = await Promise.all([
          fetchPackages(token),
          fetchAvailableTrucks(token),
          fetchDeliveryHistory(token, 7),
          fetchUnverifiedTruckers(token)
        ]);
        setPackages(pkgs);
        setTrucks(trks);
        setDeliveryHistory(hist);
        setUnverifiedTruckers(unver);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Summary card values
  const summaryData = [
    { label: 'Active Journeys', value: deliveryHistory.filter((h: any) => h.status === 'active').length, Icon: FaRoute, link: '/journeys' },
    { label: 'Packages Today', value: packages.filter((p: any) => {
      const today = new Date().toISOString().slice(0, 10);
      return p.deliveryDate && p.deliveryDate.startsWith(today);
    }).length, Icon: FaBoxOpen, link: '/packages' },
    { label: 'Trucks Available', value: trucks.length, Icon: FaTruck, link: '/trucks' },
    { label: 'Pending User Verifications', value: unverifiedTruckers.length, Icon: FaUserCheck, link: '/verifyusers' },
  ];

  const recentActivity = [
    // Placeholder only
    { Icon: FaTruck, color: '#F05033', text: 'Truck assigned to John', time: '2m ago' },
    { Icon: FaBoxOpen, color: '#F05033', text: 'Package delivered to Alice', time: '10m ago' },
    { Icon: FaUserCheck, color: '#F05033', text: 'Trucker Mike verified', time: '1h ago' },
  ];

  // Tab content
  const renderTabContent = () => {
    if (loading) return <div className={styles.card}>Loading...</div>;
    if (error) return <div className={styles.card} style={{ color: 'red' }}>{error}</div>;
    switch (activeTab) {
      case TAB_JOURNEYS:
        return (
          <div className={styles.card}>
            <h3>Journeys</h3>
            <button className={styles.gradientButton} onClick={() => navigate('/journeys')}>Go to Journeys Page</button>
            <div className={styles.section}>
              <h4>Recent Journeys</h4>
              {deliveryHistory.length === 0 ? (
                <div className={styles.placeholder}>No journeys found.</div>
              ) : (
                <ul>
                  {deliveryHistory.map((j: any, idx: number) => (
                    <li key={idx}>{j.date} - {j.status} - {j.numTrucks} trucks</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      case TAB_PACKAGES:
        return (
          <div className={styles.card}>
            <h3>Packages</h3>
            <button className={styles.gradientButton} onClick={() => navigate('/packages')}>Go to Packages Page</button>
            <div className={styles.section}>
              <h4>All Packages</h4>
              {packages.length === 0 ? (
                <div className={styles.placeholder}>No packages found.</div>
              ) : (
                <ul>
                  {packages.map((p: any, idx: number) => (
                    <li key={idx}>{p.packageID} - {p.address} - {p.status}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      case TAB_TRUCKS:
        return (
          <div className={styles.card}>
            <h3>Trucks</h3>
            <button className={styles.gradientButton} onClick={() => navigate('/trucks')}>Go to Trucks Page</button>
            <div className={styles.section}>
              <h4>Available Trucks</h4>
              {trucks.length === 0 ? (
                <div className={styles.placeholder}>No trucks available.</div>
              ) : (
                <ul>
                  {trucks.map((t: any, idx: number) => (
                    <li key={idx}>{t.licensePlate} - {t.kilogramCapacity}kg - {t.isUsed ? 'In Use' : 'Available'}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      case TAB_VERIFY:
        return (
          <div className={styles.card}>
            <h3>Verify Truckers</h3>
            <div className={styles.section}>
              <h4>Pending Truckers</h4>
              {unverifiedTruckers.length === 0 ? (
                <div className={styles.placeholder}>No truckers pending verification.</div>
              ) : (
                <ul>
                  {unverifiedTruckers.map((t: any, idx: number) => (
                    <li key={idx}>{t.username} - {t.email}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        );
      case TAB_TRACKING:
        return (
          <div className={styles.card}>
            <h3>Truck Tracking</h3>
            <div className={styles.mapPlaceholder}>Map Placeholder</div>
            <div className={styles.section}>
              <h4>Active Routes</h4>
              <div className={styles.placeholder}>No active routes.</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  // Enhanced dashboard landing
  if (activeTab === 'Dashboard') {
    return (
      <div className={styles.dashboardContainer}>
        <div className={styles.header}>
          <div className={styles.hero}>
            <div className={styles.heroIcon}><FaUserTie size={40} color="#F39358" /></div>
            <div>
              <div className={styles.heroWelcome}>Welcome, {managerName}!</div>
              <div className={styles.heroSubtitle}>Here's what's happening today:</div>
            </div>
          </div>
          <button className={styles.logoutButton} onClick={handleLogout}><FaSignOutAlt style={{ marginRight: 8 }} />Logout</button>
        </div>
        {/* Quick actions in top right corner */}
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
        <div className={styles.summaryGrid}>
          {summaryData.map((item) => {
            const Icon = item.Icon as unknown as React.FC<any>;
            return (
              <div className={styles.summaryCard} key={item.label}>
                <div className={styles.summaryIcon}><Icon color="#F39358" size={28} /></div>
                <div className={styles.summaryValue}>{item.value}</div>
                <div className={styles.summaryLabel}>{item.label}</div>
                {item.link && (
                  <button className={styles.secondaryButton} style={{ marginTop: 12 }} onClick={() => navigate(item.link!)}>
                    View {item.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.activityFeed}>
          <div className={styles.activityTitle}><FaHistory style={{ marginRight: 8 }} />Recent Activity</div>
          <ul className={styles.activityList}>
            {recentActivity.map((item, idx) => {
              const Icon = item.Icon as unknown as React.FC<any>;
              return (
                <li key={idx} className={styles.activityItem}>
                  <span className={styles.activityIcon}><Icon color={item.color} /></span>
                  <span className={styles.activityText}>{item.text}</span>
                  <span className={styles.activityTime}>{item.time}</span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <div className={styles.header}>
        <h2 className={styles.title}>Manager Dashboard</h2>
        <button className={styles.logoutButton} onClick={handleLogout}><FaSignOutAlt style={{ marginRight: 8 }} />Logout</button>
      </div>
      <div className={styles.tabContent}>{renderTabContent()}</div>
    </div>
  );
};

export default Dashboard; 