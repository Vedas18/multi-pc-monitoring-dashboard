const mongoose = require('mongoose');

/**
 * SystemInfo Schema for storing PC monitoring data
 * Each document represents a single data point from a PC
 */
const systemInfoSchema = new mongoose.Schema({
  // Unique identifier for each PC (can be hostname, MAC address, etc.)
  pcId: {
    type: String,
    required: true,
    index: true // Index for faster queries by PC ID
  },
  
  // CPU usage percentage (0-100)
  cpu: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // RAM usage percentage (0-100)
  ram: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Disk usage percentage (0-100)
  disk: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  
  // Operating system information
  os: {
    type: String,
    required: true
  },
  
  // System uptime in seconds
  uptime: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Timestamp when this data was created
  createdAt: {
    type: Date,
    default: Date.now,
    index: true // Index for time-based queries
  }
}, {
  // Add timestamps for createdAt and updatedAt
  timestamps: true
});

// Compound index for efficient queries by PC ID and time
systemInfoSchema.index({ pcId: 1, createdAt: -1 });

// Index for cleanup queries (older than 24 hours)
systemInfoSchema.index({ createdAt: 1 });

/**
 * Static method to get latest data for all PCs
 */
systemInfoSchema.statics.getLatestData = function() {
  return this.aggregate([
    {
      $sort: { pcId: 1, createdAt: -1 }
    },
    {
      $group: {
        _id: '$pcId',
        latestData: { $first: '$$ROOT' }
      }
    },
    {
      $replaceRoot: { newRoot: '$latestData' }
    }
  ]);
};

/**
 * Static method to get historical data for a specific PC (last 24 hours)
 */
systemInfoSchema.statics.getHistoricalData = function(pcId, hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.find({
    pcId: pcId,
    createdAt: { $gte: cutoffTime }
  }).sort({ createdAt: 1 });
};

/**
 * Static method to get overview statistics (averages across all PCs)
 */
systemInfoSchema.statics.getOverviewStats = function() {
  const cutoffTime = new Date(Date.now() - 24 * 60 * 60 * 1000);
  
  return this.aggregate([
    {
      $match: { createdAt: { $gte: cutoffTime } }
    },
    {
      $group: {
        _id: null,
        avgCpu: { $avg: '$cpu' },
        avgRam: { $avg: '$ram' },
        avgDisk: { $avg: '$disk' },
        totalPCs: { $addToSet: '$pcId' }
      }
    },
    {
      $project: {
        _id: 0,
        avgCpu: { $round: ['$avgCpu', 2] },
        avgRam: { $round: ['$avgRam', 2] },
        avgDisk: { $round: ['$avgDisk', 2] },
        totalPCs: { $size: '$totalPCs' }
      }
    }
  ]);
};

/**
 * Static method to clean up old data (older than specified hours)
 */
systemInfoSchema.statics.cleanupOldData = function(hours = 24) {
  const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);
  
  return this.deleteMany({
    createdAt: { $lt: cutoffTime }
  });
};

module.exports = mongoose.model('SystemInfo', systemInfoSchema);
