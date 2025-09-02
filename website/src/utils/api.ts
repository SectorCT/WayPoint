const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8000';

export async function login(email: string, password: string) {
  try {
    console.log('[API] Logging in:', email);
    const res = await fetch(`${API_BASE}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[API] Login failed:', data.detail || data);
      throw new Error(data.detail || 'Login failed');
    }
    console.log('[API] Login success:', data.user);
    return data;
  } catch (err) {
    console.error('[API] Login error:', err);
    throw err;
  }
}

export async function fetchPackages(token: string) {
  try {
    console.log('[API] Fetching packages');
    const res = await fetch(`${API_BASE}/delivery/packages/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[API] Fetch packages failed:', data.detail || data);
      throw new Error(data.detail || 'Fetch packages failed');
    }
    console.log('[API] Packages fetched:', data.length);
    return data;
  } catch (err) {
    console.error('[API] Fetch packages error:', err);
    throw err;
  }
}

export async function fetchAvailableTrucks(token: string) {
  try {
    console.log('[API] Fetching available trucks');
    const res = await fetch(`${API_BASE}/delivery/trucks/available/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[API] Fetch available trucks failed:', data.detail || data);
      throw new Error(data.detail || 'Fetch available trucks failed');
    }
    console.log('[API] Available trucks fetched:', data.length);
    return data;
  } catch (err) {
    console.error('[API] Fetch available trucks error:', err);
    throw err;
  }
}

export async function fetchAllTrucks(token: string) {
  try {
    console.log('[API] Fetching all trucks');
    const res = await fetch(`${API_BASE}/delivery/trucks/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[API] Fetch all trucks failed:', data.detail || data);
      throw new Error(data.detail || 'Fetch all trucks failed');
    }
    console.log('[API] All trucks fetched:', data.length);
    return data;
  } catch (err) {
    console.error('[API] Fetch all trucks error:', err);
    throw err;
  }
}

export async function fetchTodaysPendingPackages(token: string) {
  try {
    console.log('[API] Fetching today\'s pending packages');
    const res = await fetch(`${API_BASE}/delivery/packages/today-pending/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[API] Fetch today\'s pending packages failed:', data.detail || data);
      throw new Error(data.detail || 'Fetch today\'s pending packages failed');
    }
    console.log('[API] Today\'s pending packages fetched:', data.length);
    return data;
  } catch (err) {
    console.error('[API] Fetch today\'s pending packages error:', err);
    throw err;
  }
}

export async function fetchDeliveryHistory(token: string, days: number = 7) {
  try {
    console.log('[API] Fetching delivery history');
    const res = await fetch(`${API_BASE}/delivery/history/?days=${days}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('[API] Response status:', res.status);
    const text = await res.text();
    console.log('[API] Raw response text:', text);
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('[API] Failed to parse JSON:', e);
      throw new Error('Invalid JSON response');
    }
    if (!res.ok) {
      console.error('[API] Fetch delivery history failed:', data.detail || data);
      throw new Error(data.detail || 'Fetch delivery history failed');
    }
    console.log('[API] Parsed data:', data);
    return data;
  } catch (err) {
    console.error('[API] Fetch delivery history error:', err);
    throw err;
  }
}

export async function fetchUnverifiedTruckers(token: string) {
  try {
    console.log('[API] Fetching unverified truckers');
    const res = await fetch(`${API_BASE}/delivery/truckers/unverified/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      console.error('[API] Fetch unverified truckers failed:', data.detail || data);
      throw new Error(data.detail || 'Fetch unverified truckers failed');
    }
    return data;
  } catch (err) {
    console.error('[API] Fetch unverified truckers error:', err);
    throw err;
  }
}

export async function fetchDrivers(token: string) {
  try {
    const res = await fetch(`${API_BASE}/auth/all/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Fetch drivers failed');
    }
    // Only return non-managers
    return data.filter((user: any) => user.isManager === false);
  } catch (err) {
    console.error('[API] Fetch drivers error:', err);
    throw err;
  }
}

export async function verifyTrucker(token: string, username: string) {
  try {
    const res = await fetch(`${API_BASE}/delivery/truckers/verify/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to verify trucker');
    }
    return data;
  } catch (err) {
    console.error('[API] Verify trucker error:', err);
    throw err;
  }
}

export async function verifyUser(token: string, username: string) {
  try {
    const res = await fetch(`${API_BASE}/delivery/truckers/verify/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to verify user');
    }
    return data;
  } catch (err) {
    console.error('[API] Verify user error:', err);
    throw err;
  }
}

export async function createTruck(token: string, licensePlate: string, kilogramCapacity: number) {
  try {
    const res = await fetch(`${API_BASE}/delivery/trucks/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ licensePlate, kilogramCapacity }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to create truck');
    }
    return data;
  } catch (err) {
    console.error('[API] Create truck error:', err);
    throw err;
  }
}

export async function createPackage(token: string, recipient: string, recipientPhoneNumber: string, weight: number, deliveryDate: string, address: string, lat: number, lng: number) {
  try {
    const res = await fetch(`${API_BASE}/delivery/packages/create/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ recipient, recipientPhoneNumber, weight, deliveryDate, address, latitude: lat, longitude: lng }),
    });
    const data = await res.json();
    if (!res.ok) {
      let msg = 'Failed to create package';
      if (data.detail) msg = data.detail;
      else if (typeof data === 'string') msg = data;
      else if (data && typeof data === 'object') msg = JSON.stringify(data);
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    console.error('[API] Create package error:', err);
    throw err;
  }
}

export async function fetchActiveRoutes(token: string) {
  try {
    const res = await fetch(`${API_BASE}/delivery/route/all/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch active routes');
    }
    return data;
  } catch (err) {
    console.error('[API] Fetch active routes error:', err);
    throw err;
  }
}

export async function fetchUndeliveredPackagesRoute(token: string, driverUsername: string) {
  try {
    console.log('[API] Fetching undelivered packages route for:', driverUsername);
    const res = await fetch(`${API_BASE}/delivery/offices/undelivered_route/${driverUsername}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch undelivered packages route');
    }
    console.log('[API] Undelivered packages route fetched:', data);
    return data;
  } catch (err) {
    console.error('[API] Fetch undelivered packages route error:', err);
    throw err;
  }
}

export async function fetchOfficeDeliveries(token: string, driverUsername: string) {
  try {
    console.log('[API] Fetching office deliveries for:', driverUsername);
    const res = await fetch(`${API_BASE}/delivery/office-deliveries/${driverUsername}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.detail || 'Failed to fetch office deliveries');
    }
    console.log('[API] Office deliveries fetched:', data);
    return data;
  } catch (err) {
    console.error('[API] Fetch office deliveries error:', err);
    throw err;
  }
} 