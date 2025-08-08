import { useEffect, useState, Fragment } from 'react';
import { io as socketIO } from 'socket.io-client';
import { Listbox, Transition } from '@headlessui/react';
 import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/solid';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CityPoolCard from '../components/CityPoolCard';
import CountdownTimer from '../components/CountdownTimer';
import { fetchPools, fetchLatest, fetchAllLatest } from '../services/api';

export default function Home() {
  const [cities, setCities] = useState([]);
  const [results, setResults] = useState({});
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const apiOrigin = import.meta.env.VITE_API_URL
      ? new URL(import.meta.env.VITE_API_URL).origin
      : undefined;
    const socket = socketIO(import.meta.env.VITE_SOCKET_URL || apiOrigin);
    socket.on('resultUpdated', async ({ city }) => {
      try {
        const latest = await fetchLatest(city);
        setResults(prev => ({ ...prev, [city]: latest }));
        setError(null);
      } catch (err) {
        console.error('Failed to update results for', city, err);
        setError(err.message || 'Failed to update results');
      }
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        const cityList = await fetchPools();
        setCities(cityList);
        if (cityList.length) setSelectedCity(cityList[0]);

        const data = await fetchAllLatest(cityList);
        setResults(Object.fromEntries(data.map((item) => [item.city, item])));
        setError(null);
      } catch (err) {
        console.error('Failed to load pools:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const heroData = results[selectedCity] || {};
  const heroNextClose = heroData.nextClose ? new Date(heroData.nextClose) : null;
  const heroNextDraw = heroData.nextDraw ? new Date(heroData.nextDraw) : null;
  const showCountdown =
    heroNextClose instanceof Date && !isNaN(heroNextClose.valueOf());

  const heroNumbers = [
    heroData.firstPrize,
    heroData.secondPrize,
    heroData.thirdPrize,
  ].filter(Boolean);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      {error && (
        <div className="bg-red-100 text-red-700 text-center py-2">
          {error}
        </div>
      )}

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: 'url(/nusantara.webp)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 py-24 px-6 text-white">

          {/* Info & Selector */}
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-extrabold">
              Result Angka <span className="text-primary">{selectedCity || 'City'}</span> Pool
            </h1>

            {showCountdown
              ? <CountdownTimer targetDate={heroNextClose} />
              : <div className="h-12 w-48 bg-gray-700 animate-pulse rounded-md" />
            }

            {showCountdown && (
              <p className="text-sm text-gray-300">
                Tutup:{' '}
                {heroNextClose.toLocaleString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short',
                  timeZone: 'Asia/Jakarta',
                })}
                <br />
                Undian:{' '}
                {heroNextDraw?.toLocaleString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short',
                  timeZone: 'Asia/Jakarta',
                })}
              </p>
            )}

            {/* Custom City Selector */}
            <Listbox value={selectedCity} onChange={setSelectedCity}>
              <div className="relative mt-2 w-64">
                <Listbox.Button className="relative w-full cursor-pointer bg-gray-700 text-white py-2 pl-4 pr-10 text-left rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                  <span className="block truncate">{selectedCity || 'Pilih Kota'}</span>
 <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
   <ChevronUpDownIcon className="h-5 w-5 text-gray-300" />
 </span>
                </Listbox.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
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

          {/* Featured Pool Card */}
          <div className="w-full lg:w-1/2">
            {loading
              ? <div className="w-full h-64 bg-gray-700 animate-pulse rounded-2xl" />
              : <CityPoolCard city={selectedCity} drawDate={heroData.drawDate}                firstPrize={heroData.firstPrize}
                secondPrize={heroData.secondPrize}
                thirdPrize={heroData.thirdPrize} numbers={heroNumbers} />
            }
          </div>
        </div>
      </section>

      {/* All Cities Grid */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">
          Hasil Result Semua Pasaran
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => {
              const data = results[city] || {};
               const nums = [
                data.firstPrize,
                data.secondPrize,
                data.thirdPrize,
              ].filter(Boolean);
              return <CityPoolCard key={city} city={city} drawDate={data.drawDate}                  firstPrize={data.firstPrize}
                  secondPrize={data.secondPrize}
                  thirdPrize={data.thirdPrize} numbers={nums} />;
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
);
}
