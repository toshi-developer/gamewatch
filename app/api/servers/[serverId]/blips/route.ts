import { NextRequest, NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config";
import { getProvider } from "@/lib/registry";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  const { serverId } = await params;
  const config = getServerConfig(serverId);
  if (!config) return NextResponse.json([], { status: 404 });

  const provider = getProvider(serverId);
  if (!provider.getBlips) {
    return NextResponse.json([]);
  }

  try {
    const blips = await provider.getBlips();
    return NextResponse.json(blips, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
