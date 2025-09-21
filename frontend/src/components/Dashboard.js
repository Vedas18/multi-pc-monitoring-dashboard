import React, { useState, useEffect } from 'react';
import PCCard from './PCCard';
import OverviewChart from './OverviewChart';
import { systemDataAPI, errorUtils } from '../utils/api';

/**
 * Dashboard Component - Main dashboard page
 * Displays overview charts and individual PC cards
 */
const Dashboard = () => {
  const [systemData, setSystemData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch system data from API
  const fetchSystemData = async () => {
    try {
      setError(null);
      const response = await systemDataAPI.getData();
      
      if (response.success) {
        setSystemData(response.data);
        setLastUpdate(new Date());
      } else {
        throw new Error(response.message || 'Failed to fetch system data');
      }
    } catch (err) {
      const errorMessage = errorUtils.getErrorMessage(err);
      setError(errorMessage);
      console.error('Error fetching system data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchSystemData();
  }, []);

  // Auto-refresh setup
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchSystemData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Handle manual refresh
  const handleRefresh = () => {
    setLoading(true);
    fetchSystemData();
  };

  // Handle auto-refresh toggle
  const toggleAutoRefresh = () => {
    setAutoRefresh(!autoRefresh);
  };

  // Loading state
  if (loading && !systemData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" style={{ width: '40px', height: '40px' }}></div>
          <h2 className="text-xl font-semibold text-white mb-2">Loading Dashboard</h2>
          <p className="text-gray-400">Fetching system data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !systemData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-4">
            <h2 className="text-xl font-semibold text-red-400 mb-2">Connection Error</h2>
            <p className="text-gray-300 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Retry Connection
            </button>
          </div>
          <p className="text-gray-400 text-sm">
            Make sure the backend server is running on port 5000
          </p>
        </div>
      </div>
    );
  }

  // No data state
  if (systemData && (!systemData.latest || systemData.latest.length === 0)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-white mb-2">No PCs Connected</h2>
            <p className="text-gray-400 mb-4">
              No PC data has been received yet. Make sure the client scripts are running.
            </p>
            <button
              onClick={handleRefresh}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-2xl font-bold text-white">Multi-PC System Monitoring</h1>
              <p className="text-gray-400 text-sm">
                Real-time monitoring of {systemData?.latest?.length || 0} PC{systemData?.latest?.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Auto-refresh toggle */}
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-300">Auto-refresh</label>
                <button
                  onClick={toggleAutoRefresh}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    autoRefresh ? 'bg-blue-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      autoRefresh ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {/* Manual refresh button */}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="loading-spinner" style={{ width: '16px', height: '16px' }}></div>
                    <span>Refreshing...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Bar */}
        <div className="mb-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${error ? 'bg-red-500' : 'bg-green-500'}`}></div>
                  <span className="text-sm text-gray-300">
                    {error ? 'Connection Error' : 'Connected'}
                  </span>
                </div>
                <div className="text-sm text-gray-400">
                  Last update: {lastUpdate ? lastUpdate.toLocaleTimeString() : 'Never'}
                </div>
                <div className="text-sm text-gray-400">
                  Auto-refresh: {autoRefresh ? 'On' : 'Off'}
                </div>
              </div>
              {error && (
                <button
                  onClick={handleRefresh}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  Retry
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Overview Chart */}
        <div className="mb-8">
          <OverviewChart 
            overviewData={systemData?.overview} 
            onDataUpdate={fetchSystemData}
          />
        </div>

        {/* PC Cards Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-white mb-6">Individual PC Status</h2>
          {systemData?.latest && systemData.latest.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {systemData.latest.map((pcData) => (
                <PCCard
                  key={pcData.pcId}
                  pcId={pcData.pcId}
                  latestData={pcData}
                  onDataUpdate={fetchSystemData}
                />
              ))}
            </div>
          ) : (
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-400">No PC data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center text-gray-400 text-sm">
          <p>Multi-PC System Monitoring Dashboard v1.0.0</p>
          <p className="mt-1">
            Data retention: 24 hours | Refresh interval: 30 seconds
          </p>
        </footer>
      </main>
    </div>
  );
};

export default Dashboard;
