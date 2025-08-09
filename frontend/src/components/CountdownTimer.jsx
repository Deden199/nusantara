import { useEffect, useState, useRef } from 'react';

export default function CountdownTimer({ targetDate, onComplete }) {
  const [now, setNow] = useState(Date.now());
  const intervalRef = useRef(null);
  const completedRef = useRef(false);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, []);

  useEffect(() => {
    const remaining = targetDate.getTime() - now;
    if (remaining <= 0 && !completedRef.current) {
      completedRef.current = true;
      if (onComplete) {
        onComplete();
      }
      clearInterval(intervalRef.current);
    }
  }, [now, onComplete, targetDate]);

  const diff = Math.max(0, targetDate.getTime() - now);
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
