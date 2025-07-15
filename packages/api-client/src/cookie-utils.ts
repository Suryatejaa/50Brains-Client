// Cookie utility functions for extracting auth tokens
export function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    // Server-side rendering
    return null;
  }

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) {
    const cookieValue = parts.pop()?.split(';').shift();
    return cookieValue || null;
  }

  return null;
}

export function getAccessTokenFromCookie(): string | null {
  return getCookieValue('accessToken');
}

export function getRefreshTokenFromCookie(): string | null {
  return getCookieValue('refreshToken');
}

export function parseCookies(cookieString?: string): Record<string, string> {
  const cookies: Record<string, string> = {};

  if (!cookieString) {
    if (typeof document !== 'undefined') {
      cookieString = document.cookie;
    } else {
      return cookies;
    }
  }

  cookieString.split(';').forEach((cookie) => {
    const [name, ...rest] = cookie.trim().split('=');
    if (name && rest.length > 0) {
      cookies[name] = rest.join('=');
    }
  });

  return cookies;
}
