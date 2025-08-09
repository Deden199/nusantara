import { Home, PlusCircle, RefreshCcw, Calendar, PlayCircle } from 'lucide-react';

const menuItems = [
  { key: 'dashboard', name: 'Dashboard', icon: Home },
  { key: 'add',       name: 'Tambah Kota', icon: PlusCircle },
  { key: 'override',  name: 'Tentukan Hasil', icon: RefreshCcw },
  { key: 'schedule',  name: 'Jadwal', icon: Calendar },
  { key: 'live-draw', name: 'Live Draw', icon: PlayCircle },

];

export default function Sidebar({ active, onSelect }) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
      <nav className="mt-10 px-4">
        {menuItems.map(item => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className={
              `w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition-colors text-left
              ${active === item.key
                ? 'bg-gray-100 text-primary font-semibold'
                : 'text-gray-600 hover:bg-gray-50'}`
            }
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
