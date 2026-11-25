// One-time setup: creates the tabs + header rows in your Google Sheet and seeds sample products.
// Usage:  npm run setup:sheet      (reads .env.local)
import { readFileSync } from 'node:fs';
import { auth, sheets } from '@googleapis/sheets';

const schema = JSON.parse(readFileSync(new URL('../lib/db/schema.json', import.meta.url), 'utf8'));
const seed = JSON.parse(readFileSync(new URL('../lib/db/seed-products.json', import.meta.url), 'utf8'));

const { GOOGLE_SHEET_ID: spreadsheetId, GOOGLE_SERVICE_ACCOUNT_EMAIL: email } = process.env;
const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g, '\n');
if (!spreadsheetId || !email || !key) {
  console.error('Set GOOGLE_SHEET_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY in .env.local first.');
  process.exit(1);
}

const api = sheets({ version: 'v4', auth: new auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] }) });

const meta = await api.spreadsheets.get({ spreadsheetId });
const existing = new Set(meta.data.sheets.map((s) => s.properties.title));

const missing = Object.keys(schema).filter((t) => !existing.has(t));
if (missing.length)
  await api.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: { requests: missing.map((title) => ({ addSheet: { properties: { title, gridProperties: { frozenRowCount: 1 } } } })) },
  });

for (const [tab, headers] of Object.entries(schema)) {
  const cur = await api.spreadsheets.values.get({ spreadsheetId, range: `${tab}!1:1` });
  if (!cur.data.values?.[0]?.length) {
    await api.spreadsheets.values.update({ spreadsheetId, range: `${tab}!A1`, valueInputOption: 'RAW', requestBody: { values: [headers] } });
    console.log(`✓ ${tab}: headers written`);
  } else console.log(`• ${tab}: already has headers, left untouched`);
}

const products = await api.spreadsheets.values.get({ spreadsheetId, range: 'Products!A2:A' });
if (!products.data.values?.length) {
  const cols = schema.Products;
  const now = new Date().toISOString();
  const rows = seed.map((p) => cols.map((c) => ({ ...p, price: String(p.price), images: p.images.join('|'), active: 'TRUE', createdAt: now })[c] ?? ''));
  await api.spreadsheets.values.append({ spreadsheetId, range: 'Products!A1', valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: rows } });
  console.log(`✓ Products: seeded ${rows.length} sample frames`);
}

const settings = await api.spreadsheets.values.get({ spreadsheetId, range: 'Settings!A2:A' });
if (!settings.data.values?.length) {
  await api.spreadsheets.values.append({ spreadsheetId, range: 'Settings!A1', valueInputOption: 'RAW', insertDataOption: 'INSERT_ROWS', requestBody: { values: [['helpline', '+919876543210']] } });
  console.log('✓ Settings: default helpline added (change it in /admin/settings)');
}
console.log('Done.');
