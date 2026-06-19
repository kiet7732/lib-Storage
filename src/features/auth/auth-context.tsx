import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import { keycloakConfig } from './auth.config';
import { clearAuthSession, loadAuthSession, saveAuthSession } from './auth.storage';
import type { AuthSessionState } from './auth.types';
import { buildSessionFromTokens, getRoleHomePath } from './auth.utils';

WebBrowser.maybeCompleteAuthSession();

type AuthRedirectTarget = '/dashboard' | '/home' | '/login' | '/login?registered=1' | '/';

type AuthContextValue = {
  session: AuthSessionState | null;
  isHydrating: boolean;
  isBusy: boolean;
  isReady: boolean;
  didCompleteRegistration: boolean;
  signIn: () => Promise<void>;
  signUp: () => Promise<void>;
  signOut: () => Promise<void>;
  clearRegistrationNotice: () => void;
  completeRedirectSignIn: (params: { code?: string; state?: string }) => Promise<{
    redirectTo: AuthRedirectTarget;
    status: 'signed_in' | 'registration_complete';
  }>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const WEB_AUTH_REQUEST_KEY = 'lib-storage.auth.web-request';
const WEB_AUTH_REQUEST_FALLBACK_KEY = 'lib-storage.auth.web-request.fallback';

function createRequestConfig(extraParams?: Record<string, string>) {
  return {
    clientId: keycloakConfig.clientId,
    scopes: [...keycloakConfig.scopes],
    redirectUri: keycloakConfig.redirectUri,
    responseType: AuthSession.ResponseType.Code,
    usePKCE: true,
    extraParams,
  };
}

function saveWebAuthRequest(request: AuthSession.AuthRequest, flow: 'login' | 'register') {
  if (Platform.OS !== 'web') {
    return;
  }

  const payload = JSON.stringify({
    state: request.state,
    codeVerifier: request.codeVerifier,
    flow,
    createdAt: Date.now(),
  });

  try {
    sessionStorage.setItem(WEB_AUTH_REQUEST_KEY, payload);
  } catch {
    // Some browser modes restrict sessionStorage during auth redirects.
  }

  try {
    localStorage.setItem(WEB_AUTH_REQUEST_FALLBACK_KEY, payload);
  } catch {
    // localStorage is a fallback only; native auth is handled by AuthSession.
  }
}

function readWebAuthRequest() {
  if (Platform.OS !== 'web') {
    return null;
  }

  let raw: string | null = null;

  try {
    raw = sessionStorage.getItem(WEB_AUTH_REQUEST_KEY);
  } catch {
    raw = null;
  }

  if (!raw) {
    try {
      raw = localStorage.getItem(WEB_AUTH_REQUEST_FALLBACK_KEY);
    } catch {
      raw = null;
    }
  }

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as { state?: string; codeVerifier?: string; flow?: 'login' | 'register' };
  } catch {
    return null;
  }
}

function clearWebAuthRequest() {
  if (Platform.OS !== 'web') {
    return;
  }

  try {
    sessionStorage.removeItem(WEB_AUTH_REQUEST_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }

  try {
    localStorage.removeItem(WEB_AUTH_REQUEST_FALLBACK_KEY);
  } catch {
    // Ignore storage cleanup failures.
  }
}

function getWebLoginRoute() {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return undefined;
  }

  return `${window.location.origin}/login`;
}

function getWebLoginRedirectUri() {
  const loginRoute = getWebLoginRoute();

  if (!loginRoute) {
    return undefined;
  }

  return `${loginRoute}?registered=1`;
}

function redirectToKeycloakLogout(input: {
  endSessionEndpoint?: string;
  idToken?: string;
  fallbackUrl?: string;
}) {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }

  if (!input.endSessionEndpoint || !input.idToken || !input.fallbackUrl) {
    if (input.fallbackUrl) {
      window.location.replace(input.fallbackUrl);
      return true;
    }

    return false;
  }

  const url = new URL(input.endSessionEndpoint);
  url.searchParams.set('client_id', keycloakConfig.clientId);
  url.searchParams.set('id_token_hint', input.idToken);
  url.searchParams.set('post_logout_redirect_uri', input.fallbackUrl);
  window.location.replace(url.toString());
  return true;
}

function isMissingSupportedRoleError(error: unknown) {
  return (
    error instanceof Error &&
    error.message.includes('Keycloak token does not include a supported role')
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const discovery = AuthSession.useAutoDiscovery(keycloakConfig.issuer);
  const [session, setSession] = useState<AuthSessionState | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);
  const [isBusy, setIsBusy] = useState(false);
  const [didCompleteRegistration, setDidCompleteRegistration] = useState(false);
  const handledCodeRef = useRef<string | null>(null);

  const [loginRequest, loginResponse, promptLogin] = AuthSession.useAuthRequest(
    createRequestConfig(),
    discovery,
  );
  const [registerRequest, registerResponse, promptRegister] = AuthSession.useAuthRequest(
    createRequestConfig({ kc_action: 'register' }),
    discovery,
  );

  useEffect(() => {
    let isMounted = true;

    async function restoreSession() {
      const stored = await loadAuthSession();

      if (!isMounted) {
        return;
      }

      if (!stored) {
        setIsHydrating(false);
        return;
      }

      const isExpired = stored.expiresAt ? stored.expiresAt <= Date.now() + 30_000 : false;

      if (!isExpired || !stored.refreshToken || !discovery?.tokenEndpoint) {
        setSession(stored);
        setIsHydrating(false);
        return;
      }

      try {
        const refreshed = await AuthSession.refreshAsync(
          {
            clientId: keycloakConfig.clientId,
            refreshToken: stored.refreshToken,
          },
          { tokenEndpoint: discovery.tokenEndpoint },
        );
        const nextSession = buildSessionFromTokens({
          accessToken: refreshed.accessToken,
          refreshToken: refreshed.refreshToken ?? stored.refreshToken,
          idToken: refreshed.idToken ?? stored.idToken,
          expiresIn: refreshed.expiresIn,
        });

        await saveAuthSession(nextSession);
        setSession(nextSession);
      } catch {
        await clearAuthSession();
        setSession(null);
      } finally {
        if (isMounted) {
          setIsHydrating(false);
        }
      }
    }

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, [discovery?.tokenEndpoint]);

  const clearRegistrationNotice = useCallback(() => {
    setDidCompleteRegistration(false);
  }, []);

  const completeRegistrationFlow = useCallback(
    async (tokens?: { idToken?: string }) => {
      await clearAuthSession();
      clearWebAuthRequest();
      setSession(null);
      setDidCompleteRegistration(true);

      return redirectToKeycloakLogout({
        endSessionEndpoint: discovery?.endSessionEndpoint,
        idToken: tokens?.idToken,
        fallbackUrl: getWebLoginRedirectUri(),
      });
    },
    [discovery?.endSessionEndpoint],
  );

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    async function consumeResponse(
      response: AuthSession.AuthSessionResult | null,
      request: AuthSession.AuthRequest | null,
    ) {
      if (
        !response ||
        response.type !== 'success' ||
        !discovery?.tokenEndpoint ||
        !request?.codeVerifier
      ) {
        return;
      }

      const code = response.params.code;

      if (!code || handledCodeRef.current === code) {
        return;
      }

      handledCodeRef.current = code;
      setIsBusy(true);

      try {
        const tokens = await AuthSession.exchangeCodeAsync(
          {
            clientId: keycloakConfig.clientId,
            code,
            redirectUri: keycloakConfig.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier,
            },
          },
          { tokenEndpoint: discovery.tokenEndpoint },
        );
        const nextSession = buildSessionFromTokens({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          idToken: tokens.idToken,
          expiresIn: tokens.expiresIn,
        });

        await saveAuthSession(nextSession);
        setSession(nextSession);
      } finally {
        setIsBusy(false);
      }
    }

    consumeResponse(loginResponse, loginRequest);
  }, [discovery?.tokenEndpoint, loginRequest, loginResponse]);

  useEffect(() => {
    if (Platform.OS === 'web') {
      return;
    }

    async function consumeResponse(
      response: AuthSession.AuthSessionResult | null,
      request: AuthSession.AuthRequest | null,
    ) {
      if (
        !response ||
        response.type !== 'success' ||
        !discovery?.tokenEndpoint ||
        !request?.codeVerifier
      ) {
        return;
      }

      const code = response.params.code;

      if (!code || handledCodeRef.current === code) {
        return;
      }

      handledCodeRef.current = code;
      setIsBusy(true);

      try {
        const tokens = await AuthSession.exchangeCodeAsync(
          {
            clientId: keycloakConfig.clientId,
            code,
            redirectUri: keycloakConfig.redirectUri,
            extraParams: {
              code_verifier: request.codeVerifier,
            },
          },
          { tokenEndpoint: discovery.tokenEndpoint },
        );

        await completeRegistrationFlow({ idToken: tokens.idToken });
      } finally {
        setIsBusy(false);
      }
    }

    consumeResponse(registerResponse, registerRequest);
  }, [completeRegistrationFlow, discovery?.tokenEndpoint, registerRequest, registerResponse]);

  const signIn = useCallback(async () => {
    if (!loginRequest || !discovery) {
      return;
    }

    setIsBusy(true);

    try {
      if (Platform.OS === 'web') {
        const url = await loginRequest.makeAuthUrlAsync(discovery);
        saveWebAuthRequest(loginRequest, 'login');
        window.location.assign(url);
        return;
      }

      await promptLogin();
    } catch (error) {
      console.warn('Unable to open Keycloak login session.', error);
    } finally {
      setIsBusy(false);
    }
  }, [discovery, loginRequest, promptLogin]);

  const signUp = useCallback(async () => {
    if (!registerRequest || !discovery) {
      return;
    }

    setIsBusy(true);

    try {
      if (Platform.OS === 'web') {
        const url = await registerRequest.makeAuthUrlAsync(discovery);
        saveWebAuthRequest(registerRequest, 'register');
        window.location.assign(url);
        return;
      }

      await promptRegister();
    } catch (error) {
      console.warn('Unable to open Keycloak registration session.', error);
    } finally {
      setIsBusy(false);
    }
  }, [discovery, promptRegister, registerRequest]);

  const completeRedirectSignIn = useCallback(
    async ({
      code,
      state,
    }: {
      code?: string;
      state?: string;
    }): Promise<{
      redirectTo: AuthRedirectTarget;
      status: 'signed_in' | 'registration_complete';
    }> => {
      if (!code || !discovery?.tokenEndpoint) {
        throw new Error('Missing Keycloak authorization code.');
      }

      if (handledCodeRef.current === code) {
        return {
          redirectTo: session ? getRoleHomePath(session.role) : '/',
          status: 'signed_in' as const,
        };
      }

      const storedRequest = readWebAuthRequest();

      if (!storedRequest?.codeVerifier) {
        throw new Error('Missing PKCE verifier for Keycloak callback.');
      }

      if (storedRequest.state && state && storedRequest.state !== state) {
        throw new Error('Invalid Keycloak callback state.');
      }

      handledCodeRef.current = code;
      setIsBusy(true);

      try {
        const tokens = await AuthSession.exchangeCodeAsync(
          {
            clientId: keycloakConfig.clientId,
            code,
            redirectUri: keycloakConfig.redirectUri,
            extraParams: {
              code_verifier: storedRequest.codeVerifier,
            },
          },
          { tokenEndpoint: discovery.tokenEndpoint },
        );

        if (storedRequest.flow === 'register') {
          const redirected = await completeRegistrationFlow({ idToken: tokens.idToken });

          return {
            redirectTo: redirected ? '/login?registered=1' : '/login?registered=1',
            status: 'registration_complete' as const,
          };
        }

        let nextSession: AuthSessionState;

        try {
          nextSession = buildSessionFromTokens({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            idToken: tokens.idToken,
            expiresIn: tokens.expiresIn,
          });
        } catch (error) {
          if (isMissingSupportedRoleError(error)) {
            await completeRegistrationFlow({ idToken: tokens.idToken });
            return {
              redirectTo: '/login?registered=1',
              status: 'registration_complete' as const,
            };
          }

          throw error;
        }

        await saveAuthSession(nextSession);
        clearWebAuthRequest();
        setSession(nextSession);
        return {
          redirectTo: getRoleHomePath(nextSession.role),
          status: 'signed_in' as const,
        };
      } finally {
        setIsBusy(false);
      }
    },
    [completeRegistrationFlow, discovery?.tokenEndpoint, session],
  );

  const signOut = useCallback(async () => {
    const fallbackLoginRoute = getWebLoginRoute();
    const currentIdToken = session?.idToken;

    if (session?.refreshToken && discovery?.revocationEndpoint) {
      try {
        await AuthSession.revokeAsync(
          {
            clientId: keycloakConfig.clientId,
            token: session.refreshToken,
          },
          { revocationEndpoint: discovery.revocationEndpoint },
        );
      } catch {
        // Local logout still matters even if revocation is unavailable.
      }
    }

    await clearAuthSession();
    clearWebAuthRequest();
    setDidCompleteRegistration(false);
    setSession(null);

    redirectToKeycloakLogout({
      endSessionEndpoint: discovery?.endSessionEndpoint,
      idToken: currentIdToken,
      fallbackUrl: fallbackLoginRoute,
    });
  }, [
    discovery?.endSessionEndpoint,
    discovery?.revocationEndpoint,
    session?.idToken,
    session?.refreshToken,
  ]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      isHydrating,
      isBusy,
      isReady: Boolean(discovery && loginRequest),
      didCompleteRegistration,
      signIn,
      signUp,
      signOut,
      clearRegistrationNotice,
      completeRedirectSignIn,
    }),
    [
      clearRegistrationNotice,
      completeRedirectSignIn,
      didCompleteRegistration,
      discovery,
      isBusy,
      isHydrating,
      loginRequest,
      session,
      signIn,
      signOut,
      signUp,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return value;
}
