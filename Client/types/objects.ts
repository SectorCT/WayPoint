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