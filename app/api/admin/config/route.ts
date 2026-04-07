import { NextRequest, NextResponse } from "next/server";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import { isAuthenticated } from "@/lib/admin-auth";
import { configSchema } from "@/lib/config.schema";
import { resetConfig } from "@/lib/config";

const CONFIG_PATH = process.env.GAMEWATCH_CONFIG ?? "./gamewatch.yaml";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!existsSync(CONFIG_PATH)) {
      return NextResponse.json({ error: "Config file not found" }, { status: 404 });
    }
    const content = readFileSync(CONFIG_PATH, "utf-8");
    const data = parseYaml(content);
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to read config: ${err}` },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();

    // Validate with Zod
    const parsed = configSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.issues },
        { status: 400 },
      );
    }

    // Write YAML
    const yaml = stringifyYaml(parsed.data, { indent: 2 });
    writeFileSync(CONFIG_PATH, yaml, "utf-8");

    // Invalidate cached config
    resetConfig();

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: `Failed to write config: ${err}` },
      { status: 500 },
    );
  }
}
