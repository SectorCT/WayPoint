import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { truckAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck as TruckIcon, ArrowLeft } from 'lucide-react';

const Trucks = () => {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    licensePlate: '',
    kilogramCapacity: '',
  });

  useEffect(() => {
    fetchTrucks();
  }, []);

  const fetchTrucks = async () => {
    try {
      const response = await truckAPI.getAll();
      setTrucks(response.data);
    } catch (error) {
      toast.error('Failed to fetch trucks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await truckAPI.create(formData);
      toast.success('Truck created successfully!');
      setFormData({ licensePlate: '', kilogramCapacity: '' });
      fetchTrucks();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create truck');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading trucks...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Truck Management</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Truck Form */}
        <Card>
          <CardHeader>
            <CardTitle>Add New Truck</CardTitle>
            <CardDescription>Register a new truck in the fleet</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="licensePlate">License Plate</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) =>
                    setFormData({ ...formData, licensePlate: e.target.value })
                  }
                  placeholder="ABC-123"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kilogramCapacity">Capacity (kg)</Label>
                <Input
                  id="kilogramCapacity"
                  type="number"
                  value={formData.kilogramCapacity}
                  onChange={(e) =>
                    setFormData({ ...formData, kilogramCapacity: e.target.value })
                  }
                  placeholder="1000"
                  required
                  min="1"
                />
              </div>
              <Button type="submit" className="w-full gradient-primary text-white">
                Create Truck
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Truck List */}
        <Card>
          <CardHeader>
            <CardTitle>Truck Fleet</CardTitle>
            <CardDescription>{trucks.length} trucks registered</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {trucks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No trucks registered yet
                </p>
              ) : (
                trucks.map((truck) => (
                  <div
                    key={truck.licensePlate}
                    className="p-4 rounded-lg border flex justify-between items-start hover:shadow-soft transition-smooth"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-full bg-primary/10 p-2">
                        <TruckIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{truck.licensePlate}</p>
                        <p className="text-sm text-muted-foreground">
                          Capacity: {truck.kilogramCapacity} kg
                        </p>
                      </div>
                    </div>
                    <Badge variant={truck.isUsed ? 'default' : 'success'}>
                      {truck.isUsed ? 'In Use' : 'Available'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Trucks;

