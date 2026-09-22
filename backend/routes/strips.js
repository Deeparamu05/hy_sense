const express = require('express');
const db = require('../database/db');
const router = express.Router();

// GET all strips
router.get('/', (req, res) => {
  db.all(
    `SELECT s.*, e.employeeName, e.department, e.shift 
     FROM strip_records s 
     LEFT JOIN employees e ON s.employeeId = e.employeeId 
     ORDER BY s.timestamp DESC`, 
    [], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const formatted = rows.map(r => ({
        ...r,
        initialStripScan: r.initialScan ? JSON.parse(r.initialScan) : { scanned: false },
        finalStripScan: r.finalScan ? JSON.parse(r.finalScan) : { scanned: false }
      }));
      res.json(formatted);
    }
  );
});

// GET strips for employee
router.get('/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  db.all(
    `SELECT s.*, e.employeeName, e.department, e.shift 
     FROM strip_records s 
     LEFT JOIN employees e ON s.employeeId = e.employeeId 
     WHERE s.employeeId = ? ORDER BY s.timestamp DESC`, 
    [employeeId], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      const formatted = rows.map(r => ({
        ...r,
        initialStripScan: r.initialScan ? JSON.parse(r.initialScan) : { scanned: false },
        finalStripScan: r.finalScan ? JSON.parse(r.finalScan) : { scanned: false }
      }));
      res.json(formatted);
    }
  );
});

// POST new strip
router.post('/', (req, res) => {
  const { employeeId, date, shift, initialStripScan, finalStripScan, initialImage, finalImage, exposureLevel, analysisStatus } = req.body;
  const id = `strip-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  const initialScanStr = initialStripScan ? JSON.stringify(initialStripScan) : null;
  const finalScanStr = finalStripScan ? JSON.stringify(finalStripScan) : null;

  db.run(
    `INSERT INTO strip_records (id, employeeId, date, shift, initialScan, finalScan, initialImage, finalImage, exposureLevel, timestamp) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, employeeId, date, shift, initialScanStr, finalScanStr, initialImage, finalImage, exposureLevel, timestamp],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(
        `SELECT s.*, e.employeeName, e.department, e.shift 
         FROM strip_records s 
         LEFT JOIN employees e ON s.employeeId = e.employeeId 
         WHERE s.id = ?`, 
        [id], 
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          if (row) {
            row.initialStripScan = row.initialScan ? JSON.parse(row.initialScan) : { scanned: false };
            row.finalStripScan = row.finalScan ? JSON.parse(row.finalScan) : { scanned: false };
            row.analysisStatus = analysisStatus;
          }
          res.status(201).json(row);
        }
      );
    }
  );
});

// PUT update strip
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { finalStripScan, finalImage, exposureLevel, analysisStatus } = req.body;
  
  const finalScanStr = finalStripScan ? JSON.stringify(finalStripScan) : null;

  db.run(
    `UPDATE strip_records SET finalScan = ?, finalImage = ?, exposureLevel = ? WHERE id = ?`,
    [finalScanStr, finalImage, exposureLevel, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Strip record not found' });
      db.get(
        `SELECT s.*, e.employeeName, e.department, e.shift 
         FROM strip_records s 
         LEFT JOIN employees e ON s.employeeId = e.employeeId 
         WHERE s.id = ?`, 
        [id], 
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          if (row) {
            row.initialStripScan = row.initialScan ? JSON.parse(row.initialScan) : { scanned: false };
            row.finalStripScan = row.finalScan ? JSON.parse(row.finalScan) : { scanned: false };
            row.analysisStatus = analysisStatus;
          }
          res.json(row);
        }
      );
    }
  );
});

module.exports = router;
