import React from 'react';
import { AlertCircle, MapPin, Mic, Phone, PhoneCall, Navigation, Shield, Users, ChevronRight } from 'lucide-react';

const HomePage = ({ setCurrentPage }) => {
  const features = [
    { id: 'sos', icon: AlertCircle, title: 'SOS Emergency', desc: 'Instant alert to contacts', color: 'from-red-500 to-red-600', badge: 'Critical' },
    { id: 'live-tracking', icon: MapPin, title: 'Live Tracking', desc: 'Real-time location sharing', color: 'from-blue-500 to-blue-600' },
    { id: 'voice-activation', icon: Mic, title: 'Voice SOS', desc: 'Say safe word to alert', color: 'from-green-500 to-green-600' },
    { id: 'shake-detection', icon: Phone, title: 'Shake Alert', desc: 'Shake phone for SOS', color: 'from-orange-500 to-orange-600' },
    { id: 'fake-call', icon: PhoneCall, title: 'Fake Call', desc: 'Exit unsafe situations', color: 'from-purple-500 to-purple-600' },
    { id: 'help-centers', icon: Navigation, title: 'Help Centers', desc: 'Find nearby assistance', color: 'from-teal-500 to-teal-600' },
    { id: 'safe-walk', icon: Shield, title: 'Safe Walk', desc: 'Monitored journey', color: 'from-indigo-500 to-indigo-600' },
    { id: 'emergency-numbers', icon: Phone, title: 'Emergency Dial', desc: 'Quick access helplines', color: 'from-red-600 to-pink-600' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Stay Safe, Stay Connected</h2>
        <p className="text-gray-600">Your comprehensive safety companion is ready</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => setCurrentPage(feature.id)}
            className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-2xl transition-all transform hover:-translate-y-2 text-left group"
          >
            <div className={`bg-gradient-to-br ${feature.color} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
              <feature.icon className="w-7 h-7 text-white" />
            </div>
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-lg font-bold text-gray-800">{feature.title}</h3>
              {feature.badge && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">{feature.badge}</span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-4">{feature.desc}</p>
            <div className="flex items-center text-purple-600 text-sm font-medium group-hover:gap-2 transition-all">
              <span>Open feature</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl border-2 border-green-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-semibold text-green-800">System Active</span>
          </div>
          <p className="text-sm text-gray-700">All safety features operational</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl border-2 border-blue-200">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-blue-800">Protected 24/7</span>
          </div>
          <p className="text-sm text-gray-700">Round the clock monitoring</p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl border-2 border-purple-200">
          <div className="flex items-center gap-3 mb-2">
            <Users className="w-5 h-5 text-purple-600" />
            <span className="font-semibold text-purple-800">Community Strong</span>
          </div>
          <p className="text-sm text-gray-700">10,000+ active users</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
