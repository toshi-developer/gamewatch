import { z } from "zod";

const serverAuthSchema = z
  .object({
    tokenName: z.string().optional(),
    tokenSecret: z.string().optional(),
    rconPassword: z.string().optional(),
  })
  .optional();

const modEntrySchema = z.object({
  name: z.string(),
  version: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  url: z.string().optional(),
});

const serverSchema = z.object({
  id: z.string(),
  game: z.enum(["sdtd", "fivem", "minecraft", "palworld", "rust", "ark"]),
  label: z.string(),
  apiUrl: z.string().url(),
  auth: serverAuthSchema,
  mods: z.array(modEntrySchema).optional(),
  /** FiveM: tile source — "github" (default proxy) or "local" */
  tileSource: z.string().optional(),
  /** FiveM: custom resource name for the gamewatch API (default "gamewatch_api") */
  resourceName: z.string().optional(),
  /** server_name tag in InfluxDB for history charts (defaults to label) */
  monitorName: z.string().optional(),
});

export type ServerConfig = z.infer<typeof serverSchema>;
export type GameType = ServerConfig["game"];

const linkSchema = z.object({
  label: z.string().default("Gamewatch"),
  url: z.string().default("https://github.com/toshi-developer/gamewatch"),
});

const footerSchema = z.object({
  text: z.string().default("Powered by"),
  link: linkSchema.default({ label: "Gamewatch", url: "https://github.com/toshi-developer/gamewatch" }),
});

const siteSchema = z.object({
  name: z.string().default("Gamewatch"),
  footer: footerSchema.default({ text: "Powered by", link: { label: "Gamewatch", url: "https://github.com/toshi-developer/gamewatch" } }),
  locale: z.enum(["ja", "en"]).default("ja"),
  refreshInterval: z.number().min(5).default(30),
});

const SITE_DEFAULT = {
  name: "Gamewatch",
  footer: {
    text: "Powered by",
    link: {
      label: "Gamewatch",
      url: "https://github.com/toshi-developer/gamewatch",
    },
  },
  locale: "ja" as const,
  refreshInterval: 30,
};

const influxSchema = z
  .object({
    url: z.string().url(),
    token: z.string(),
    org: z.string(),
    bucket: z.string(),
  })
  .optional();

export const configSchema = z.object({
  site: siteSchema.default(SITE_DEFAULT),
  servers: z.array(serverSchema).min(1),
  influxdb: influxSchema,
});

export type GamewatchConfig = z.infer<typeof configSchema>;
