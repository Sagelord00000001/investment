"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { FiRefreshCw, FiExternalLink } from "react-icons/fi";
import { SiBitcoin, SiEthereum } from "react-icons/si";

interface PriceData {
  time: string;
  price: number;
}

const COIN_ICONS: Record<string, JSX.Element> = {
  bitcoin: <SiBitcoin className="text-orange-500" size={24} />,
  ethereum: <SiEthereum className="text-purple-500" size={24} />,
};

export default function Web3PriceWidget({ 
  coin = "bitcoin", 
  currency = "usd" 
}: { coin?: string; currency?: string }) {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(
        `/api/crypto/price?coin=${coin}&days=1&currency=${currency}`,
        { next: { revalidate: 60 } }
      );
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch data');
      }

      const result = await res.json();
      
      if (!result.prices || !Array.isArray(result.prices)) {
        throw new Error("Invalid data format from API");
      }

      const formatted = result.prices.map(([time, price]: [number, number]) => ({
        time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: parseFloat(price.toFixed(4))
      }));

      setData(formatted);
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err) {
      console.error(`Error fetching ${coin} data:`, err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [coin, currency]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: value < 1 ? 6 : 2,
      maximumFractionDigits: value < 1 ? 6 : 2,
    }).format(value);
  };

  if (error) {
    return (
      <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 p-6 rounded-xl border border-red-800/30">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-red-100">Error Loading Data</h3>
        </div>
        <p className="text-red-300 text-sm mb-4">{error}</p>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-red-800/50 hover:bg-red-800/70 rounded-lg text-red-100 text-sm transition-colors"
        >
          <FiRefreshCw size={14} />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg backdrop-blur-sm">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3">
            {COIN_ICONS[coin] || (
              <div className="w-6 h-6 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center">
                <span className="text-xs font-bold text-white">
                  {coin.slice(0, 2).toUpperCase()}
                </span>
              </div>
            )}
            <h3 className="text-xl font-semibold text-white">
              {coin.charAt(0).toUpperCase() + coin.slice(1)}
            </h3>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {currency.toUpperCase()} Price Chart
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <p className="text-gray-500 text-xs">
              Updated: {lastUpdated}
            </p>
          )}
          <button
            onClick={fetchData}
            disabled={loading}
            className={`p-2 rounded-full ${loading ? 'text-gray-500' : 'text-gray-300 hover:text-white hover:bg-gray-700'}`}
          >
            <FiRefreshCw className={`${loading ? 'animate-spin' : ''}`} size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-gray-700 rounded-full mb-2"></div>
            <p className="text-gray-400">Loading chart...</p>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <p className="text-2xl font-bold text-white">
              {formatPrice(data[data.length - 1]?.price || 0)}
            </p>
            <div className="flex gap-4 mt-1">
              <p className="text-sm text-gray-400">
                24h Range: {formatPrice(Math.min(...data.map(d => d.price)))} - {formatPrice(Math.max(...data.map(d => d.price)))}
              </p>
            </div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                <XAxis 
                  dataKey="time" 
                  stroke="#6B7280"
                  tick={{ fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis 
                  stroke="#6B7280"
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => 
                    new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: currency.toUpperCase(),
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    }).format(value)
                  }
                  tick={{ fontSize: 12 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111827',
                    borderColor: '#4B5563',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.25)',
                  }}
                  labelStyle={{ color: '#D1D5DB', fontWeight: 600 }}
                  formatter={(value: number) => [formatPrice(value), "Price"]}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{
                    r: 6,
                    strokeWidth: 2,
                    fill: '#8884d8',
                    stroke: '#ffffff',
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      <div className="mt-4 flex justify-end">
        <a
          href={`https://www.coingecko.com/en/coins/${coin}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          View on CoinGecko <FiExternalLink size={14} />
        </a>
      </div>
    </div>
  );
}