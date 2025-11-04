import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { logout, getUser } from '@/lib/auth';
import {
  packageAPI,
  truckAPI,
  deliveryHistoryAPI,
  truckersAPI,
  statisticsAPI,
  routeAPI,
} from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import QuickActions from '@/components/QuickActions';
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
  MapPin,
  Package,
  Truck,
  UserCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUser();
  const [stats, setStats] = useState({
    activeJourneys: 0,
    todayPackages: 0,
    availableTrucks: 0,
    pendingVerifications: 0,
  });
  const [currentChart, setCurrentChart] = useState(0);
  const [chartData, setChartData] = useState({
    dailyDeliveries: [] as any[],
    truckUsage: [] as any[],
    packageDistribution: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentChart((prev) => (prev + 1) % 3);
    }, 7500);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [
        packagesRes,
        trucksRes,
        historyRes,
        truckersRes,
        routesRes,
        statsRes,
      ] = await Promise.all([
        packageAPI.getTodayPending(),
        truckAPI.getAvailable(),
        deliveryHistoryAPI.get(7),
        truckersAPI.getUnverified(),
        routeAPI.getAll(),
        statisticsAPI.get(),
      ]);

      const activeRoutes = routesRes.data.filter(
        (route: any) => route.status === 'active'
      ).length;

      setStats({
        activeJourneys: activeRoutes,
        todayPackages: packagesRes.data.length,
        availableTrucks: trucksRes.data.length,
        pendingVerifications: truckersRes.data.length,
      });

      // Process chart data
      const dailyData = historyRes.data.map((item: any) => ({
        day: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
        value: item.delivered_count || 0,
      }));

      const truckData = statsRes.data.truck_usage_data || [];
      const packageData = statsRes.data.package_status_distribution || [];

      setChartData({
        dailyDeliveries: dailyData,
        truckUsage: truckData,
        packageDistribution: packageData,
      });
    } catch (error) {
      toast.error('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const summaryCards = [
    {
      title: 'Active Journeys',
      value: stats.activeJourneys,
      icon: MapPin,
      color: 'text-active',
      onClick: () => navigate('/journeys'),
    },
    {
      title: "Today's Packages",
      value: stats.todayPackages,
      icon: Package,
      color: 'text-primary',
      onClick: () => navigate('/packages'),
    },
    {
      title: 'Available Trucks',
      value: stats.availableTrucks,
      icon: Truck,
      color: 'text-success',
      onClick: () => navigate('/trucks'),
    },
    {
      title: 'Pending Verifications',
      value: stats.pendingVerifications,
      icon: UserCheck,
      color: 'text-warning',
      onClick: () => navigate('/verifyusers'),
    },
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--info))'];

  const renderChart = () => {
    switch (currentChart) {
      case 0:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.dailyDeliveries}>
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
        );
      case 1:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.truckUsage}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="truck" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="used" fill="hsl(var(--primary))" />
              <Bar dataKey="capacity" fill="hsl(var(--muted))" />
            </BarChart>
          </ResponsiveContainer>
        );
      case 2:
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData.packageDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.packageDistribution.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Welcome back, {user?.firstName || user?.username}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Here's what's happening with your logistics operations
          </p>
        </div>
        <Button variant="outline" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="cursor-pointer hover:shadow-medium transition-smooth"
              onClick={card.onClick}
            >
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

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Access frequently used features</CardDescription>
        </CardHeader>
        <CardContent>
          <QuickActions />
        </CardContent>
      </Card>

      {/* Analytics Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Analytics Overview
              </CardTitle>
              <CardDescription>
                {currentChart === 0 && 'Daily Deliveries (Last 7 Days)'}
                {currentChart === 1 && 'Truck Usage'}
                {currentChart === 2 && 'Package Status Distribution'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentChart((prev) => (prev - 1 + 3) % 3)
                }
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate('/statistics')}
              >
                View All
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentChart((prev) => (prev + 1) % 3)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>{renderChart()}</CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

