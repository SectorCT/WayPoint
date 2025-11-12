import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { routeAPI, userAPI, truckAPI, officeDeliveryAPI, packageAPI } from '@/lib/api';
import { useNavigate } from 'react-router-dom';
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
import { Map as MapLibreMap, Marker, Source, Layer } from '@vis.gl/react-maplibre';
import { MapPin, Package, Truck as TruckIcon, ChevronDown, ChevronUp, CheckCircle, ArrowLeft } from 'lucide-react';

const Journeys = () => {
  const navigate = useNavigate();
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
  const [startingJourney, setStartingJourney] = useState(false);
  const [availablePackagesCount, setAvailablePackagesCount] = useState<number>(0);

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
      const [routesRes, usersRes, trucksRes, packagesRes] = await Promise.all([
        routeAPI.getAll(),
        userAPI.getAll(),
        truckAPI.getAvailable(),
        packageAPI.getTodayPending().catch(() => ({ data: [] })), // Don't fail if this errors
      ]);

      setRoutes(routesRes.data);
      
      // Filter for drivers (non-managers, verified)
      const driverList = usersRes.data.filter(
        (user: any) => !user.isManager && user.verified
      );
      setDrivers(driverList);
      setTrucks(trucksRes.data);
      setAvailablePackagesCount(packagesRes.data?.length || 0);
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
    // Prevent multiple simultaneous calls
    if (startingJourney) {
      console.warn('Journey start already in progress, ignoring duplicate call');
      return;
    }

    if (selectedDrivers.size === 0) {
      toast.error('Please select at least one driver');
      return;
    }

    if (assignedTrucks.size !== selectedDrivers.size) {
      toast.error('All drivers must have trucks assigned');
      return;
    }

    setStartingJourney(true);
    try {
      toast.loading('Planning routes...', { id: 'journey-start' });
      
      // Plan routes - API expects "drivers" not "selected_drivers"
      let planResponse;
      try {
        planResponse = await routeAPI.plan({
          drivers: Array.from(selectedDrivers),
        });
      } catch (planError: any) {
        // Handle specific error from plan endpoint
        const errorMsg = planError.response?.data?.error || planError.message;
        if (errorMsg?.includes('No packages available')) {
          toast.error(
            'No packages available. Packages may have already been assigned, or there are no pending packages with delivery date today or earlier. Please refresh the page and check the Packages page.', 
            { id: 'journey-start', duration: 6000 }
          );
          // Refresh data to show current state
          await fetchData();
        } else {
          throw planError; // Re-throw to be handled by outer catch
        }
        setStartingJourney(false);
        return;
      }

      const plannedRoutes = planResponse.data || [];
      
      if (plannedRoutes.length === 0) {
        toast.error(
          'No routes were planned. Make sure you have packages with status "pending" and delivery date today or earlier.', 
          { id: 'journey-start', duration: 5000 }
        );
        setStartingJourney(false);
        // Refresh data to show current state
        await fetchData();
        return;
      }

      // Log the response structure for debugging
      console.log('Planned routes response:', plannedRoutes);

      toast.loading('Assigning trucks and starting journeys...', { id: 'journey-start' });

      // Refresh truck availability before assignment
      let refreshedTrucks: any[] = [];
      try {
        const refreshedTrucksRes = await truckAPI.getAvailable();
        refreshedTrucks = refreshedTrucksRes.data;
      } catch (error) {
        console.warn('Failed to refresh truck list, proceeding with cached data');
      }

      // Check if assigned trucks are still available
      const unavailableTrucks: string[] = [];
      for (const [username, licensePlate] of assignedTrucks) {
        const truck = refreshedTrucks.find((t: any) => t.licensePlate === licensePlate);
        if (!truck || truck.isUsed) {
          unavailableTrucks.push(licensePlate);
        }
      }

      if (unavailableTrucks.length > 0) {
        toast.error(
          `Truck(s) ${unavailableTrucks.join(', ')} are no longer available. Please refresh and select different trucks.`, 
          { id: 'journey-start', duration: 6000 }
        );
        setStartingJourney(false);
        // Refresh data to update truck status
        await fetchData();
        return;
      }

      // Assign trucks and start journeys using the planned route data
      const assignmentPromises = [];
      
      for (const [username, licensePlate] of assignedTrucks) {
        // Find the planned route for this driver
        // The API returns "user" field, not "driverUsername"
        const plannedRoute = plannedRoutes.find((route: any) => 
          String(route.user || route.driverUsername || '').trim() === String(username).trim()
        );

        if (!plannedRoute) {
          console.warn(`No planned route found for driver: ${username}. Available routes:`, plannedRoutes.map((r: any) => r.user || r.driverUsername));
          continue;
        }

        // The API response already contains packageSequence and mapRoute in the correct format
        // Response structure: { user, packageSequence, mapRoute, truck, routeID, dateOfCreation }
        const packageSequence = plannedRoute.packageSequence || [];
        const mapRoute = plannedRoute.mapRoute || [];

        // Validate that we have the required data
        if (!packageSequence || packageSequence.length === 0) {
          console.error(`No package sequence found for driver ${username}:`, plannedRoute);
          toast.error(`No packages in route for ${username}`, { id: 'journey-start' });
          continue;
        }

        if (!mapRoute || mapRoute.length === 0) {
          console.error(`No map route found for driver ${username}:`, plannedRoute);
          toast.error(`No map route for ${username}`, { id: 'journey-start' });
          continue;
        }

        console.log(`Assigning truck ${licensePlate} to driver ${username} with ${packageSequence.length} packages`);
        console.log('Package sequence:', JSON.stringify(packageSequence, null, 2));
        console.log('Map route length:', mapRoute.length);

        // Call assign with the full route data
        assignmentPromises.push(
          routeAPI.assign({
            driverUsername: username,
            truckLicensePlate: licensePlate,
            packageSequence: packageSequence,
            mapRoute: mapRoute,
          }).catch((error: any) => {
            console.error(`Failed to assign truck to ${username}:`, error.response?.data || error.message);
            throw error;
          })
        );
      }

      // Wait for all assignments to complete, but handle individual failures
      if (assignmentPromises.length === 0) {
        toast.error('No routes to assign. Please check the planned routes.', { id: 'journey-start' });
        setStartingJourney(false);
        return;
      }

      const results = await Promise.allSettled(assignmentPromises);
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      if (failed > 0) {
        const rejectedReasons = results
          .filter(r => r.status === 'rejected')
          .map(r => {
            if (r.status === 'rejected') {
              const reason = r.reason;
              if (reason?.response?.data?.error) {
                const errorMsg = reason.response.data.error;
                // If truck is already in use, suggest refreshing
                if (errorMsg.includes('already in use')) {
                  return `${errorMsg} Please refresh the page and try again.`;
                }
                return errorMsg;
              } else if (reason?.message) {
                return reason.message;
              }
              return 'Unknown error';
            }
            return '';
          });
        
        console.error('Some assignments failed:', results.filter(r => r.status === 'rejected'));
        console.error('Rejection reasons:', rejectedReasons);
        
        if (successful > 0) {
          toast.warning(
            `${successful} journey(s) started, but ${failed} failed. ${rejectedReasons[0] || ''}`, 
            { id: 'journey-start', duration: 5000 }
          );
        } else {
          const failureReason = rejectedReasons[0] || 'Check console for details';
          toast.error(
            `All assignments failed. ${failureReason}`, 
            { id: 'journey-start', duration: 6000 }
          );
          // Refresh data to update truck status
          await fetchData();
          setStartingJourney(false);
          return;
        }
      } else {
        toast.success(`${successful} journey(s) started successfully!`, { id: 'journey-start' });
      }

      setSelectedDrivers(new Set());
      setAssignedTrucks(new Map());
      setShowTruckModal(false);
      
      // Refresh data to show the new routes - wait a bit for backend to process
      await new Promise(resolve => setTimeout(resolve, 500));
      await fetchData();
    } catch (error: any) {
      // Show more detailed error message
      let errorMessage = 'Failed to start journey';
      let errorDetails = '';
      
      if (error.response) {
        // Try to parse JSON error response
        try {
          const errorData = error.response.data;
          if (typeof errorData === 'string' && errorData.includes('<!DOCTYPE')) {
            // HTML error page - extract meaningful message
            if (errorData.includes('RuntimeError')) {
              errorMessage = 'Server error occurred. Please check server logs.';
            } else {
              errorMessage = 'Server error occurred.';
            }
          } else if (errorData?.error) {
            errorMessage = errorData.error;
            
            // Add helpful context for common errors
            if (errorMessage.includes('No packages available')) {
              errorDetails = `Packages must have status "pending" and delivery date today or earlier. Currently ${availablePackagesCount} package(s) available. Go to Packages page to create packages.`;
            } else if (errorMessage.includes('No valid drivers')) {
              errorDetails = 'Please select at least one verified driver.';
            } else if (errorMessage.includes('No available truck')) {
              errorDetails = 'Make sure there are available trucks with sufficient capacity.';
            }
          } else if (errorData?.message) {
            errorMessage = errorData.message;
          } else if (typeof errorData === 'string') {
            errorMessage = errorData;
          }
        } catch (parseError) {
          // If response is HTML or other non-JSON, use default message
          errorMessage = error.response.status === 500 
            ? 'Server error occurred. Please try again later.'
            : 'Failed to start journey';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      // Show error with details if available
      if (errorDetails) {
        toast.error(`${errorMessage}. ${errorDetails}`, { 
          id: 'journey-start', 
          duration: 6000 
        });
      } else {
        toast.error(errorMessage, { id: 'journey-start' });
      }
      
      console.error('Journey start error:', error.response?.data || error);
    } finally {
      setStartingJourney(false);
    }
  };

  // Filter drivers by search and exclude those with active routes
  const availableDrivers = useMemo(() => {
    // Get all active route driver usernames (use same logic as activeRoutes)
    const activeDriverUsernames = new Set(
      routes
        .filter((r) => {
          // If status field exists and is not 'active', exclude it
          if (r.hasOwnProperty('status') && r.status && r.status !== 'active') return false;
          // If isActive field exists and is false, exclude it
          if (r.hasOwnProperty('isActive') && r.isActive === false) return false;
          // Otherwise, include it (API already filters for active routes)
          return true;
        })
        .map((r) => r.user)
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
    // Use same filtering logic as activeRoutes
    const activeRoutes = routes.filter((r) => {
      // If status field exists and is not 'active', exclude it
      if (r.hasOwnProperty('status') && r.status && r.status !== 'active') return false;
      // If isActive field exists and is false, exclude it
      if (r.hasOwnProperty('isActive') && r.isActive === false) return false;
      // Otherwise, include it (API already filters for active routes)
      return true;
    });
    
    const packages: any[] = [];
    activeRoutes.forEach((route) => {
      if (route.packageSequence && Array.isArray(route.packageSequence)) {
        route.packageSequence.forEach((pkg: any, index: number) => {
          // Only include packages that have valid coordinates
          // Check both number and string formats
          const lat = pkg.latitude != null ? parseFloat(pkg.latitude) : null;
          const lng = pkg.longitude != null ? parseFloat(pkg.longitude) : null;
          
          if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
            packages.push({ 
              ...pkg, 
              routeID: route.routeID, 
              driver: route.user,
              sequenceIndex: index, // Store the index in the sequence
              latitude: lat, // Ensure it's a number
              longitude: lng // Ensure it's a number
            });
          }
        });
      }
    });
    
    // Debug: log packages found
    if (packages.length > 0) {
      console.log('Packages found for map:', packages.length, packages.slice(0, 3));
    }
    
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

  // The API endpoint /route/all/ already filters for active routes (isActive=True and dateOfCreation=today)
  // So all routes returned should be considered active
  // However, we still check for status/isActive fields if they exist for robustness
  const activeRoutes = routes.filter((r) => {
    // If status field exists and is not 'active', exclude it
    if (r.hasOwnProperty('status') && r.status && r.status !== 'active') return false;
    // If isActive field exists and is false, exclude it
    if (r.hasOwnProperty('isActive') && r.isActive === false) return false;
    // Otherwise, include it (API already filters for active routes)
    return true;
  });

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Journey Management</h1>
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Header Stats */}
      <div className="flex flex-col md:flex-row gap-4">
        <Card className="flex-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available Packages</p>
                <p className="text-2xl font-bold">{availablePackagesCount}</p>
                {availablePackagesCount === 0 && (
                  <p className="text-xs text-warning mt-1">Create packages to start journey</p>
                )}
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
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
        <Card className="flex-1">
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
      </div>

      {/* Main Content Area: Sidebar + Map */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar: Driver Selection + Office Deliveries */}
        <div className="flex flex-col gap-6 lg:w-80 flex-shrink-0">
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
                className="w-full"
              />
              <ScrollArea className="h-[400px]">
                <div className="space-y-2">
                  {availableDrivers.map((driver) => (
                    <div
                      key={driver.username}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        selectedDrivers.has(driver.username)
                          ? 'bg-primary/10 border-primary shadow-soft'
                          : 'hover:bg-muted/50 hover:shadow-soft'
                      }`}
                      onClick={() => handleDriverToggle(driver.username)}
                    >
                      <p className="font-semibold text-foreground">{driver.username}</p>
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

          {/* Office Deliveries Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Office Deliveries</CardTitle>
              <CardDescription>
                {selectedRoute ? 'Packages by office' : 'Select a route'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
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
                          <div className="p-3 rounded-lg border flex justify-between items-center hover:bg-muted/50 hover:shadow-soft transition-all duration-200 w-full">
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

        {/* Main Panel: Map View */}
        <div className="flex-1 min-w-0">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <CardTitle>Active Routes</CardTitle>
              <CardDescription>View routes on map</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden">
              {/* Map Container - Edge to edge with proper containment */}
              <div className="h-[600px] w-full rounded-lg overflow-hidden">
                <MapLibreMap
                  mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                  style={{ width: '100%', height: '100%' }}
                  initialViewState={
                    mapBounds
                      ? {
                          latitude: (mapBounds.minLat + mapBounds.maxLat) / 2,
                          longitude: (mapBounds.minLng + mapBounds.maxLng) / 2,
                          zoom: 12,
                        }
                      : {
                          latitude: 37.4220,
                          longitude: -122.0841,
                          zoom: 12,
                        }
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
                  {allPackages.map((pkg) => {
                    // Use the sequenceIndex (already set in allPackages)
                    const packageIndex = pkg.sequenceIndex ?? 0;
                    
                    const isDelivered = pkg.status === 'delivered';
                    const isUndelivered = pkg.status === 'undelivered';
                    const isWarehouse = pkg.packageID === 'ADMIN';
                    
                    // Coordinates are already validated and converted to numbers in allPackages
                    // Include sequenceIndex in key to ensure uniqueness even when multiple routes share the same packageID (e.g., ADMIN)
                    return (
                      <Marker
                        key={`${pkg.routeID}-${pkg.sequenceIndex}-${pkg.packageID}`}
                        longitude={pkg.longitude}
                        latitude={pkg.latitude}
                      >
                        <div className="relative">
                          {isWarehouse ? (
                            <div className="text-2xl">🏠</div>
                          ) : (
                            <div
                              className={`rounded-full w-8 h-8 flex items-center justify-center text-xs font-bold border-2 ${
                                isDelivered
                                  ? 'bg-green-100 border-green-500 text-green-700'
                                  : isUndelivered
                                  ? 'bg-red-100 border-red-500 text-red-700'
                                  : 'bg-white border-blue-500 text-blue-700'
                              }`}
                            >
                              {isDelivered ? '✓' : isUndelivered ? '✗' : packageIndex + 1}
                            </div>
                          )}
                        </div>
                      </Marker>
                    );
                  })}
                </MapLibreMap>
              </div>

              {/* Active Routes List */}
              <div className="p-4 space-y-2 border-t">
                <h3 className="font-semibold text-sm mb-2">Active Routes</h3>
                <ScrollArea className="h-32">
                  {activeRoutes.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4 text-sm">
                      No active routes
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {activeRoutes.map((route) => (
                        <div
                          key={route.routeID}
                          className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                            selectedRoute === route.routeID
                              ? 'bg-primary/10 border-primary shadow-soft'
                              : 'hover:bg-muted/50 hover:shadow-soft'
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
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </div>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">Available Trucks</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={async () => {
                    try {
                      const refreshedTrucksRes = await truckAPI.getAvailable();
                      setTrucks(refreshedTrucksRes.data);
                      toast.success('Truck list refreshed');
                    } catch (error) {
                      toast.error('Failed to refresh trucks');
                    }
                  }}
                >
                  Refresh
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {trucks.filter(t => !t.isUsed).map((truck) => (
                  <Button
                    key={truck.licensePlate}
                    variant="outline"
                    onClick={() => handleTruckAssign(truck)}
                    disabled={Array.from(assignedTrucks.values()).includes(
                      truck.licensePlate
                    )}
                    className={truck.isUsed ? 'opacity-50 cursor-not-allowed' : ''}
                  >
                    {truck.licensePlate} ({truck.kilogramCapacity} kg)
                  </Button>
                ))}
                {trucks.filter(t => !t.isUsed).length === 0 && (
                  <p className="col-span-2 text-center text-muted-foreground py-4 text-sm">
                    No available trucks. All trucks are currently in use.
                  </p>
                )}
              </div>
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
                selectedDrivers.size === 0 ||
                startingJourney
              }
            >
              {startingJourney ? 'Starting...' : 'Start Journey'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Journeys;

