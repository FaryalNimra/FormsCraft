import { Settings, Bell, ChevronDown, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-[60]">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm">
          <FileText size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">FormCraft</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Professional</span>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-5">
          <button className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest">Resources</button>
          <button className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest">Help</button>
        </div>

        <div className="h-4 w-px bg-gray-100 mx-1"></div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-all">
            <Bell size={18} />
          </button>
          <div className="flex items-center gap-2 pl-1 pr-3 py-1 border border-gray-100 rounded-full hover:bg-gray-50 transition-all cursor-pointer">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 border border-white"></div>
            <div className="hidden sm:flex items-center gap-1.5">
              <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Workspace</span>
              <ChevronDown size={12} className="text-gray-400" />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
