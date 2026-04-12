import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('posted'); 
  const [postedTasks, setPostedTasks] = useState([]);
  const [appliedTasks, setAppliedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskBids, setSelectedTaskBids] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const resPosted = await axios.get(`${import.meta.env.VITE_API_URL}/errands/user/${user.id}`);
        setPostedTasks(resPosted.data);

        const resApplied = await axios.get(`${import.meta.env.VITE_API_URL}/users/${user.id}/bids`);
        setAppliedTasks(resApplied.data);
      } catch (err) { console.error("Sync Error", err); }
      finally { setLoading(false); }
    };
    fetchDashboard();
  }, [user]);

  const handleAcceptBidder = async (taskId, runnerId) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/errands/${taskId}/accept`, { runner_id: runnerId });
      alert("Hiring Confirmed!");
      window.location.reload();
    } catch (err) { alert("Action failed."); }
  };

  if (loading) return <div className="p-20 text-center font-black text-indigo-600 italic animate-pulse">Syncing ErrandMate Profile...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-10 p-10 bg-slate-900 rounded-[3rem] text-white flex justify-between items-center shadow-2xl border-4 border-slate-800">
        <div>
          <h2 className="text-4xl font-black mb-2">Hi, {user?.name || 'User'}</h2>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{user?.qualifications || 'ICT Student'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-10 bg-slate-100 p-2 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('posted')} className={`px-8 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'posted' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Posted Errand</button>
        <button onClick={() => setActiveTab('accepted')} className={`px-8 py-3 rounded-xl font-black text-xs transition-all ${activeTab === 'accepted' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-800'}`}>Applied Errand</button>
      </div>

      <div className="grid gap-6">
        {activeTab === 'posted' ? (
          postedTasks.length > 0 ? postedTasks.map(task => (
            <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 flex justify-between items-center shadow-sm">
              <div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${task.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{task.status}</span>
                <h3 className="text-2xl font-black mt-3">{task.title}</h3>
                <p className="text-slate-400 text-sm mt-1">₹{task.budget} • {task.location}</p>
              </div>
              {task.status === 'PENDING' && (
                <button onClick={() => setSelectedTaskBids(task)} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-slate-900 shadow-lg shadow-indigo-100 transition-all">View Applicants</button>
              )}
            </div>
          )) : <p className="text-center py-20 text-slate-300 font-bold italic tracking-widest">No posted errands yet.</p>
        ) : (
          appliedTasks.length > 0 ? appliedTasks.map(task => (
            <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 opacity-90">
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-100 text-slate-500 uppercase tracking-widest">{task.status || 'Active'}</span>
              <h3 className="text-2xl font-black mt-3">{task.title}</h3>
              <p className="text-slate-400 text-sm mt-1 font-bold uppercase tracking-widest">{task.status === 'ASSIGNED' ? 'Contract Won ✅' : 'Application Sent ⏳'}</p>
            </div>
          )) : <p className="text-center py-20 text-slate-300 font-bold italic tracking-widest">No active applications found.</p>
        )}
      </div>

      {/* Applicant Overlay */}
      <AnimatePresence>
        {selectedTaskBids && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div onClick={() => setSelectedTaskBids(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative bg-white w-full max-w-sm p-10 rounded-[3rem] shadow-2xl">
              <h3 className="text-xl font-black mb-1">Hiring for</h3>
              <p className="text-indigo-600 font-bold mb-8 text-lg italic tracking-tight">"{selectedTaskBids.title}"</p>
              <div className="p-6 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100 transition-all hover:border-indigo-600">
                <div>
                  <p className="font-black text-slate-800 tracking-tight">Akshat Dev</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase">Bid: ₹{selectedTaskBids.budget - 5}</p>
                </div>
                <button 
                  onClick={() => handleAcceptBidder(selectedTaskBids.id, 101)}
                  className="px-4 py-2 bg-indigo-600 text-white font-black text-[10px] rounded-lg hover:bg-emerald-500 transition-colors shadow-lg"
                >
                  Hire
                </button>
              </div>
              <button onClick={() => setSelectedTaskBids(null)} className="w-full mt-8 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:text-indigo-600 transition-colors">Close View</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;