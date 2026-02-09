import { Settings, LogOut, FileText } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white">
      <div className="flex items-center gap-2 text-brand-blue">
        <div className="bg-brand-blue p-1.5 rounded-lg text-white">
          <FileText size={20} fill="white" />
        </div>
        <span className="text-xl font-bold text-gray-900">FormCraft</span>
      </div>

      <div className="flex items-center gap-6 text-gray-600">
        <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </button>
        <button className="flex items-center gap-2 hover:text-gray-900 transition-colors">
          <LogOut size={20} />
          <span className="text-sm font-medium">Sign Out</span>
        </button>
      </div>
    </nav>
  );
}
