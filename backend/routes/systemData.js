const express = require('express');
const router = express.Router();
const SystemInfo = require('../models/SystemInfo');

/**
 * POST /api/systemdata
 * Receives system data from client scripts
 * Body: { pcId, cpu, ram, disk, os, uptime }
 */
router.post('/', async (req, res) => {
  try {
    const { pcId, cpu, ram, disk, os, uptime } = req.body;

    // Validate required fields
    if (!pcId || cpu === undefined || ram === undefined || disk === undefined || !os || uptime === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pcId, cpu, ram, disk, os, uptime'
      });
    }

    // Validate data ranges
    if (cpu < 0 || cpu > 100 || ram < 0 || ram > 100 || disk < 0 || disk > 100 || uptime < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid data ranges: cpu/ram/disk (0-100), uptime (>=0)'
      });
    }

    // Create new system info document
    const systemData = new SystemInfo({
      pcId,
      cpu,
      ram,
      disk,
      os,
      uptime
    });

    // Save to database
    await systemData.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'System data saved successfully',
      data: {
        id: systemData._id,
        pcId: systemData.pcId,
        timestamp: systemData.createdAt
      }
    });

  } catch (error) {
    console.error('Error saving system data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/systemdata
 * Returns latest data for all PCs and overview statistics
 * Query params: 
 *   - pcId: Get data for specific PC only
 *   - hours: Historical data for last N hours (default: 24)
 */
router.get('/', async (req, res) => {
  try {
    const { pcId, hours = 24 } = req.query;
    const hoursNum = parseInt(hours);

    // Validate hours parameter
    if (isNaN(hoursNum) || hoursNum < 1 || hoursNum > 168) { // Max 1 week
      return res.status(400).json({
        success: false,
        message: 'Invalid hours parameter (1-168)'
      });
    }

    let response = {};

    if (pcId) {
      // Get data for specific PC
      const [latestData, historicalData] = await Promise.all([
        SystemInfo.findOne({ pcId }).sort({ createdAt: -1 }),
        SystemInfo.getHistoricalData(pcId, hoursNum)
      ]);

      response = {
        success: true,
        data: {
          pcId,
          latest: latestData,
          historical: historicalData,
          timeRange: `${hoursNum} hours`
        }
      };
    } else {
      // Get data for all PCs
      const [latestData, overviewStats] = await Promise.all([
        SystemInfo.getLatestData(),
        SystemInfo.getOverviewStats()
      ]);

      response = {
        success: true,
        data: {
          latest: latestData,
          overview: overviewStats[0] || { avgCpu: 0, avgRam: 0, avgDisk: 0, totalPCs: 0 },
          timeRange: '24 hours'
        }
      };
    }

    res.json(response);

  } catch (error) {
    console.error('Error fetching system data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/systemdata/pcs
 * Returns list of all unique PC IDs with their latest data
 */
router.get('/pcs', async (req, res) => {
  try {
    const pcs = await SystemInfo.getLatestData();
    
    res.json({
      success: true,
      data: pcs,
      count: pcs.length
    });

  } catch (error) {
    console.error('Error fetching PC list:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * DELETE /api/systemdata/cleanup
 * Cleans up old data (older than specified hours)
 * Query params: hours (default: 24)
 */
router.delete('/cleanup', async (req, res) => {
  try {
    const { hours = 24 } = req.query;
    const hoursNum = parseInt(hours);

    if (isNaN(hoursNum) || hoursNum < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid hours parameter'
      });
    }

    const result = await SystemInfo.cleanupOldData(hoursNum);

    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} old records`,
      deletedCount: result.deletedCount
    });

  } catch (error) {
    console.error('Error cleaning up data:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

/**
 * GET /api/systemdata/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'System data API is healthy',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
