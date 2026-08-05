import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Current developer host machine IP fallback (Wi-Fi / LAN)
const LOCAL_DEV_IP = '192.168.137.45';

function getPackagerIp(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL.replace(/^https?:\/\//, '').split(':')[0];
  }

  const hostUri = Constants.expoConfig?.hostUri 
    || (Constants as any).manifest2?.extra?.expoGo?.developer?.tool
    || (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1' && ip !== '0.0.0.0') {
      return ip;
    }
  }

  const linkingUri = Constants.linkingUri;
  if (linkingUri) {
    const match = linkingUri.match(/exp:\/\/([^:/]+)/);
    if (match && match[1] && match[1] !== 'localhost' && match[1] !== '127.0.0.1') {
      return match[1];
    }
  }

  return LOCAL_DEV_IP;
}

const packagerIp = getPackagerIp();
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || `http://${packagerIp}:8000`;

console.log('[CastingAI] Mobile API_BASE =>', API_BASE);

export const getToken = async () => await SecureStore.getItemAsync('castingai_token');
export const setToken = async (t: string) => await SecureStore.setItemAsync('castingai_token', t);
export const removeToken = async () => await SecureStore.deleteItemAsync('castingai_token');

export const authFetch = async (path: string, opts: RequestInit = {}) => {
  const token = await getToken();
  return fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
  });
};

export function makeUrlDynamic(url: string | null | undefined): string {
  if (!url) return '';
  // If url is already relative, resolve it relative to API_BASE
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    const cleanUrl = url.startsWith('/') ? url : `/${url}`;
    return `${API_BASE}${cleanUrl}`;
  }
  // Replace the host in url with the host in API_BASE to ensure it resolves to the current server
  try {
    const path = url.replace(/^https?:\/\/[^\/]+/, '');
    return `${API_BASE}${path}`;
  } catch (e) {
    return url;
  }
}

export function isValidGmail(email: string): boolean {
  if (!email) return false;
  const trimmed = email.trim().toLowerCase();
  return /^[a-zA-Z0-9._%+-]+@(gmail|googlemail)\.com$/.test(trimmed);
}

