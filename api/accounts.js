let inMemoryAccounts = null;
const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(process.cwd(), 'data', 'accounts_db.json');

const readAccounts = () => {
  if (inMemoryAccounts !== null) return inMemoryAccounts;
  try { inMemoryAccounts = JSON.parse(fs.readFileSync(DB_PATH, 'utf8')); }
  catch { inMemoryAccounts = []; }
  return inMemoryAccounts;
};

const performCleanup = (accounts) => {
  const now = Date.now();
  const DAY_MS = 86400000;
  const active = [];
  let purged = 0;

  for (const acct of accounts) {
    let shouldPurge = false;
    const tier = acct.tier || 'free';
    const keyExpiresStr = acct.keyExpiresAt;
    const lastActiveStr = acct.lastActiveDate || acct.createdAt;

    if (tier === 'premium' && keyExpiresStr) {
      const expTime = new Date(keyExpiresStr).getTime();
      // Grace period of 7 days (1 week) after key expiry
      if (now > expTime + 7 * DAY_MS) {
        shouldPurge = true;
      }
    } else {
      // Free account: 30 days inactivity
      if (lastActiveStr) {
        const actTime = new Date(lastActiveStr).getTime();
        if (now > actTime + 30 * DAY_MS) {
          shouldPurge = true;
        }
      }
    }

    if (shouldPurge) {
      purged++;
    } else {
      active.push(acct);
    }
  }

  return { active, purged };
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    const list = readAccounts();
    const { active, purged } = performCleanup(list);
    if (purged > 0) inMemoryAccounts = active;
    return res.json(active);
  }

  if (req.method === 'POST') {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    if (body && body.action === 'cleanup') {
      const list = readAccounts();
      const { active, purged } = performCleanup(list);
      inMemoryAccounts = active;
      try { fs.writeFileSync(DB_PATH, JSON.stringify(inMemoryAccounts, null, 2), 'utf8'); } catch(e) {}
      return res.json({ success: true, purged, remaining: active.length, accounts: active });
    }
    if (body && body.deleteAccountId) {
      const delId = body.deleteAccountId;
      const list = Array.isArray(body.accounts) ? body.accounts : readAccounts();
      inMemoryAccounts = list.filter(a => 
        a.accountId !== delId && 
        a.email !== delId && 
        (!a.email || a.email.toLowerCase() !== delId.toLowerCase()) &&
        a.linkedKey !== delId
      );
      try { fs.writeFileSync(DB_PATH, JSON.stringify(inMemoryAccounts, null, 2), 'utf8'); } catch(e) {}
      return res.json({ success: true, remaining: inMemoryAccounts.length });
    }
    if (body && body.account) {
      const list = readAccounts();
      const idx = list.findIndex(a => a.accountId === body.account.accountId);
      if (idx >= 0) list[idx] = body.account;
      else list.push(body.account);
      inMemoryAccounts = list;
      try { fs.writeFileSync(DB_PATH, JSON.stringify(inMemoryAccounts, null, 2), 'utf8'); } catch(e) {}
      return res.json({ success: true, account: body.account });
    }
    if (body && Array.isArray(body.accounts)) {
      inMemoryAccounts = body.accounts;
      try { fs.writeFileSync(DB_PATH, JSON.stringify(inMemoryAccounts, null, 2), 'utf8'); } catch(e) {}
      return res.json({ success: true, count: inMemoryAccounts.length });
    }
    if (Array.isArray(body)) {
      inMemoryAccounts = body;
      try { fs.writeFileSync(DB_PATH, JSON.stringify(inMemoryAccounts, null, 2), 'utf8'); } catch(e) {}
      return res.json({ success: true, count: inMemoryAccounts.length });
    }
    return res.status(400).json({ error: 'Invalid body' });
  }

  res.status(405).end();
};
