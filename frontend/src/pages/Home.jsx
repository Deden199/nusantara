import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CityPoolCard from '../components/CityPoolCard';
import { fetchPools, fetchLatest } from '../services/api';

export default function Home() {
  const [cities, setCities] = useState([]);
  const [results, setResults] = useState({});
  const [selected, setSelected] = useState('');

  useEffect(() => {
    fetchPools().then(setCities);
  }, []);

  useEffect(() => {
    if (selected) {
      fetchLatest(selected).then(r => setResults({ [selected]: r }));
    }
  }, [selected]);

  return (
    <div>
      <Header />
      <main className="p-4">
        <div className="mb-4">
          <label htmlFor="city">Pilih Kota:</label>
          <select id="city" className="ml-2" onChange={e => setSelected(e.target.value)}>
            <option value="">-- Pilih --</option>
            {cities.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(results).map(([city, res]) => (
            <CityPoolCard key={city} city={city} drawDate={res.drawDate} numbers={res.numbers} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
