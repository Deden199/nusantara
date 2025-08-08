export default function CityTab({ newCity, setNewCity, handleAdd, pools, onDelete }) {
  return (
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
          <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
            Tambah
          </button>
        </form>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <h4 className="text-lg font-semibold mb-4">Daftar Kota</h4>
        <CityTable data={pools} onDelete={onDelete} />
      </div>
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
