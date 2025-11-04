import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { statisticsAPI } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  Package,
  CheckCircle,
  Truck,
  MapPin,
  Users,
  UserCheck,
} from 'lucide-react';

const Statistics = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const response = await statisticsAPI.get();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading statistics...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">No statistics available</div>
      </div>
    );
  }

  const summaryCards = [
    {
      title: 'Total Packages',
      value: stats.package_stats?.total || 0,
      icon: Package,
      color: 'text-primary',
    },
    {
      title: 'Delivered Packages',
      value: stats.package_stats?.delivered || 0,
      icon: CheckCircle,
      color: 'text-success',
    },
    {
      title: 'Total Trucks',
      value: stats.truck_stats?.total || 0,
      icon: Truck,
      color: 'text-info',
    },
    {
      title: 'Active Routes',
      value: stats.summary_stats?.active_routes || 0,
      icon: MapPin,
      color: 'text-active',
    },
    {
      title: 'Total Drivers',
      value: stats.summary_stats?.total_drivers || 0,
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Pending Verifications',
      value: stats.summary_stats?.unverified_drivers || 0,
      icon: UserCheck,
      color: 'text-warning',
    },
  ];

  const COLORS = [
    'hsl(var(--primary))',
    'hsl(var(--success))',
    'hsl(var(--warning))',
    'hsl(var(--info))',
    'hsl(var(--active))',
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Statistics & Analytics</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.title}</p>
                    <p className="text-3xl font-bold mt-2">{card.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${card.color}`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Deliveries Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Deliveries</CardTitle>
            <CardDescription>Last 7 days delivery performance</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.daily_deliveries || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Truck Usage Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Truck Usage</CardTitle>
            <CardDescription>Capacity utilization by truck</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.truck_usage_data || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="truck" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="used" fill="hsl(var(--primary))" />
                <Bar dataKey="capacity" fill="hsl(var(--muted))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Package Status Distribution Pie Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Package Status Distribution</CardTitle>
            <CardDescription>Current status of all packages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.package_status_distribution || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {(stats.package_status_distribution || []).map(
                    (entry: any, index: number) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    )
                  )}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Statistics;

