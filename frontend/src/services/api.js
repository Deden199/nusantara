// frontend/src/services/api.js
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function handleResponse(res) {
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {}
    throw new Error(message);
  }
  return res.json();
}

// Public
export async function fetchPools() {
  const res = await fetch(`${API_URL}/pools`);
  const data = await handleResponse(res);
  return data.map((item) => ({
    city: item.city ?? item,
    startsAt: item.startsAt ?? null,
    isLive: item.isLive ?? false,
  }));
}

export async function fetchLatest(city) {
  const res = await fetch(`${API_URL}/pools/${city}/latest`);
  const data = await handleResponse(res);
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
  const res = await fetch(url);
  const data = await handleResponse(res);
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
  return handleResponse(res);
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
  return handleResponse(res);
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
  return handleResponse(res);
}

// Recent Overrides
export async function fetchRecentOverrides(token, limit = 10) {
  const url = new URL(`${API_URL}/admin/overrides`);
  url.searchParams.set('limit', limit);
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
export async function fetchPublicSchedules() {
  const res = await fetch(`${API_URL}/schedules`);
  return handleResponse(res);
}
// Dashboard Stats
export async function fetchStats(token) {
  const res = await fetch(`${API_URL}/admin/stats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
// Schedule management
export async function fetchSchedules(token) {
  const res = await fetch(`${API_URL}/admin/schedules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
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
  return handleResponse(res);
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
  return handleResponse(res);
}
export async function deletePool(city, token) {
  const res = await fetch(`${API_URL}/admin/pools/${city}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
export async function deleteSchedule(city, token) {
  const res = await fetch(`${API_URL}/admin/schedules/${city}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse(res);
}
export async function fetchAllHistory() {
  const res = await fetch(`${API_URL}/history`);
  const data = await handleResponse(res);
  return data.map(item => ({
    ...item,
    numbers: [item.firstPrize, item.secondPrize, item.thirdPrize],
  }));
}
