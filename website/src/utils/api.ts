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
      console.error('[API] Fetch trucks failed:', data.detail || data);
      throw new Error(data.detail || 'Fetch trucks failed');
    }
    return data;
  } catch (err) {
    console.error('[API] Fetch trucks error:', err);
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