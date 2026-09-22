const express = require('express');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/db');
const router = express.Router();

function generateUniqueQrId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 5; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET all employees
router.get('/', (req, res) => {
  db.all(`SELECT * FROM employees ORDER BY createdAt DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// GET employee by ID
router.get('/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  db.get(`SELECT * FROM employees WHERE employeeId = ? OR id = ?`, [employeeId, employeeId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Employee not found' });
    res.json(row);
  });
});

// POST new employee
router.post('/', (req, res) => {
  const { employeeId, employeeName, gender, contact, department, shift } = req.body;
  if (!employeeId || !employeeName) {
    return res.status(400).json({ error: 'employeeId and employeeName are required' });
  }

  // Check unique ID
  db.get(`SELECT employeeId FROM employees WHERE employeeId = ?`, [employeeId], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (row) return res.status(400).json({ error: 'Employee ID already exists' });

    // Generate unique QR
    const qrId = generateUniqueQrId();
    const qrData = `HYSENSE|${employeeId}|${qrId}`;
    const id = `emp-${Date.now()}`;
    const createdAt = new Date().toISOString();

    db.run(
      `INSERT INTO employees (id, employeeId, employeeName, gender, contact, department, shift, qrId, qrData, createdAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, employeeId, employeeName, gender, contact, department, shift, qrId, qrData, createdAt],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });
        
        db.get(`SELECT * FROM employees WHERE id = ?`, [id], (err, newRow) => {
          if (err) return res.status(500).json({ error: err.message });
          // Add status Active since frontend expects it
          newRow.status = 'Active'; 
          res.status(201).json(newRow);
        });
      }
    );
  });
});

// PUT update employee
router.put('/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  const { employeeName, gender, contact, department, shift } = req.body;
  
  db.run(
    `UPDATE employees SET employeeName = ?, gender = ?, contact = ?, department = ?, shift = ? WHERE id = ? OR employeeId = ?`,
    [employeeName, gender, contact, department, shift, employeeId, employeeId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ error: 'Employee not found' });
      
      db.get(`SELECT * FROM employees WHERE id = ? OR employeeId = ?`, [employeeId, employeeId], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(row);
      });
    }
  );
});

// DELETE employee
router.delete('/:employeeId', (req, res) => {
  const { employeeId } = req.params;
  db.run(`DELETE FROM employees WHERE id = ? OR employeeId = ?`, [employeeId, employeeId], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ error: 'Employee not found' });
    res.json({ message: 'Employee deleted' });
  });
});

module.exports = router;
