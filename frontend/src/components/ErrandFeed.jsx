export default function ErrandFeed() {
  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-2xl font-bold mb-6">Available Errands</h2>
      <div className="bg-white p-6 rounded-xl shadow-sm border flex justify-between items-center mb-4">
        <div>
          <h3 className="font-bold text-lg">Pick up groceries</h3>
          <p className="text-gray-500 text-sm">Category: Delivery</p>
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold">Bid $15</button>
      </div>
    </div>
  );
}