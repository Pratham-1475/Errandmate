import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Home = () => {
  const categories = [
    { title: "Delivery", icon: "📦", desc: "Packages & Lab gear", color: "bg-blue-50" },
    { title: "Academic", icon: "📚", desc: "Notes & Printouts", color: "bg-orange-50" },
    { title: "Grocery", icon: "🍎", desc: "Snacks & Essentials", color: "bg-emerald-50" },
    { title: "Technical", icon: "💻", desc: "IT & Hardware help", color: "bg-purple-50" }
  ];

  return (
    <div className="bg-white">
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-20 overflow-hidden text-center lg:text-left">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-7xl font-black text-slate-900 leading-tight mb-6">
              Campus help, <br/> 
              <span className="text-indigo-600">on demand.</span>
            </h1>
            <p className="text-xl text-slate-500 mb-10 max-w-lg font-medium leading-relaxed mx-auto lg:mx-0">
              The smartest way to get things done at IIIT Delhi. Reliable peers for every errand.
            </p>
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              <Link to="/feed" className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl hover:bg-indigo-600 shadow-xl transition-all active:scale-95">
                Browse Tasks
              </Link>
              <Link to="/post" className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 font-black rounded-2xl hover:border-indigo-600 transition-all">
                Post a Task
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative hidden lg:block"
          >
            <img 
              src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=800" 
              className="rounded-[3rem] shadow-2xl border-8 border-white"
              alt="Campus life"
            />
          </motion.div>
        </div>
      </section>

      {/* --- CATEGORY SECTION --- */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-black text-slate-900 mb-12">What do you need today?</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className={`${cat.color} p-8 rounded-[2rem] border border-white/50 shadow-sm transition-all cursor-pointer text-left`}
              >
                <div className="text-5xl mb-4">{cat.icon}</div>
                <h3 className="text-lg font-bold text-slate-900">{cat.title}</h3>
                <p className="text-slate-500 text-sm mt-1">{cat.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;