// src/pages/Login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { adminLogin } from '../services/api';

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminLogin(form.username, form.password);
      if (res.token) {
        localStorage.setItem('token', res.token);
        navigate('/admin', { replace: true });
      } else {
        setError(res.message || 'Login gagal');
      }
    } catch (err) {
      setError(err.message || 'Login gagal');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4"
        >
          <h2 className="text-2xl font-semibold text-gray-800 text-center">
            Admin Login
          </h2>
          {error && <p className="text-red-600 text-center">{error}</p>}
          <input
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
          />
          <input
            type="password"
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-primary focus:border-primary"
            placeholder="Password"
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="submit"
            className="w-full bg-primary text-white rounded-lg py-2 hover:bg-primary-dark transition"
          >
            Login
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
