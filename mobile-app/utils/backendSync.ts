import { updateLocalDatabase } from './messageUtils';

export type SyncConfig = {
  baseUrl: string; // e.g., https://api.ndimboni.org
  trustedPath?: string; // default /api/trusted-senders
  scammersPath?: string; // default /api/scammers
};

export async function syncFromBackend(cfg: SyncConfig) {
  const trustedUrl = cfg.baseUrl + (cfg.trustedPath || '/api/trusted-senders');
  const scammersUrl = cfg.baseUrl + (cfg.scammersPath || '/api/scammers');
  const [trustedRes, scammersRes] = await Promise.all([
    fetch(trustedUrl),
    fetch(scammersUrl),
  ]);
  if (!trustedRes.ok || !scammersRes.ok) {
    throw new Error('Failed to fetch remote lists');
  }
  const trusted = (await trustedRes.json()) as string[];
  const scammers = (await scammersRes.json()) as string[];
  await updateLocalDatabase(trusted || [], scammers || []);
}
