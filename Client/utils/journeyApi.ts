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

export const startJourney = async (drivers: string[]): Promise<void> => {
  const body = {
    drivers: drivers,
  }
  const response = await makeAuthenticatedRequest('/delivery/route/', {
    method: "POST",
    body: JSON.stringify(body),
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

export const deleteTruck = async (licensePlate: string): Promise<Response> => {
  return makeAuthenticatedRequest(`/delivery/trucks/${licensePlate}/`, {
    method: "DELETE",
  });
};

export const markPackageAsDelivered = async (packageID: string): Promise<Response> => {
  return makeAuthenticatedRequest(`/delivery/packages_mark/`, {
    method: "POST",
    body: JSON.stringify({
      "packageID": packageID
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


