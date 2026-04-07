import { NextRequest, NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config";
import { getHistory, isInfluxEnabled } from "@/lib/influx";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ serverId: string }> },
) {
  const { serverId } = await params;

  if (!isInfluxEnabled()) {
    return NextResponse.json(
      { error: "InfluxDB not configured" },
      { status: 404 },
    );
  }

  const config = getServerConfig(serverId);
  if (!config) {
    return NextResponse.json({ error: "Unknown server" }, { status: 404 });
  }

  const range = req.nextUrl.searchParams.get("range") ?? "-24h";
  const allowed = ["-1h", "-6h", "-24h", "-7d", "-30d"];
  if (!allowed.includes(range)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const points = await getHistory(serverId, range);
  return NextResponse.json(points, {
    headers: { "Cache-Control": "no-store" },
  });
}
