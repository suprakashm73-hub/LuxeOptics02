import 'server-only';
import fs from 'node:fs';
import path from 'node:path';
import { HEADERS, type Driver, type Row, type TabName } from './driver';
import seedProducts from './seed-products.json';

/** Development-only driver: a JSON file in .data/ so the app runs without Google credentials. */
export function createLocalDriver(): Driver {
  const file = path.join(process.cwd(), '.data', 'store.json');
  type Store = Record<TabName, Row[]>;

  function read(): Store {
    if (!fs.existsSync(file)) {
      const empty = Object.fromEntries(Object.keys(HEADERS).map((t) => [t, []])) as unknown as Store;
      empty.Products = seedProducts.map((p) => ({
        ...p,
        price: String(p.price),
        images: p.images.join('|'),
        active: 'TRUE',
        createdAt: new Date().toISOString(),
      }));
      empty.Settings = [{ key: 'helpline', value: '+919876543210' }];
      write(empty);
      return empty;
    }
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  }
  function write(data: Store) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const tmp = file + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(data, null, 2));
    fs.renameSync(tmp, file);
  }

  return {
    async list(tab) {
      return read()[tab];
    },
    async append(tab, row) {
      const data = read();
      data[tab].push(row);
      write(data);
    },
    async update(tab, keyCol, key, patch) {
      const data = read();
      const hit = data[tab].find((r) => r[keyCol] === key);
      if (!hit) return false;
      Object.assign(hit, patch);
      write(data);
      return true;
    },
  };
}
