export default function Login() {
  return (
    <div className="bg-white p-8 rounded-2xl shadow-md max-w-md mx-auto mt-10">
      <h2 className="text-2xl font-bold text-indigo-600 mb-4 text-center">Login to ErrandMate</h2>
      <input type="email" placeholder="Email" className="w-full p-3 border rounded-xl mb-4 outline-none focus:ring-2 focus:ring-indigo-400" />
      <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold">Send OTP</button>
    </div>
  );
}