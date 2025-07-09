import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { adminLogin, addPool } from '../services/api';

export default function Admin() {
  const [token, setToken] = useState('');
  const [city, setCity] = useState('');
  const [form, setForm] = useState({ username: '', password: '' });

  const handleLogin = async e => {
    e.preventDefault();
    const res = await adminLogin(form.username, form.password);
    if (res.token) setToken(res.token);
  };

  const handleAdd = async e => {
    e.preventDefault();
    if (!city) return;
    await addPool(city, token);
    alert('Kota ditambahkan');
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
      </main>
      <Footer />
    </div>
  );
}
