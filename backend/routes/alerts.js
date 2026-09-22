const express = require('express');
const db = require('../database/db');
const router = express.Router();

// GET all alerts
router.get('/', (req, res) => {
  db.all(`SELECT * FROM alerts ORDER BY timestamp DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST new alert
router.post('/', (req, res) => {
  const { employeeId, exposureLevel, message, status, notes } = req.body;
  const id = `alert-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  db.run(
    `INSERT INTO alerts (id, employeeId, exposureLevel, message, status, timestamp, notes) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, employeeId, exposureLevel, message, status || 'Active', timestamp, notes || ''],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(`SELECT * FROM alerts WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.status(201).json(row);
      });
    }
  );
});

// PUT update alert (e.g. resolve)
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  db.run(
    `UPDATE alerts SET status = ?, notes = ? WHERE id = ?`,
    [status, notes, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Alert not found' });
      db.get(`SELECT * FROM alerts WHERE id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

module.exports = router;
