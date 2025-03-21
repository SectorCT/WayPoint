import { makeAuthenticatedRequest } from './api';


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

export const startJourney = async (drivers: string[]): Promise<void> => {
  const body = {
    drivers: drivers,
  }
  console.log(body);
  const response = await makeAuthenticatedRequest('/delivery/route/', {
    method: "POST",
    body: JSON.stringify(body),
  });
  return response.json();
};

export const getAllRoutes = async (): Promise<RouteData[]> => {
  const response = await makeAuthenticatedRequest('/delivery/routes/');
  if (!response.ok) {
    return [];
  }
  return response.json();
};



