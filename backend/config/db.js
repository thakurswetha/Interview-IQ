const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

let mongodProcess = null;

// Helper to check if a port is in use
function isPortInUse(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

// Helper to try spawning local mongod if port 27017 is not active
async function ensureLocalMongod() {
  const inUse = await isPortInUse(27017);
  if (inUse) {
    console.log('[DB] MongoDB service/port 27017 is active and accepting connections.');
    return;
  }

  const possiblePaths = [
    'C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\8.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\7.0\\bin\\mongod.exe',
    'C:\\Program Files\\MongoDB\\Server\\6.0\\bin\\mongod.exe',
    'mongod'
  ];

  let mongodBin = null;
  for (const p of possiblePaths) {
    if (p === 'mongod') {
      mongodBin = 'mongod';
      break;
    }
    if (fs.existsSync(p)) {
      mongodBin = p;
      break;
    }
  }

  if (!mongodBin) {
    console.warn('[DB] No local mongod.exe binary found in default locations.');
    return;
  }

  const dbPath = path.resolve(__dirname, '..', 'data', 'db');
  if (!fs.existsSync(dbPath)) {
    fs.mkdirSync(dbPath, { recursive: true });
  }

  console.log(`[DB] Starting embedded/local mongod instance with dbpath: ${dbPath}`);
  try {
    mongodProcess = spawn(mongodBin, ['--dbpath', dbPath, '--port', '27017', '--bind_ip', '127.0.0.1'], {
      detached: false,
      stdio: 'ignore'
    });

    mongodProcess.on('error', (err) => {
      console.warn('[DB] Could not launch mongod process:', err.message);
    });

    // Wait up to 5 seconds for mongod to initialize
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 500));
      if (await isPortInUse(27017)) {
        console.log('[DB] Local mongod process started successfully.');
        break;
      }
    }
  } catch (err) {
    console.warn('[DB] Error attempting to spawn local mongod:', err.message);
  }
}

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/interviewiq';

  // If pointing to localhost, check and try to ensure mongod is up
  if (mongoURI.includes('127.0.0.1') || mongoURI.includes('localhost')) {
    await ensureLocalMongod();
  }

  try {
    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[DB] MongoDB connection failed: ${error.message}`);
    console.error(`[DB] Please ensure MongoDB is running or configure MONGO_URI in backend/.env`);
    // Do not terminate process; allow application to provide meaningful error or retry
    return null;
  }
};

process.on('exit', () => {
  if (mongodProcess) {
    try {
      mongodProcess.kill();
    } catch (_) {}
  }
});

module.exports = connectDB;

