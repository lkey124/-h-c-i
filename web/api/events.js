let inMemoryEvents = [];

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const since = parseInt(req.query?.since || '0', 10) || 0;
    const filtered = inMemoryEvents.filter(e => e.timestamp > since);
    return res.json({ events: filtered, serverTime: Date.now() });
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (body && body.type) {
      const ev = {
        id: 'EV-' + Date.now() + '-' + Math.floor(Math.random() * 900 + 100),
        type: body.type,
        data: body.data || {},
        timestamp: Date.now()
      };
      inMemoryEvents.push(ev);
      if (inMemoryEvents.length > 100) inMemoryEvents = inMemoryEvents.slice(-100);
      return res.json({ success: true, event: ev });
    }
    return res.status(400).json({ error: 'Invalid event body' });
  }

  res.status(405).end();
};
