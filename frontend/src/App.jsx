import React, { useState } from 'react';
import Login from './components/Login';
import PostErrand from './components/PostErrand';
import ErrandFeed from './components/ErrandFeed';

function App() {
  const [view, setView] = useState('login');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-indigo-600 p-4 text-white flex justify-between shadow-lg">
        <h1 className="font-bold text-xl">ErrandMate</h1>
        <div className="flex gap-4">
          <button onClick={() => setView('login')} className="hover:underline">Login</button>
          <button onClick={() => setView('feed')} className="hover:underline">Feed</button>
          <button onClick={() => setView('post')} className="hover:underline">Post</button>
        </div>
      </nav>

      <div className="container mx-auto">
        {view === 'login' && <Login />}
        {view === 'feed' && <ErrandFeed />}
        {view === 'post' && <PostErrand />}
      </div>
    </div>
  );
}

export default App;