import { useEffect, useState } from 'react';
import { fetchPools } from '../../services/api';

export default function LiveDrawTab({ token }) {
  const [pools, setPools] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchPools(token);
        setPools(Array.isArray(data) ? data : []);
      } catch (err) {
        setMessage(err.message || 'Gagal memuat kota');
      }
    };
    load();
  }, [token]);

  const refreshPools = async () => {
    try {
      const data = await fetchPools(token);
      setPools(Array.isArray(data) ? data : []);
    } catch {}
  };

  const handleStart = async () => {
    if (!selectedCity) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      await fetch(`${API_URL}/pools/${selectedCity}/live-draw`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage(`Live draw ${selectedCity} dimulai`);
      await refreshPools();
    } catch (err) {
      setMessage(err.message || 'Gagal memulai live draw');
    }
  };

  const handleStop = async () => {
    if (!selectedCity) return;
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const res = await fetch(`${API_URL}/pools/${selectedCity}/live-draw`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Gagal menghentikan live draw');
      }
      setMessage(data.message || `Live draw ${selectedCity} dihentikan`);
      await refreshPools();
    } catch (err) {
      setMessage(err.message || 'Gagal menghentikan live draw');
    }
  };

  const selectedPool = pools.find(p => p.city === selectedCity);

  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto space-y-4">
      <h4 className="text-xl font-semibold mb-4">Live Draw Manual</h4>
      {message && <p className="text-sm text-gray-600">{message}</p>}
      <select
        className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
        value={selectedCity}
        onChange={e => setSelectedCity(e.target.value)}
      >
        <option value="">Pilih Kota</option>
        {pools.map(p => (
          <option key={p.city} value={p.city}>
            {p.city} {p.isLive ? '(LIVE)' : ''}
          </option>
        ))}
      </select>
      <div className="flex space-x-4">
        <button
          onClick={handleStart}
          disabled={!selectedCity}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark disabled:opacity-50"
        >
          Start
        </button>
        {selectedPool?.isLive && (
          <button
            onClick={handleStop}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}

