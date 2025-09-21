import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { systemDataAPI, dataUtils } from '../utils/api';

/**
 * PCCard Component - Displays individual PC monitoring data
 * Shows CPU, RAM, Disk usage with charts and system information
 */
const PCCard = ({ pcId, latestData, onDataUpdate }) => {
  const [historicalData, setHistoricalData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  // Fetch historical data for this PC
  const fetchHistoricalData = async () => {
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
      console.error('Error fetching historical data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when pcId changes
  useEffect(() => {
    fetchHistoricalData();
    
    // Set up interval to refresh data every 30 seconds
    const interval = setInterval(fetchHistoricalData, 30000);
    
    return () => clearInterval(interval);
  }, [pcId]);

  // Prepare chart data
  const chartData = historicalData.map(item => ({
    time: new Date(item.createdAt).toLocaleTimeString(),
    cpu: item.cpu,
    ram: item.ram,
    disk: item.disk,
    timestamp: item.createdAt
  })).slice(-20); // Show last 20 data points

  // Current usage data for pie charts
  const currentUsage = latestData ? [
    { name: 'Used', value: latestData.cpu, color: dataUtils.getStatusColor(latestData.cpu) },
    { name: 'Free', value: 100 - latestData.cpu, color: '#374151' }
  ] : [];

  const ramUsage = latestData ? [
    { name: 'Used', value: latestData.ram, color: dataUtils.getStatusColor(latestData.ram) },
    { name: 'Free', value: 100 - latestData.ram, color: '#374151' }
  ] : [];

  const diskUsage = latestData ? [
    { name: 'Used', value: latestData.disk, color: dataUtils.getStatusColor(latestData.disk) },
    { name: 'Free', value: 100 - latestData.disk, color: '#374151' }
  ] : [];

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-gray-300 text-sm mb-1">{`Time: ${label}`}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey.toUpperCase()}: ${entry.value.toFixed(1)}%`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!latestData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading PC data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">{pcId}</h3>
          <p className="text-gray-400 text-sm">{latestData.os}</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Uptime</p>
          <p className="text-white font-medium">{dataUtils.formatUptime(latestData.uptime)}</p>
        </div>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* CPU Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">CPU</span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: dataUtils.getStatusColor(latestData.cpu) + '20',
                color: dataUtils.getStatusColor(latestData.cpu)
              }}
            >
              {dataUtils.getStatusText(latestData.cpu)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {dataUtils.formatPercentage(latestData.cpu)}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${latestData.cpu}%`,
                backgroundColor: dataUtils.getStatusColor(latestData.cpu)
              }}
            ></div>
          </div>
        </div>

        {/* RAM Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">RAM</span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: dataUtils.getStatusColor(latestData.ram) + '20',
                color: dataUtils.getStatusColor(latestData.ram)
              }}
            >
              {dataUtils.getStatusText(latestData.ram)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {dataUtils.formatPercentage(latestData.ram)}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${latestData.ram}%`,
                backgroundColor: dataUtils.getStatusColor(latestData.ram)
              }}
            ></div>
          </div>
        </div>

        {/* Disk Status */}
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Disk</span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: dataUtils.getStatusColor(latestData.disk) + '20',
                color: dataUtils.getStatusColor(latestData.disk)
              }}
            >
              {dataUtils.getStatusText(latestData.disk)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {dataUtils.formatPercentage(latestData.disk)}
          </div>
          <div className="w-full bg-gray-600 rounded-full h-2">
            <div 
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${latestData.disk}%`,
                backgroundColor: dataUtils.getStatusColor(latestData.disk)
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Historical Charts */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-4">24-Hour Usage Trends</h4>
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <p className="text-red-400 mb-2">Error loading chart data</p>
              <button 
                onClick={fetchHistoricalData}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="time" 
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tick={{ fill: '#9ca3af' }}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="cpu" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={false}
                name="CPU"
              />
              <Line 
                type="monotone" 
                dataKey="ram" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={false}
                name="RAM"
              />
              <Line 
                type="monotone" 
                dataKey="disk" 
                stroke="#f59e0b" 
                strokeWidth={2}
                dot={false}
                name="Disk"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-400">No historical data available</p>
          </div>
        )}
      </div>

      {/* Last Update */}
      <div className="flex items-center justify-between text-sm text-gray-400">
        <span>
          Last updated: {lastUpdate ? dataUtils.formatTimestamp(lastUpdate) : 'Never'}
        </span>
        <button 
          onClick={fetchHistoricalData}
          disabled={loading}
          className="text-blue-400 hover:text-blue-300 disabled:text-gray-500"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default PCCard;
