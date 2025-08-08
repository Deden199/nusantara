export default function OverrideTab({ pools, overrideData, setOverrideData, handleOverride }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 max-w-md mx-auto">
      <h4 className="text-xl font-semibold mb-4">Override Hasil Undian</h4>
      <form onSubmit={handleOverride} className="space-y-4">
        <select
          className="w-full border rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
          value={overrideData.city}
          onChange={e => setOverrideData({ ...overrideData, city: e.target.value })}
        >
          <option value="">Pilih Kota</option>
          {pools.map(c => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
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
        <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary-dark">
          Update
        </button>
      </form>
    </div>
  );
}
