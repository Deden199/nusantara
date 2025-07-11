import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CityPoolCard from '../components/CityPoolCard';
import CountdownTimer from '../components/CountdownTimer';
import { fetchPools, fetchLatest } from '../services/api';

export default function Home() {
  const [cities, setCities] = useState([]);
  const [results, setResults] = useState({});
  const [nextDrawTimes, setNextDrawTimes] = useState({});
  const [loading, setLoading] = useState(true);
  const dummyNextDraw = new Date(Date.now() + 60 * 60 * 1000); // 1 jam dari sekarang

  // Ambil daftar kota dan hasil + nextDraw per kota
  
  useEffect(() => {
    fetchPools().then(cityList => {
      setCities(cityList);
      Promise.all(
        cityList.map(city =>
          fetchLatest(city).then(data => [city, data])
        )
      ).then(pairs => {
        const map = Object.fromEntries(pairs);
        setResults(map);
        // extract nextDraw untuk hero: pakai kota pertama
        if (pairs.length) {
          const [, firstData] = pairs[0];
          setNextDrawTimes(prev => ({ ...prev, hero: firstData.nextDraw }));
        }
      }).finally(() => setLoading(false));
    });
  }, []);

  const heroNextDraw = nextDrawTimes.hero ? new Date(nextDrawTimes.hero) : null;

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />

      {/* HERO SECTION */}
      <section
        className="relative bg-cover bg-center"
        style={{ backgroundImage: 'url(/nusantara.webp)' }}
      >
        <div className="absolute inset-0 bg-black bg-opacity-60" />
        <div className="relative max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-8 py-24 px-6 text-white">
          {/* Countdown */}
          <div className="flex-1 space-y-4">
            <h1 className="text-4xl lg:text-5xl font-extrabold">
              Next Draw Nusantara Pool
            </h1>
            {heroNextDraw ? (
              <CountdownTimer targetDate={heroNextDraw} />
            ) : (
              <div className="h-12 w-48 bg-gray-700 animate-pulse rounded-md" />
            )}
            {heroNextDraw && (
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
          </div>

          {/* Live Video */}
          <div className="w-full lg:w-1/2 aspect-video rounded-lg overflow-hidden shadow-lg">
            {loading ? (
              <div className="w-full h-full bg-gray-700 animate-pulse" />
            ) : (
              <iframe
                src={results[cities[0]]?.liveUrl || 'https://www.youtube.com/embed/live_stream?channel=CHANNEL_ID'}
                title="Live Streaming Nusantara Pool"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            )}
          </div>
        </div>
      </section>

      {/* GRID KOTA */}
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
            {cities.map(city => {
              const data = results[city] || {};
              let nums = [];
              if (data.numbers) {
                nums = Array.isArray(data.numbers)
                  ? data.numbers
                  : data.numbers.split(/[\s,-]+/).map(n => n.trim()).filter(Boolean);
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
