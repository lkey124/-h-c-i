// Vercel Serverless Function: Cloud Keys Sync
let inMemoryKeys = [];

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const keysData = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      inMemoryKeys = Array.isArray(keysData) ? keysData : [];
      return res.status(200).json({ success: true, count: inMemoryKeys.length });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    return res.status(200).json(inMemoryKeys);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
