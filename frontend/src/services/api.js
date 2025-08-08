// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  if (res.status === 401) {
    if (localStorage.getItem('token')) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(msg || res.statusText);
  }
  return res.json();
}

// Public
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
  // ensure nextDraw gets passed along
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
// Admin
export async function adminLogin(username, password) {
  const res = await fetch(`${API_URL}/admin/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
}

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

// Recent Overrides
export async function fetchRecentOverrides(token, limit = 10) {
  const url = new URL(`${API_URL}/admin/overrides`);
  url.searchParams.set('limit', limit);
  return apiFetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function fetchPublicSchedules() {
  return apiFetch(`${API_URL}/schedules`);
}
// Dashboard Stats
export async function fetchStats(token) {
  return apiFetch(`${API_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
}
// Schedule management
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
export async function deletePool(city, token) {
  return apiFetch(`${API_URL}/admin/pools/${city}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function deleteSchedule(city, token) {
  return apiFetch(`${API_URL}/admin/schedules/${city}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
}
export async function fetchAllHistory() {
  const data = await apiFetch(`${API_URL}/history`);
  return data.map(item => ({
    ...item,
    numbers: [item.firstPrize, item.secondPrize, item.thirdPrize],
  }));
}
