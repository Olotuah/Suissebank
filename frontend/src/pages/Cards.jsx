import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";

export default function Cards() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen text-white bg-gradient-to-br from-black via-gray-900 to-gray-800 font-manrope relative">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden absolute top-4 left-4 z-50 bg-white/10 p-2 rounded"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-0 left-0 z-40 w-64 p-6 bg-white/10 backdrop-blur-md border-r border-white/10 transform transition-transform duration-300 ease-in-out ${
          menuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <h2 className="text-2xl font-bold mb-8 font-inter">SwissBankasi</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="block hover:text-blue-400">🏠 Dashboard</Link>
          <Link to="/transactions" className="block hover:text-blue-400">💳 Transactions</Link>
          <Link to="/transfer" className="block hover:text-blue-400">💸 Transfer</Link>
          <Link to="/bills" className="block hover:text-blue-400">📥 Bills</Link>
          <Link to="/cards" className="block hover:text-blue-400">💳 Cards</Link>
          <Link to="/profile" className="block hover:text-blue-400">👤 Profile</Link>
        </nav>
      </aside>

      <main className="flex-1 p-6 sm:p-8 mt-16 md:mt-0">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 font-inter">Your Cards</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-2xl text-white shadow-md">
            <h2 className="text-lg font-semibold">SwissBankasi Virtual Card</h2>
            <p className="text-2xl font-semibold mt-4">**** **** **** 4321</p>
            <div className="flex justify-between mt-6 text-sm">
              <span>VALID: 06/28</span>
              <span>CVV: ***</span>
            </div>
          </div>
          <div className="bg-white/10 p-6 rounded-xl shadow-md">
            <h3 className="text-lg font-semibold">Order New Card</h3>
            <p className="text-gray-300 text-sm mb-4">Get a new debit or virtual card.</p>
            <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 font-inter">Request Card</button>
          </div>
        </div>
      </main>
    </div>
  );
}
