import axios from 'axios';

// Base API configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error);
    
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      console.error(`Server Error ${status}:`, data);
    } else if (error.request) {
      // Request was made but no response received
      console.error('Network Error: No response received');
    } else {
      // Something else happened
      console.error('Request Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

/**
 * System Data API functions
 */
export const systemDataAPI = {
  /**
   * Submit system data from client
   * @param {Object} data - System data object
   * @param {string} data.pcId - PC identifier
   * @param {number} data.cpu - CPU usage percentage
   * @param {number} data.ram - RAM usage percentage
   * @param {number} data.disk - Disk usage percentage
   * @param {string} data.os - Operating system
   * @param {number} data.uptime - System uptime in seconds
   * @returns {Promise} API response
   */
  submitData: async (data) => {
    try {
      const response = await api.post('/systemdata', data);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to submit system data: ${error.message}`);
    }
  },

  /**
   * Get latest and historical data for all PCs or specific PC
   * @param {Object} params - Query parameters
   * @param {string} [params.pcId] - Specific PC ID to get data for
   * @param {number} [params.hours=24] - Hours of historical data to retrieve
   * @returns {Promise} API response with system data
   */
  getData: async (params = {}) => {
    try {
      const response = await api.get('/systemdata', { params });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch system data: ${error.message}`);
    }
  },

  /**
   * Get list of all PCs with their latest data
   * @returns {Promise} API response with PC list
   */
  getPCs: async () => {
    try {
      const response = await api.get('/systemdata/pcs');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch PC list: ${error.message}`);
    }
  },

  /**
   * Get health status of the API
   * @returns {Promise} API response with health status
   */
  getHealth: async () => {
    try {
      const response = await api.get('/systemdata/health');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch health status: ${error.message}`);
    }
  },

  /**
   * Clean up old data
   * @param {number} [hours=24] - Hours of data to keep
   * @returns {Promise} API response with cleanup results
   */
  cleanupData: async (hours = 24) => {
    try {
      const response = await api.delete('/systemdata/cleanup', {
        params: { hours }
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to cleanup data: ${error.message}`);
    }
  }
};

/**
 * Utility functions for data processing
 */
export const dataUtils = {
  /**
   * Format uptime from seconds to human readable format
   * @param {number} seconds - Uptime in seconds
   * @returns {string} Formatted uptime string
   */
  formatUptime: (seconds) => {
    if (!seconds || seconds < 0) return 'Unknown';
    
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  },

  /**
   * Get status color based on usage percentage
   * @param {number} percentage - Usage percentage (0-100)
   * @returns {string} CSS color class or hex color
   */
  getStatusColor: (percentage) => {
    if (percentage < 60) return '#10b981'; // Green
    if (percentage < 80) return '#f59e0b'; // Yellow
    return '#ef4444'; // Red
  },

  /**
   * Get status text based on usage percentage
   * @param {number} percentage - Usage percentage (0-100)
   * @returns {string} Status text
   */
  getStatusText: (percentage) => {
    if (percentage < 60) return 'Good';
    if (percentage < 80) return 'Warning';
    return 'Critical';
  },

  /**
   * Format percentage with proper decimal places
   * @param {number} value - Percentage value
   * @returns {string} Formatted percentage string
   */
  formatPercentage: (value) => {
    if (typeof value !== 'number' || isNaN(value)) return '0%';
    return `${value.toFixed(1)}%`;
  },

  /**
   * Calculate average from array of numbers
   * @param {number[]} values - Array of numbers
   * @returns {number} Average value
   */
  calculateAverage: (values) => {
    if (!Array.isArray(values) || values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + (val || 0), 0);
    return sum / values.length;
  },

  /**
   * Get timestamp for display
   * @param {string|Date} timestamp - Timestamp
   * @returns {string} Formatted timestamp
   */
  formatTimestamp: (timestamp) => {
    if (!timestamp) return 'Unknown';
    const date = new Date(timestamp);
    return date.toLocaleString();
  }
};

/**
 * Error handling utilities
 */
export const errorUtils = {
  /**
   * Get user-friendly error message
   * @param {Error} error - Error object
   * @returns {string} User-friendly error message
   */
  getErrorMessage: (error) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }
    if (error.message) {
      return error.message;
    }
    return 'An unexpected error occurred';
  },

  /**
   * Check if error is network related
   * @param {Error} error - Error object
   * @returns {boolean} True if network error
   */
  isNetworkError: (error) => {
    return !error.response && error.request;
  },

  /**
   * Check if error is server related
   * @param {Error} error - Error object
   * @returns {boolean} True if server error
   */
  isServerError: (error) => {
    return error.response && error.response.status >= 500;
  }
};

export default api;
