export default function CityPoolCard({ city, drawDate, numbers }) {
  return (
    <div className="border p-4 shadow bg-white">
      <h2 className="text-lg font-bold mb-2">{city}</h2>
      <p className="text-sm">Tanggal: {new Date(drawDate).toLocaleDateString('id-ID')}</p>
      <p className="text-xl mt-2 font-mono">{numbers || '-'}</p>
    </div>
  );
}
