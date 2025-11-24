import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import {
  getMessages,
  checkMessageFormat,
  checkTrustedSource,
  checkScammerDatabase,
  getTrustedSources,
  getScammerNumbers,
  updateLocalDatabase,
  getLastUpdated
} from '../utils/messageUtils';
import { emitWarning } from '../utils/notifications';
import Constants from 'expo-constants';
import { syncFromBackend } from '../utils/backendSync';

const BACKGROUND_FETCH_TASK = 'background-message-checker';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    // Periodic backend sync (every 6 hours)
    const last = getLastUpdated();
    const sixHours = 6 * 60 * 60 * 1000;
    const baseUrl = (Constants?.expoConfig?.extra as any)?.backendBaseUrl as string | undefined;
    if (baseUrl && (!last || Date.now() - last > sixHours)) {
      try { await syncFromBackend({ baseUrl }); } catch {}
    }

    const messages = await getMessages();
    const trustedSources = await getTrustedSources();
    const scammerNumbers = await getScammerNumbers();
    for (const msg of messages as Array<{ sender: string; body: string }>) {
      const isFormatValid = checkMessageFormat(msg);
      const isTrusted = checkTrustedSource(msg.sender, trustedSources);
      const isScammer = checkScammerDatabase(msg.sender, scammerNumbers);
      if (!isFormatValid || !isTrusted) {
        emitWarning('Message is not from MTN or format mismatch');
      }
      if (isScammer) {
        emitWarning('Sender reported as scammer');
      }
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundMessageChecker() {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
    minimumInterval: 60, // 1 minute
    stopOnTerminate: false,
    startOnBoot: true,
    });
  } catch (e) {
    // If already registered or not supported
  }
}
