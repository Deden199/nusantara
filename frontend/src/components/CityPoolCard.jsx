import { useEffect, useState } from 'react';

export default function CityPoolCard({
  city,
  drawDate,
  firstPrize = '',
  secondPrize = '',
  thirdPrize = '',
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, [drawDate, firstPrize, secondPrize, thirdPrize]);

  // Pisahkan tanggal dan waktu dari ISO string
  const raw = drawDate || '';
  const [datePart = '', timeWithOffset = ''] = raw.split('T');
  const timePart = timeWithOffset.split(/[.Z]/)[0] || '';

  // Format tanggal tanpa konversi zona (asumsikan datePart sudah dalam WIB)
  let formattedDate = '-';
  if (datePart) {
    const [year, month, day] = datePart.split('-');
    const dt = new Date(+year, +month - 1, +day);
    formattedDate = dt.toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  // Tampilkan jam:menit persis dari input
  const formattedTime = timePart ? timePart.slice(0, 5) : '-';

  // Fungsi render bola dengan animasi
  const renderBalls = (nums) =>
    nums.map((n, i) => (
      <div
        key={i}
        className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-red-600 text-white font-extrabold text-lg shadow-[0_0_12px_rgba(255,0,0,0.5)] transform transition-all duration-700"
        style={{
          transitionDelay: `${i * 150}ms`,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(1rem)',
        }}
      >
        {n}
      </div>
    ));

  // Pecah setiap prize jadi karakter
  const fpNums = firstPrize.split('').filter(Boolean);
  const spNums = secondPrize.split('').filter(Boolean);
  const tpNums = thirdPrize.split('').filter(Boolean);

  return (
    <div className="relative bg-gradient-to-br from-red-900 to-red-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2">
      {/* Neon accent */}
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-red-600/80 rounded-full blur-xl animate-pulse" />

      <div className="p-6 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-3xl font-extrabold text-white truncate">{city || '-'}</h3>
          <time dateTime={drawDate} className="text-sm text-gray-300 italic">
            {formattedDate}
          </time>
        </div>

        {/* First Result */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">1st Result</h4>
          <div className="grid grid-cols-5 gap-4 justify-items-center">
            {fpNums.length > 0
              ? renderBalls(fpNums)
              : <p className="col-span-5 text-center text-gray-400 italic">Belum ada hasil</p>
            }
          </div>
        </div>

        {/* Second Result */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">2rd Result</h4>
          <div className="grid grid-cols-5 gap-4 justify-items-center">
            {spNums.length > 0
              ? renderBalls(spNums)
              : <p className="col-span-5 text-center text-gray-400 italic">Belum ada hasil</p>
            }
          </div>
        </div>

        {/* Third Result */}
        <div>
          <h4 className="text-lg font-semibold text-white mb-2">3rd Result</h4>
          <div className="grid grid-cols-5 gap-4 justify-items-center">
            {tpNums.length > 0
              ? renderBalls(tpNums)
              : <p className="col-span-5 text-center text-gray-400 italic">Belum ada hasil</p>
            }
          </div>
        </div>

        {/* Footer Timestamp */}
        <p className="text-center text-xs text-gray-300">
          Terakhir: <span className="font-medium text-white">{formattedTime}</span> WIB
        </p>
      </div>
    </div>
  );
}
