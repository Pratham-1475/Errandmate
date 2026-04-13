import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = ({ user }) => {
  const [activeTab, setActiveTab] = useState('posted'); 
  const [postedTasks, setPostedTasks] = useState([]);
  const [appliedTasks, setAppliedTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTaskBids, setSelectedTaskBids] = useState(null);
  const [bidsForTask, setBidsForTask] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const resPosted = await axios.get(`${import.meta.env.VITE_API_URL}/errands/user/${user.id}`);
        setPostedTasks(resPosted.data);

        const resApplied = await axios.get(`${import.meta.env.VITE_API_URL}/users/${user.id}/bids`);
        setAppliedTasks(resApplied.data);
      } catch (err) { 
        console.error("Dashboard Sync Error", err); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchDashboard();
  }, [user]);

  const fetchBidsForTask = async (task) => {
    setSelectedTaskBids(task);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/errands/${task.id}/bids`);
      // res.data should now include 'name' and 'qualifications' from the backend JOIN
      setBidsForTask(res.data);
    } catch (err) {
      console.error("Failed to fetch bidders", err);
      setBidsForTask([]);
    }
  };

  const handleAcceptBidder = async (taskId, runnerId) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/errands/${parseInt(taskId)}/accept`, { 
        runner_id: parseInt(runnerId) 
      });
      alert("Application Accepted! Task is now assigned.");
      window.location.reload();
    } catch (err) { 
      alert("Hiring failed. Check if Akshat's accept route is active."); 
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-indigo-600">Loading PDEU Profile...</div>;

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="mb-10 p-10 bg-slate-900 rounded-[3rem] text-white flex justify-between items-center shadow-2xl">
        <div>
          <h2 className="text-4xl font-black mb-2">Hi, {user?.name || 'PDEU Student'}</h2>
          <div className="flex gap-2">
            <span className="px-4 py-1.5 bg-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{user?.qualification || 'ICT Division'}</span>
            <span className="px-4 py-1.5 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">{user?.skills || 'Member'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-10 bg-slate-100 p-2 rounded-2xl w-fit">
        <button onClick={() => setActiveTab('posted')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'posted' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}>Tasks I Posted</button>
        <button onClick={() => setActiveTab('accepted')} className={`px-8 py-3 rounded-xl font-black text-sm transition-all ${activeTab === 'accepted' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-500'}`}>My Applied Tasks</button>
      </div>

      <div className="grid gap-6">
        {activeTab === 'posted' ? (
          postedTasks.length > 0 ? postedTasks.map(task => (
            <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center transition-all hover:shadow-md">
              <div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${task.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>{task.status}</span>
                <h3 className="text-2xl font-black mt-3">{task.title}</h3>
                <p className="text-slate-400 text-sm mt-1">₹{task.budget} • {task.location}</p>
              </div>
              {task.status === 'PENDING' && (
                <button onClick={() => fetchBidsForTask(task)} className="px-6 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-slate-900 shadow-lg transition-all">View Applicants</button>
              )}
            </div>
          )) : <p className="text-slate-400 text-center py-10">You haven't posted any tasks yet.</p>
        ) : (
          appliedTasks.length > 0 ? appliedTasks.map(task => (
            <div key={task.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 opacity-90">
              <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${task.status === 'ASSIGNED' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>{task.status || 'Applied'}</span>
              <h3 className="text-2xl font-black mt-3">{task.title}</h3>
              <p className="text-slate-400 text-sm mt-1 font-bold">Status: {task.status === 'ASSIGNED' ? 'Accepted ✅' : 'Pending Review ⏳'}</p>
            </div>
          )) : <p className="text-slate-400 text-center py-10">You haven't applied for any tasks yet.</p>
        )}
      </div>

      <AnimatePresence>
        {selectedTaskBids && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedTaskBids(null)} className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" />
            <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="relative bg-white w-full max-w-lg p-10 rounded-[3rem] shadow-2xl">
              <h3 className="text-2xl font-black mb-1">Applicants for</h3>
              <p className="text-indigo-600 font-bold mb-8 text-lg">{selectedTaskBids.title}</p>
              
              <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Real-time Bids</p>
                
                {bidsForTask.length > 0 ? bidsForTask.map(bid => (
                  <div key={bid.id} className="p-5 bg-slate-50 rounded-2xl flex justify-between items-center border border-slate-100">
                    <div>
                      {/* INTEGRATED CHANGE: Displaying name and qualification if available */}
                      <p className="font-black text-slate-800 tracking-tight">
                        {bid.name || `Runner #${bid.runner_id}`}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {bid.qualifications || 'PDEU Student'}
                      </p>
                      <p className="text-indigo-600 font-black mt-1 text-sm text-emerald-600">Bid: ₹{bid.bid_amount}</p>
                    </div>
                    <button onClick={() => handleAcceptBidder(selectedTaskBids.id, bid.runner_id)} className="px-4 py-2 bg-indigo-600 text-white font-black text-xs rounded-lg hover:bg-slate-900">Hire</button>
                  </div>
                )) : (
                  <p className="text-slate-400 text-sm italic">No one has applied for this task yet.</p>
                )}
              </div>
              <button onClick={() => setSelectedTaskBids(null)} className="w-full mt-8 py-4 text-slate-400 font-bold text-sm uppercase tracking-widest hover:text-slate-600">Close Panel</button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;