# Writing a Game Provider

This guide explains how to add support for a new game to Gamewatch.

## Overview

Each game is supported through a **provider** — a class that implements the `GameProvider` interface defined in `lib/providers/types.ts`. The provider is responsible for fetching data from the game server's API and returning it in Gamewatch's normalized format.

## Step 1: Add the Game Type

In `lib/config.schema.ts`, add your game to the `game` enum:

```typescript
game: z.enum(["sdtd", "fivem", "minecraft", "palworld", "rust", "ark", "your-game"]),
```

## Step 2: Create the Provider

Create a new directory: `lib/providers/<your-game>/index.ts`

```typescript
import type { ServerConfig } from "@/lib/config.schema";
import type {
  GameProvider,
  ProviderCapabilities,
  ServerStatus,
  Player,
} from "../types";

export class YourGameProvider implements GameProvider {
  readonly id = "your-game";
  readonly displayName = "Your Game";
  readonly capabilities: ProviderCapabilities = {
    hasMap: false,
    hasPlayerPositions: false,
    hasBlips: false,
    hasRankings: false,
    hasModList: false,
    hasServerSettings: false,
    hasGameEvents: false,
  };

  constructor(private config: ServerConfig) {}

  async getStatus(): Promise<ServerStatus> {
    // Fetch from your game's API
    const res = await fetch(`${this.config.apiUrl}/status`, {
      cache: "no-store",
    });
    const data = await res.json();

    return {
      online: true,
      playerCount: data.players,
      maxPlayers: data.maxPlayers,
      version: data.version,
      serverName: this.config.label,
      gameSpecific: {}, // Put game-specific data here
    };
  }

  async getPlayers(): Promise<Player[]> {
    // Implement player list fetching
    return [];
  }
}
```

## Step 3: Register the Provider

In `lib/registry.ts`, import and register your provider:

```typescript
import { YourGameProvider } from "./providers/your-game";

function createProvider(config: ServerConfig): GameProvider {
  switch (config.game) {
    case "sdtd":
      return new SdtdProvider(config);
    case "fivem":
      return new FiveMProvider(config);
    case "your-game":
      return new YourGameProvider(config);
    default:
      return new StubProvider(config);
  }
}
```

## Step 4: Add Map Support (Optional)

If your game supports a world map, implement `getMapConfig()` and `getPlayerPositions()`:

```typescript
getMapConfig(): MapConfig {
  return {
    tileUrl: `/api/servers/${this.config.id}/map/{z}/{x}/{y}`,
    tileOptions: {
      tileSize: 256,
      minZoom: 0,
      maxZoom: 5,
    },
    crs: { type: "simple" },
    defaultCenter: [0, 0],
    defaultZoom: 2,
  };
}

async getPlayerPositions(): Promise<Player[]> {
  // Return players with position data
}

async proxyRequest(path: string): Promise<Response> {
  // Proxy map tile requests to your game's map server
  return fetch(`${this.config.apiUrl}/map/${path}`);
}
```

### CRS Options

- `{ type: "simple" }` — Standard Leaflet CRS.Simple (pixel coordinates)
- `{ type: "sdtd", maxZoom: 4 }` — 7 Days to Die custom projection
- `{ type: "transformation", params: [a, b, c, d] }` — Custom Leaflet Transformation

## Step 5: Add Game-Specific Components (Optional)

For unique UI elements, create components in `components/game-specific/<your-game>/`:

```typescript
// components/game-specific/your-game/special-widget.tsx
export function SpecialWidget({ status }: { status: ServerStatus }) {
  const data = status.gameSpecific;
  // Render game-specific UI
}
```

Then conditionally render in the server page (`app/servers/[serverId]/page.tsx`):

```tsx
{serverConfig.game === "your-game" && (
  <SpecialWidget status={status} />
)}
```

## Provider Capabilities

Set capabilities to `true` only for features your provider actually implements:

| Capability | Required Methods |
|-----------|-----------------|
| `hasMap` | `getMapConfig()`, `proxyRequest()` |
| `hasPlayerPositions` | `getPlayerPositions()` |
| `hasBlips` | `getBlips()` |
| `hasRankings` | `getPlayers()` with playtime/stats |
| `hasModList` | `getMods()` |
| `hasServerSettings` | `getServerSettings()` |
| `hasGameEvents` | `getGameEvents()` |

The dashboard automatically shows/hides sections based on capabilities.
