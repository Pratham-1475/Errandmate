import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';

const ErrandFeed = () => {
  const [errands, setErrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchErrands = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/errands`);
        setErrands(res.data);
      } catch (err) {
        console.error("Feed Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchErrands();
  }, []);

  const handleApply = async (errandId) => {
    // 1. Get the user object saved during Cognito login
    const savedUser = JSON.parse(localStorage.getItem('errandmate_user'));
    
    // 2. Safety check for the ID
    if (!savedUser || !savedUser.id) {
      alert("Please login first to apply for errands!");
      return;
    }

    try {
      // 3. FIXED: Explicitly passing the id as runner_id
      const payload = { 
        errand_id: errandId, 
        runner_id: savedUser.id 
      };

      console.log("Submitting Bid Payload:", payload);

      await axios.post(`${import.meta.env.VITE_API_URL}/bids`, payload);
      alert("Application Successful! It will now appear in your Dashboard.");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to apply. You might have already bid on this.");
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-indigo-600 animate-pulse uppercase tracking-tighter">Locating Campus Errands...</div>;

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <h2 className="text-4xl font-black mb-10 tracking-tight">Available <span className="text-indigo-600 italic">Opportunities</span></h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {errands.map(errand => (
          <motion.div 
            key={errand.id} 
            whileHover={{ y: -8, shadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}
            className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-between transition-all"
          >
            <div>
              <div className="flex justify-between items-start mb-6">
                <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-full uppercase tracking-widest">{errand.location}</span>
                <span className="text-xl font-black text-slate-900 tracking-tighter">₹{errand.budget}</span>
              </div>
              <h3 className="text-2xl font-black mb-3 leading-tight">{errand.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 line-clamp-3">{errand.description}</p>
            </div>
            <button 
              onClick={() => handleApply(errand.id)}
              className="w-full py-5 bg-slate-900 text-white font-black rounded-[1.5rem] hover:bg-indigo-600 transition-all shadow-lg active:scale-95"
            >
              Apply to Run
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ErrandFeed;