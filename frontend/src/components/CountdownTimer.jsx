import { useEffect, useState } from 'react';

export default function CountdownTimer({ targetDate, onComplete }) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const tick = () => {
      const current = Date.now();
      if (current >= targetDate) {
        setNow(current);
        clearInterval(id);
        onComplete?.();
      } else {
        setNow(current);
      }
    };
    const id = setInterval(tick, 1000);
    tick();
    return () => clearInterval(id);
  }, [targetDate, onComplete]);

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
