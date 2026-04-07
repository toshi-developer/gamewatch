import { cookies } from "next/headers";

const COOKIE_NAME = "gw_admin";
const TOKEN_ENV = "GAMEWATCH_ADMIN_TOKEN";

export function getAdminToken(): string | undefined {
  return process.env[TOKEN_ENV];
}

export function isAdminEnabled(): boolean {
  const token = getAdminToken();
  return !!token && token.length > 0;
}

export async function isAuthenticated(): Promise<boolean> {
  if (!isAdminEnabled()) return false;
  const cookieStore = await cookies();
  const cookie = cookieStore.get(COOKIE_NAME);
  return cookie?.value === getAdminToken();
}

export function getSessionCookie(token: string): {
  name: string;
  value: string;
  options: Record<string, unknown>;
} | null {
  if (token !== getAdminToken()) return null;
  return {
    name: COOKIE_NAME,
    value: token,
    options: {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24, // 24h
    },
  };
}
