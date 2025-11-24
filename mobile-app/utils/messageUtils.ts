import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { readInbox } from './sms';

export type SmsMessage = { sender: string; body: string; timestamp?: number };

const db = SQLite.openDatabaseSync('trusted_sources.db');

export async function initLocalDb() {
  // Create tables if not exist
  db.execSync(`
    PRAGMA journal_mode = wal;
    CREATE TABLE IF NOT EXISTS trusted_sources (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS scammer_numbers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      number TEXT UNIQUE NOT NULL
    );
    CREATE TABLE IF NOT EXISTS meta (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

export async function getMessages(): Promise<SmsMessage[]> {
  if (Platform.OS === 'android') {
    return readInbox(100);
  }
  return [];
}

export function checkMessageFormat(msg: SmsMessage): boolean {
  // Heuristics for Rwanda MTN MoMo transaction messages
  // Look for currency, keywords, and possible transaction code patterns.
  const currency = /(RWF|FRW|Frw)/i;
  const keywords = /(MTN|MoMo|Mobile\s*Money|Yego!|Transaction)/i;
  const amount = /(\b\d{1,3}(?:[\s,]\d{3})*(?:\.\d+)?\b)/; // 1,000 or 1000.00
  const txCode = /(Txn|Trans(?:action)?)\s*ID\s*[:#-]?\s*[A-Za-z0-9]{6,}/i;
  const receivedPaid = /(received|paid|sent|deposit|withdrawal)/i;
  const body = msg.body || '';
  return (
    currency.test(body) &&
    keywords.test(body) &&
    (amount.test(body) || txCode.test(body) || receivedPaid.test(body))
  );
}

export function checkTrustedSource(sender: string, trustedSources: string[]) {
  return trustedSources.includes(normalizeMsisdn(sender));
}

export function checkScammerDatabase(sender: string, scammerNumbers: string[]) {
  return scammerNumbers.includes(normalizeMsisdn(sender));
}

export function normalizeMsisdn(input: string) {
  // Normalize to last 9 digits for Rwanda numbers and remove non-digits
  const digits = (input || '').replace(/\D/g, '');
  return digits.slice(-9);
}

export function getTrustedSources(): Promise<string[]> {
  const res: string[] = [];
  const query = db.getAllSync<{ number: string }>(
    'SELECT number FROM trusted_sources'
  );
  query.forEach(r => res.push(normalizeMsisdn(r.number)));
  return Promise.resolve(res);
}

export function getScammerNumbers(): Promise<string[]> {
  const res: string[] = [];
  const query = db.getAllSync<{ number: string }>(
    'SELECT number FROM scammer_numbers'
  );
  query.forEach(r => res.push(normalizeMsisdn(r.number)));
  return Promise.resolve(res);
}

export async function updateLocalDatabase(trustedSources: string[], scammerNumbers: string[]) {
  db.withTransactionSync(() => {
    db.execSync('DELETE FROM trusted_sources');
    const insertTrusted = db.prepareSync('INSERT OR IGNORE INTO trusted_sources (number) VALUES (?)');
    trustedSources.forEach(num => insertTrusted.executeSync([normalizeMsisdn(num)]));
    insertTrusted.finalizeSync();

    db.execSync('DELETE FROM scammer_numbers');
    const insertScammer = db.prepareSync('INSERT OR IGNORE INTO scammer_numbers (number) VALUES (?)');
    scammerNumbers.forEach(num => insertScammer.executeSync([normalizeMsisdn(num)]));
    insertScammer.finalizeSync();

    const stamp = Date.now().toString();
    db.execSync("INSERT OR REPLACE INTO meta (key, value) VALUES ('last_updated', '" + stamp + "')");
  });
}

export function getLastUpdated(): number | null {
  const row = db.getFirstSync<{ value: string }>('SELECT value FROM meta WHERE key = ?',[ 'last_updated' ]);
  return row?.value ? Number(row.value) : null;
}

export async function mergeLocalTrustedSources(numbers: string[]) {
  db.withTransactionSync(() => {
    const stmt = db.prepareSync('INSERT OR IGNORE INTO trusted_sources (number) VALUES (?)');
    numbers.forEach(n => stmt.executeSync([normalizeMsisdn(n)]));
    stmt.finalizeSync();
  });
}

export async function mergeLocalScammerNumbers(numbers: string[]) {
  db.withTransactionSync(() => {
    const stmt = db.prepareSync('INSERT OR IGNORE INTO scammer_numbers (number) VALUES (?)');
    numbers.forEach(n => stmt.executeSync([normalizeMsisdn(n)]));
    stmt.finalizeSync();
  });
}
