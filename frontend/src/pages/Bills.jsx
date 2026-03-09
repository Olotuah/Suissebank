import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react"; // Install with: npm i lucide-react

export default function Bills() {
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

      {/* Main Content */}
      <main className="flex-1 p-6 sm:p-8 mt-16 md:mt-0">
        <h1 className="text-3xl sm:text-4xl font-bold mb-6 font-inter">Bill Payments</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {["Electricity", "Internet", "Cable TV", "Water", "Insurance", "Tuition"].map((bill) => (
            <div
              key={bill}
              className="bg-white/10 p-6 rounded-xl shadow-md hover:bg-white/20 transition"
            >
              <h3 className="text-lg font-semibold">{bill} Bill</h3>
              <p className="text-gray-300 text-sm mb-4">Pay your {bill.toLowerCase()} bills easily.</p>
              <button className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 font-inter">
                Pay Now
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
