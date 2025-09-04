const express = require('express');
const { db } = require('../lib/database');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/dashboard-data
 *
 * Returns summarized cost metrics for the authenticated user.  Data is
 * aggregated from the NormalizedCost table by service, time_period and
 * category.  If there are no records, a sample dataset is returned for
 * demonstration purposes.  Optional query parameters startDate and endDate
 * filter the data by the time_period (inclusive).  Optional category
 * filters by category.
 */
router.get('/dashboard-data', authenticate, (req, res) => {
  const { startDate, endDate, category } = req.query;
  let conditions = [];
  let params = [];
  if (startDate) {
    conditions.push('time_period >= ?');
    params.push(startDate);
  }
  if (endDate) {
    conditions.push('time_period <= ?');
    params.push(endDate);
  }
  if (category) {
    conditions.push('category = ?');
    params.push(category);
  }
  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  // Query aggregated by service
  const sqlByService = `SELECT service, SUM(cost) as totalCost FROM NormalizedCost ${whereClause} GROUP BY service`;
  // Query aggregated by time period (e.g. daily or monthly)
  const sqlByTime = `SELECT time_period, SUM(cost) as totalCost FROM NormalizedCost ${whereClause} GROUP BY time_period ORDER BY time_period`;
  // Query aggregated by category
  const sqlByCategory = `SELECT category, SUM(cost) as totalCost FROM NormalizedCost ${whereClause} GROUP BY category`;
  db.all(sqlByService, params, (err, byService) => {
    if (err) return res.status(500).json({ message: 'Database error', error: err.message });
    db.all(sqlByTime, params, (err2, byTime) => {
      if (err2) return res.status(500).json({ message: 'Database error', error: err2.message });
      db.all(sqlByCategory, params, (err3, byCategory) => {
        if (err3) return res.status(500).json({ message: 'Database error', error: err3.message });
        // If no data return sample dataset
        if (byService.length === 0 && byTime.length === 0) {
          const sampleData = {
            byService: [
              { service: 'Compute', totalCost: 1200 },
              { service: 'Storage', totalCost: 800 },
              { service: 'Network', totalCost: 400 },
            ],
            byTime: [
              { time_period: '2025-01-01', totalCost: 300 },
              { time_period: '2025-02-01', totalCost: 400 },
              { time_period: '2025-03-01', totalCost: 350 },
              { time_period: '2025-04-01', totalCost: 500 },
            ],
            byCategory: [
              { category: 'Production', totalCost: 1600 },
              { category: 'Development', totalCost: 800 },
            ],
          };
          return res.json(sampleData);
        }
        return res.json({ byService, byTime, byCategory });
      });
    });
  });
});

module.exports = router;

/**
 * GET /api/normalized-data
 *
 * Return all normalized cost records as CSV.  This simple export returns
 * comma-separated values with a header row.  Authentication is required.
 */
router.get('/normalized-data', authenticate, (req, res) => {
  db.all(
    'SELECT service, cost, time_period, category, tags FROM NormalizedCost',
    [],
    (err, rows) => {
      if (err) return res.status(500).json({ message: 'Database error', error: err.message });
      const header = ['service', 'cost', 'time_period', 'category', 'tags'];
      const csv = [header.join(',')]
        .concat(
          rows.map((r) =>
            [r.service, r.cost, r.time_period, r.category || '', r.tags || '']
              .map((v) => (v === null || v === undefined ? '' : String(v).replace(/,/g, ' ')))
              .join(','),
          ),
        )
        .join('\n');
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="normalized-data.csv"');
      res.send(csv);
    },
  );
});