import { useEffect, useState } from 'react';

export default function CityPoolCard({ city, drawDate, numbers }) {
  // Гарантируем, что numbers — массив строк
  const nums = Array.isArray(numbers)
    ? numbers
    : typeof numbers === 'string'
      ? numbers.split(/[\s,-]+/).map(n => n.trim()).filter(Boolean)
      : [];

  // Локальный state, чтобы добавить эффект “fade-in” при обновлении
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(true);
    return () => setShow(false);
  }, [drawDate, numbers]);

  return (
    <div
      className={`
        relative bg-white rounded-3xl overflow-hidden shadow-lg 
        transition-transform transform hover:-translate-y-1
      `}
      style={{ minWidth: '200px' }}
    >
      {/* Accent bar */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-primary to-gold" />

      {/* Card content */}
      <div className="p-6 flex flex-col space-y-4">
        {/* City & Date */}
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-primary">{city}</h3>
          <time
            dateTime={drawDate}
            className="text-sm text-gray-400"
          >
            {new Date(drawDate).toLocaleDateString('id-ID', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </time>
        </div>

        {/* Number balls */}
        <div className="flex justify-center space-x-3">
          {nums.length > 0 ? nums.map((n, i) => (
            <div
              key={i}
              className={`
                w-12 h-12 flex items-center justify-center rounded-full 
                bg-red-600 text-white font-semibold text-lg shadow-md
                ${show ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
                transition-all duration-500 delay-${i * 100}
              `}
            >
              {String(n).padStart(2, '0')}
            </div>
          )) : (
            <span className="text-gray-300 italic">– Belum ada –</span>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-center text-xs text-gray-500">
          Update: {new Date(drawDate).toLocaleTimeString('id-ID', {
            hour: '2-digit', minute: '2-digit'
          })} WIB
        </p>
      </div>
    </div>
  );
}
