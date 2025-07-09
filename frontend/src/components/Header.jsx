import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header className="bg-primary text-gold p-4 flex justify-between items-center" style={{backgroundImage:'url(/batik.png)'}}>
      <h1 className="font-bold text-xl">Nusantara Pool</h1>
      <nav className="space-x-4">
        <Link to="/" className="hover:underline">Beranda</Link>
        <Link to="/admin" className="hover:underline">Admin</Link>
      </nav>
    </header>
  );
}
