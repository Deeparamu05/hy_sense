const express = require('express');
const db = require('../database/db');
const router = express.Router();

router.get('/summary', (req, res) => {
  const queries = {
    totalWorkers: `SELECT COUNT(*) as count FROM employees`,
    presentToday: `SELECT COUNT(*) as count FROM attendance WHERE date = date('now') AND (status = 'Present' OR status = 'Currently Working' OR status = 'Completed')`,
    activeShifts: `SELECT COUNT(*) as count FROM attendance WHERE date = date('now') AND status = 'Currently Working'`,
    h2sAlerts: `SELECT COUNT(*) as count FROM alerts WHERE status = 'Active'`
  };

  const results = {};
  let completed = 0;
  const keys = Object.keys(queries);

  if (keys.length === 0) {
    return res.json(results);
  }

  keys.forEach(key => {
    db.get(queries[key], [], (err, row) => {
      if (err) {
        results[key] = 0;
      } else {
        results[key] = row.count;
      }
      completed++;
      if (completed === keys.length) {
        res.json(results);
      }
    });
  });
});

module.exports = router;
