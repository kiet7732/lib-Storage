import { jwtDecode } from 'jwt-decode';

import { keycloakConfig } from './auth.config';
import type { AppRole, AuthSessionState, KeycloakClaims } from './auth.types';

function uniq(values: string[]) {
  return Array.from(new Set(values));
}

export function resolveRoleFromToken(token: string) {
  const claims = jwtDecode<KeycloakClaims>(token);
  const realmRoles = claims.realm_access?.roles ?? [];
  const clientRoles = Object.values(claims.resource_access ?? {}).flatMap(
    (entry) => entry.roles ?? [],
  );
  const roles = uniq([...realmRoles, ...clientRoles]);
  const role = roles.includes('librarian')
    ? 'librarian'
    : roles.includes('student')
      ? 'student'
      : null;

  return { role, claims };
}

export function buildSessionFromTokens(input: {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
}) {
  // Roles are typically attached to the access token in Keycloak, while the ID token
  // is better for profile fields. Prefer access-token roles to avoid false "missing role" errors.
  const { role } = resolveRoleFromToken(input.accessToken);
  const claimsToken = input.idToken ?? input.accessToken;
  const { claims } = resolveRoleFromToken(claimsToken);

  if (!role) {
    throw new Error(
      `Keycloak token does not include a supported role for client "${keycloakConfig.clientId}".`,
    );
  }

  return {
    accessToken: input.accessToken,
    refreshToken: input.refreshToken,
    idToken: input.idToken,
    expiresAt: input.expiresIn ? Date.now() + input.expiresIn * 1000 : undefined,
    role: role as AppRole,
    username: claims.preferred_username,
    email: claims.email,
    displayName: claims.name,
  } satisfies AuthSessionState;
}

export function getRoleHomePath(role: AppRole): '/dashboard' | '/home' {
  return role === 'librarian' ? '/dashboard' : '/home';
}
