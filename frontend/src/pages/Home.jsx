import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CityPoolCard from '../components/CityPoolCard';
import CountdownTimer from '../components/CountdownTimer';
import { fetchPools, fetchLatest } from '../services/api';

export default function Home() {
  const [cities, setCities] = useState([]);
  const [results, setResults] = useState({});
  const [selectedCity, setSelectedCity] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const cityList = await fetchPools();
        if (cityList.length > 0) setSelectedCity(cityList[0]);
        setCities(cityList);

        const pairs = await Promise.all(
          cityList.map(async (city) => {
            const data = await fetchLatest(city);
            return [city, data];
          })
        );
        const map = Object.fromEntries(pairs);
        setResults(map);
      } catch (err) {
        console.error('Failed to load pools:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const heroData = results[selectedCity] || {};
  const heroNextDraw = heroData.nextDraw
    ? new Date(heroData.nextDraw)
    : null;
  const showCountdown =
    heroNextDraw instanceof Date && !isNaN(heroNextDraw.valueOf());

  // parse numbers for CityPoolCard
  let heroNumbers = [];
  if (heroData.numbers) {
    heroNumbers = Array.isArray(heroData.numbers)
      ? heroData.numbers
      : heroData.numbers
          .split(/[\s,-]+/)
          .map((n) => n.trim())
          .filter(Boolean);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: 'url(/nusantara.webp)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 py-24 px-6 text-white">

          {/* Info & Selector */}
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold">
              Next Draw {selectedCity || 'City'} Pool
            </h1>

            {showCountdown ? (
              <CountdownTimer targetDate={heroNextDraw} />
            ) : (
              <div className="h-12 w-48 bg-gray-700 animate-pulse rounded-md" />
            )}

            {showCountdown && (
              <p className="text-sm text-gray-300">
                {heroNextDraw.toLocaleString('id-ID', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  timeZoneName: 'short',
                })}
              </p>
            )}

            {/* City Selector */}
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="mt-4 bg-gray-700 text-white px-4 py-2 rounded"
            >
              {cities.map((city) => (
                <option key={city} value={city} className="text-black">
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Featured Pool Card */}
          <div className="w-full lg:w-1/2">
            {loading ? (
              <div className="w-full h-64 bg-gray-700 animate-pulse rounded-2xl" />
            ) : (
              <CityPoolCard
                city={selectedCity}
                drawDate={heroData.drawDate}
                numbers={heroNumbers}
              />
            )}
          </div>
        </div>
      </section>

      {/* All Cities Grid */}
      <main className="flex-grow max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-bold text-center text-primary mb-8">
          Hasil Terbaru Semua Kota
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="h-64 bg-gray-200 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {cities.map((city) => {
              const data = results[city] || {};
              let nums = [];
              if (data.numbers) {
                nums = Array.isArray(data.numbers)
                  ? data.numbers
                  : data.numbers
                      .split(/[\s,-]+/)
                      .map((n) => n.trim())
                      .filter(Boolean);
              }
              return (
                <CityPoolCard
                  key={city}
                  city={city}
                  drawDate={data.drawDate}
                  numbers={nums}
                />
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
