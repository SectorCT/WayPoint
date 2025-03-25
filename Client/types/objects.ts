interface Package {
    address: string;
    latitude: number;
    longitude: number;
    recipient: string;
    recipientPhoneNumber: string;
    deliveryDate: string;
    weight: number;
    status: "pending" | "in_transit" | "delivered";
    packageID: string;
}

interface Truck {
    kilogramCapacity: number;
    licensePlate: string;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface RouteLocation extends Coordinate {
  waypoint_index: number;
  package_info: Package;
}

interface RouteData {
  user: string;
  packageSequence: Package[];
  mapRoute: [number, number][];
  dateOfCreation: string;
  truck?: string;
  _id?: string;
  isActive: boolean;
}