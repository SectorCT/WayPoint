import React from 'react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
import styles from './Dashboard.module.css';
import { quickActions } from './Dashboard';

const analyticsData = [
  {
    title: 'Packages Delivered (Last 7 Days)',
    type: 'line',
    data: [
      { day: 'Mon', value: 12 },
      { day: 'Tue', value: 18 },
      { day: 'Wed', value: 9 },
      { day: 'Thu', value: 15 },
      { day: 'Fri', value: 20 },
      { day: 'Sat', value: 7 },
      { day: 'Sun', value: 14 },
    ],
  },
  {
    title: 'Truck Usage',
    type: 'bar',
    data: [
      { truck: 'A', used: 8 },
      { truck: 'B', used: 5 },
      { truck: 'C', used: 12 },
      { truck: 'D', used: 3 },
    ],
  },
  {
    title: 'Package Status Distribution',
    type: 'pie',
    data: [
      { name: 'Delivered', value: 60 },
      { name: 'In Transit', value: 25 },
      { name: 'Pending', value: 15 },
    ],
  },
];

const COLORS = ['#F39358', '#F05033', '#B2B2B2'];

const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className={styles.fullScreenTwoCol}>
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
      {/* Main content: charts grid and back button */}
      <div className={styles.columnsWrapper} style={{ width: '100%', marginTop: 0 }}>
        <div className={styles.rightCol} style={{ width: '100%' }}>
          <div className={styles.topRightScreenButton}>
            <button onClick={() => navigate('/dashboard')} className={styles.logoutButton}>
              ← Back to Dashboard
            </button>
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
            gap: '48px',
            width: '100%',
            maxWidth: 1200,
            margin: '0 auto',
            marginTop: 32,
          }}>
            {analyticsData.map((item, idx) => (
              <div key={idx} className={styles.card} style={{ alignItems: 'center', minWidth: 320, maxWidth: 500, width: '100%' }}>
                <div className={styles.analyticsTitle}>{item.title}</div>
                {item.type === 'line' && (
                  <ResponsiveContainer width="95%" height={300}>
                    <LineChart data={item.data}>
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="value" stroke="#F39358" strokeWidth={3} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
                {item.type === 'bar' && (
                  <ResponsiveContainer width="95%" height={300}>
                    <BarChart data={item.data}>
                      <XAxis dataKey="truck" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="used" fill="#F05033" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {item.type === 'pie' && (
                  <ResponsiveContainer width="95%" height={300}>
                    <PieChart>
                      <Pie data={item.data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatisticsPage; 