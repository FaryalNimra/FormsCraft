'use client';

import { Settings, Bell, ChevronDown, FileText, Check } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from './ThemeProvider';
import { useState, useRef, useEffect } from 'react';

export default function Navbar() {
  const { theme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-[60]">
      <Link href="/" className="flex items-center gap-2.5 group">
        <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-colors">
          <FileText size={18} />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-gray-900 leading-none tracking-tight">FormCraft</span>
          <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none mt-0.5">Professional</span>
        </div>
      </Link>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center gap-5">
          <button className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Resources</button>
          <button className="text-[10px] font-bold text-gray-400 hover:text-blue-600 uppercase tracking-widest transition-colors">Help</button>
        </div>

        <div className="h-4 w-px bg-gray-100 mx-1"></div>

        <div className="flex items-center gap-3">
          <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-lg transition-all">
            <Bell size={18} />
          </button>

          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-2 pl-2 pr-3 py-1.5 border border-gray-100 rounded-full hover:bg-gray-50 transition-all cursor-pointer bg-white shadow-sm hover:shadow-md group"
            >
              <div className="flex -space-x-1.5 overflow-hidden">
                <div
                  className="w-4 h-4 rounded-full border-2 border-white shadow-sm z-[10]"
                  style={{ backgroundColor: availableThemes[theme].primary }}
                ></div>
                {Object.entries(availableThemes)
                  .filter(([id]) => id !== theme)
                  .slice(0, 2)
                  .map(([id, t], i) => (
                    <div
                      key={id}
                      className="w-4 h-4 rounded-full border-2 border-white shadow-sm transition-transform group-hover:translate-x-0.5"
                      style={{ backgroundColor: t.primary, zIndex: 5 - i }}
                    ></div>
                  ))}
              </div>
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-gray-900 uppercase tracking-wider">Workspace</span>
                <ChevronDown size={12} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </div>
            </div>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 p-3 animate-in fade-in zoom-in duration-200 z-[70]">
                <div className="mb-3 px-2">
                  <h3 className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest">Workspace Theme</h3>
                </div>
                <div className="grid grid-cols-1 gap-1">
                  {Object.entries(availableThemes).map(([id, t]) => (
                    <button
                      key={id}
                      onClick={() => {
                        setTheme(id);
                        setIsOpen(false);
                      }}
                      className={`flex items-center justify-between w-full px-2 py-1.5 rounded-lg transition-all ${theme === id ? 'bg-gray-50 text-gray-900' : 'text-gray-500 hover:bg-gray-50/50 hover:text-gray-700'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-5 h-5 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: t.primary }}
                        ></div>
                        <span className="text-[11px] font-bold tracking-tight">{t.name}</span>
                      </div>
                      {theme === id && <Check size={12} className="text-blue-600" />}
                    </button>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-50 px-2">
                  <p className="text-[8px] font-medium text-gray-400 leading-relaxed italic">Changes global primary colors across all projects.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
