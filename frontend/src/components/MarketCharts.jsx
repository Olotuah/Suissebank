import { useEffect, useMemo, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  AreaChart,
  Area,
  CartesianGrid,
} from "recharts";

function formatTimeLabel(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function makeSeedSeries(seed, points = 40) {
  const now = Date.now();
  let price = seed;
  const arr = [];

  for (let i = points - 1; i >= 0; i--) {
    price = Math.max(0.0001, price + (Math.random() - 0.5) * (seed * 0.008));
    const t = new Date(now - i * 60_000);
    arr.push({ t: formatTimeLabel(t), value: Number(price.toFixed(4)) });
  }
  return arr;
}

export default function MarketCharts() {
  const [active, setActive] = useState("FX"); // FX | STOCKS

  const [usdngn, setUsdngn] = useState(() => makeSeedSeries(1500, 50));
  const [eurusd, setEurusd] = useState(() => makeSeedSeries(1.09, 50));
  const [aapl, setAapl] = useState(() => makeSeedSeries(185, 50));
  const [tsla, setTsla] = useState(() => makeSeedSeries(210, 50));

  useEffect(() => {
    const interval = setInterval(() => {
      const tick = (series, volatility, decimals = 4) => {
        const last = series[series.length - 1]?.value ?? 1;
        const next = Math.max(0.0001, last + (Math.random() - 0.5) * volatility);
        const nextPoint = {
          t: formatTimeLabel(new Date()),
          value: Number(next.toFixed(decimals)),
        };
        return [...series.slice(1), nextPoint];
      };

      setUsdngn((s) => tick(s, 3.2, 2));
      setEurusd((s) => tick(s, 0.0025, 4));
      setAapl((s) => tick(s, 0.45, 2));
      setTsla((s) => tick(s, 0.8, 2));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const fxCards = useMemo(() => {
    const last = (arr) => arr[arr.length - 1]?.value ?? 0;
    return [
      { title: "GBP/USD", value: last(gbpusd), data: gbpusd, kind: "area" },
      { title: "EUR/USD", value: last(eurusd), data: eurusd, kind: "line" },
    ];
  }, [gbpusd, eurusd]);

  const stockCards = useMemo(() => {
    const last = (arr) => arr[arr.length - 1]?.value ?? 0;
    return [
      { title: "AAPL", value: last(aapl), data: aapl, kind: "line" },
      { title: "TSLA", value: last(tsla), data: tsla, kind: "area" },
    ];
  }, [aapl, tsla]);

  const cards = active === "FX" ? fxCards : stockCards;

  return (
    <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h3 className="text-xl font-bold">Markets</h3>
          <p className="text-sm text-slate-400">
    
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActive("FX")}
            className={`px-4 py-2 rounded-2xl text-sm border transition ${
              active === "FX"
                ? "bg-white text-slate-900 border-white"
                : "border-slate-700 hover:bg-slate-800"
            }`}
          >
            Forex
          </button>
          <button
            onClick={() => setActive("STOCKS")}
            className={`px-4 py-2 rounded-2xl text-sm border transition ${
              active === "STOCKS"
                ? "bg-white text-slate-900 border-white"
                : "border-slate-700 hover:bg-slate-800"
            }`}
          >
            Stocks
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-2xl bg-slate-800/50 border border-slate-700 p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400">{c.title}</p>
                <p className="text-2xl font-bold mt-1">{c.value}</p>
              </div>
              <span className="text-xs text-slate-400 border border-slate-600 rounded-xl px-2 py-1">
                LIVE
              </span>
            </div>

            <div className="h-44 mt-4 text-indigo-300">
              <ResponsiveContainer width="100%" height="100%">
                {c.kind === "area" ? (
                  <AreaChart data={c.data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      strokeWidth={2}
                      stroke="currentColor"
                      fill="currentColor"
                      fillOpacity={0.12}
                    />
                  </AreaChart>
                ) : (
                  <LineChart data={c.data}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="t" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="value"
                      strokeWidth={2}
                      dot={false}
                      stroke="currentColor"
                    />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-slate-500">
        
      </p>
    </div>
  );
}
