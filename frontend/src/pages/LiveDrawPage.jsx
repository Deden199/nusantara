// pages/LiveDrawPage.jsx
import { useEffect, useState, Fragment, useRef, useMemo } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import { io as socketIO } from 'socket.io-client';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchPools } from '../services/api';

const prizeLabels = {
  first: 'Hadiah Pertama',
  second: 'Hadiah Kedua',
  third: 'Hadiah Ketiga',
};

// --- Utils ---
const parseDate = (v) => (v ? new Date(v) : null);
const now = () => new Date();

function formatCountdown(target) {
  if (!target) return '';
  const diff = Math.max(0, target - now());
  const s = Math.floor(diff / 1000);
  const hh = String(Math.floor(s / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

// --- Ball component (mobile-safe, responsive, extra glow) ---
function Ball({ rolling, value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let interval;
    if (rolling) {
      interval = setInterval(() => {
        setDisplay(Math.floor(Math.random() * 10));
      }, 80);
    } else if (value !== null && value !== undefined) {
      setDisplay(value);
    }
    return () => clearInterval(interval);
  }, [rolling, value]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 350, damping: 20 }}
      className={[
        // ukuran dibuat fluid dan aman di mobile
        'w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16',
        'flex items-center justify-center rounded-full',
        'bg-gradient-to-br from-amber-300 to-red-600 text-gray-900 font-extrabold',
        'text-lg xs:text-xl sm:text-2xl',
        'shadow-[0_0_20px_rgba(255,255,255,0.35)] border-2 border-white',
        rolling ? 'animate-pulse' : '',
      ].join(' ')}
    >
      {display}
    </motion.div>
  );
}

// --- Styles & Prize Box ---
const PRIZE_STYLES = {
  first: {
    title: 'Hadiah Pertama',
    ringFrom: 'from-amber-400',
    ringTo: 'to-red-500',
    headerGrad: 'from-amber-500/20 to-red-500/20',
    medal: '🥇',
    chipColor: 'bg-amber-500/15 text-amber-200 border-amber-300/30',
  },
  second: {
    title: 'Hadiah Kedua',
    ringFrom: 'from-zinc-200',
    ringTo: 'to-sky-400',
    headerGrad: 'from-zinc-300/15 to-sky-400/20',
    medal: '🥈',
    chipColor: 'bg-sky-500/15 text-sky-200 border-sky-300/30',
  },
  third: {
    title: 'Hadiah Ketiga',
    ringFrom: 'from-orange-400',
    ringTo: 'to-rose-500',
    headerGrad: 'from-orange-400/15 to-rose-500/15',
    medal: '🥉',
    chipColor: 'bg-orange-500/15 text-orange-200 border-orange-300/30',
  },
};

function PrizeBox({ k, balls, active }) {
  const s = PRIZE_STYLES[k];
  const allFixed = balls.every((b) => b.value !== null && b.value !== undefined);
  const result = allFixed ? balls.map((b) => b.value).join('') : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl overflow-hidden"
    >
      {/* Glow border gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute -inset-[1px] rounded-2xl bg-gradient-to-br ${s.ringFrom} ${s.ringTo} opacity-30`} />
      </div>

      {/* Body */}
      <div className="relative rounded-2xl bg-gray-900/60 backdrop-blur p-4 sm:p-5 border border-white/10">
        {/* Header */}
        <div className={`flex items-center justify-between rounded-xl p-3 sm:p-4 bg-gradient-to-r ${s.headerGrad}`}>
          <div className="flex items-center gap-3">
            <div className="text-2xl">{s.medal}</div>
            <div>
              <div className="text-base sm:text-lg font-extrabold tracking-wide">{s.title}</div>
              <div className="text-xs sm:text-sm opacity-80">
                {active ? 'Sedang diundi…' : allFixed ? 'Selesai diundi' : 'Menunggu giliran'}
              </div>
            </div>
          </div>

          {/* Chip status / hasil */}
          <div
            className={[
              'px-3 py-1 rounded-full text-xs sm:text-sm border',
              s.chipColor,
              active ? 'animate-pulse' : '',
            ].join(' ')}
          >
            {active ? 'LIVE' : allFixed ? 'Final' : 'Idle'}
          </div>
        </div>

        {/* Balls */}
        <div className="mt-4 sm:mt-5">
          <div
            className={[
              'grid grid-cols-6 xs:grid-cols-6 sm:grid-cols-6 gap-3 sm:gap-4',
              'place-items-center',
              'px-1 sm:px-2',
            ].join(' ')}
          >
            {balls.map((ball, idx) => (
              <Ball key={idx} rolling={ball.rolling} value={ball.value} />
            ))}
          </div>

            {/* Result line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: result ? 1 : 0.6 }}
            className="mt-4 text-center"
          >
            <span className="text-xs uppercase tracking-wider opacity-70">Kombinasi</span>
            <div className="text-xl sm:text-2xl font-black tabular-nums mt-1">
              {result ? result : '— — — — — —'}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Active halo */}
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.7 }}
          transition={{ duration: 0.4 }}
          className="pointer-events-none absolute -inset-2 rounded-3xl blur-2xl"
          style={{
            background:
              'radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.12), rgba(0,0,0,0))',
          }}
        />
      )}
    </motion.div>
  );
}

export default function LiveDrawPage() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const initialBalls = () =>
    Array.from({ length: 6 }, () => ({ value: null, rolling: false }));
  const [prizes, setPrizes] = useState({
    first: initialBalls(),
    second: initialBalls(),
    third: initialBalls(),
    currentPrize: '',
  });
  const [nextStartAt, setNextStartAt] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [tickerItems, setTickerItems] = useState([]);
  const socketRef = useRef(null);
  const startRequestedRef = useRef(false);
  const [error, setError] = useState(null);

  // --- Normalize city item coming from API ({ city, startsAt, isLive }) ---
  const normalizeCity = (item) => {
    if (!item) return null;
    if (typeof item === 'string') {
      return { id: item, name: item, startsAt: null, isLive: false };
    }
    return {
      id: item.city || item.id || item.name || JSON.stringify(item),
      name: item.city || item.name || 'Unknown',
      startsAt: parseDate(item.startsAt) || null,
      isLive: Boolean(item.isLive),
      raw: item,
    };
  };

  // --- Sort: prioritize live / nearest to start time ---
  const sortedCities = useMemo(() => {
    const arr = cities.map(normalizeCity).filter(Boolean);
    return arr.sort((a, b) => {
      // Live first
      if (a.isLive && !b.isLive) return -1;
      if (!a.isLive && b.isLive) return 1;
      // Then nearest upcoming (non-null startsAt, earlier first)
      const aT = a.startsAt ? a.startsAt.getTime() : Infinity;
      const bT = b.startsAt ? b.startsAt.getTime() : Infinity;
      return aT - bT;
    });
  }, [cities]);

  // --- Initial fetch + pick best city (live or nearest) ---
  useEffect(() => {
    async function load() {
      try {
        const list = await fetchPools();
        setCities(Array.isArray(list) ? list : []);
        setError(null);
      } catch (err) {
        console.error('Failed to load pools', err);
        setError(err.message || 'Failed to load pools');
      }
    }
    load();
  }, []);

  useEffect(() => {
    if (!sortedCities.length) return;
    // pilih: live duluan, kalau tidak ada live, pilih start paling dekat
    const best = sortedCities[0];
    setSelectedCity(best);
    setNextStartAt(best.startsAt || null);
  }, [sortedCities]);

  // --- Countdown (prioritaskan kota yg mau mulai) ---
  useEffect(() => {
    if (!nextStartAt) {
      setCountdown('');
      return;
    }
    setCountdown(formatCountdown(nextStartAt));
    const t = setInterval(() => setCountdown(formatCountdown(nextStartAt)), 1000);
    return () => clearInterval(t);
  }, [nextStartAt]);

  useEffect(() => {
    startRequestedRef.current = false;
  }, [selectedCity, nextStartAt]);

  useEffect(() => {
    if (
      countdown === '00:00:00' &&
      !prizes.currentPrize &&
      selectedCity &&
      !startRequestedRef.current
    ) {
      startRequestedRef.current = true;
      const API_URL =
        import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
      const cityId = selectedCity.id ?? selectedCity.name ?? selectedCity;
      fetch(`${API_URL}/pools/${cityId}/live-draw`, { method: 'POST' }).catch(
        console.error
      );
    }
  }, [countdown, prizes.currentPrize, selectedCity]);

  // --- Socket setup ---
  useEffect(() => {
    const apiOrigin = import.meta.env.VITE_API_URL
      ? new URL(import.meta.env.VITE_API_URL).origin
      : undefined;
    const socket = socketIO(import.meta.env.VITE_SOCKET_URL || apiOrigin);
    socketRef.current = socket;

    socket.on('prizeStart', ({ prize }) => {
      setPrizes((prev) => {
        const updated = { ...prev, currentPrize: prize };
        const arr = initialBalls();
        arr[0].rolling = true;
        updated[prize] = arr;
        return updated;
      });
    });

    socket.on('drawNumber', ({ prize: p, index, number }) => {
      setPrizes((prev) => {
        const updated = { ...prev };
        const arr = prev[p].map((b) => ({ ...b }));
        arr[index] = { value: number, rolling: false };
        if (index + 1 < arr.length) arr[index + 1].rolling = true;
        updated[p] = arr;
        return updated;
      });
      // tambahkan ke ticker (riwayat angka keluar)
      setTickerItems((t) => [
        { ts: Date.now(), label: `#${index + 1}: ${number}` },
        ...t.slice(0, 9),
      ]);
    });

    socket.on('liveMeta', ({ isLive, startsAt }) => {
      // server optional: update meta agar countdown relevan
      setNextStartAt(parseDate(startsAt) || null);
    });

    return () => socket.disconnect();
  }, []);

  // --- (Re)join room ketika city berubah ---
  useEffect(() => {
    if (!selectedCity || !socketRef.current) return;
    setPrizes({
      first: initialBalls(),
      second: initialBalls(),
      third: initialBalls(),
      currentPrize: '',
    });
    socketRef.current.emit?.(
      'joinLive',
      selectedCity.id ?? selectedCity.name ?? selectedCity
    );
    setNextStartAt(selectedCity.startsAt || null);
  }, [selectedCity]);

  const cityLabel = (c) =>
    c?.name || c?.city || (typeof c === 'string' ? c : '') || 'Pilih Kota';

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-950 via-red-900 to-red-950 text-gray-100">
      <Header />
      {error && (
        <div className="bg-red-100 text-red-700 text-center py-2">{error}</div>
      )}
      <main className="flex-1 px-4 py-6 sm:py-10">
        {/* Live banner + countdown */}
        <div className="max-w-4xl mx-auto w-full">
          <motion.div
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="rounded-2xl p-4 sm:p-5 mb-5 sm:mb-8 bg-gradient-to-r from-red-700 to-amber-600 shadow-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                <span className="font-bold tracking-wide uppercase">Live Draw</span>
              </div>
              <div className="text-sm sm:text-base">
                {nextStartAt ? (
                  <span className="font-semibold">
                    Mulai dalam <span className="tabular-nums">{countdown}</span>
                  </span>
                ) : (
                  <span className="opacity-90">Menunggu jadwal dimulai…</span>
                )}
              </div>
            </div>

            {/* progress bar countdown (visual) */}
            {nextStartAt && (
              <motion.div
                key={countdown} // re-animate per tick
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, ease: 'linear' }}
                className="mt-3 h-1.5 rounded-full bg-white/30 overflow-hidden"
              >
                <div className="h-full w-full"></div>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* City selector + next-up list */}
        <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="lg:col-span-2 rounded-2xl p-4 sm:p-5 bg-gray-800/60 backdrop-blur"
          >
            <div className="mb-3 text-sm opacity-80">Pilih Kota / Pool</div>
            <Listbox value={selectedCity} onChange={setSelectedCity}>
              <div className="relative">
                <Listbox.Button className="relative w-full cursor-pointer bg-gray-700 text-white py-2.5 pl-4 pr-10 text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400">
                  <span className="block truncate">{cityLabel(selectedCity)}</span>
                  <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronUpDownIcon className="h-5 w-5 text-gray-300" />
                  </span>
                </Listbox.Button>
                <Transition
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-72 overflow-auto focus:outline-none">
                    {sortedCities.map((city, idx) => (
                      <Listbox.Option
                        key={city.id ?? idx}
                        value={city}
                        className={({ active }) =>
                          `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                            active ? 'bg-amber-500 text-white' : 'text-gray-900'
                          }`
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                              {cityLabel(city)}
                            </span>
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                              {selected ? (
                                <CheckIcon className="h-5 w-5 text-amber-600" />
                              ) : city.isLive ? (
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                              ) : city.startsAt ? (
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                              ) : null}
                            </span>
                            {city.startsAt && (
                              <span className="absolute inset-y-0 right-2 flex items-center text-xs opacity-70">
                                {city.startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>
              </div>
            </Listbox>
          </motion.div>

          {/* Next-up / Jadwal Ringkas */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="rounded-2xl p-4 sm:p-5 bg-gray-800/60 backdrop-blur"
          >
            <div className="font-semibold mb-2">Prioritas Mulai</div>
            <div className="space-y-2 max-h-48 overflow-auto pr-1">
              {sortedCities.slice(0, 6).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-sm bg-gray-700/50 rounded-lg px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    {c.isLive ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500 animate-pulse" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    )}
                    <span>{c.name}</span>
                  </div>
                  <span className="opacity-80">
                    {c.isLive
                      ? 'Live'
                      : c.startsAt
                      ? c.startsAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '-'}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Ticker (riwayat angka keluar) */}
        <div className="max-w-4xl mx-auto w-full mt-5 sm:mt-6">
          <div className="overflow-hidden rounded-xl bg-gray-800/60">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: '-100%' }}
              transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
              className="whitespace-nowrap py-2 px-4 text-sm"
            >
              {tickerItems.length ? (
                tickerItems.map((t) => (
                  <span key={t.ts} className="mr-6 opacity-90">
                    {t.label}
                  </span>
                ))
              ) : (
                <span className="opacity-70">Menunggu angka keluar…</span>
              )}
            </motion.div>
          </div>
        </div>

        {/* Prize sections */}
        <div className="max-w-4xl mx-auto w-full mt-6 sm:mt-8 space-y-6 sm:space-y-8">
          <PrizeBox k="first"  balls={prizes.first}  active={prizes.currentPrize === 'first'} />
          <PrizeBox k="second" balls={prizes.second} active={prizes.currentPrize === 'second'} />
          <PrizeBox k="third"  balls={prizes.third}  active={prizes.currentPrize === 'third'} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
