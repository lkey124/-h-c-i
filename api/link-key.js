let inMemoryKeys = null;
let inMemoryAccounts = null;
const fs = require('fs');
const path = require('path');
const KEYS_PATH = path.join(process.cwd(), 'data', 'keys_db.json');
const CLOUD_KEYS_PATH = path.join(process.cwd(), 'data', 'users_cloud_db.json');
const ACCTS_PATH = path.join(process.cwd(), 'data', 'accounts_db.json');

const norm = k => (k || '').toString().replace(/[\s\-_]/g, '').toUpperCase();

const readAllKeys = () => {
  if (inMemoryKeys !== null) return inMemoryKeys;
  let list1 = [], list2 = [];
  try { list1 = JSON.parse(fs.readFileSync(KEYS_PATH, 'utf8')); } catch {}
  try { list2 = JSON.parse(fs.readFileSync(CLOUD_KEYS_PATH, 'utf8')); } catch {}
  
  const map = {};
  for (const k of [...list1, ...list2]) {
    if (k && typeof k === 'object') {
      const nk = norm(k.key || k.id);
      if (nk) {
        map[nk] = { ...(map[nk] || {}), ...k };
      }
    }
  }
  inMemoryKeys = Object.values(map);
  return inMemoryKeys;
};

const readAccounts = () => {
  if (inMemoryAccounts !== null) return inMemoryAccounts;
  try { inMemoryAccounts = JSON.parse(fs.readFileSync(ACCTS_PATH, 'utf8')); } catch { inMemoryAccounts = []; }
  return inMemoryAccounts;
};

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-cache,no-store,must-revalidate');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const { accountId, key: rawKey } = body || {};
  if (!accountId || !rawKey) return res.status(400).json({ ok: false, error: 'Missing accountId or key' });

  const normEntered = norm(rawKey);
  const keys = readAllKeys();
  const accounts = readAccounts();

  const keyObj = keys.find(k => norm(k.key || k.id) === normEntered);
  if (!keyObj) return res.json({ ok: false, error: 'Key không tồn tại hoặc chưa được cấp bởi Admin!' });
  if (keyObj.status !== 'ACTIVE') return res.json({ ok: false, error: 'Key này đã bị Admin khóa!' });
  
  // Check expiry
  if (keyObj.expiresAt) {
    const exp = new Date(keyObj.expiresAt);
    if (exp < new Date()) return res.json({ ok: false, error: 'Key này đã hết hạn sử dụng!' });
  }

  const existingLinked = keyObj.linkedAccountId;
  if (existingLinked && existingLinked !== accountId)
    return res.json({ ok: false, error: 'Key này đã được tài khoản khác sử dụng rồi!' });

  const acct = accounts.find(a => a.accountId === accountId);
  if (!acct) return res.json({ ok: false, error: 'Tài khoản không tồn tại!' });

  const studentName = (acct.name || '').trim().toUpperCase() || 'HỌC VIÊN';
  keyObj.name = studentName;
  keyObj.linkedName = studentName;
  keyObj.linkedAccountId = accountId;
  keyObj.linkedEmail = acct.email || '';
  keyObj.streak = acct.streak || 1;
  acct.tier = 'premium';
  acct.linkedKey = keyObj.key || rawKey;
  acct.keyExpiresAt = keyObj.expiresAt;
  acct.lastActiveDate = new Date().toISOString();

  const kIdx = keys.findIndex(k => norm(k.key || k.id) === normEntered);
  if (kIdx >= 0) keys[kIdx] = keyObj; else keys.push(keyObj);
  const aIdx = accounts.findIndex(a => a.accountId === accountId);
  if (aIdx >= 0) accounts[aIdx] = acct; else accounts.push(acct);

  inMemoryKeys = keys;
  inMemoryAccounts = accounts;

  return res.json({ ok: true, account: acct, keyInfo: keyObj });
};
