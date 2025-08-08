import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/HeaderAdmin';
import Sidebar from '../components/Sidebar';
import DashboardTab from '../components/admin/DashboardTab';
import CityTab from '../components/admin/CityTab';
import ScheduleTab from '../components/admin/ScheduleTab';
import OverrideTab from '../components/admin/OverrideTab';
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

export default function Admin() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [stats, setStats] = useState(null);
  const [pools, setPools] = useState([]);
  const [overrides, setOverrides] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [newCity, setNewCity] = useState('');
  const [overrideData, setOverrideData] = useState({
    city: '',
    drawDate: '',
    firstPrize: '',
    secondPrize: '',
    thirdPrize: '',
  });
  const [scheduleForm, setScheduleForm] = useState({ city: '', drawTime: '', closeTime: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Redirect to login if no token
  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  // Fetch admin data
  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    setFetchError('');
    Promise.all([
      fetchStats(token),
      fetchPools(token),
      fetchRecentOverrides(token),
      fetchSchedules(token),
    ])
      .then(([statsData, poolsData, overridesData, schedulesData]) => {
        setStats(statsData);
        setPools(poolsData.map(p => p.city));
        setOverrides(Array.isArray(overridesData) ? overridesData : []);
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
      })
      .catch(() => setFetchError('Gagal memuat data awal'))
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleAdd = async e => {
    e.preventDefault();
    if (!newCity.trim()) return;
    try {
      await addPool(newCity, token);
      setMessage({ text: `Kota “${newCity}” ditambahkan`, type: 'success' });
      setNewCity('');
      const updated = await fetchPools(token);
      setPools(updated.map(p => p.city));
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
      setPools(updated.map(p => p.city));
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

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Memuat...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-red-600">{fetchError}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar active={activeTab} onSelect={setActiveTab} />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 overflow-y-auto p-6">
          {message.text && (
            <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {message.text}
            </div>
          )}
          {activeTab === 'dashboard' && (
            <DashboardTab stats={stats} overrides={overrides} />
          )}
          {activeTab === 'add' && (
            <CityTab
              newCity={newCity}
              setNewCity={setNewCity}
              handleAdd={handleAdd}
              pools={pools}
              onDelete={handleDeleteCity}
            />
          )}
          {activeTab === 'schedule' && (
            <ScheduleTab
              schedules={schedules}
              onDelete={handleDeleteSchedule}
              scheduleForm={scheduleForm}
              setScheduleForm={setScheduleForm}
              handleSave={handleScheduleSave}
              pools={pools}
            />
          )}
          {activeTab === 'override' && (
            <OverrideTab
              pools={pools}
              overrideData={overrideData}
              setOverrideData={setOverrideData}
              handleOverride={handleOverride}
            />
          )}
        </main>
      </div>
    </div>
  );
}
