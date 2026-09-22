const express = require('express');
const cors = require('cors');

const employeesRouter = require('./routes/employees');
const attendanceRouter = require('./routes/attendance');
const stripsRouter = require('./routes/strips');
const alertsRouter = require('./routes/alerts');
const dashboardRouter = require('./routes/dashboard');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/employees', employeesRouter);
app.use('/api/attendance', attendanceRouter);
app.use('/api/strips', stripsRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/dashboard', dashboardRouter);

// Error Handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Hysense Manager Backend running on http://localhost:${PORT}`);
});
