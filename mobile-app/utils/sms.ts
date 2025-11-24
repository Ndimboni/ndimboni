import { PermissionsAndroid, Platform } from 'react-native';
import type { SmsMessage } from './messageUtils';

export async function ensureSmsPermissions(): Promise<boolean> {
  if (Platform.OS !== 'android') return false;
  try {
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_SMS,
      PermissionsAndroid.PERMISSIONS.RECEIVE_SMS,
    ]);
    return (
      granted[PermissionsAndroid.PERMISSIONS.READ_SMS] === PermissionsAndroid.RESULTS.GRANTED &&
      granted[PermissionsAndroid.PERMISSIONS.RECEIVE_SMS] === PermissionsAndroid.RESULTS.GRANTED
    );
  } catch {
    return false;
  }
}

export async function readInbox(limit = 50): Promise<SmsMessage[]> {
  if (Platform.OS !== 'android') return [];
  const hasPerm = await ensureSmsPermissions();
  if (!hasPerm) return [];
  try {
    const SmsAndroid = await import('react-native-get-sms-android');
    const filter = {
      box: 'inbox',
      indexFrom: 0,
      maxCount: limit,
    };
    return await new Promise<SmsMessage[]>((resolve) => {
    SmsAndroid.default.list(JSON.stringify(filter), (fail: unknown) => {
        resolve([]);
    }, (count: number, smsList: string) => {
        try {
      const arr = JSON.parse(smsList) as { address: string; body: string; date?: number }[];
          resolve(
            arr.map((m) => ({ sender: m.address, body: m.body, timestamp: m.date }))
          );
        } catch {
          resolve([]);
        }
      });
    });
  } catch {
    return [];
  }
}
