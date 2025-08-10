const baseUrl =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_SOCKET_URL || '';
const API_URL = `${baseUrl}/api`;

export async function fetchPools() {
  const res = await fetch(`${API_URL}/pools`);
  return res.json();
}

export async function fetchLatest(city) {
  const res = await fetch(`${API_URL}/pools/${city}/latest`);
  return res.json();
}

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
