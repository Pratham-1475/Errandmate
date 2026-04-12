import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import Home from './components/Home';
import PostErrand from './components/PostErrand';
import ErrandFeed from './components/ErrandFeed';
import Dashboard from './components/Dashboard';
import LoginModal from './components/LoginModal';

const PageWrapper = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.4 }}>
    {children}
  </motion.div>
);

function AppContent() {
  const location = useLocation();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('errandmate_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('errandmate_user');
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('errandmate_user');
    setUser(null);
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 h-20 px-6 flex justify-between items-center shadow-sm">
        <Link to="/" className="text-2xl font-black tracking-tighter">
          ERRAND<span className="text-indigo-600">MATE</span>
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Home</Link>
          <Link to="/feed" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Browse Feed</Link>
          <Link to="/post" className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition-colors">Post Task</Link>
          {user && <Link to="/dashboard" className="text-sm font-black text-indigo-600 font-bold">My Dashboard</Link>}
          
          {user ? (
            <div className="flex items-center gap-4 pl-6 border-l border-slate-100">
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-indigo-600 leading-none mb-1">{user.name}</p>
                <button onClick={handleLogout} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline">Logout</button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setIsLoginOpen(true)} 
              className="px-6 py-2.5 bg-slate-900 text-white text-xs font-black rounded-full hover:bg-indigo-600 transition-all shadow-lg"
            >
              Login / Signup
            </button>
          )}
        </div>
      </nav>

      <main className="pt-20">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<PageWrapper><Home /></PageWrapper>} />
            <Route path="/feed" element={<PageWrapper><ErrandFeed /></PageWrapper>} />
            <Route path="/post" element={<PageWrapper><PostErrand /></PageWrapper>} />
            <Route path="/dashboard" element={<PageWrapper><Dashboard user={user} /></PageWrapper>} />
          </Routes>
        </AnimatePresence>
      </main>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} setUser={setUser} />
    </div>
  );
}

export default function App() { return ( <Router><AppContent /></Router> ); }