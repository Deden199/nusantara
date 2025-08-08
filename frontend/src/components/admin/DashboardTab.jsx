import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function DashboardTab({ stats, overrides }) {
  if (!stats) return null;
  return (
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
              <td className="px-4 py-2">{new Date(o.time).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}</td>
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
