import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { quickActions } from './Dashboard';
import { Helmet } from 'react-helmet';

const COLORS = ['#F39358', '#F05033', '#B2B2B2', '#4CAF50'];

interface StatisticsData {
  package_stats: {
    total: number;
    pending: number;
    in_transit: number;
    delivered: number;
    undelivered: number;
  };
  truck_stats: {
    total: number;
    used: number;
    available: number;
  };
  truck_usage_data: Array<{
    truck: string;
    used: number;
    capacity: number;
    isUsed: boolean;
  }>;
  daily_deliveries: Array<{
    day: string;
    value: number;
    date: string;
  }>;
  package_status_distribution: Array<{
    name: string;
    value: number;
  }>;
  summary_stats: {
    active_routes: number;
    total_drivers: number;
    verified_drivers: number;
    unverified_drivers: number;
  };
  recent_activity: Array<{
    text: string;
    type: string;
    time: string | null;
  }>;
}

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('access');
      if (!token) {
        throw new Error('No access token found');
      }

      const response = await fetch('http://localhost:8000/delivery/statistics/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setStatisticsData(data);
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  if (loading) {
    return (
      <div className={styles.fullScreenTwoCol}>
        <Helmet>
          <title>Waypoint - Statistics</title>
        </Helmet>
        
        {/* Back button in top right */}
        <div className={styles.topRightScreenButton}>
          <button onClick={() => navigate('/dashboard')} className={styles.logoutButton}>
            ← Back to Dashboard
          </button>
        </div>
        
        {/* Quick actions on the left */}
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
        
        {/* Main content */}
        <div className={styles.columnsWrapper} style={{ width: '100%', marginTop: 0 }}>
          <div className={styles.rightCol} style={{ width: '100%' }}>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '100px',
              fontSize: '1.2rem',
              color: '#666',
              maxWidth: '1200px',
              margin: '100px auto 0 auto'
            }}>
              <div>🔄 Loading statistics...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.fullScreenTwoCol}>
        <Helmet>
          <title>Waypoint - Statistics</title>
        </Helmet>
        
        {/* Back button in top right */}
        <div className={styles.topRightScreenButton}>
          <button onClick={() => navigate('/dashboard')} className={styles.logoutButton}>
            ← Back to Dashboard
          </button>
        </div>
        
        {/* Quick actions on the left */}
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
        
        {/* Main content */}
        <div className={styles.columnsWrapper} style={{ width: '100%', marginTop: 0 }}>
          <div className={styles.rightCol} style={{ width: '100%' }}>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '100px',
              color: '#F05033',
              maxWidth: '1200px',
              margin: '100px auto 0 auto'
            }}>
              <div style={{ fontSize: '1.2rem', marginBottom: '20px' }}>
                ❌ Error loading statistics: {error}
              </div>
              <button 
                onClick={() => window.location.reload()} 
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#F39358', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '8px', 
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                🔄 Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!statisticsData) {
    return (
      <div className={styles.fullScreenTwoCol}>
        <Helmet>
          <title>Waypoint - Statistics</title>
        </Helmet>
        
        {/* Back button in top right */}
        <div className={styles.topRightScreenButton}>
          <button onClick={() => navigate('/dashboard')} className={styles.logoutButton}>
            ← Back to Dashboard
          </button>
        </div>
        
        {/* Quick actions on the left */}
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
        
        {/* Main content */}
        <div className={styles.columnsWrapper} style={{ width: '100%', marginTop: 0 }}>
          <div className={styles.rightCol} style={{ width: '100%' }}>
            <div style={{ 
              textAlign: 'center', 
              marginTop: '100px',
              fontSize: '1.2rem',
              color: '#666',
              maxWidth: '1200px',
              margin: '100px auto 0 auto'
            }}>
              <div>📊 No statistics data available</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Prepare analytics data from real statistics
  const analyticsData = [
    {
      title: 'Packages Delivered (Last 7 Days)',
      type: 'line',
      data: statisticsData.daily_deliveries,
    },
    {
      title: 'Truck Usage',
      type: 'bar',
      data: statisticsData.truck_usage_data,
    },
    {
      title: 'Package Status Distribution',
      type: 'pie',
      data: statisticsData.package_status_distribution,
    },
  ];

  return (
    <div className={styles.fullScreenTwoCol}>
      <Helmet>
        <title>Waypoint - Statistics</title>
        <style>{`
          @media (max-width: 1200px) {
            .stats-cards-grid {
              grid-template-columns: repeat(3, 1fr) !important;
              max-width: 900px !important;
            }
            .charts-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              max-width: 900px !important;
            }
          }
          @media (max-width: 768px) {
            .stats-cards-grid {
              grid-template-columns: repeat(2, 1fr) !important;
              max-width: 600px !important;
            }
            .charts-grid {
              grid-template-columns: 1fr !important;
              max-width: 400px !important;
            }
          }
          @media (max-width: 480px) {
            .stats-cards-grid {
              grid-template-columns: 1fr !important;
              max-width: 300px !important;
            }
          }
        `}</style>
      </Helmet>
      
      {/* Back button in top right */}
      <div className={styles.topRightScreenButton}>
        <button onClick={() => navigate('/dashboard')} className={styles.logoutButton}>
          ← Back to Dashboard
        </button>
      </div>
      
      {/* Quick actions on the left */}
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
      
      {/* Main content */}
      <div className={styles.columnsWrapper} style={{ width: '100%', marginTop: 0 }}>
        <div className={styles.rightCol} style={{ width: '100%' }}>
          {/* Header */}
          <div style={{
            marginBottom: '30px',
            textAlign: 'center',
            maxWidth: '1200px',
            margin: '0 auto 30px auto'
          }}>
            <h1 style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold', 
              color: '#333',
              margin: 0
            }}>
              📊 Statistics Dashboard
            </h1>
          </div>

      {/* Summary Statistics Cards */}
      <div className="stats-cards-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(6, 1fr)',
        gap: '20px',
        marginBottom: '40px',
        maxWidth: '1200px',
        margin: '0 auto 40px auto'
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F39358', marginBottom: '8px' }}>
            {statisticsData.package_stats.total}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Total Packages</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#4CAF50', marginBottom: '8px' }}>
            {statisticsData.package_stats.delivered}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Delivered</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#F05033', marginBottom: '8px' }}>
            {statisticsData.truck_stats.total}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Total Trucks</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2196F3', marginBottom: '8px' }}>
            {statisticsData.summary_stats.active_routes}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Active Routes</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#FF9800', marginBottom: '8px' }}>
            {statisticsData.summary_stats.total_drivers}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Total Drivers</div>
        </div>
        
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0',
          minWidth: '150px'
        }}>
          <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#9C27B0', marginBottom: '8px' }}>
            {statisticsData.summary_stats.unverified_drivers}
          </div>
          <div style={{ fontSize: '0.9rem', color: '#666', fontWeight: '500' }}>Pending Verification</div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '30px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {analyticsData.map((item, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0',
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '300px'
          }}>
            <h3 style={{
              fontSize: '1.2rem',
              fontWeight: '600',
              color: '#333',
              margin: '0 0 20px 0',
              textAlign: 'center'
            }}>
              {item.title}
            </h3>
            
            <div style={{ flex: 1, minHeight: '300px' }}>
              {item.type === 'line' && (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={item.data}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#F39358" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              )}
              {item.type === 'bar' && (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={item.data}>
                    <XAxis dataKey="truck" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="used" fill="#F05033" />
                  </BarChart>
                </ResponsiveContainer>
              )}
              {item.type === 'pie' && (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={item.data} 
                      dataKey="value" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={80} 
                      label
                    >
                      {item.data.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        ))}
      </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage; 