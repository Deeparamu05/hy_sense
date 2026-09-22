const express = require('express');
const db = require('../database/db');
const router = express.Router();

// GET all attendance
router.get('/', (req, res) => {
  db.all(
    `SELECT a.*, e.employeeName, e.department 
     FROM attendance a 
     LEFT JOIN employees e ON a.employeeId = e.employeeId 
     ORDER BY a.date DESC, a.inTime DESC`, 
    [], 
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// POST new attendance
router.post('/', (req, res) => {
  const { employeeId, date, shift, inTime, outTime, status } = req.body;
  const id = `att-${Date.now()}`;
  
  db.run(
    `INSERT INTO attendance (id, employeeId, date, shift, inTime, outTime, status) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, employeeId, date, shift, inTime, outTime, status],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      db.get(
        `SELECT a.*, e.employeeName, e.department 
         FROM attendance a 
         LEFT JOIN employees e ON a.employeeId = e.employeeId 
         WHERE a.id = ?`, 
        [id], 
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.status(201).json(row);
        }
      );
    }
  );
});

// PUT update attendance
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { outTime, status } = req.body;
  
  db.run(
    `UPDATE attendance SET outTime = ?, status = ? WHERE id = ?`,
    [outTime, status, id],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Attendance not found' });
      db.get(
        `SELECT a.*, e.employeeName, e.department 
         FROM attendance a 
         LEFT JOIN employees e ON a.employeeId = e.employeeId 
         WHERE a.id = ?`, 
        [id], 
        (err, row) => {
          if (err) return res.status(500).json({ error: err.message });
          res.json(row);
        }
      );
    }
  );
});

module.exports = router;
