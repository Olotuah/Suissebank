import { Link } from "react-router-dom";
import { useState } from "react";
import { Menu } from "lucide-react";
import useTransactions from "../hooks/useTransactions";

export default function Transactions() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { transactions, loading } = useTransactions();

  return (
    <div className="flex min-h-screen text-white bg-gradient-to-br from-black via-gray-900 to-gray-800 font-manrope relative">
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="md:hidden absolute top-4 left-4 z-50 bg-white/10 p-2 rounded"
      >
        <Menu size={24} />
      </button>

      <aside
        className={`fixed md:static top-0 left-0 z-40 w-64 p-6 bg-white/10 backdrop-blur-md border-r border-white/10 transform transition-transform duration-300 ease-in-out ${menuOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
      >
        <h2 className="text-2xl font-bold mb-8 font-inter">Swissbankasi</h2>
        <nav className="space-y-4">
          <Link to="/dashboard" className="block hover:text-blue-400">🏠 Dashboard</Link>
          <Link to="/transactions" className="block hover:text-blue-400">💳 Transactions</Link>
          <Link to="/transfer" className="block hover:text-blue-400">💸 Transfer</Link>
          <Link to="/bills" className="block hover:text-blue-400">📥 Bills</Link>
          <Link to="/cards" className="block hover:text-blue-400">💳 Cards</Link>
          <Link to="/profile" className="block hover:text-blue-400">👤 Profile</Link>
        </nav>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-10 mt-16 md:mt-0 overflow-x-auto">
        <header className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold font-inter">All Transactions</h1>
          <p className="text-gray-300">Track your financial activity in real time</p>
        </header>

        {loading ? (
          <p className="text-white">Loading...</p>
        ) : (
          <div className="w-full overflow-x-auto rounded-xl shadow">
            <table className="min-w-[640px] w-full bg-white/5 font-manrope">
              <thead className="bg-white/10 font-inter">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">Date</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">Description</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">Type</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">Amount</th>
                  <th className="text-left px-4 py-3 text-sm font-semibold text-white whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {transactions.map((tx, index) => (
                  <tr key={index} className="hover:bg-white/5 text-sm">
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{tx.description}</td>
                    <td className={`px-4 py-3 whitespace-nowrap ${tx.type === 'Credit' ? 'text-green-400' : 'text-red-400'}`}>{tx.type}</td>
                    <td className="px-4 py-3 whitespace-nowrap">${tx.amount.toFixed(2)}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-yellow-400">{tx.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
