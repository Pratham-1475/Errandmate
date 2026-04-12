import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => (
  <div className="max-w-7xl mx-auto px-6 py-20 lg:flex items-center gap-20">
    <div className="lg:w-1/2 text-center lg:text-left">
      <h1 className="text-7xl font-black text-slate-900 leading-tight mb-8">Campus help, <span className="text-indigo-600">on demand.</span></h1>
      <p className="text-xl text-slate-500 mb-12 font-medium">Get your records picked up, groceries delivered, or technical help from fellow ICT students.</p>
      <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
        <Link to="/feed" className="px-10 py-5 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-100">Browse Tasks</Link>
        <Link to="/post" className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 font-black rounded-2xl">Post a Task</Link>
      </div>
    </div>
    <div className="lg:w-1/2 mt-20 lg:mt-0 hidden md:block">
      <img src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1000" className="rounded-[4rem] shadow-2xl border-8 border-white" alt="Campus" />
    </div>
  </div>
);

export default Home;