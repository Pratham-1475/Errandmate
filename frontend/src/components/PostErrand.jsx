import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const PostErrand = () => {
  const [form, setForm] = useState({ title: '', description: '', location: '', budget: '' });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handlePost = async (e) => {
    e.preventDefault();
    const savedUser = JSON.parse(localStorage.getItem('errandmate_user'));
    
    if (!savedUser || !savedUser.id) {
      alert("Session expired. Please login again.");
      return;
    }

    setLoading(true);
    try {
      // Sending clientId was the key fix yesterday to link the task in RDS
      const payload = { 
        ...form, 
        clientId: savedUser.id 
      };

      await axios.post(`${import.meta.env.VITE_API_URL}/errands`, payload);
      
      // Yesterday we added this professional success animation
      setShowSuccess(true);
      
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 2000);

    } catch (err) {
      alert("Server Error: Could not post task. Check backend connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-6 relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-white p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-bl-full -mr-16 -mt-16 opacity-50" />

        <h2 className="text-4xl font-black mb-2 tracking-tight">
          Post an <span className="text-indigo-600 italic">Errand</span>
        </h2>
        <p className="text-slate-400 font-medium mb-10">Describe what you need and set a fair budget.</p>

        <form onSubmit={handlePost} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Task Title</label>
            <input 
              type="text" 
              placeholder="e.g., Pick up lab manual from Block C" 
              required 
              className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600 font-bold transition-all" 
              onChange={(e) => setForm({...form, title: e.target.value})} 
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Detailed Description</label>
            <textarea 
              placeholder="Be specific about the location and time..." 
              required 
              className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600 font-medium resize-none transition-all" 
              rows="4" 
              onChange={(e) => setForm({...form, description: e.target.value})} 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Campus Location</label>
              <input 
                type="text" 
                placeholder="e.g., Boys Hostel 2" 
                required 
                className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600 font-bold" 
                onChange={(e) => setForm({...form, location: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-4">Budget (₹)</label>
              <input 
                type="number" 
                placeholder="50" 
                required 
                className="w-full px-8 py-5 bg-slate-50 rounded-2xl outline-none border-2 border-transparent focus:border-indigo-600 font-black text-indigo-600" 
                onChange={(e) => setForm({...form, budget: e.target.value})} 
              />
            </div>
          </div>

          <button 
            disabled={loading} 
            className="w-full py-6 bg-slate-900 text-white font-black rounded-3xl hover:bg-indigo-600 transition-all shadow-xl shadow-slate-200 mt-4 flex items-center justify-center gap-3"
          >
            {loading ? "Syncing..." : "Launch Errand"}
          </button>
        </form>
      </motion.div>

      <AnimatePresence>
        {showSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-indigo-600/90 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.8, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} className="relative bg-white p-12 rounded-[3rem] shadow-2xl text-center max-w-sm w-full">
              <h3 className="text-3xl font-black mb-2 tracking-tight text-slate-900">Task Launched!</h3>
              <p className="text-slate-500 font-bold mb-8 text-sm">Your errand is now live on the campus feed.</p>
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.8 }} className="bg-indigo-600 h-full" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostErrand;