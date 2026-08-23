// Vercel Serverless Function: Cloud Keys Sync
import fs from 'fs';
import path from 'path';

let inMemoryKeys = null;

export default async function handler(req, res) {
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
      try {
        const p1 = path.join(process.cwd(), 'data', 'users_cloud_db.json');
        const p2 = path.join(process.cwd(), 'data', 'keys_db.json');
        fs.writeFileSync(p1, JSON.stringify(inMemoryKeys, null, 2), 'utf8');
        fs.writeFileSync(p2, JSON.stringify(inMemoryKeys, null, 2), 'utf8');
      } catch(e) {}
      return res.status(200).json({ success: true, count: inMemoryKeys.length });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'GET') {
    if (inMemoryKeys !== null) {
      return res.status(200).json(inMemoryKeys);
    }
    try {
      const filePath = path.join(process.cwd(), 'data', 'users_cloud_db.json');
      if (fs.existsSync(filePath)) {
        const fileData = fs.readFileSync(filePath, 'utf8');
        inMemoryKeys = JSON.parse(fileData);
        return res.status(200).json(inMemoryKeys);
      }
    } catch (e) {}
    return res.status(200).json([]);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
