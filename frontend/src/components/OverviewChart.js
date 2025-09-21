import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { systemDataAPI, dataUtils } from '../utils/api';

/**
 * OverviewChart Component - Displays overall system statistics
 * Shows average CPU, RAM, Disk usage across all PCs with various chart types
 */
const OverviewChart = ({ overviewData, onDataUpdate }) => {
  const [historicalOverview, setHistoricalOverview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [chartType, setChartType] = useState('line'); // 'line', 'bar', 'pie'

  // Fetch historical overview data
  const fetchHistoricalOverview = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get data for all PCs over the last 24 hours
      const response = await systemDataAPI.getData({ hours: 24 });
      if (response.success && response.data.latest) {
        // Calculate hourly averages
        const hourlyData = calculateHourlyAverages(response.data.latest);
        setHistoricalOverview(hourlyData);
        setLastUpdate(new Date());
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching historical overview:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate hourly averages from PC data
  const calculateHourlyAverages = (pcData) => {
    const now = new Date();
    const hourlyAverages = [];
    
    // Create 24 hourly buckets
    for (let i = 23; i >= 0; i--) {
      const hourStart = new Date(now.getTime() - i * 60 * 60 * 1000);
      const hourEnd = new Date(now.getTime() - (i - 1) * 60 * 60 * 1000);
      
      // Filter PCs that have data in this hour
      const pcsInHour = pcData.filter(pc => {
        const pcTime = new Date(pc.createdAt);
        return pcTime >= hourStart && pcTime < hourEnd;
      });
      
      if (pcsInHour.length > 0) {
        const avgCpu = dataUtils.calculateAverage(pcsInHour.map(pc => pc.cpu));
        const avgRam = dataUtils.calculateAverage(pcsInHour.map(pc => pc.ram));
        const avgDisk = dataUtils.calculateAverage(pcsInHour.map(pc => pc.disk));
        
        hourlyAverages.push({
          hour: hourStart.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          cpu: avgCpu,
          ram: avgRam,
          disk: avgDisk,
          timestamp: hourStart
        });
      }
    }
    
    return hourlyAverages;
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchHistoricalOverview();
    
    // Set up interval to refresh data every 60 seconds
    const interval = setInterval(fetchHistoricalOverview, 60000);
    
    return () => clearInterval(interval);
  }, []);

  // Prepare pie chart data
  const pieData = overviewData ? [
    { name: 'CPU', value: overviewData.avgCpu, color: '#10b981' },
    { name: 'RAM', value: overviewData.avgRam, color: '#3b82f6' },
    { name: 'Disk', value: overviewData.avgDisk, color: '#f59e0b' }
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

  // Custom pie chart tooltip
  const PieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="text-sm" style={{ color: data.payload.color }}>
            {`${data.name}: ${data.value.toFixed(1)}%`}
          </p>
        </div>
      );
    }
    return null;
  };

  if (!overviewData) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="loading-spinner mx-auto mb-4"></div>
            <p className="text-gray-400">Loading overview data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">System Overview</h3>
          <p className="text-gray-400 text-sm">
            Average usage across {overviewData.totalPCs} PC{overviewData.totalPCs !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setChartType('line')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'line' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Line
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'bar' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Bar
          </button>
          <button
            onClick={() => setChartType('pie')}
            className={`px-3 py-1 rounded text-sm ${
              chartType === 'pie' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Pie
          </button>
        </div>
      </div>

      {/* Current Averages */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Avg CPU</span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: dataUtils.getStatusColor(overviewData.avgCpu) + '20',
                color: dataUtils.getStatusColor(overviewData.avgCpu)
              }}
            >
              {dataUtils.getStatusText(overviewData.avgCpu)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {dataUtils.formatPercentage(overviewData.avgCpu)}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Avg RAM</span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: dataUtils.getStatusColor(overviewData.avgRam) + '20',
                color: dataUtils.getStatusColor(overviewData.avgRam)
              }}
            >
              {dataUtils.getStatusText(overviewData.avgRam)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {dataUtils.formatPercentage(overviewData.avgRam)}
          </div>
        </div>

        <div className="bg-gray-700 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-300 text-sm">Avg Disk</span>
            <span 
              className="text-xs px-2 py-1 rounded-full"
              style={{ 
                backgroundColor: dataUtils.getStatusColor(overviewData.avgDisk) + '20',
                color: dataUtils.getStatusColor(overviewData.avgDisk)
              }}
            >
              {dataUtils.getStatusText(overviewData.avgDisk)}
            </span>
          </div>
          <div className="text-2xl font-bold text-white">
            {dataUtils.formatPercentage(overviewData.avgDisk)}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="mb-6">
        <h4 className="text-lg font-medium text-white mb-4">24-Hour Average Trends</h4>
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="loading-spinner mx-auto mb-2"></div>
              <p className="text-gray-400 text-sm">Loading chart data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-400 mb-2">Error loading chart data</p>
              <button 
                onClick={fetchHistoricalOverview}
                className="text-blue-400 hover:text-blue-300 text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        ) : historicalOverview.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {chartType === 'line' && (
              <LineChart data={historicalOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
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
            )}
            {chartType === 'bar' && (
              <BarChart data={historicalOverview}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="hour" 
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
                <Bar dataKey="cpu" fill="#10b981" name="CPU" />
                <Bar dataKey="ram" fill="#3b82f6" name="RAM" />
                <Bar dataKey="disk" fill="#f59e0b" name="Disk" />
              </BarChart>
            )}
            {chartType === 'pie' && (
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            )}
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-64">
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
          onClick={fetchHistoricalOverview}
          disabled={loading}
          className="text-blue-400 hover:text-blue-300 disabled:text-gray-500"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
    </div>
  );
};

export default OverviewChart;
