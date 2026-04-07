import { NextRequest, NextResponse } from "next/server";
import { getServerConfig } from "@/lib/config";
import { getProvider } from "@/lib/registry";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ serverId: string; path: string[] }> },
) {
  const { serverId, path } = await params;

  const config = getServerConfig(serverId);
  if (!config) return new NextResponse("Not Found", { status: 404 });

  const provider = getProvider(serverId);
  if (!provider.proxyRequest) {
    return new NextResponse("Not supported", { status: 404 });
  }

  try {
    const upstream = await provider.proxyRequest(path.join("/"));
    if (!upstream.ok) {
      return new NextResponse(null, { status: 204 });
    }

    const buf = await upstream.arrayBuffer();
    let contentType =
      upstream.headers.get("content-type") ?? "application/octet-stream";

    // Fix content type when upstream returns generic octet-stream
    if (contentType === "application/octet-stream") {
      const pathStr = path.join("/");
      if (pathStr.endsWith(".webp")) contentType = "image/webp";
      else contentType = "image/png"; // default for map tiles
    }

    return new NextResponse(buf, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300, stale-while-revalidate=600",
      },
    });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
