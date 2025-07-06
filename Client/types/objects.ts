export interface Package {
    address: string;
    latitude: number;
    longitude: number;
    recipient: string;
    recipientPhoneNumber: string;
    deliveryDate: string;
    weight: number;
    status: "pending" | "in_transit" | "delivered";
    packageID: string;
    location_index: number;
}

export interface Truck {
    kilogramCapacity: number;
    licensePlate: string;
    isUsed: boolean;
}

export interface User {
    username: string;
    isManager: boolean;
    email: string;
    phoneNumber: string;
    company?: { unique_id: string; name: string } | null;
    verified?: boolean;
}

export interface RouteData {
    user: string;
    packageSequence: Package[];
    mapRoute: [number, number][];
    dateOfCreation: string;
    truck?: string;
    _id?: string;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteLocation extends Coordinate {
  waypoint_index: number;
  package_info: Package;
}