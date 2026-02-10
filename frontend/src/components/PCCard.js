import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { systemDataAPI, dataUtils } from '../utils/api';

const PCCard = ({ pcId, latestData }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [lastUpdate, setLastUpdate] = useState(null);

  // ✅ FIX 1: memoized function
  const fetchHistoricalData = useCallback(async () => {
    if (!pcId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await systemDataAPI.getData({ pcId, hours: 24 });
      if (response.success) {
        setHistoricalData(response.data.historical || []);
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [pcId]);

  // ✅ FIXED useEffect
  useEffect(() => {
    fetchHistoricalData();
    const interval = setInterval(fetchHistoricalData, 30000);
    return () => clearInterval(interval);
  }, [fetchHistoricalData]);

  const chartData = historicalData.map(item => ({
    time: new Date(item.createdAt).toLocaleTimeString(),
    cpu: item.cpu,
    ram: item.ram,
    disk: item.disk
  })).slice(-20);

  // ✅ Pie chart data
  const makeUsage = (value) => ([
    { name: 'Used', value, color: dataUtils.getStatusColor(value) },
    { name: 'Free', value: 100 - value, color: '#374151' }
  ]);

  if (!latestData) return null;

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">

      {/* PIE CHARTS (now actually USED ✅) */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'CPU', data: makeUsage(latestData.cpu) },
          { label: 'RAM', data: makeUsage(latestData.ram) },
          { label: 'Disk', data: makeUsage(latestData.disk) }
        ].map(({ label, data }) => (
          <div key={label} className="text-center">
            <p className="text-gray-300 mb-2">{label}</p>
            <ResponsiveContainer width="100%" height={120}>
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  innerRadius={35}
                  outerRadius={50}
                >
                  {data.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>

      {/* LINE CHART */}
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="time" stroke="#9ca3af" />
          <YAxis domain={[0, 100]} stroke="#9ca3af" />
          <Tooltip />
          <Line dataKey="cpu" stroke="#10b981" dot={false} />
          <Line dataKey="ram" stroke="#3b82f6" dot={false} />
          <Line dataKey="disk" stroke="#f59e0b" dot={false} />
        </LineChart>
      </ResponsiveContainer>

      <div className="text-sm text-gray-400 mt-4">
        Last updated: {lastUpdate ? dataUtils.formatTimestamp(lastUpdate) : '—'}
      </div>
    </div>
  );
};

export default PCCard;

