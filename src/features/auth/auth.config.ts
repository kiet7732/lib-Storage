import * as AuthSession from 'expo-auth-session';
import { Platform } from 'react-native';

const issuer =
  process.env.EXPO_PUBLIC_KEYCLOAK_ISSUER ??
  process.env.EXPO_PUBLIC_KEYCLOAK_URL ??
  'http://localhost:8080/realms/library';

export const keycloakConfig = {
  issuer,
  clientId: process.env.EXPO_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'lib-storage-mobile',
  redirectUri:
    Platform.OS === 'web'
      ? makeWebRedirectUri()
      : AuthSession.makeRedirectUri({
          scheme: 'libstorage',
          path: 'auth/callback',
        }),
  scopes: ['openid', 'profile', 'email', 'offline_access'],
} as const;

function makeWebRedirectUri() {
  if (typeof window !== 'undefined' && window.location.origin) {
    return `${window.location.origin}/auth/callback`;
  }

  return AuthSession.makeRedirectUri({ path: 'auth/callback' });
}
