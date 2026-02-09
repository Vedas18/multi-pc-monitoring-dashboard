const si = require('systeminformation');
const axios = require('axios');
require('dotenv').config();

// Wake up backend before starting main client logic
axios.get('https://pc-monitoring-backend-yctj.onrender.com/api/systemdata/health')
  .then(() => console.log("✅ Backend warmed up and ready"))
  .catch(() => console.log("⚠️ Backend wake-up ping failed, continuing..."));


/**
 * Multi-PC System Monitoring Client
 * 
 * Monitors CPU, RAM, Disk, OS, and sends data to backend every 60 seconds.
 */

// Configuration
const CONFIG = {
  SERVER_URL: process.env.SERVER_URL || 'http://localhost:5000/api/systemdata',
  COLLECTION_INTERVAL: parseInt(process.env.COLLECTION_INTERVAL) || 60000,
  MAX_RETRIES: parseInt(process.env.MAX_RETRIES) || 3,
  RETRY_DELAY: parseInt(process.env.RETRY_DELAY) || 5000,
  PC_ID: process.env.PC_ID || require('os').hostname(),
  VERBOSE: process.env.VERBOSE === 'true' || false,
  MAX_OFFLINE_TIME: parseInt(process.env.MAX_OFFLINE_TIME) || 300000, // 5 minutes
};

// Global state
let isRunning = false;
let retryCount = 0;
let lastSuccessfulSend = Date.now();
let systemInfo = null;

// Logging utility
function log(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (CONFIG.VERBOSE || level === 'error' || level === 'warn') {
    console.log(`${prefix} ${message}`);
    if (data) console.log(JSON.stringify(data, null, 2));
  }
}

// Get system info
async function getSystemInfo() {
  try {
    const [cpu, mem, fs, osInfo, time] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.osInfo(),
      si.time()
    ]);

    let diskUsage = 0;
    if (fs && fs.length > 0) {
      const mainDisk = fs.find(d => d.mount === 'C:' || d.mount === '/' || d.mount === '/System/Volumes/Data') || fs[0];
      diskUsage = mainDisk ? ((mainDisk.used / mainDisk.size) * 100) : 0;
    }

    const memUsage = mem ? ((mem.used / mem.total) * 100) : 0;
    const uptime = time ? time.uptime : 0;
    const osString = osInfo ? `${osInfo.distro} ${osInfo.release} ${osInfo.arch}` : 'Unknown OS';

    return {
      pcId: CONFIG.PC_ID,
      cpu: Math.round(cpu.currentLoad * 100) / 100,
      ram: Math.round(memUsage * 100) / 100,
      disk: Math.round(diskUsage * 100) / 100,
      os: osString,
      uptime: Math.round(uptime)
    };

  } catch (error) {
    log('error', 'Failed to get system information', error);
    throw error;
  }
}

// Send data to server with retries
async function sendDataToServer(data) {
  const maxRetries = CONFIG.MAX_RETRIES;
  let lastError = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      log('info', `Sending data to server (attempt ${attempt}/${maxRetries})`);
      const response = await axios.post(CONFIG.SERVER_URL, data, {
        timeout: 40000,
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Multi-PC-Monitoring-Client/1.0.0' }
      });

      if (response.status === 200 || response.status === 201) {
        log('info', 'Data sent successfully', { status: response.status, pcId: data.pcId });
        retryCount = 0;
        lastSuccessfulSend = Date.now();
        return true;
      } else {
        throw new Error(`Unexpected response status: ${response.status}`);
      }

    } catch (error) {
      lastError = error;
      log('warn', `Attempt ${attempt} failed`, { error: error.message, status: error.response?.status });
      if (attempt < maxRetries) {
        const delay = CONFIG.RETRY_DELAY * attempt;
        log('info', `Retrying in ${delay}ms...`);
        await new Promise(r => setTimeout(r, delay));
      }
    }
  }

  retryCount++;
  log('error', `Failed to send data after ${maxRetries} attempts`, { error: lastError.message, pcId: data.pcId });
  return false;
}

// Check if client should continue
function shouldContinueRunning() {
  const offlineTime = Date.now() - lastSuccessfulSend;
  if (offlineTime > CONFIG.MAX_OFFLINE_TIME) {
    log('error', `Server offline for ${Math.round(offlineTime / 1000)}s. Stopping client.`);
    return false;
  }
  return true;
}

// Monitoring loop
async function monitorSystem() {
  if (!isRunning) return;

  try {
    const currentData = await getSystemInfo();
    systemInfo = currentData;
    await sendDataToServer(currentData);

  } catch (error) {
    log('error', 'Error in monitoring cycle', error);
  }

  if (isRunning && shouldContinueRunning()) {
    setTimeout(monitorSystem, CONFIG.COLLECTION_INTERVAL);
  } else if (isRunning) {
    log('error', 'Stopping monitoring due to server connectivity issues');
    process.exit(1);
  }
}

// Graceful shutdown
function gracefulShutdown(signal) {
  log('info', `Received ${signal}. Shutting down gracefully...`);
  isRunning = false;

  if (systemInfo) {
    sendDataToServer(systemInfo).then(() => {
      log('info', 'Final data sent. Goodbye!');
      process.exit(0);
    }).catch(() => {
      log('warn', 'Failed to send final data. Goodbye!');
      process.exit(0);
    });
  } else {
    log('info', 'No system data to send. Goodbye!');
    process.exit(0);
  }
}

// Start client
async function startClient() {
  log('info', 'Starting Multi-PC System Monitoring Client', {
    serverUrl: CONFIG.SERVER_URL,
    collectionInterval: CONFIG.COLLECTION_INTERVAL,
    pcId: CONFIG.PC_ID,
    maxRetries: CONFIG.MAX_RETRIES,
    verbose: CONFIG.VERBOSE
  });

  // Correct health-check endpoint
  try {
    log('info', 'Testing server connectivity...');
    const response = await axios.get(`${CONFIG.SERVER_URL}/health`, { timeout: 5000 });
    if (response.status === 200) {
      log('info', 'Server is reachable. Starting monitoring...');
    } else {
      throw new Error(`Server returned status ${response.status}`);
    }
  } catch (error) {
    log('warn', 'Server connectivity test failed, but continuing...', { error: error.message });
  }

  // Signal handlers
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2'));

  process.on('uncaughtException', error => { log('error', 'Uncaught exception', error); gracefulShutdown('uncaughtException'); });
  process.on('unhandledRejection', (reason, promise) => { log('error', 'Unhandled rejection', { reason, promise }); gracefulShutdown('unhandledRejection'); });

  isRunning = true;
  monitorSystem();

  setInterval(() => {
    if (isRunning) {
      const timeSinceLast = Date.now() - lastSuccessfulSend;
      log('info', 'Client status', { running: isRunning, retryCount, timeSinceLast: Math.round(timeSinceLast/1000)+'s', pcId: CONFIG.PC_ID });
    }
  }, 60000);
}

// Help info
function showHelp() {
  console.log(`
Multi-PC System Monitoring Client

Usage: node client.js [options]

Environment Variables:
  SERVER_URL          Backend server URL (default: http://localhost:5000/api/systemdata)
  COLLECTION_INTERVAL Data collection interval in ms (default: 5000)
  PC_ID              PC identifier (default: hostname)
  MAX_RETRIES        Maximum retry attempts (default: 3)
  RETRY_DELAY        Delay between retries in ms (default: 5000)
  MAX_OFFLINE_TIME   Max time to run without server connection in ms (default: 300000)
  VERBOSE            Enable verbose logging (default: false)

Examples:
  node client.js
  PC_ID=MyPC-001 SERVER_URL=http://localhost:5000/api/systemdata node client.js
`);
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

startClient().catch(error => {
  log('error', 'Failed to start client', error);
  process.exit(1);
});
