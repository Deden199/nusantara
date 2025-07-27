import { useState } from 'react';
import { Bell, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export default function HeaderAdmin() {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState(3); // contoh jumlah notifikasi

  const handleLogout = () => {
    // Clear token & redirect
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
      </div>
      <div className="flex items-center space-x-6">
        {/* Bell Notification */}
        <div className="relative cursor-pointer">
          <Bell size={24} className="text-gray-600 hover:text-gray-800" />
          {alerts > 0 && (
            <span className="absolute top-0 right-0 inline-flex items-center justify-center h-5 w-5 text-xs font-semibold text-white bg-red-600 rounded-full">
              {alerts}
            </span>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <LogOut size={20} />
          <span className="hidden md:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}
