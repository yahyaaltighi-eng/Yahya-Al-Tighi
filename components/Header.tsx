import React from 'react';
import { Sun, Moon, LayoutDashboard, LogOut, Home } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import Logo from './Logo';

interface HeaderProps {
  isDark: boolean;
  toggleTheme: () => void;
  isAdmin?: boolean;
  onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDark, toggleTheme, isAdmin, onLogout }) => {
  const location = useLocation();

  return (
    <header className="sticky top-4 mx-4 z-50 rounded-2xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-lg border border-white/20 dark:border-gray-700/50 transition-all duration-300">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        
        {/* Logo Area */}
        <Link to="/" className="flex items-center gap-4 hover:opacity-80 transition-opacity group">
          <Logo className="h-12 w-12 md:h-14 md:w-14" />
          <div className="flex flex-col">
            <h1 className="text-lg md:text-xl font-bold text-gray-800 dark:text-gray-100 leading-tight">
              مراقبة التربية والتعليم <span className="text-primary-600 dark:text-primary-400">سلوق</span>
            </h1>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-medium">
              مكتب الموارد البشرية
            </span>
          </div>
        </Link>

        {/* Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          
          {isAdmin && (
            <div className="hidden md:flex items-center gap-2">
               {location.pathname === '/admin' ? (
                 <Link to="/" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                   <Home size={18} />
                   <span>الرئيسية</span>
                 </Link>
               ) : (
                 <Link to="/admin" className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                   <LayoutDashboard size={18} />
                   <span>لوحة التحكم</span>
                 </Link>
               )}
            </div>
          )}

          <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1"></div>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 text-gray-600 dark:text-yellow-400 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all active:scale-95 shadow-sm"
            aria-label="Toggle Dark Mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {isAdmin && (
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-xl shadow-red-500/20 shadow-lg transition-all active:scale-95"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">خروج</span>
            </button>
          )}

          {!isAdmin && location.pathname !== '/login' && (
             <Link to="/login" className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-xl transition-colors">
               دخول مسؤول
             </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;