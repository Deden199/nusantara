// pages/LuckyNumberPage.jsx
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { RefreshCw } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function LuckyNumberPage() {
  const [count, setCount] = useState(4);
  const [numbers, setNumbers] = useState([]);
  const [animKey, setAnimKey] = useState(0);
  const [loading, setLoading] = useState(false);

  // Generate `count` unique single digits (0-9)
  const generateNumbers = () => {
    setLoading(true);
    setTimeout(() => {
      const available = Array.from({ length: 10 }, (_, i) => i);
      const result = [];
      for (let i = 0; i < count; i++) {
        const idx = Math.floor(Math.random() * available.length);
        result.push(available.splice(idx, 1)[0]);
      }
      setNumbers(result);
      setAnimKey(prev => prev + 1);
      setLoading(false);
    }, 400);
  };

  // Ensure count stays between 1 and 5
  const handleCountChange = (e) => {
    const val = Math.max(1, Math.min(5, +e.target.value));
    setCount(val);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-gray-100">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Title Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-gradient-to-r from-amber-500 to-red-600 rounded-3xl shadow-2xl p-10 text-center max-w-md w-full mx-auto border-4 border-amber-300"
        >
          <h1 className="text-4xl font-extrabold mb-2 text-white drop-shadow-lg">
            Generate Nomor
          </h1>
          <div className="h-1 w-20 bg-white mx-auto mb-4 rounded-full opacity-70" />
          <p className="text-amber-100 mb-6">
            Pilih angka keberuntunganmu (maks 5 digit unik)
          </p>

          {/* Control Panel */}
          <div className="flex items-center justify-center space-x-3 mb-6">
            <label htmlFor="count" className="text-lg font-medium text-white">Jumlah:</label>
            <input
              id="count"
              type="number"
              min={1}
              max={5}
              value={count}
              onChange={handleCountChange}
              className="w-16 text-center bg-white text-gray-800 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
          </div>
          <button
            onClick={generateNumbers}
            className="inline-flex items-center bg-amber-400 hover:bg-amber-500 active:bg-amber-600 transition px-8 py-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-300"
            disabled={loading}
          >
            <RefreshCw className={`h-6 w-6 mr-2 text-white ${loading ? 'animate-spin' : ''}`} />
            <span className="text-white font-semibold">{loading ? 'Memuat...' : 'Generate'}</span>
          </button>
        </motion.div>

        {/* Results Grid */}
        <div className="mt-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 justify-center">
          <AnimatePresence>
            {numbers.length > 0 ? (
              numbers.map((n, idx) => (
                <motion.div
                  key={`${animKey}-${n}`}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ delay: idx * 0.1, type: 'spring', stiffness: 350, damping: 20 }}
                  className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-red-600 text-gray-900 font-extrabold text-xl shadow-lg border-2 border-white"
                >
                  {n}
                </motion.div>
              ))
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                className="col-span-full text-center text-amber-200 italic"
              >
                Tekan tombol untuk memulai!
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </main>

      <Footer />
    </div>
  );
}