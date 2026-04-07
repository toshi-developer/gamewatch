import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie, isAdminEnabled } from "@/lib/admin-auth";

export async function POST(req: NextRequest) {
  if (!isAdminEnabled()) {
    return NextResponse.json(
      { error: "Admin is not enabled. Set GAMEWATCH_ADMIN_TOKEN." },
      { status: 403 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const token = body.token as string;

  const cookie = getSessionCookie(token);
  if (!cookie) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(cookie.name, cookie.value, cookie.options as Record<string, string>);
  return res;
}
