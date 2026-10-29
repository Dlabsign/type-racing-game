export const AUTH_COOKIE_NAME = 'type_racing_auth';

/**
 * Sets the authentication cookie in the browser.
 * @param tokenOrUid User UID or Session identifier
 * @param rememberMe If true, persists for 30 days; if false, lasts 1 day
 */
export function setAuthCookie(tokenOrUid: string, rememberMe: boolean = true): void {
  if (typeof document === 'undefined') return;
  const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // 30 days or 1 day
  document.cookie = `${AUTH_COOKIE_NAME}=${encodeURIComponent(tokenOrUid)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

/**
 * Reads the authentication cookie in the browser.
 */
export function getAuthCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const matches = document.cookie.match(
    new RegExp('(?:^|; )' + AUTH_COOKIE_NAME.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + '=([^;]*)')
  );
  return matches ? decodeURIComponent(matches[1]) : null;
}

/**
 * Clears the authentication cookie in the browser.
 */
export function clearAuthCookie(): void {
  if (typeof document === 'undefined') return;
  document.cookie = `${AUTH_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}
