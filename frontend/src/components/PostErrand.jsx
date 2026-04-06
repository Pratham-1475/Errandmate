import React, { useState } from 'react';
import axios from 'axios';

export default function PostErrand() {
  // 1. Create a "State" to hold the form data
  const [formData, setFormData] = useState({
    title: '',
    budget: ''
  });

  // 2. Handle the button click
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from refreshing
    
    try {
      // This sends the data to Member 2's computer!
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/errands`, formData);
      alert("Errand Posted Successfully!");
      console.log(response.data);
    } catch (error) {
      console.error("Post failed:", error);
      alert("Error: Is Member 2's server running?");
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-md max-w-md mx-auto mt-10 border-t-4 border-indigo-600">
      <h2 className="text-2xl font-bold mb-4">Post a New Errand</h2>
      <p className="text-gray-500 mb-6">Tell us what you need help with.</p>
      
      <form onSubmit={handleSubmit}>
        <input 
          type="text" 
          placeholder="Task Title" 
          className="w-full p-3 border rounded-xl mb-4"
          onChange={(e) => setFormData({...formData, title: e.target.value})} 
        />
        <input 
          type="number" 
          placeholder="Budget ($)" 
          className="w-full p-3 border rounded-xl mb-6"
          onChange={(e) => setFormData({...formData, budget: e.target.value})}
        />
        <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">
          Post to Feed
        </button>
      </form>
    </div>
  );
}