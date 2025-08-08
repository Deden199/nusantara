import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { fetchPublicSchedules } from '../services/api';

export default function SchedulePage() {
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    fetchPublicSchedules().then(setSchedules).catch(console.error);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow max-w-2xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-center mb-6">Jadwal Penutupan &amp; Undian</h1>
        <div className="overflow-x-auto bg-white shadow rounded-lg">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Kota</th>
                <th className="px-4 py-2 text-left">Tutup</th>
                <th className="px-4 py-2 text-left">Undian</th>
              </tr>
            </thead>
            <tbody>
              {schedules.map((s, i) => (
                <tr
                  key={s.city}
                  className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-2">{s.city}</td>
                  <td className="px-4 py-2">
                    {new Date(`1970-01-01T${s.closeTime}:00+07:00`).toLocaleTimeString(
                      'id-ID',
                      {
                        timeZone: 'Asia/Jakarta',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(`1970-01-01T${s.drawTime}:00+07:00`).toLocaleTimeString(
                      'id-ID',
                      {
                        timeZone: 'Asia/Jakarta',
                        hour: '2-digit',
                        minute: '2-digit',
                      },
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
      <Footer />
    </div>
  );
}