import React, { useState } from 'react';
import axios from 'axios';

export default function PostErrand() {
  const [formData, setFormData] = useState({ title: '', budget: '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title || !formData.budget) {
      setMessage('❌ Please fill in all fields');
      return;
    }

    setMessage('Sending...'); 
    try {
      // This sends data to Member 2's server (defined in your .env file)
      await axios.post(`${import.meta.env.VITE_API_URL}/errands`, formData);
      
      setMessage('✅ Errand posted successfully!');
      setFormData({ title: '', budget: '' }); // This clears the input boxes
    } catch (error) {
      console.error(error);
      setMessage('❌ Failed to post. Is Member 2’s server running?');
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md max-w-md mx-auto mt-10 border-t-4 border-indigo-600">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Post a New Errand</h2>
      <p className="text-gray-500 mb-6 text-sm">Fill in the details below to find a helper.</p>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Task Title</label>
          <input
            type="text"
            placeholder="e.g., Pick up lab manual"
            value={formData.title}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition"
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-600 mb-1">Budget ($)</label>
          <input
            type="number"
            placeholder="10"
            value={formData.budget}
            className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-indigo-400 transition"
            onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
          />
        </div>

        {/* Status Message Display */}
        {message && (
          <p className={`text-sm mb-4 text-center font-medium ${
            message.includes('✅') ? 'text-green-600' : 'text-red-600'
          }`}>
            {message}
          </p>
        )}

        <button 
          type="submit" 
          className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 active:scale-95 transition-all shadow-lg"
        >
          Post Errand
        </button>
      </form>
    </div>
  );
}