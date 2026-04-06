import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function ErrandFeed() {
  const [errands, setErrands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchErrands = async () => {
      try {
        // This will fetch the list from Member 2's database
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/errands`);
        setErrands(res.data);
      } catch (err) {
        console.error("Could not fetch errands. Server might be down.");
      } finally {
        setLoading(false);
      }
    };
    fetchErrands();
  }, []);

  return (
    <div className="max-w-2xl mx-auto mt-10 px-4">
      <h2 className="text-3xl font-bold mb-8 text-gray-800 border-b pb-2">Available Errands</h2>
      
      {loading ? (
        <p className="text-gray-500 animate-pulse">Loading errands...</p>
      ) : errands.length === 0 ? (
        <div className="bg-white p-10 rounded-2xl shadow-sm border text-center">
          <p className="text-gray-400 italic">No errands posted yet. Be the first!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {errands.map((errand) => (
            <div key={errand.id} className="bg-white p-6 rounded-xl shadow-md border-l-4 border-indigo-500 flex justify-between items-center hover:shadow-lg transition">
              <div>
                <h3 className="font-bold text-lg text-gray-800">{errand.title}</h3>
                <p className="text-indigo-600 font-semibold mt-1">${errand.budget}</p>
              </div>
              <button className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-600 hover:text-white transition">
                Apply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}