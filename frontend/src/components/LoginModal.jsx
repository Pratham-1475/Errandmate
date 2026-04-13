import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const LoginModal = ({ isOpen, onClose, setUser }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', qualifications: '', skills: '' });

  const resetModal = () => {
    setIsSignup(false);
    setForm({ email: '', password: '', qualifications: '', skills: '' });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup ? '/signup' : '/login';
      const payload = { 
        email: form.email.trim().toLowerCase(), 
        password: form.password 
      };

      if (isSignup) {
        payload.qualifications = form.qualifications;
        payload.skills = form.skills;
        payload.name = form.email.split('@')[0];
      }

      const res = await axios.post(`${import.meta.env.VITE_API_URL}${endpoint}`, payload);

      // FIXED: Akshat returns the direct user object. Checking for res.data.id.
      if (res.data && res.data.id) {
        localStorage.setItem('errandmate_user', JSON.stringify(res.data));
        setUser(res.data);
        onClose();
        window.location.href = '/dashboard';
      }
    } catch (err) {
      if (err.response?.status === 404) {
        alert("Account not found. Switching to Signup—please create a profile!");
        setIsSignup(true);
      } else {
        alert(err.response?.data?.message || "Auth failed. Check credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { onClose(); resetModal(); }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="relative bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl">
            <h2 className="text-3xl font-black mb-2 text-center">{isSignup ? 'Create Profile' : 'Welcome Back'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              <input type="email" placeholder="Campus Email" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600 font-bold" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} />
              <input type="password" placeholder="Password" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600 font-bold" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} />
              {isSignup && (
                <div className="space-y-4">
                  <input type="text" placeholder="Qualifications (B.Tech, etc.)" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none" onChange={(e) => setForm({...form, qualifications: e.target.value})} />
                  <textarea placeholder="Skills" required className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none resize-none" rows="2" onChange={(e) => setForm({...form, skills: e.target.value})} />
                </div>
              )}
              <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-slate-900 transition-all">
                {loading ? 'Processing...' : (isSignup ? 'Create Profile' : 'Login')}
              </button>
              <p className="text-center text-xs font-bold text-slate-500 cursor-pointer mt-4" onClick={() => setIsSignup(!isSignup)}>
                {isSignup ? "Have an account? Login here" : "Don't have an account? Sign up"}
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;