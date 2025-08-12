import { makeAuthenticatedRequest } from './api';
import { Truck, Package, User, RouteData } from '../types/objects';


export const getAvailableTrucks = async (): Promise<Truck[]> => {
  const response = await makeAuthenticatedRequest("/delivery/trucks/", {
    method: "GET",
  });
  return response.json();
};

export const getPackages = async (): Promise<Package[]> => {
  const response = await makeAuthenticatedRequest('/delivery/packages/');
  return response.json();
}; 

export const getEmployees = async (): Promise<User[]> => {
  const response = await makeAuthenticatedRequest('/auth/all/');
  const data = await response.json();
  return data.filter((user: User) => user.isManager === false);
};

export const getUserByUsername = async (username: string): Promise<User> => {
  const allEmployeesRes = await makeAuthenticatedRequest('/auth/all/');
  const allEmployees = await allEmployeesRes.json();
  const user = allEmployees.find((user: User) => user.username === username);
  if (!user) {
    throw new Error(`User with username ${username} not found`);
  }
  return user;
};

export const startJourney = async (drivers: string[]): Promise<any> => {
  const body = {
    drivers: drivers,
  }
  const response = await makeAuthenticatedRequest('/delivery/route/', {
    method: "POST",
    body: JSON.stringify(body),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to start journey');
  }
  
  return response.json();
};

export const assignTruckAndStartJourney = async (
  driverUsername: string,
  truckLicensePlate: string,
  packageSequence: any,
  mapRoute: any
): Promise<any> => {
  const body = {
    driverUsername,
    truckLicensePlate,
    packageSequence,
    mapRoute,
  };
  const response = await makeAuthenticatedRequest('/delivery/route/assign/', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to assign truck and start journey');
  }

  return response.json();
};

export const checkDriverStatus = async (username: string): Promise<any> => {
  const response = await makeAuthenticatedRequest('/delivery/route/checkDriverStatus/', {
    method: "POST",
    body: JSON.stringify({
      username: username
    }),
  });
  return response.json();
};

export const getAllRoutes = async (): Promise<RouteData[]> => {
  const response = await makeAuthenticatedRequest('/delivery/route/all/');
  if (!response.ok) {
    return [];
  }
  return response.json();
};

export const getRoute = async (driverID: string): Promise<RouteData> => {
  const response = await makeAuthenticatedRequest(`/delivery/route/getByDriver/`, {
    method: "POST",
    body: JSON.stringify({
      "username": driverID
  }),
  });
  return response.json();
};

export const getReturnRoute = async (
  currentLat: number,
  currentLng: number,
  defaultLat: number,
  defaultLng: number,
  username: string
): Promise<[number, number][]> => {
  try {
    const response = await makeAuthenticatedRequest('/delivery/route/return/', {
      method: "POST",
      body: JSON.stringify({
        currentLat,
        currentLng,
        defaultLat,
        defaultLng,
        username
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get return route');
    }
    
    const data = await response.json();
    if (!data.route || !Array.isArray(data.route)) {
      throw new Error('Invalid route data received from server');
    }
    
    return data.route;
  } catch (error) {
    console.error('Error in getReturnRoute:', error);
    throw error;
  }
};

export const deleteTruck = async (licensePlate: string): Promise<Response> => {
  return makeAuthenticatedRequest(`/delivery/trucks/${licensePlate}/`, {
    method: "DELETE",
  });
};

export const markPackageAsDelivered = async (packageID: string, driverUsername: string, signature?: string): Promise<Response> => {
  return makeAuthenticatedRequest(`/delivery/packages_mark/`, {
    method: "POST",
    body: JSON.stringify({
      packageID,
      driver_username: driverUsername,
      ...(signature ? { signature } : {})
    }),
  });
};

export const markPackageAsUndelivered = async (packageID: string): Promise<Response> => {
  return makeAuthenticatedRequest(`/delivery/packages_mark_undelivered/`, {
    method: "POST",
    body: JSON.stringify({
      "packageID": packageID
    }),
  });
};

export const recalculateRoute = async (
  username: string,
  currentLat: number,
  currentLng: number
): Promise<{ route: [number, number][], message: string, remaining_packages: number }> => {
  try {
    const response = await makeAuthenticatedRequest('/delivery/route/recalculate/', {
      method: "POST",
      body: JSON.stringify({
        username,
        currentLat,
        currentLng
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to recalculate route');
    }
    
    const data = await response.json();
    if (!data.route || !Array.isArray(data.route)) {
      throw new Error('Invalid route data received from server');
    }
    
    return data;
  } catch (error) {
    console.error('Error in recalculateRoute:', error);
    throw error;
  }
};

export const getUndeliveredPackagesRoute = async (driverUsername: string): Promise<any> => {
  try {
    const response = await makeAuthenticatedRequest(`/delivery/offices/undelivered_route/${driverUsername}/`, {
      method: "GET",
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get undelivered packages route');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in getUndeliveredPackagesRoute:', error);
    throw error;
  }
};

export const saveOfficeDelivery = async (
  driverUsername: string,
  officeId: number,
  packageIds: string[]
): Promise<any> => {
  try {
    const response = await makeAuthenticatedRequest('/delivery/office-delivery/', {
      method: "POST",
      body: JSON.stringify({
        driver_username: driverUsername,
        office_id: officeId,
        package_ids: packageIds
      }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to save office delivery');
    }
    
    return response.json();
  } catch (error) {
    console.error('Error in saveOfficeDelivery:', error);
    throw error;
  }
};

export const optimizeOfficeRoute = async (
  driverUsername: string,
  currentLat: number,
  currentLng: number,
  officeIds: number[]
): Promise<any> => {
  try {
    const response = await makeAuthenticatedRequest('/delivery/route/optimize-office/', {
      method: "POST",
      body: JSON.stringify({
        driver_username: driverUsername,
        current_lat: currentLat,
        current_lng: currentLng,
        office_ids: officeIds
      }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to optimize office route');
    }
    return response.json();
  } catch (error) {
    console.error('Error in optimizeOfficeRoute:', error);
    throw error;
  }
};


