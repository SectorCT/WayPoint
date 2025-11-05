import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { packageAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Map as MapLibreMap, Marker } from '@vis.gl/react-maplibre';
import { Package as PackageIcon, MapPin } from 'lucide-react';

const Packages = () => {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewPackage, setPreviewPackage] = useState<any>(null);
  const [formData, setFormData] = useState({
    address: '',
    recipient: '',
    recipientPhoneNumber: '',
    deliveryDate: '',
    weight: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await packageAPI.getAll();
      setPackages(response.data);
    } catch (error) {
      toast.error('Failed to fetch packages');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = async (e: any) => {
    const { lng, lat } = e.lngLat;
    setFormData({
      ...formData,
      latitude: lat.toString(),
      longitude: lng.toString(),
    });

    // Reverse geocoding
    const GEOAPIFY_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
    if (GEOAPIFY_KEY) {
      try {
        const response = await fetch(
          `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lng}&apiKey=${GEOAPIFY_KEY}`
        );
        const data = await response.json();
        const address =
          data.features[0]?.properties?.formatted || `${lat}, ${lng}`;
        setFormData((prev) => ({ ...prev, address }));
      } catch (error) {
        setFormData((prev) => ({
          ...prev,
          address: `${lat}, ${lng}`,
        }));
      }
    } else {
      setFormData((prev) => ({ ...prev, address: `${lat}, ${lng}` }));
    }

    setShowMapPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await packageAPI.create({
        ...formData,
        weight: parseFloat(formData.weight),
      });
      toast.success('Package created successfully!');
      setFormData({
        address: '',
        recipient: '',
        recipientPhoneNumber: '',
        deliveryDate: '',
        weight: '',
        latitude: '',
        longitude: '',
      });
      fetchPackages();
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || 'Failed to create package'
      );
    }
  };

  // Group packages by date
  const groupedPackages = packages.reduce((acc, pkg) => {
    const date = pkg.deliveryDate || 'Unknown';
    const today = new Date().toISOString().split('T')[0];
    const groupKey = date === today ? 'Today' : date;

    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(pkg);
    return acc;
  }, {} as Record<string, any[]>);

  const sortedGroups = Object.entries(groupedPackages).sort(([a], [b]) => {
    if (a === 'Today') return -1;
    if (b === 'Today') return 1;
    return b.localeCompare(a);
  });

  const openPreview = (pkg: any) => {
    setPreviewPackage(pkg);
    setShowPreview(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading packages...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Package Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Package Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Package</CardTitle>
            <CardDescription>Add a new package to the delivery system</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Select location on map"
                    required
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowMapPicker(true)}
                  >
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="recipient">Recipient Name</Label>
                  <Input
                    id="recipient"
                    value={formData.recipient}
                    onChange={(e) =>
                      setFormData({ ...formData, recipient: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="recipientPhoneNumber">Phone Number</Label>
                  <Input
                    id="recipientPhoneNumber"
                    value={formData.recipientPhoneNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recipientPhoneNumber: e.target.value,
                      })
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="deliveryDate">Delivery Date</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) =>
                      setFormData({ ...formData, deliveryDate: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) =>
                      setFormData({ ...formData, weight: e.target.value })
                    }
                    required
                    min="0.1"
                  />
                </div>
              </div>

              <Button type="submit" className="w-full gradient-primary text-white">
                Create Package
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Package List */}
        <Card>
          <CardHeader>
            <CardTitle>All Packages</CardTitle>
            <CardDescription>{packages.length} packages total</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 max-h-[600px] overflow-y-auto">
              {sortedGroups.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No packages created yet
                </p>
              ) : (
                sortedGroups.map(([date, pkgs]) => (
                  <div key={date}>
                    <h3 className="font-semibold mb-3 text-lg">{date}</h3>
                    <div className="space-y-2">
                      {pkgs.map((pkg) => (
                        <div
                          key={pkg.packageID}
                          className="p-4 rounded-lg border hover:shadow-soft transition-smooth cursor-pointer"
                          onClick={() => openPreview(pkg)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3 flex-1">
                              <div className="rounded-full bg-primary/10 p-2">
                                <PackageIcon className="h-5 w-5 text-primary" />
                              </div>
                              <div className="flex-1">
                                <p className="font-semibold">{pkg.recipient}</p>
                                <p className="text-sm text-muted-foreground">
                                  {pkg.address}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {pkg.weight} kg
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                pkg.status === 'delivered'
                                  ? 'success'
                                  : pkg.status === 'in_transit'
                                  ? 'info'
                                  : 'default'
                              }
                            >
                              {pkg.status || 'pending'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map Picker Dialog */}
      <Dialog open={showMapPicker} onOpenChange={setShowMapPicker}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>Select Package Location</DialogTitle>
          </DialogHeader>
          <div className="h-full">
            <MapLibreMap
              mapStyle="https://demotiles.maplibre.org/style.json"
              style={{ width: '100%', height: '100%' }}
              onClick={handleMapClick}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Package Details</DialogTitle>
          </DialogHeader>
          {previewPackage && (
            <div className="space-y-4">
              <div>
                <Label>Recipient</Label>
                <p className="font-semibold">{previewPackage.recipient}</p>
              </div>
              <div>
                <Label>Address</Label>
                <p>{previewPackage.address}</p>
              </div>
              <div>
                <Label>Weight</Label>
                <p>{previewPackage.weight} kg</p>
              </div>
              <div className="h-64">
                <MapLibreMap
                  mapStyle="https://demotiles.maplibre.org/style.json"
                  style={{ width: '100%', height: '100%' }}
                  initialViewState={{
                    longitude: parseFloat(previewPackage.longitude),
                    latitude: parseFloat(previewPackage.latitude),
                    zoom: 14,
                  }}
                >
                  <Marker
                    longitude={parseFloat(previewPackage.longitude)}
                    latitude={parseFloat(previewPackage.latitude)}
                  >
                    <div className="bg-primary text-white p-2 rounded-full">
                      <MapPin className="h-4 w-4" />
                    </div>
                  </Marker>
                </MapLibreMap>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Packages;

