// pages/LiveDrawPage.jsx
import { useEffect, useState, Fragment, useRef } from 'react';
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
      className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-red-600 text-gray-900 font-extrabold text-lg sm:text-xl shadow-lg border-2 border-white"
    >
      {display}
    </motion.div>
  );
}

export default function LiveDrawPage() {
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [balls, setBalls] = useState(() =>
    Array.from({ length: 6 }, () => ({ value: null, rolling: false }))
  );
  const [prize, setPrize] = useState('');
  const socketRef = useRef(null);
  const prizeRef = useRef('');

  // Fetch list of pools
  useEffect(() => {
    async function load() {
      const list = await fetchPools();
      setCities(list);
      if (list.length) setSelectedCity(list[0]);
    }
    load();
  }, []);

  // Setup socket connection
  useEffect(() => {
    const apiOrigin = import.meta.env.VITE_API_URL
      ? new URL(import.meta.env.VITE_API_URL).origin
      : undefined;
    const socket = socketIO(import.meta.env.VITE_SOCKET_URL || apiOrigin);
    socketRef.current = socket;

    socket.on('prizeStart', ({ prize }) => {
      prizeRef.current = prize;
      setPrize(prize);
      setBalls(Array.from({ length: 6 }, () => ({ value: null, rolling: false })));
      setBalls(prev => {
        const arr = [...prev];
        if (arr[0]) arr[0].rolling = true;
        return arr;
      });
    });

    socket.on('drawNumber', ({ prize: p, index, number }) => {
      if (p !== prizeRef.current) return;
      setBalls(prev => {
        const next = [...prev];
        next[index] = { value: number, rolling: false };
        if (index + 1 < next.length) {
          next[index + 1].rolling = true;
        }
        return next;
      });
    });

    return () => socket.disconnect();
  }, []);

  // When city changes, reset balls and subscribe
  useEffect(() => {
    if (!selectedCity || !socketRef.current) return;
    setBalls(Array.from({ length: 6 }, () => ({ value: null, rolling: false })));
    setPrize('');
    prizeRef.current = '';
    socketRef.current.emit?.('joinLive', selectedCity);
  }, [selectedCity]);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-gray-100">
      <Header />
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 space-y-8">
        <div className="w-64">
          <Listbox value={selectedCity} onChange={setSelectedCity}>
            <div className="relative">
              <Listbox.Button className="relative w-full cursor-pointer bg-gray-700 text-white py-2 pl-4 pr-10 text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                <span className="block truncate">{selectedCity || 'Pilih Kota'}</span>
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
                <Listbox.Options className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto focus:outline-none">
                  {cities.map((city, idx) => (
                    <Listbox.Option
                      key={idx}
                      value={city}
                      className={({ active }) =>
                        `cursor-pointer select-none relative py-2 pl-10 pr-4 ${
                          active ? 'bg-primary text-white' : 'text-gray-900'
                        }`
                      }
                    >
                      {({ selected }) => (
                        <>
                          <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                            {city}
                          </span>
                          {selected && (
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-primary">
                              <CheckIcon className="h-5 w-5" />
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
        </div>
        {prize && (
          <h2 className="text-2xl font-bold mt-4">
            {prizeLabels[prize]}
          </h2>
        )}

        <div className="flex flex-wrap justify-center gap-4 mt-8">
          {balls.map((ball, idx) => (
            <Ball key={idx} rolling={ball.rolling} value={ball.value} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
