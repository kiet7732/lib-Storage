export type AppRole = 'student' | 'librarian';

export type AuthSessionState = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresAt?: number;
  role: AppRole;
  username?: string;
  email?: string;
  displayName?: string;
};

export type KeycloakClaims = {
  preferred_username?: string;
  email?: string;
  name?: string;
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
};
