import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="bg-white overflow-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32">
        {/* Animated Background Mesh */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-100/50 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-[10%] right-[-10%] w-[30%] h-[30%] bg-blue-100/50 blur-[120px] rounded-full" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-bold mb-6">
              <Sparkles size={14} /> <span>Now live at PDEU Gandhinagar</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black text-slate-900 tracking-tighter leading-[0.9] mb-8">
              Campus efficiency <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-blue-500">engineered.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 font-medium">
              ErrandMate connects students for high-trust tasks. Get your day back while fellow peers earn on their own schedule.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/feed" className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 shadow-2xl shadow-indigo-200 transition-all hover:-translate-y-1 active:scale-95">
                Explore Marketplace
              </Link>
              <Link to="/post" className="w-full sm:w-auto px-10 py-5 bg-white border border-slate-200 text-slate-900 font-black rounded-2xl hover:border-indigo-600 transition-all">
                Post an Errand
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- BENTO GRID FEATURES --- */}
      <section className="py-24 bg-slate-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white p-10 rounded-[2.5rem] border border-slate-200/60 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all">
              <div>
                <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mb-6 group-hover:rotate-12 transition-transform">
                  <Zap size={24} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Instant Fulfillment</h3>
                <p className="text-slate-500 font-medium">Average task pickup time is under 8 minutes across campus hostels and libraries.</p>
              </div>
              <img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=600" className="mt-8 rounded-2xl h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt="Teamwork" />
            </div>

            <div className="bg-indigo-600 p-10 rounded-[2.5rem] text-white flex flex-col justify-between shadow-2xl shadow-indigo-200">
              <ShieldCheck size={48} />
              <div>
                <h3 className="text-3xl font-black mb-4 tracking-tight leading-none">Verified Identity</h3>
                <p className="text-indigo-100 font-medium">Exclusive to PDEU students with Cognito-verified campus credentials.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;