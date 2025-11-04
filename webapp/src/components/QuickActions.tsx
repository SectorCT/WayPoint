import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Package, Truck, MapPin, UserCheck, BarChart3 } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Manage Journeys',
      icon: MapPin,
      route: '/journeys',
      color: 'text-active',
    },
    {
      label: 'Create Package',
      icon: Package,
      route: '/packages',
      color: 'text-primary',
    },
    {
      label: 'Add Truck',
      icon: Truck,
      route: '/trucks',
      color: 'text-success',
    },
    {
      label: 'Verify Users',
      icon: UserCheck,
      route: '/verifyusers',
      color: 'text-warning',
    },
    {
      label: 'View Statistics',
      icon: BarChart3,
      route: '/statistics',
      color: 'text-info',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Button
            key={action.route}
            variant="outline"
            onClick={() => navigate(action.route)}
            className="flex flex-col items-center gap-2 h-auto py-4 hover:shadow-soft transition-smooth"
          >
            <Icon className={`h-5 w-5 ${action.color}`} />
            <span className="text-xs font-medium">{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
};

export default QuickActions;

