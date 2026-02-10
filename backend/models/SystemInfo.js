const mongoose = require('mongoose');

/**
 * SystemInfo Schema
 * Stores monitoring data sent from client PCs
 */
const systemInfoSchema = new mongoose.Schema(
  {
    // Unique PC identifier (hostname / custom ID)
    pcId: {
      type: String,
      required: true,
      trim: true
    },

    // CPU usage percentage
    cpu: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // RAM usage percentage
    ram: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // Disk usage percentage
    disk: {
      type: Number,
      required: true,
      min: 0,
      max: 100
    },

    // Operating system name
    os: {
      type: String,
      required: true
    },

    // System uptime in seconds
    uptime: {
      type: Number,
      required: true,
      min: 0
    }
  },
  {
    timestamps: true // creates createdAt & updatedAt automatically
  }
);

/* ================= INDEXES ================= */

// Fast latest-PC dashboard queries
systemInfoSchema.index({ pcId: 1, createdAt: -1 });

// Auto-delete old records after 24 hours (TTL index)
systemInfoSchema.index(
  { createdAt: 1 },
  { expireAfterSeconds: 24 * 60 * 60 }
);

/* ================= STATIC METHODS ================= */

/**
 * Get latest data of all PCs (one record per PC)
 */
systemInfoSchema.statics.getLatestData = function () {
  return this.aggregate([
    { $sort: { pcId: 1, createdAt: -1 } },
    {
      $group: {
        _id: '$pcId',
        latestData: { $first: '$$ROOT' }
      }
    },
    { $replaceRoot: { newRoot: '$latestData' } }
  ]);
};

/**
 * Get historical data of a specific PC (last N hours)
 */
systemInfoSchema.statics.getHistoricalData = function (pcId, hours = 24) {
  const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);

  return this.find({
    pcId,
    createdAt: { $gte: cutoff }
  }).sort({ createdAt: 1 });
};

/**
 * Overview statistics for dashboard
 */
systemInfoSchema.statics.getOverviewStats = function () {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.aggregate([
    { $match: { createdAt: { $gte: cutoff } } },
    {
      $group: {
        _id: null,
        avgCpu: { $avg: '$cpu' },
        avgRam: { $avg: '$ram' },
        avgDisk: { $avg: '$disk' },
        pcs: { $addToSet: '$pcId' }
      }
    },
    {
      $project: {
        _id: 0,
        avgCpu: { $round: ['$avgCpu', 2] },
        avgRam: { $round: ['$avgRam', 2] },
        avgDisk: { $round: ['$avgDisk', 2] },
        totalPCs: { $size: '$pcs' }
      }
    }
  ]);
};

module.exports = mongoose.model('SystemInfo', systemInfoSchema);
