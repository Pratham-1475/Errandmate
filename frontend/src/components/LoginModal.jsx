import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const LoginModal = ({ isOpen, onClose, setUser }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // FIXED: No more OTP field. Added password strength note.
  const [form, setForm] = useState({ 
    email: '', 
    password: '', 
    qualifications: '', 
    skills: '' 
  });

  const resetModal = () => {
    setIsSignup(false);
    setForm({ email: '', password: '', qualifications: '', skills: '' });
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isSignup ? '/signup' : '/login';
      
      // FIXED: Payload now matches Akshat's AWS Cognito logic
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

      // FIXED: Saving res.data.id directly from the RDS user object
      if (res.data && res.data.id) {
        localStorage.setItem('errandmate_user', JSON.stringify(res.data));
        setUser(res.data);
        onClose();
        
        // Success redirect
        window.location.href = '/dashboard';
      }
    } catch (err) {
      // 🚨 Cognito Error Handling
      const status = err.response?.status;
      const message = err.response?.data?.message || "";

      if (status === 400) {
        alert("Cognito Error: Password too weak or email already exists. Use a strong password like 'Errand@2026'!");
      } else if (status === 401) {
        alert("Invalid email or password.");
      } else if (status === 500) {
        alert("Server Error: Cognito worked, but RDS failed. Ask Gnyani to check the database.");
      } else {
        alert("Authentication failed. Check your connection.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
            onClick={() => { onClose(); resetModal(); }} 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
          />
          
          <motion.div 
            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
            className="relative bg-white w-full max-w-md p-10 rounded-[3rem] shadow-2xl"
          >
            <h2 className="text-3xl font-black mb-2 text-center">
              {isSignup ? 'Join ErrandMate' : 'Welcome Back'}
            </h2>
            <p className="text-center text-slate-400 text-xs mb-8 font-bold uppercase tracking-widest">
              Secured by AWS Cognito
            </p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <input 
                type="email" 
                placeholder="Campus Email" 
                required 
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600 font-bold" 
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})} 
              />
              
              <input 
                type="password" 
                placeholder="Strong Password (e.g. Errand@2026)" 
                required 
                className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600 font-bold" 
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})} 
              />

              {isSignup && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                  <input 
                    type="text" 
                    placeholder="Qualifications (e.g. B.Tech ICT)" 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600" 
                    onChange={(e) => setForm({...form, qualifications: e.target.value})} 
                  />
                  <textarea 
                    placeholder="Skills (React, AWS, Node.js)" 
                    required 
                    className="w-full px-6 py-4 bg-slate-50 rounded-2xl outline-none resize-none" 
                    rows="2" 
                    onChange={(e) => setForm({...form, skills: e.target.value})} 
                  />
                </motion.div>
              )}

              <button className="w-full py-5 bg-indigo-600 text-white font-black rounded-2xl shadow-xl hover:bg-slate-900 transition-all">
                {loading ? 'Authenticating...' : (isSignup ? 'Register' : 'Login')}
              </button>
              
              <p 
                className="text-center text-xs font-bold text-slate-500 cursor-pointer mt-4" 
                onClick={() => { setIsSignup(!isSignup); }}
              >
                {isSignup ? "Already have an account? Login" : "New student? Signup"}
              </p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;