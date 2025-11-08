import { Home, Shield, Users, Phone } from "lucide-react";

const BottomNav = ({ currentPage, setCurrentPage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-inner flex justify-around py-3 border-t border-gray-200">
      <button onClick={() => setCurrentPage("home")} className="flex flex-col items-center text-gray-700 hover:text-purple-600">
        <Home className="w-5 h-5" />
        <span className="text-xs">Home</span>
      </button>

      <button onClick={() => setCurrentPage("sos")} className="flex flex-col items-center text-gray-700 hover:text-purple-600">
        <Shield className="w-5 h-5" />
        <span className="text-xs">SOS</span>
      </button>

      <button onClick={() => setCurrentPage("community")} className="flex flex-col items-center text-gray-700 hover:text-purple-600">
        <Users className="w-5 h-5" />
        <span className="text-xs">Community</span>
      </button>

      {/* ✅ Fix this one */}
      <button
        onClick={() => setCurrentPage("emergency-dial")}
        className="flex flex-col items-center text-gray-700 hover:text-purple-600"
      >
        <Phone className="w-5 h-5" />
        <span className="text-xs">Emergency</span>
      </button>
    </nav>
  );
};

export default BottomNav;
