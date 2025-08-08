export default function ScheduleTab({ schedules, onDelete, scheduleForm, setScheduleForm, handleSave, pools }) {
  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold mb-4">Daftar Jadwal</h4>
        <ScheduleTable data={schedules} onDelete={onDelete} />
      </div>
      <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
        <h4 className="text-xl font-semibold mb-4">Tambah / Update Jadwal</h4>
        <form onSubmit={handleSave} className="space-y-4">
          <select
            className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
            value={scheduleForm.city}
            onChange={e => setScheduleForm({ ...scheduleForm, city: e.target.value })}
          >
            <option value="">Pilih Kota</option>
            {pools.map(c => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
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
          <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
            Simpan
          </button>
        </form>
      </div>
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
              <td className="px-4 py-2">{s.closeTime}</td>
              <td className="px-4 py-2">{s.drawTime}</td>
              <td className="px-4 py-2">
                <button onClick={() => onDelete(s.city)} className="text-red-600 hover:underline">
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
