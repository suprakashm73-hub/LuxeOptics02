import 'server-only';
import schema from './schema.json';

export type TabName = keyof typeof schema;
export type Row = Record<string, string>;

export const HEADERS = schema as Record<TabName, string[]>;

/** Minimal table interface; every cell is a string. Implemented by Sheets and a local JSON file. */
export interface Driver {
  list(tab: TabName): Promise<Row[]>;
  append(tab: TabName, row: Row): Promise<void>;
  /** Merge `patch` into the first row whose `keyCol` equals `key`. Returns false when no row matched. */
  update(tab: TabName, keyCol: string, key: string, patch: Row): Promise<boolean>;
}

let driver: Driver | undefined;

export async function getDriver(): Promise<Driver> {
  if (driver) return driver;
  if (process.env.GOOGLE_SHEET_ID) {
    const { createSheetsDriver } = await import('./sheets');
    driver = createSheetsDriver();
  } else if (process.env.NODE_ENV !== 'production') {
    const { createLocalDriver } = await import('./local');
    driver = createLocalDriver();
  } else {
    throw new Error('GOOGLE_SHEET_ID is not set. Configure Google Sheets (see README).');
  }
  return driver;
}
