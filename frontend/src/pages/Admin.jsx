import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { adminLogin, addPool, overrideResults } from '../services/api';

export default function Admin() {
  const [token, setToken] = useState('');
  const [city, setCity] = useState('');
  const [overrideData, setOverrideData] = useState({ city: '', drawDate: '', numbers: '' });
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });

  const handleLogin = async e => {
    e.preventDefault();
    const res = await adminLogin(form.username, form.password);
    if (res.token) setToken(res.token);
  };

  const handleAdd = async e => {
    e.preventDefault();
    if (!city) return;
    try {
      await addPool(city, token);
      setMessage('Kota ditambahkan');
    } catch (err) {
      setMessage('Gagal menambahkan kota');
    }
  };

  const handleOverride = async e => {
    e.preventDefault();
    const { city: c, drawDate, numbers } = overrideData;
    if (!c || !drawDate || !numbers) return;
    try {
      await overrideResults(c, drawDate, numbers, token);
      setMessage('Hasil diperbarui');
    } catch (err) {
      setMessage('Gagal memperbarui hasil');
    }
  };

  if (!token) {
    return (
      <div>
        <Header />
        <main className="p-4">
          <form onSubmit={handleLogin} className="space-y-2 max-w-sm">
            <input className="border p-2 w-full" placeholder="Username" value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
            <input type="password" className="border p-2 w-full" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
            <button className="bg-primary text-gold px-4 py-2" type="submit">Login</button>
          </form>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Header />
      <main className="p-4 space-y-4">
        <form onSubmit={handleAdd} className="space-y-2 max-w-sm">
          <input className="border p-2 w-full" placeholder="Nama Kota" value={city} onChange={e => setCity(e.target.value)} />
          <button className="bg-primary text-gold px-4 py-2" type="submit">Tambah Kota</button>
        </form>

        <form onSubmit={handleOverride} className="space-y-2 max-w-sm">
          <input
            className="border p-2 w-full"
            placeholder="Kota"
            value={overrideData.city}
            onChange={e => setOverrideData({ ...overrideData, city: e.target.value })}
          />
          <input
            type="datetime-local"
            className="border p-2 w-full"
            value={overrideData.drawDate}
            onChange={e => setOverrideData({ ...overrideData, drawDate: e.target.value })}
          />
          <input
            className="border p-2 w-full"
            placeholder="Nomor, pisahkan dengan koma"
            value={overrideData.numbers}
            onChange={e => setOverrideData({ ...overrideData, numbers: e.target.value })}
          />
          <button className="bg-primary text-gold px-4 py-2" type="submit">Update Hasil</button>
        </form>

        {message && <p className="text-green-600">{message}</p>}
      </main>
      <Footer />
    </div>
  );
}
