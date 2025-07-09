import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header
      className="bg-primary bg-cover bg-center text-white"
      style={{ backgroundImage: 'url(/batik.png)' }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gold rounded-full flex items-center justify-center text-primary font-bold">
            NP
          </div>
          <span className="text-2xl font-extrabold">Nusantara Pool</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/" className="hover:text-gold transition">Beranda</Link>
          <Link to="/lucky" className="hover:text-gold transition">Lucky Number</Link>
          <Link to="/results" className="hover:text-gold transition">Previous Results</Link>
          <Link to="/stats" className="hover:text-gold transition">Statistics</Link>
          <Link to="/about" className="hover:text-gold transition">About Us</Link>
          <Link to="/howtoplay" className="hover:text-gold transition">How To Play</Link>
          <button className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded-lg flex items-center space-x-1 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 16.5l6-4.5-6-4.5v9z" />
            </svg>
            <span>Live Streaming</span>
          </button>

        </nav>

        {/* Mobile Toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden p-2 text-white focus:outline-none"
        >
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {open && (
        <nav className="md:hidden bg-primary bg-opacity-90 text-white px-4 pb-4 space-y-2">
          {['Beranda','Lucky Number','Previous Results','Statistics','About Us','How To Play'].map((label) => (
            <Link
              key={label}
              to={`/${label.toLowerCase().replace(/ /g,'')}`}
              className="block py-2 hover:text-gold transition"
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button className="w-full text-left bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg flex items-center space-x-1 transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M10 16.5l6-4.5-6-4.5v9z" />
            </svg>
            <span>Live Streaming</span>
          </button>
          <div className="flex items-center space-x-2 pt-2">
            <img src="/flags/id.svg" alt="ID" className="w-5 h-5" />
            <span>ID</span>
            <span className="opacity-50">|</span>
            <img src="/flags/gb.svg" alt="EN" className="w-5 h-5" />
            <span>EN</span>
          </div>
        </nav>
      )}
    </header>
  );
}
