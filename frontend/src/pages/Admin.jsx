import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import Header from '../components/HeaderAdmin';
import Sidebar from '../components/Sidebar';
import {
  fetchPools,
  fetchStats,
  fetchRecentOverrides,
  addPool,
  overrideResults,
  fetchSchedules,
  createSchedule,
  updateSchedule,
  deleteSchedule,
    deletePool,

} from '../services/api';
import { formatTime, formatDateTime } from '../utils/time';

export default function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState(null);
  const [pools, setPools] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newCity, setNewCity] = useState('');
  const [overrideData, setOverrideData] = useState({
    city: '',
    drawDate: '',
    firstPrize: '',
    secondPrize: '',
    thirdPrize: '',
  });
  const [schedules, setSchedules] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ city: '', drawTime: '', closeTime: '' });
  const [message, setMessage] = useState({ text: '', type: '' });

  // Redirect to login if no token
  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  // Fetch admin data
  useEffect(() => {
    if (!token) return;
    fetchStats(token)
      .then(data => setStats(data))
      .catch(err => console.error(err));
    fetchPools(token)
      .then(data => setPools(data))
      .catch(err => console.error(err));
    fetchRecentOverrides(token)
      .then(data => setOverrides(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
          fetchSchedules(token)
      .then(data => setSchedules(Array.isArray(data) ? data : []))
      .catch(err => console.error(err));
  }, [token]);

  const handleAdd = async e => {
    e.preventDefault();
    if (!newCity.trim()) return;
    try {
      await addPool(newCity, token);
      setMessage({ text: `Kota “${newCity}” ditambahkan`, type: 'success' });
      setNewCity('');
      const updated = await fetchPools(token);
      setPools(updated);
    } catch (err) {
      setMessage({ text: err.message || 'Gagal menambahkan kota', type: 'error' });
    }
  };
const handleScheduleSave = async e => {
  e.preventDefault();
      const { city, drawTime, closeTime } = scheduleForm;
    if (!city || !drawTime || !closeTime) return;
    try {
      const exists = schedules.some(s => s.city === city);
      if (exists) {
        await updateSchedule(city, drawTime, closeTime, token);
      } else {
        await createSchedule(city, drawTime, closeTime, token);
      }
      const updated = await fetchSchedules(token);
      setSchedules(Array.isArray(updated) ? updated : []);
      setScheduleForm({ city: '', drawTime: '', closeTime: '' });
      setMessage({ text: 'Jadwal tersimpan', type: 'success' });
    } catch (err) {
      setMessage({ text: err.message || 'Gagal menyimpan jadwal', type: 'error' });
    }
  };

  const handleDeleteSchedule = async city => {
    try {
      await deleteSchedule(city, token);
      const updated = await fetchSchedules(token);
      setSchedules(Array.isArray(updated) ? updated : []);
    } catch (err) {
      setMessage({ text: err.message || 'Gagal menghapus jadwal', type: 'error' });
    }
  };
    const handleDeleteCity = async city => {
    try {
      await deletePool(city, token);
      const updated = await fetchPools(token);
      setPools(updated);
    } catch (err) {
      setMessage({ text: err.message || 'Gagal menghapus kota', type: 'error' });
    }
  };
  const handleOverride = async e => {
    e.preventDefault();
    const { city, drawDate, firstPrize, secondPrize, thirdPrize } = overrideData;
    if (!city || !drawDate) return;
    try {
      await overrideResults(
        city,
        drawDate,
        { firstPrize, secondPrize, thirdPrize },
        token
      );
            setMessage({ text: `Hasil ${city} diperbarui`, type: 'success' });
      setOverrideData({
        city: '',
        drawDate: '',
        firstPrize: '',
        secondPrize: '',
        thirdPrize: '',
      });
            const recs = await fetchRecentOverrides(token);
      setOverrides(Array.isArray(recs) ? recs : []);
    } catch (err) {
      setMessage({ text: err.message || 'Gagal override', type: 'error' });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar active={activeTab} onSelect={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}> {message.text} </div>
          )}
          {activeTab === 'dashboard' && stats && (
            <>
              {/* Stat Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card title="Total Kota" value={stats.totalCities} />
                <Card title="Fetch Hari Ini" value={stats.todayFetches} />
                <Card title="Error Fetch" value={stats.fetchErrors} highlight />
                <Card title="Override Terakhir" value={stats.lastOverrideTime} />
              </div>
              {/* Chart */}
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h4 className="text-lg font-semibold mb-4">Distribusi Fetch per Jam</h4>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={stats.fetchByHour}>
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3182CE" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Override Table */}
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold mb-4">Riwayat Override</h4>
                <OverrideTable data={overrides} />
              </div>
            </>
          )}
          {activeTab === 'add' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                <h4 className="text-xl font-semibold mb-4">Tambah Kota Baru</h4>
                <form onSubmit={handleAdd} className="space-y-4">
                  <input
                    className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                    placeholder="Nama kota"
                    value={newCity}
                    onChange={e => setNewCity(e.target.value)}
                  />
                  <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"> Tambah </button>
                </form>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold mb-4">Daftar Kota</h4>
                <CityTable data={pools} onDelete={handleDeleteCity} />
              </div>
            </div>
          )}
          {activeTab === 'schedule' && (
            <div className="space-y-8">
              <div className="bg-white rounded-lg shadow p-6">
                <h4 className="text-lg font-semibold mb-4">Daftar Jadwal</h4>
                <ScheduleTable data={schedules} onDelete={handleDeleteSchedule} />
              </div>
              <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
                <h4 className="text-xl font-semibold mb-4">Tambah / Update Jadwal</h4>
                <form onSubmit={handleScheduleSave} className="space-y-4">
                  <select
                    className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                    value={scheduleForm.city}
                    onChange={e => setScheduleForm({ ...scheduleForm, city: e.target.value })}
                  >
                    <option value="">Pilih Kota</option>
                    {pools.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="time"
                                        placeholder="Tutup"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                    value={scheduleForm.closeTime}
                    onChange={e => setScheduleForm({ ...scheduleForm, closeTime: e.target.value })}
                  />
                  <input
                    type="time"
                    placeholder="Undian"
                    className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                    value={scheduleForm.drawTime}
                    onChange={e => setScheduleForm({ ...scheduleForm, drawTime: e.target.value })}
                  />
                  <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"> Simpan </button>
                </form>
              </div>            </div>
          )}
          {activeTab === 'override' && (
            <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
              <h4 className="text-xl font-semibold mb-4">Override Hasil Undian</h4>
              <form onSubmit={handleOverride} className="space-y-4">
                <select
                  className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                  value={overrideData.city}
                  onChange={e => setOverrideData({ ...overrideData, city: e.target.value })}
                >
                  <option value="">Pilih Kota</option>
                  {pools.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <input
                  type="datetime-local"
                  className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                  value={overrideData.drawDate}
                  onChange={e => setOverrideData({ ...overrideData, drawDate: e.target.value })}
                />
                <input
                  className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                  placeholder="First Prize"
                  value={overrideData.firstPrize}
                  onChange={e => setOverrideData({ ...overrideData, firstPrize: e.target.value })}
                />
                <input
                  className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                  placeholder="Second Prize"
                  value={overrideData.secondPrize}
                  onChange={e => setOverrideData({ ...overrideData, secondPrize: e.target.value })}
                />
                <input
                  className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
                  placeholder="Third Prize"
                  value={overrideData.thirdPrize}
                  onChange={e => setOverrideData({ ...overrideData, thirdPrize: e.target.value })}
                />
                <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark"> Update </button>
              </form>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function Card({ title, value, highlight }) {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${highlight ? 'text-red-600' : ''}`}>
      <h4 className="text-sm text-gray-500">{title}</h4>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function OverrideTable({ data }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-center py-4 text-gray-500">Belum ada override.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            {['Kota','Waktu','Nomor Lama','Nomor Baru','Admin'].map(h => (
              <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-600">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((o,i) => (
            <tr key={i} className={i%2===0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2">{o.city}</td>
              <td className="px-4 py-2">{formatDateTime(o.time)}</td>
              <td className="px-4 py-2">{o.oldNumbers}</td>
              <td className="px-4 py-2">{o.newNumbers}</td>
      <td className="px-4 py-2">{o.adminUsername}</td>
    </tr>
  ))}
        </tbody>
      </table>
    </div>
  );
}
function CityTable({ data, onDelete }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-center py-4 text-gray-500">Belum ada kota.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            {['Kota', ''].map(h => (
              <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((c, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2">{c}</td>
              <td className="px-4 py-2">
                <button onClick={() => onDelete(c)} className="text-red-600 hover:underline">
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScheduleTable({ data, onDelete }) {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-center py-4 text-gray-500">Belum ada jadwal.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full">
        <thead>
          <tr className="bg-gray-50">
            {['Kota', 'Tutup', 'Undian', ''].map(h => (
              <th key={h} className="px-4 py-2 text-left text-sm font-medium text-gray-600">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((s, i) => (
            <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="px-4 py-2">{s.city}</td>
              <td className="px-4 py-2">{formatTime(s.closeTime)}</td>
              <td className="px-4 py-2">{formatTime(s.drawTime)}</td>
              <td className="px-4 py-2">
                <button
                  onClick={() => onDelete(s.city)}
                  className="text-red-600 hover:underline"
                >
                  Hapus
                </button>
              </td>            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
