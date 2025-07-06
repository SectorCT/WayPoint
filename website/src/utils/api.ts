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