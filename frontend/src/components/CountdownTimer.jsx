import { useEffect, useState } from 'react';

const getJakartaNow = () =>
  new Date(
    new Date().toLocaleString('en-US', { timeZone: 'Asia/Jakarta' })
  ).getTime();

export default function CountdownTimer({ targetDate }) {
  const [now, setNow] = useState(getJakartaNow());

  useEffect(() => {
    const id = setInterval(() => setNow(getJakartaNow()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = Math.max(0, targetDate - now);
  const hrs = Math.floor(diff / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <div className="flex items-baseline space-x-2 text-4xl font-bold">
      <span className="opacity-50">{String(hrs).padStart(2, '0')}</span>
      <span>:</span>
      <span className="text-red-500">{String(mins).padStart(2, '0')}</span>
      <span>:</span>
      <span className="text-red-500">{String(secs).padStart(2, '0')}</span>
    </div>
  );
}
