import React from 'react';
import { Home, Shield, Phone, Users } from 'lucide-react';

const BottomNav = ({ currentPage, setCurrentPage }) => {
  const buttons = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'sos', icon: Shield, label: 'SOS' },
    { id: 'community', icon: Users, label: 'Community' },
    { id: 'emergency-numbers', icon: Phone, label: 'Emergency' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-md flex justify-around py-3">
      {buttons.map((btn) => (
        <button
          key={btn.id}
          onClick={() => setCurrentPage(btn.id)}
          className={`flex flex-col items-center text-sm ${
            currentPage === btn.id ? 'text-purple-600' : 'text-gray-500'
          }`}
        >
          <btn.icon className="w-6 h-6 mb-1" />
          {btn.label}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav;
