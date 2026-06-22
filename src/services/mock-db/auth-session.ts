import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import type { AuthSessionState } from '@/features/auth/auth.types';

import { mockDatabase } from './database';

type ProvisionedSystemUser = Pick<AuthSessionState, 'role' | 'email' | 'username'>;

const PROVISIONED_USERS_STORAGE_KEY = 'lib-storage.mock-system-users';

function normalize(value?: string | null) {
  return value?.trim().toLowerCase() ?? '';
}

function getEmailLocalPart(email: string) {
  return normalize(email.split('@')[0]);
}

async function setProvisionedUsersStorage(value: string | null) {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') {
      return;
    }

    if (value === null) {
      localStorage.removeItem(PROVISIONED_USERS_STORAGE_KEY);
      return;
    }

    localStorage.setItem(PROVISIONED_USERS_STORAGE_KEY, value);
    return;
  }

  if (value === null) {
    await SecureStore.deleteItemAsync(PROVISIONED_USERS_STORAGE_KEY);
    return;
  }

  await SecureStore.setItemAsync(PROVISIONED_USERS_STORAGE_KEY, value);
}

async function getProvisionedUsersStorage() {
  if (Platform.OS === 'web') {
    if (typeof localStorage === 'undefined') {
      return null;
    }

    return localStorage.getItem(PROVISIONED_USERS_STORAGE_KEY);
  }

  return SecureStore.getItemAsync(PROVISIONED_USERS_STORAGE_KEY);
}

function sessionMatchesUser(session: Pick<AuthSessionState, 'role' | 'email' | 'username'>, input: {
  role: AuthSessionState['role'];
  email?: string;
  username?: string;
  studentCode?: string;
  employeeCode?: string;
}) {
  const email = normalize(session.email);
  const username = normalize(session.username);

  if (!email && !username) {
    return false;
  }

  if (input.role !== session.role) {
    return false;
  }

  const userEmail = normalize(input.email);
  const emailMatches = Boolean(email) && userEmail === email;
  const usernameMatches =
    Boolean(username) &&
    (
      getEmailLocalPart(input.email ?? '') === username ||
      (input.role === 'student' && normalize(input.studentCode) === username) ||
      (input.role === 'librarian' && normalize(input.employeeCode) === username) ||
      normalize(input.username) === username
    );

  return emailMatches || usernameMatches;
}

async function loadProvisionedSystemUsers() {
  const raw = await getProvisionedUsersStorage();

  if (!raw) {
    return [] as ProvisionedSystemUser[];
  }

  try {
    const parsed = JSON.parse(raw) as ProvisionedSystemUser[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function rememberSystemUserForSession(
  session: Pick<AuthSessionState, 'role' | 'email' | 'username'>,
) {
  const currentUsers = await loadProvisionedSystemUsers();
  const alreadyExists = currentUsers.some((entry) =>
    sessionMatchesUser(session, {
      role: entry.role,
      email: entry.email,
      username: entry.username,
    }),
  );

  if (alreadyExists) {
    return;
  }

  currentUsers.push({
    role: session.role,
    email: session.email,
    username: session.username,
  });

  await setProvisionedUsersStorage(JSON.stringify(currentUsers));
}

export function hasSystemUserForSession(session: Pick<AuthSessionState, 'role' | 'email' | 'username'>) {
  for (const user of mockDatabase.users) {
    if (user.status !== 'active') {
      continue;
    }

    const role = mockDatabase.roles.find((entry) => entry.id === user.roleId);

    if (!role || role.code !== session.role) {
      continue;
    }

    const studentProfile = mockDatabase.students.find((entry) => entry.userId === user.id);
    const librarianProfile = mockDatabase.librarians.find((entry) => entry.userId === user.id);
    const hasRoleProfile =
      session.role === 'student' ? Boolean(studentProfile) : Boolean(librarianProfile);

    if (!hasRoleProfile) {
      continue;
    }

    if (
      sessionMatchesUser(session, {
        role: session.role,
        email: user.email,
        studentCode: studentProfile?.studentCode,
        employeeCode: librarianProfile?.employeeCode,
      })
    ) {
      return true;
    }
  }

  return false;
}

export async function hasPersistedSystemUserForSession(
  session: Pick<AuthSessionState, 'role' | 'email' | 'username'>,
) {
  if (hasSystemUserForSession(session)) {
    return true;
  }

  const provisionedUsers = await loadProvisionedSystemUsers();

  return provisionedUsers.some((entry) =>
    sessionMatchesUser(session, {
      role: entry.role,
      email: entry.email,
      username: entry.username,
    }),
  );
}
