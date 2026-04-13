import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Zap, MapPin, Clock, TrendingUp } from 'lucide-react';

const ErrandFeed = () => {
  const [errands, setErrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    const fetchErrands = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/errands`);
        setErrands(res.data);
      } catch (err) { console.error(err); } 
      finally { setLoading(false); }
    };
    fetchErrands();
  }, []);

  const handleApply = async (errandId, budget) => {
    const rawData = localStorage.getItem('errandmate_user');
    const savedUser = JSON.parse(rawData);
    if (!savedUser?.id) return alert("Login required");

    try {
      const payload = { errand_id: parseInt(errandId), runner_id: parseInt(savedUser.id), bid_amount: parseInt(budget) };
      await axios.post(`${import.meta.env.VITE_API_URL}/bids`, payload);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000); 
    } catch (err) { alert("Error applying."); }
  };

  if (loading) return <div className="p-20 text-center animate-pulse font-black text-slate-300">Synchronizing Marketplace...</div>;

  return (
    <div className="max-w-7xl mx-auto py-16 px-6 relative">
      <AnimatePresence>
        {showSuccess && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[200] bg-slate-900 text-white px-8 py-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-slate-700"
          >
            <div className="bg-emerald-500 p-1 rounded-full"><CheckCircle size={16}/></div>
            <span className="font-bold text-sm tracking-tight">Application sent successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h2 className="text-5xl font-black text-slate-900 tracking-tighter">Live <span className="text-indigo-600 italic">Feed</span></h2>
          <p className="text-slate-500 font-medium">Real-time opportunities across campus.</p>
        </div>
        <div className="flex gap-2">
          {['All', 'High Pay', 'Urgent'].map(filter => (
            <button key={filter} className="px-5 py-2 rounded-full border border-slate-200 text-xs font-black text-slate-600 hover:bg-slate-900 hover:text-white transition-all">
              {filter}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {errands.map((errand, i) => (
          <motion.div
            key={errand.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ y: -10 }}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.08)] flex flex-col justify-between hover:border-indigo-200 transition-all relative overflow-hidden"
          >
            {errand.budget > 500 && (
              <div className="absolute top-0 right-0 px-4 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-bl-xl uppercase tracking-widest">
                🔥 High Payout
              </div>
            )}
            
            <div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                   <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">
                    <MapPin size={10} /> {errand.location}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{errand.title}</h3>
                </div>
                <div className="text-2xl font-black text-slate-900">₹{errand.budget}</div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-8 line-clamp-2">{errand.description}</p>
            </div>
            
            <div className="flex items-center gap-4">
               <button
                onClick={() => handleApply(errand.id, errand.budget)}
                className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl group-hover:bg-indigo-600 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={16} fill="currentColor" /> Apply to Run
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ErrandFeed;