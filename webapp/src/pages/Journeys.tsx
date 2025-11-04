import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { routeAPI, userAPI, truckAPI, officeDeliveryAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Map, Marker, Source, Layer } from '@vis.gl/react-maplibre';
import { MapPin, Package, Truck as TruckIcon, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';

const Journeys = () => {
  const [routes, setRoutes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [trucks, setTrucks] = useState<any[]>([]);
  const [selectedDrivers, setSelectedDrivers] = useState<Set<string>>(new Set());
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showTruckModal, setShowTruckModal] = useState(false);
  const [assignedTrucks, setAssignedTrucks] = useState<Map<string, string>>(new Map());
  const [officeDeliveries, setOfficeDeliveries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      const route = routes.find((r) => r.routeID === selectedRoute);
      if (route) {
        fetchOfficeDeliveries(route.user);
      }
    }
  }, [selectedRoute, routes]);

  const fetchData = async () => {
    try {
      const [routesRes, usersRes, trucksRes] = await Promise.all([
        routeAPI.getAll(),
        userAPI.getAll(),
        truckAPI.getAvailable(),
      ]);

      setRoutes(routesRes.data);
      
      // Filter for drivers (non-managers, verified)
      const driverList = usersRes.data.filter(
        (user: any) => !user.isManager && user.verified
      );
      setDrivers(driverList);
      setTrucks(trucksRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficeDeliveries = async (driverUsername: string) => {
    try {
      const response = await officeDeliveryAPI.getUndeliveredByRoute(driverUsername);
      setOfficeDeliveries(response.data);
    } catch (error) {
      console.error('Failed to fetch office deliveries:', error);
      setOfficeDeliveries([]);
    }
  };

  const handleDriverToggle = (username: string) => {
    const newSelected = new Set(selectedDrivers);
    if (newSelected.has(username)) {
      newSelected.delete(username);
    } else {
      newSelected.add(username);
    }
    setSelectedDrivers(newSelected);
  };

  const handleTruckAssign = (truck: any) => {
    const unassignedDriver = Array.from(selectedDrivers).find(
      (username) => !assignedTrucks.has(username)
    );
    if (unassignedDriver) {
      const newMap = new Map(assignedTrucks);
      newMap.set(unassignedDriver, truck.licensePlate);
      setAssignedTrucks(newMap);
    }
  };

  const handleConfirmJourney = async () => {
    if (selectedDrivers.size === 0) {
      toast.error('Please select at least one driver');
      return;
    }

    if (assignedTrucks.size !== selectedDrivers.size) {
      toast.error('All drivers must have trucks assigned');
      return;
    }

    try {
      // Plan routes
      const planResponse = await routeAPI.plan({
        selected_drivers: Array.from(selectedDrivers),
      });

      // Assign trucks
      for (const [username, licensePlate] of assignedTrucks) {
        await routeAPI.assign({ username, licensePlate });
      }

      toast.success('Journey started successfully!');
      setSelectedDrivers(new Set());
      setAssignedTrucks(new Map());
      setShowTruckModal(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to start journey');
    }
  };

  // Filter drivers by search and exclude those with active routes
  const availableDrivers = useMemo(() => {
    const activeDriverUsernames = new Set(
      routes.filter((r) => r.status === 'active').map((r) => r.user)
    );

    return drivers.filter(
      (driver) =>
        !activeDriverUsernames.has(driver.username) &&
        (driver.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          driver.email.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [drivers, searchTerm, routes]);

  // Generate color for route
  const stringToColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 50%)`;
  };

  // Get all packages from active routes
  const allPackages = useMemo(() => {
    const activeRoutes = routes.filter((r) => r.status === 'active');
    const packages: any[] = [];
    activeRoutes.forEach((route) => {
      if (route.packageSequence) {
        route.packageSequence.forEach((pkg: any) => {
          packages.push({ ...pkg, routeID: route.routeID, driver: route.user });
        });
      }
    });
    return packages;
  }, [routes]);

  // Get selected route data
  const selectedRouteData = useMemo(() => {
    if (!selectedRoute) return null;
    return routes.find((r) => r.routeID === selectedRoute);
  }, [selectedRoute, routes]);

  // Calculate map bounds
  const mapBounds = useMemo(() => {
    if (allPackages.length === 0) return null;
    
    const lats = allPackages.map((p) => parseFloat(p.latitude));
    const lngs = allPackages.map((p) => parseFloat(p.longitude));
    
    return {
      minLng: Math.min(...lngs),
      maxLng: Math.max(...lngs),
      minLat: Math.min(...lats),
      maxLat: Math.max(...lats),
    };
  }, [allPackages]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading journeys...</div>
      </div>
    );
  }

  const activeRoutes = routes.filter((r) => r.status === 'active');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Journey Management</h1>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Trucks</p>
                <p className="text-2xl font-bold">{trucks.length}</p>
              </div>
              <TruckIcon className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Routes</p>
                <p className="text-2xl font-bold">{activeRoutes.length}</p>
              </div>
              <MapPin className="h-8 w-8 text-active" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Packages</p>
                <p className="text-2xl font-bold">{allPackages.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Driver Selection Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Select Drivers</CardTitle>
            <CardDescription>
              Choose drivers for new journey
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Search drivers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {availableDrivers.map((driver) => (
                  <div
                    key={driver.username}
                    className={`p-3 rounded-lg border cursor-pointer transition-smooth ${
                      selectedDrivers.has(driver.username)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:shadow-soft'
                    }`}
                    onClick={() => handleDriverToggle(driver.username)}
                  >
                    <p className="font-semibold">{driver.username}</p>
                    <p className="text-sm text-muted-foreground">{driver.email}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
            {selectedDrivers.size > 0 && (
              <Button
                className="w-full gradient-primary text-white"
                onClick={() => setShowTruckModal(true)}
              >
                Assign Trucks ({selectedDrivers.size})
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Map View */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Routes</CardTitle>
            <CardDescription>View routes on map</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <Map
                mapStyle="https://demotiles.maplibre.org/style.json"
                style={{ width: '100%', height: '100%' }}
                initialViewState={
                  mapBounds
                    ? {
                        bounds: [
                          [mapBounds.minLng, mapBounds.minLat],
                          [mapBounds.maxLng, mapBounds.maxLat],
                        ],
                      }
                    : undefined
                }
              >
                {/* Render routes */}
                {activeRoutes.map((route) => {
                  if (!route.mapRoute || route.mapRoute.length === 0) return null;
                  
                  const routeColor = stringToColor(route.user);
                  const routeGeoJson = {
                    type: 'Feature' as const,
                    geometry: {
                      type: 'LineString' as const,
                      coordinates: route.mapRoute,
                    },
                  };

                  return (
                    <Source
                      key={route.routeID}
                      id={`route-${route.routeID}`}
                      type="geojson"
                      data={routeGeoJson}
                    >
                      <Layer
                        id={`route-layer-${route.routeID}`}
                        type="line"
                        paint={{
                          'line-color':
                            selectedRoute === route.routeID
                              ? '#FF4136'
                              : routeColor,
                          'line-width': selectedRoute === route.routeID ? 6 : 4,
                        }}
                      />
                    </Source>
                  );
                })}

                {/* Render package markers */}
                {allPackages.map((pkg) => (
                  <Marker
                    key={pkg.packageID}
                    longitude={parseFloat(pkg.longitude)}
                    latitude={parseFloat(pkg.latitude)}
                  >
                    <div className="relative">
                      <div
                        className={`rounded-full p-2 text-white text-xs font-bold ${
                          pkg.isDelivered
                            ? 'bg-success'
                            : selectedRouteData?.packageSequence?.some(
                                (p: any) => p.packageID === pkg.packageID
                              )
                            ? 'bg-destructive'
                            : 'bg-primary'
                        }`}
                      >
                        {pkg.isDelivered ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </Marker>
                ))}
              </Map>
            </div>

            {/* Active Routes List */}
            <div className="mt-4 space-y-2">
              <ScrollArea className="h-32">
                {activeRoutes.map((route) => (
                  <div
                    key={route.routeID}
                    className={`p-3 rounded-lg border cursor-pointer transition-smooth ${
                      selectedRoute === route.routeID
                        ? 'bg-primary/10 border-primary'
                        : 'hover:shadow-soft'
                    }`}
                    onClick={() => setSelectedRoute(route.routeID)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{route.user}</p>
                        <p className="text-sm text-muted-foreground">
                          {route.packageSequence?.length || 0} packages
                        </p>
                      </div>
                      <Badge
                        variant={
                          route.status === 'active' ? 'success' : 'default'
                        }
                      >
                        {route.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>
          </CardContent>
        </Card>

        {/* Office Deliveries Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Office Deliveries</CardTitle>
            <CardDescription>
              {selectedRoute ? 'Packages by office' : 'Select a route'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px]">
              {!selectedRoute ? (
                <p className="text-center text-muted-foreground py-8">
                  Select a route to view office deliveries
                </p>
              ) : officeDeliveries.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No office deliveries for this route
                </p>
              ) : (
                <div className="space-y-2">
                  {officeDeliveries.map((office) => (
                    <Collapsible key={office.office.id}>
                      <CollapsibleTrigger className="w-full">
                        <div className="p-3 rounded-lg border flex justify-between items-center hover:shadow-soft transition-smooth w-full">
                          <div>
                            <p className="font-semibold">{office.office.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {office.office.address}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge>{office.packages.length}</Badge>
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="pl-3 pt-2 space-y-2">
                          {office.packages.map((pkg: any) => (
                            <div
                              key={pkg.packageID}
                              className="p-2 rounded border bg-muted/50"
                            >
                              <p className="text-sm font-medium">{pkg.recipient}</p>
                              <p className="text-xs text-muted-foreground">
                                {pkg.weight} kg
                              </p>
                            </div>
                          ))}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Truck Assignment Modal */}
      <Dialog open={showTruckModal} onOpenChange={setShowTruckModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Assign Trucks to Drivers</DialogTitle>
            <DialogDescription>
              Assign available trucks to selected drivers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {Array.from(selectedDrivers).map((username) => {
              const driver = drivers.find((d) => d.username === username);
              const assignedTruck = assignedTrucks.get(username);
              return (
                <div
                  key={username}
                  className="p-4 rounded-lg border flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{driver?.username}</p>
                    <p className="text-sm text-muted-foreground">
                      {driver?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {assignedTruck ? (
                      <Badge variant="success">{assignedTruck}</Badge>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        No truck assigned
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {trucks.map((truck) => (
                <Button
                  key={truck.licensePlate}
                  variant="outline"
                  onClick={() => handleTruckAssign(truck)}
                  disabled={Array.from(assignedTrucks.values()).includes(
                    truck.licensePlate
                  )}
                >
                  {truck.licensePlate} ({truck.kilogramCapacity} kg)
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowTruckModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="gradient-primary text-white"
              onClick={handleConfirmJourney}
              disabled={
                assignedTrucks.size !== selectedDrivers.size ||
                selectedDrivers.size === 0
              }
            >
              Start Journey
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journeys;

