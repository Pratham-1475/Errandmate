import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
      <header className="bg-indigo-600 w-full p-4 text-white text-center shadow-md fixed top-0">
        <h1 className="text-2xl font-bold">ErrandMate</h1>
      </header>
      
      <main className="mt-20 p-6 bg-white rounded-xl shadow-lg border border-gray-200 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Welcome, Member 1!</h2>
        <p className="text-gray-600 mt-2">The Frontend is ready for AWS integration.</p>
        
        <div className="mt-6 flex gap-4">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition">
            Post an Errand
          </button>
          <button className="bg-white text-indigo-600 border border-indigo-600 px-4 py-2 rounded-lg font-medium hover:bg-indigo-50 transition">
            Find Work
          </button>
        </div>
      </main>
    </div>
  )
}

export default App