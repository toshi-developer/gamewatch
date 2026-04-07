# Gamewatch

Open-source game server dashboard — real-time status, player list, world map, and mod/resource list for your game servers.

![License](https://img.shields.io/badge/license-Apache%202.0-blue)

## Features

- **Multi-game support** — 7 Days to Die, FiveM (Minecraft, Palworld, Rust, ARK coming soon)
- **Multi-server** — Monitor multiple servers from a single dashboard
- **Real-time map** — World map with live player positions (7DTD via Allocs, FiveM via GTA V satellite tiles)
- **FiveM blips** — Map POI markers collected from game client
- **Player list** — Online/offline players with stats, playtime, last seen
- **Rankings** — Leaderboards (zombie kills, playtime, etc.)
- **Mod/resource list** — Display installed mods or FiveM resources
- **Auto-refresh** — Configurable polling interval (default 30s)
- **i18n** — Japanese and English UI
- **YAML config** — Single config file for all settings, with env var overrides
- **Docker ready** — One-command deployment with Docker Compose

## Quick Start

### 1. Clone

```bash
git clone https://github.com/toshi-developer/gamewatch.git
cd gamewatch
```

### 2. Configure

```bash
cp gamewatch.example.yaml gamewatch.yaml
```

Edit `gamewatch.yaml` to match your servers:

```yaml
site:
  name: "My Game Servers"
  locale: "en"

servers:
  - id: "sdtd"
    game: "sdtd"
    label: "7 Days to Die"
    apiUrl: "http://localhost:8081"

  - id: "fivem"
    game: "fivem"
    label: "FiveM Server"
    apiUrl: "http://localhost:30120"
```

### 3. Deploy with Docker

```bash
docker compose up -d
```

The dashboard will be available at `http://localhost:3000`.

### Without Docker

```bash
npm install
npm run build
npm start
```

## Game-Specific Setup

### 7 Days to Die

Requires the [Allocs Web API](https://7dtd.illy.bz/wiki/Server%20fixes) mod.

For public access without authentication, add webmodules with `permission_level="2000"` in `serveradmin.xml`:

```xml
<webmodules>
  <module name="webapi.getserverinfo" permission_level="2000" />
  <module name="webapi.getplayersonline" permission_level="2000" />
  <module name="webapi.getplayerlist" permission_level="2000" />
  <module name="webapi.getstats" permission_level="2000" />
  <module name="webapi.getplayerslocation" permission_level="2000" />
  <module name="web.map" permission_level="2000" />
</webmodules>
```

### FiveM

FiveM's standard endpoints (`/info.json`, `/dynamic.json`, `/players.json`) work out of the box.

For **player positions on the map** and **blip display**, install the included FiveM resource:

```bash
cp -r resources/fivem/gamewatch_api /path/to/your/fivem/resources/[standalone]/
```

Add to your `server.cfg`:

```
ensure gamewatch_api
```

Or if using a `[standalone]` folder with `ensure [standalone]`, just place the resource inside it.

## Configuration

### Config File (`gamewatch.yaml`)

See [`gamewatch.example.yaml`](gamewatch.example.yaml) for a full example with all options.

### Environment Variable Overrides

Every config value can be overridden via environment variables:

| Environment Variable | Config Path |
|---------------------|-------------|
| `GAMEWATCH_SITE_NAME` | `site.name` |
| `GAMEWATCH_SITE_LOCALE` | `site.locale` |
| `GAMEWATCH_SITE_REFRESH_INTERVAL` | `site.refreshInterval` |
| `GAMEWATCH_SERVERS_0_API_URL` | `servers[0].apiUrl` |
| `GAMEWATCH_SERVERS_0_LABEL` | `servers[0].label` |

### Legacy Environment Variables

For simple single-server setups, you can skip the YAML file entirely:

```bash
SDTD_API_URL=http://localhost:8081    # Auto-creates a 7DTD server entry
FIVEM_API_URL=http://localhost:30120  # Auto-creates a FiveM server entry
```

## Architecture

```
gamewatch/
├── app/
│   ├── page.tsx                    # Home: server list
│   └── servers/[serverId]/
│       └── page.tsx                # Server dashboard (dynamic per game)
├── lib/
│   ├── config.ts                   # YAML + env var config loader
│   ├── registry.ts                 # Provider factory
│   ├── i18n.ts                     # Internationalization
│   └── providers/
│       ├── types.ts                # GameProvider interface
│       ├── sdtd/index.ts           # 7 Days to Die provider
│       ├── fivem/index.ts          # FiveM provider
│       └── stub.ts                 # Stub for unimplemented games
├── components/
│   ├── shared/                     # Reusable UI components
│   └── game-specific/              # Game-specific widgets
├── resources/
│   └── fivem/gamewatch_api/        # FiveM Lua resource
├── gamewatch.yaml                  # Your config (git-ignored)
├── gamewatch.example.yaml          # Example config
└── docker-compose.yml
```

### Adding a New Game Provider

1. Create `lib/providers/<game>/index.ts`
2. Implement the `GameProvider` interface
3. Add the game type to `lib/config.schema.ts`
4. Register the provider in `lib/registry.ts`

See [`docs/providers.md`](docs/providers.md) for detailed instructions.

## Tech Stack

- [Next.js 16](https://nextjs.org/) (App Router, standalone output)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Leaflet](https://leafletjs.com/) (world maps)
- [Zod](https://zod.dev/) (config validation)

## Contributing

Contributions are welcome! Please open an issue or pull request.

Areas where help is especially appreciated:
- New game providers (Minecraft, Palworld, Rust, ARK)
- Translations (i18n string tables in `lib/i18n.ts`)
- UI improvements

## License

[Apache License 2.0](LICENSE)

Copyright 2026 toshi dev (Toshiki Kitaoka)
