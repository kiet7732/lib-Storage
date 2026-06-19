import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthSessionState } from './auth.types';

const AUTH_STORAGE_KEY = 'lib-storage.auth.session';

async function setWebItem(value: string | null) {
  if (typeof localStorage === 'undefined') {
    return;
  }

  if (value === null) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return;
  }

  localStorage.setItem(AUTH_STORAGE_KEY, value);
}

async function getWebItem() {
  if (typeof localStorage === 'undefined') {
    return null;
  }

  return localStorage.getItem(AUTH_STORAGE_KEY);
}

export async function saveAuthSession(session: AuthSessionState) {
  const value = JSON.stringify(session);

  if (Platform.OS === 'web') {
    await setWebItem(value);
    return;
  }

  await SecureStore.setItemAsync(AUTH_STORAGE_KEY, value);
}

export async function loadAuthSession() {
  const raw =
    Platform.OS === 'web'
      ? await getWebItem()
      : await SecureStore.getItemAsync(AUTH_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthSessionState;
  } catch {
    return null;
  }
}

export async function clearAuthSession() {
  if (Platform.OS === 'web') {
    await setWebItem(null);
    return;
  }

  await SecureStore.deleteItemAsync(AUTH_STORAGE_KEY);
}
