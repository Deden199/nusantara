// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Unified fetch helper (handles 401 + parses JSON/text gracefully)
async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);

  if (res.status === 401) {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  // Try parse JSON body (success or error)
  const tryJson = async () => {
    try {
      return await res.json();
    } catch {
      return null;
    }
  };

  if (!res.ok) {
    const data = await tryJson();
    const message =
      (data && (data.message || data.error || data.msg)) ||
      (await res.text()).trim() ||
      res.statusText;
    throw new Error(message);
  }

  const data = await tryJson();
  return data ?? (await res.text());
}

// ===== Public =====
export async function fetchPools() {
  const data = await apiFetch(`${API_URL}/pools`);
  return data.map((item) => ({
    city: item.city ?? item,
    startsAt: item.startsAt ?? null,
    isLive: item.isLive ?? false,
  }));
}

export async function fetchLatest(city) {
  const data = await apiFetch(`${API_URL}/pools/${city}/latest`);
  return {
    ...data,
    numbers: [data.firstPrize, data.secondPrize, data.thirdPrize],
    nextDraw: data.nextDraw,
    nextClose: data.nextClose,
  };
}

export async function fetchAllLatest(cities = []) {
  const url = new URL(`${API_URL}/pools/latest`);
  if (cities.length) url.searchParams.set('cities', cities.join(','));
  const data = await apiFetch(url);
  return data.map((item) => ({
    ...item,
    numbers: [item.firstPrize, item.secondPrize, item.thirdPrize],
    nextDraw: item.nextDraw,
    nextClose: item.nextClose,
  }));
}

export async function fetchPublicSchedules() {
  return apiFetch(`${API_URL}/schedules`);
}

// ===== Admin/Auth =====
export async function adminLogin(username, password) {
  return apiFetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
}

// Pools
export async function addPool(city, token) {
  return apiFetch(`${API_URL}/admin/pools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ city }),
  });
}

export async function deletePool(city, token) {
  return apiFetch(`${API_URL}/admin/pools/${city}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Overrides
export async function overrideResults(city, drawDate, prizes, token) {
  return apiFetch(`${API_URL}/admin/pools/${city}/results`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ drawDate, ...prizes }),
  });
}

export async function fetchRecentOverrides(token, limit = 10) {
  const url = new URL(`${API_URL}/admin/overrides`);
  url.searchParams.set('limit', limit);
  return apiFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Stats
export async function fetchStats(token) {
  return apiFetch(`${API_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// Schedules
export async function fetchSchedules(token) {
  return apiFetch(`${API_URL}/admin/schedules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function createSchedule(city, drawTime, closeTime, token) {
  return apiFetch(`${API_URL}/admin/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ city, drawTime, closeTime }),
  });
}

export async function updateSchedule(city, drawTime, closeTime, token) {
  return apiFetch(`${API_URL}/admin/schedules/${city}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ drawTime, closeTime }),
  });
}

export async function deleteSchedule(city, token) {
  return apiFetch(`${API_URL}/admin/schedules/${city}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}

// History
export async function fetchAllHistory() {
  const data = await apiFetch(`${API_URL}/history`);
  return data.map((item) => ({
    ...item,
    numbers: [item.firstPrize, item.secondPrize, item.thirdPrize],
  }));
}
