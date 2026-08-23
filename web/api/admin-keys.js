let inMemoryKeys = null;
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(process.cwd(), 'data', 'keys_db.json');

const readKeys = () => {
  if (inMemoryKeys !== null) return inMemoryKeys;
  try { inMemoryKeys = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { inMemoryKeys = []; }
  return inMemoryKeys;
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    return res.json(readKeys());
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const keys = body && body.keys ? body.keys : (Array.isArray(body) ? body : null);
    if (!keys) return res.status(400).json({ error: 'Invalid body' });
    inMemoryKeys = keys;
    return res.json({ success: true, count: keys.length });
  }

  res.status(405).end();
};
