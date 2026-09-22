const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(__dirname, 'database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
    
    db.serialize(() => {
      // Employees Table
      db.run(`CREATE TABLE IF NOT EXISTS employees (
        id TEXT PRIMARY KEY,
        employeeId TEXT UNIQUE,
        employeeName TEXT,
        gender TEXT,
        contact TEXT,
        department TEXT,
        shift TEXT,
        qrId TEXT UNIQUE,
        qrData TEXT,
        createdAt TEXT
      )`);

      // Attendance Table
      db.run(`CREATE TABLE IF NOT EXISTS attendance (
        id TEXT PRIMARY KEY,
        employeeId TEXT,
        date TEXT,
        shift TEXT,
        inTime TEXT,
        outTime TEXT,
        status TEXT
      )`);

      // Strip Records Table
      db.run(`CREATE TABLE IF NOT EXISTS strip_records (
        id TEXT PRIMARY KEY,
        employeeId TEXT,
        date TEXT,
        shift TEXT,
        initialScan TEXT,
        finalScan TEXT,
        initialImage TEXT,
        finalImage TEXT,
        exposureLevel TEXT,
        timestamp TEXT
      )`);

      // Alerts Table
      db.run(`CREATE TABLE IF NOT EXISTS alerts (
        id TEXT PRIMARY KEY,
        employeeId TEXT,
        exposureLevel TEXT,
        message TEXT,
        status TEXT,
        timestamp TEXT,
        notes TEXT
      )`);
    });
  }
});

module.exports = db;
