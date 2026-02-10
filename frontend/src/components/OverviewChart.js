import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { systemDataAPI, dataUtils } from '../utils/api';

/**
 * OverviewChart Component
 */
const OverviewChart = ({ overviewData }) => {
  const [historicalOverview, setHistoricalOverview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [chartType, setChartType] = useState('line');

  // Calculate hourly averages
  const calculateHourlyAverages = (pcData) => {
    const now = new Date();
    const hourlyAverages = [];

    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - (i - 1) * 60 * 60 * 1000);

      const pcsInHour = pcData.filter(pc => {
        const pcTime = new Date(pc.createdAt);
        return pcTime >= hourStart && pcTime < hourEnd;
      });

      if (pcsInHour.length > 0) {
        hourlyAverages.push({
          hour: hourStart.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
          }),
          cpu: dataUtils.calculateAverage(pcsInHour.map(pc => pc.cpu)),
          ram: dataUtils.calculateAverage(pcsInHour.map(pc => pc.ram)),
          disk: dataUtils.calculateAverage(pcsInHour.map(pc => pc.disk))
        });
      }
    }

    return hourlyAverages;
  };

  // ✅ FIXED: wrapped in useCallback
  const fetchHistoricalOverview = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await systemDataAPI.getData({ hours: 24 });
      if (response.success && response.data.latest) {
        const hourlyData = calculateHourlyAverages(response.data.latest);
        setHistoricalOverview(hourlyData);
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError(err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ FIXED dependency
  useEffect(() => {
    fetchHistoricalOverview();
    const interval = setInterval(fetchHistoricalOverview, 60000);
    return () => clearInterval(interval);
  }, [fetchHistoricalOverview]);

  if (!overviewData) {
    return <p className="text-gray-400">Loading overview...</p>;
  }

  const pieData = [
    { name: 'CPU', value: overviewData.avgCpu, color: '#10b981' },
    { name: 'RAM', value: overviewData.avgRam, color: '#3b82f6' },
    { name: 'Disk', value: overviewData.avgDisk, color: '#f59e0b' }
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">System Overview</h3>

      {/* Chart type buttons */}
      <div className="flex space-x-2 mb-4">
        {['line', 'bar', 'pie'].map(type => (
          <button
            key={type}
            onClick={() => setChartType(type)}
            className={`px-3 py-1 rounded text-sm ${
              chartType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400">Loading chart…</p>
      ) : error ? (
        <p className="text-red-400">{error}</p>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'line' && (
            <LineChart data={historicalOverview}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line dataKey="cpu" stroke="#10b981" />
              <Line dataKey="ram" stroke="#3b82f6" />
              <Line dataKey="disk" stroke="#f59e0b" />
            </LineChart>
          )}

          {chartType === 'bar' && (
            <BarChart data={historicalOverview}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Bar dataKey="cpu" fill="#10b981" />
              <Bar dataKey="ram" fill="#3b82f6" />
              <Bar dataKey="disk" fill="#f59e0b" />
            </BarChart>
          )}

          {chartType === 'pie' && (
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          )}
        </ResponsiveContainer>
      )}

      <p className="text-gray-400 text-sm mt-3">
        Last updated: {lastUpdate ? lastUpdate.toLocaleString() : '—'}
      </p>
    </div>
  );
};

export default OverviewChart;