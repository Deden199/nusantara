// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Public
export async function fetchPools() {
  const res = await fetch(`${API_URL}/pools`);
  return res.json();
}

export async function fetchLatest(city) {
  const res = await fetch(`${API_URL}/pools/${city}/latest`);
  if (!res.ok) {
    throw new Error(res.statusText);
  }
  const data = await res.json();
  // ensure nextDraw gets passed along
  return {
    ...data,
    numbers: [data.firstPrize, data.secondPrize, data.thirdPrize],
    nextDraw: data.nextDraw,
  };
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
  const res = await fetch(`${API_URL}/admin/pools`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ city }),
  });
  return res.json();
}

export async function overrideResults(city, drawDate, prizes, token) {
  const res = await fetch(`${API_URL}/admin/pools/${city}/results`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ drawDate, ...prizes }),
  });
  return res.json();
}

// Recent Overrides
export async function fetchRecentOverrides(token, limit = 10) {
  const url = new URL(`${API_URL}/admin/overrides`);
  url.searchParams.set('limit', limit);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
export async function fetchPublicSchedules() {
  const res = await fetch(`${API_URL}/schedules`);
  return res.json();
}
// Dashboard Stats
export async function fetchStats(token) {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
// Schedule management
export async function fetchSchedules(token) {
  const res = await fetch(`${API_URL}/admin/schedules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function createSchedule(city, drawTime, closeTime, token) {
  const res = await fetch(`${API_URL}/admin/schedules`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ city, drawTime, closeTime }),
  });
  return res.json();
}

export async function updateSchedule(city, drawTime, closeTime, token) {
  const res = await fetch(`${API_URL}/admin/schedules/${city}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ drawTime, closeTime }),
  });
  return res.json();
}
export async function deletePool(city, token) {
  const res = await fetch(`${API_URL}/admin/pools/${city}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
export async function deleteSchedule(city, token) {
  const res = await fetch(`${API_URL}/admin/schedules/${city}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}
export async function fetchAllHistory() {
  const res = await fetch(`${API_URL}/history`);
  const data = await res.json();
  return data.map(item => ({
    ...item,
    numbers: [item.firstPrize, item.secondPrize, item.thirdPrize],
  }));}
