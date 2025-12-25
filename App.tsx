import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import InquiryForm from './components/InquiryForm';
import ResultView from './components/ResultView';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import { Employee } from './types';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const [searchResult, setSearchResult] = useState<Employee | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Initialize Theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleLogout = () => {
    setIsAdmin(false);
  };

  const handleLogin = () => {
    setIsAdmin(true);
  };

  const handleSearchResult = (result: Employee | null) => {
    setSearchResult(result);
  };

  const resetSearch = () => {
    setSearchResult(null);
  };

  return (
    <Router>
      <div className="min-h-screen flex flex-col relative overflow-hidden transition-colors duration-300 font-sans">
        
        {/* Dynamic Background Elements */}
        <div className="fixed inset-0 w-full h-full -z-10 bg-gray-50 dark:bg-gray-900">
           {/* Gradient Orbs */}
           <div className="absolute top-0 left-0 w-72 h-72 bg-purple-300 dark:bg-purple-900 rounded-full mix-blend-multiply dark:mix-blend-exclusion filter blur-xl opacity-70 animate-blob"></div>
           <div className="absolute top-0 right-0 w-72 h-72 bg-yellow-300 dark:bg-yellow-900 rounded-full mix-blend-multiply dark:mix-blend-exclusion filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
           <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 dark:bg-pink-900 rounded-full mix-blend-multiply dark:mix-blend-exclusion filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
           
           {/* Mesh Gradient Overlay */}
           <div className="absolute inset-0 bg-white/50 dark:bg-black/20 backdrop-blur-[100px]"></div>
        </div>

        <Header 
          isDark={isDark} 
          toggleTheme={toggleTheme} 
          isAdmin={isAdmin}
          onLogout={handleLogout}
        />

        <main className="flex-grow container mx-auto px-4 py-8 relative z-10">
          <Routes>
            <Route path="/" element={
              searchResult ? (
                <ResultView employee={searchResult} onNewSearch={resetSearch} />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[70vh]">
                   <InquiryForm onResult={handleSearchResult} />
                </div>
              )
            } />
            
            <Route path="/login" element={
              isAdmin ? <Navigate to="/admin" /> : <Login onLogin={handleLogin} />
            } />

            <Route path="/admin" element={
              isAdmin ? <AdminDashboard /> : <Navigate to="/login" />
            } />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;