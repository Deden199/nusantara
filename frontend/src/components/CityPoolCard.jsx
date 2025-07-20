// components/CityPoolCard.jsx
import { useEffect, useState } from 'react';

export default function CityPoolCard({
  city,
  drawDate,
  firstPrize,
  secondPrize,
  thirdPrize,
  numbers,
}) {
  const nums = numbers
    ? Array.isArray(numbers)
      ? numbers
      : typeof numbers === 'string'
        ? numbers.split(/[\s,-]+/).map(n => n.trim()).filter(Boolean)
        : []
    : [firstPrize, secondPrize, thirdPrize].filter(Boolean);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, [drawDate, firstPrize, secondPrize, thirdPrize, numbers]);

  const dateObj = drawDate ? new Date(drawDate) : null;
  const formattedDate = dateObj
    ? dateObj.toLocaleDateString('id-ID', {
        weekday: 'short', day: 'numeric', month: 'short', year: 'numeric'
      })
    : '-';
  const formattedTime = dateObj
    ? dateObj.toLocaleTimeString('id-ID', {             hour: '2-digit', minute: '2-digit',
            timeZone: 'Asia/Jakarta' })
    : '-';

  return (
    <div className="relative bg-gradient-to-br from-red-900 to-red-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-transform duration-300 transform hover:-translate-y-2">
      {/* Red neon corner accent */}
      <div className="absolute -top-3 -left-3 w-10 h-10 bg-red-600/80 rounded-full blur-xl animate-pulse" />

      <div className="p-6 flex flex-col space-y-4">
        {/* Header: City & Date */}
        <div className="flex justify-between items-center">
          <h3 className="text-3xl font-extrabold text-white truncate">{city || '-'}</h3>
          <time dateTime={drawDate} className="text-sm text-gray-300 italic">
            {formattedDate}
          </time>
        </div>

        {/* Number balls */}
        <div className="grid grid-cols-4 gap-4 justify-items-center">
          {nums.length > 0 ? (
            nums.map((n, i) => (
              <div
                key={i}
                className={
                  `w-14 h-14 flex items-center justify-center rounded-full bg-gradient-to-br from-yellow-500 to-red-600 text-white font-extrabold text-xl shadow-[0_0_15px_rgba(255,0,0,0.5)] transform transition-all duration-700` +
                  (mounted
                    ? ` opacity-100 translate-y-0 delay-${i * 150}`
                    : ' opacity-0 translate-y-6')
                }
              >
                {n}
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-400 italic">Belum ada hasil</p>
          )}
        </div>

        {/* Footer timestamp */}
        <p className="text-center text-xs text-gray-300">
          Terakhir: <span className="font-medium text-white">{formattedTime}</span> WIB
        </p>
      </div>
    </div>
  );
}
