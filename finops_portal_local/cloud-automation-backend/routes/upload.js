const express = require('express');
const multer = require('multer');
const { parse } = require('csv-parse/sync');
const fs = require('fs');
const { db } = require('../lib/database');
const { authenticate } = require('../middleware/auth');

// Configure multer to store uploaded files in memory.  This avoids having
// to manage temporary files on disk.  Note: this may not scale to large
// files in production; consider using streaming parsers.
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

/**
 * Normalize an array of cost records to the expected schema.  Incoming
 * objects may have various fields; this helper extracts and renames
 * relevant properties.
 *
 * @param {Array<Object>} records - raw parsed records
 * @returns {Array<Object>} normalized
 */
function normalizeRecords(records) {
  return records.map((rec) => {
    return {
      service: rec.service || rec.Service || rec.serviceName || 'Unknown',
      cost: parseFloat(rec.cost || rec.Cost || rec.amount || 0),
      time_period: rec.time_period || rec.TimePeriod || rec.date || new Date().toISOString().substring(0, 10),
      category: rec.category || rec.Category || '',
      tags: rec.tags || rec.Tags || '',
      metadata: JSON.stringify(rec),
    };
  });
}

/**
 * POST /api/upload-cost-data
 *
 * Accepts a CSV or JSON file upload containing cost data.  The file is
 * parsed and normalized and stored in the NormalizedCost table.  A record
 * is also added to CostUploads to track the upload.  Requires authentication.
 */
router.post('/upload-cost-data', authenticate, upload.single('file'), async (req, res) => {
  const { file } = req;
  if (!file) {
    return res.status(400).json({ message: 'No file provided' });
  }
  const filename = file.originalname;
  const mimetype = file.mimetype;
  let rawRecords;
  try {
    const buffer = file.buffer;
    if (mimetype === 'application/json' || filename.endsWith('.json')) {
      rawRecords = JSON.parse(buffer.toString());
      if (!Array.isArray(rawRecords)) {
        throw new Error('JSON file must contain an array of records');
      }
    } else if (mimetype === 'text/csv' || filename.endsWith('.csv') || mimetype === 'application/vnd.ms-excel') {
      rawRecords = parse(buffer.toString(), {
        columns: true,
        skip_empty_lines: true,
      });
    } else {
      return res.status(400).json({ message: 'Unsupported file type' });
    }
  } catch (err) {
    return res.status(400).json({ message: 'Failed to parse file', error: err.message });
  }
  const normalized = normalizeRecords(rawRecords);
  db.run(
    'INSERT INTO CostUploads (user_id, filename) VALUES (?, ?)',
    [req.user.id, filename],
    function (err) {
      if (err) {
        return res.status(500).json({ message: 'Failed to record upload', error: err.message });
      }
      const uploadId = this.lastID;
      // Insert normalized records
      const stmt = db.prepare(
        'INSERT INTO NormalizedCost (upload_id, service, cost, time_period, category, tags, metadata) VALUES (?, ?, ?, ?, ?, ?, ?)',
      );
      for (const rec of normalized) {
        stmt.run([uploadId, rec.service, rec.cost, rec.time_period, rec.category, rec.tags, rec.metadata]);
      }
      stmt.finalize((finalErr) => {
        if (finalErr) {
          return res.status(500).json({ message: 'Failed to store normalized records', error: finalErr.message });
        }
        return res.status(201).json({ message: 'File uploaded and data normalized', uploadId, recordCount: normalized.length });
      });
    },
  );
});

module.exports = router;