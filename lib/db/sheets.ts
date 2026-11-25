import 'server-only';
import { auth, sheets as sheetsApi } from '@googleapis/sheets';
import { HEADERS, type Driver, type Row, type TabName } from './driver';

const colLetter = (n: number) => {
  let s = '';
  for (n += 1; n > 0; n = Math.floor((n - 1) / 26)) s = String.fromCharCode(65 + ((n - 1) % 26)) + s;
  return s;
};

export function createSheetsDriver(): Driver {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g, '\n');
  const spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  if (!email || !key) throw new Error('GOOGLE_SERVICE_ACCOUNT_EMAIL and GOOGLE_PRIVATE_KEY are required.');

  const api = sheetsApi({
    version: 'v4',
    auth: new auth.JWT({ email, key, scopes: ['https://www.googleapis.com/auth/spreadsheets'] }),
  });

  /** Returns header row + data rows (with their 1-based sheet row numbers). */
  async function load(tab: TabName) {
    const res = await api.spreadsheets.values.get({ spreadsheetId, range: tab });
    const [header = HEADERS[tab], ...rest] = res.data.values ?? [];
    const rows = rest.map((cells, i) => ({
      n: i + 2,
      row: Object.fromEntries(header.map((h, c) => [h, String(cells[c] ?? '')])) as Row,
    }));
    return { header: header.map(String), rows };
  }

  const toCells = (header: string[], row: Row) => header.map((h) => row[h] ?? '');

  return {
    async list(tab) {
      return (await load(tab)).rows.map((r) => r.row);
    },

    async append(tab, row) {
      const { header } = await load(tab);
      await api.spreadsheets.values.append({
        spreadsheetId,
        range: `${tab}!A1`,
        valueInputOption: 'RAW', // RAW => user text such as "=1+1" is never evaluated as a formula
        insertDataOption: 'INSERT_ROWS',
        requestBody: { values: [toCells(header, row)] },
      });
    },

    async update(tab, keyCol, key, patch) {
      const { header, rows } = await load(tab);
      const hit = rows.find((r) => r.row[keyCol] === key);
      if (!hit) return false;
      await api.spreadsheets.values.update({
        spreadsheetId,
        range: `${tab}!A${hit.n}:${colLetter(header.length - 1)}${hit.n}`,
        valueInputOption: 'RAW',
        requestBody: { values: [toCells(header, { ...hit.row, ...patch })] },
      });
      return true;
    },
  };
}
