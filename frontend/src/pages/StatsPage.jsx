import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchAllHistory, fetchStats } from '../services/api';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function StatsPage() {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [filterCity, setFilterCity] = useState('');
  const [cities, setCities] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [statsData, historyData] = await Promise.all([
          fetchStats(),
          fetchAllHistory(),
        ]);
        setStats(statsData);
        setHistory(historyData);
        setCities(Array.from(new Set(historyData.map(item => item.city))).sort());
      } catch (err) {
        setError(err.message || 'Gagal memuat data');
      }
    })();
  }, []);

  const displayed = filterCity
    ? history.filter(item => item.city === filterCity)
    : history;

  // Format helpers for date & time in WIB
  const formatDate = iso => new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Jakarta'
  });
  const formatTime = iso => new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Header />
      <div className="flex-grow flex justify-center items-start py-16">
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
          <main className="px-8 py-12 space-y-12">
            {error && (
              <div className="text-red-600 text-center mb-4">{error}</div>
            )}
            {/* Title */}
            <div className="text-center">
              <h1 className="text-4xl font-extrabold text-primary mb-2">Statistik &amp; Riwayat Nusantara Full</h1>
              <p className="text-gray-600">Pantau data undian dan histori nomor dengan tampilan interaktif.</p>
            </div>

            {/* Overview Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Total Kota" value={stats.totalCities} color="bg-indigo-200" />
                <Card title="Undian Hari Ini" value={stats.todayFetches} color="bg-green-200" />
                <Card title="Total History" value={history.length} color="bg-pink-200" />
              </div>
            )}

            {/* Trend Chart */}
            {stats?.fetchByHour && (
              <section className="bg-gray-50 rounded-2xl p-6">
                <h2 className="text-xl font-semibold mb-4">Trend Fetch per Jam (Hari Ini)</h2>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={stats.fetchByHour} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip contentStyle={{ borderRadius: '6px' }} />
                    <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              </section>
            )}

            {/* Filter Box */}
            <section className="flex justify-end">
              <div className="bg-white p-3 rounded-xl shadow flex items-center space-x-3">
                <label className="text-gray-700 font-medium">Filter Kota:</label>
                <select
                  value={filterCity}
                  onChange={e => setFilterCity(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-1 focus:ring-primary focus:border-primary"
                >
                  <option value="">Semua Kota</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </section>

            {/* History Table */}
            <section>
              <h2 className="text-xl font-semibold mb-4">Riwayat Undian</h2>
              <div className="bg-white rounded-2xl shadow divide-y divide-gray-200">
                <div className="grid grid-cols-3 bg-gray-100 px-6 py-3 font-medium text-gray-700 uppercase text-sm">
                  <div>Kota</div>
                  <div>Tanggal &amp; Waktu</div>
                  <div>Prizes</div>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {displayed.map((item, idx) => {
                    const prizes = [
                      { label: '1st Prize', value: item.firstPrize },
                      { label: '2nd Prize', value: item.secondPrize },
                      { label: '3rd Prize', value: item.thirdPrize },
                    ].filter(p => p.value);
                    return (
                      <div
                        key={idx}
                        className={`grid grid-cols-3 px-6 py-4 items-start text-sm ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                      >
                        <div className="text-gray-800 font-medium">{item.city}</div>
                        <div className="text-gray-600">
                          <div>{formatDate(item.drawDate)}</div>
                          <div className="text-xs">{formatTime(item.drawDate)} WIB</div>
                        </div>
                        <div className="space-y-3">
                          {prizes.map((p, i) => (
                            <div key={i} className="">
                              <h5 className="text-xs font-semibold text-gray-700 mb-2">{p.label}</h5>
                              <div className="flex gap-3">
                                {String(p.value).split('').map((d, j) => (
                                  <div
                                    key={j}
                                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-400 text-white font-extrabold text-lg shadow-[0_0_10px_rgba(255,0,0,0.5)]"
                                  >
                                    {d}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div className={`${color} rounded-xl p-4 flex flex-col items-center`}>
      <p className="text-gray-700 uppercase tracking-wide mb-1 text-xs">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}