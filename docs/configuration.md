# Configuration Reference

Gamewatch is configured via a YAML file (`gamewatch.yaml`) with optional environment variable overrides.

## Config File Location

The config file is loaded from:
1. Path specified by `GAMEWATCH_CONFIG` environment variable
2. `./gamewatch.yaml` (default)

## Schema

### `site`

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `name` | string | `"Gamewatch"` | Site name displayed in the header |
| `locale` | `"ja"` \| `"en"` | `"ja"` | UI language |
| `refreshInterval` | number | `30` | Auto-refresh interval in seconds (min: 5) |
| `footer.text` | string | `"Powered by"` | Footer text |
| `footer.link.label` | string | `"Gamewatch"` | Footer link label |
| `footer.link.url` | string | GitHub URL | Footer link URL |

### `servers[]`

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `id` | string | Yes | Unique server identifier (used in URLs) |
| `game` | enum | Yes | Game type: `sdtd`, `fivem`, `minecraft`, `palworld`, `rust`, `ark` |
| `label` | string | Yes | Display name |
| `apiUrl` | string (URL) | Yes | Game server API endpoint |
| `auth.tokenName` | string | No | API token name (7DTD) |
| `auth.tokenSecret` | string | No | API token secret (7DTD) |
| `auth.rconPassword` | string | No | RCON password (Minecraft, Rust) |
| `mods[]` | array | No | Static mod list (overrides API-based detection) |
| `resourceName` | string | No | FiveM resource name (default: `gamewatch_api`) |
| `tileSource` | string | No | Map tile source (FiveM: `"github"` default) |

### `mods[]` entries

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `name` | string | Yes | Mod name |
| `version` | string | No | Version string |
| `description` | string | No | Description |
| `category` | string | No | Category for grouping |
| `url` | string | No | Link to mod page |

## Environment Variable Overrides

### Structured overrides

```
GAMEWATCH_SITE_NAME=My Servers
GAMEWATCH_SITE_LOCALE=en
GAMEWATCH_SITE_REFRESH_INTERVAL=15
GAMEWATCH_SERVERS_0_API_URL=http://10.0.0.5:8081
GAMEWATCH_SERVERS_0_LABEL=My 7DTD Server
GAMEWATCH_SERVERS_1_API_URL=http://10.0.0.5:30120
```

### Legacy single-server mode

If no `gamewatch.yaml` exists, these env vars auto-create server entries:

```
SDTD_API_URL=http://localhost:8081
SDTD_API_TOKEN_NAME=mytoken
SDTD_API_TOKEN_SECRET=mysecret
FIVEM_API_URL=http://localhost:30120
```

## InfluxDB Integration

Connect to [game-monitor-agent](https://github.com/toshi-developer/game-monitor-agent)'s InfluxDB for history charts:

```yaml
influxdb:
  url: "http://localhost:8086"
  token: "your-influxdb-token"
  org: "your-org"
  bucket: "game_metrics"
```

Each server can specify `monitorName` to match the `server_name` tag in InfluxDB:

```yaml
servers:
  - id: "sdtd"
    game: "sdtd"
    label: "7DTD Server"
    monitorName: "Local-7DTD"
```

If `monitorName` is omitted, the server `label` is used for matching.

**Public pages** display player count history. **Admin pages** additionally show CPU and memory charts.

## Admin Panel

Set `GAMEWATCH_ADMIN_TOKEN` to enable the admin panel:

```bash
GAMEWATCH_ADMIN_TOKEN=my-secret-token docker compose up -d
```

| Path | Description |
|------|-------------|
| `/admin` | Token login page |
| `/admin/settings` | Edit `gamewatch.yaml` from the browser |
| `/servers/<id>/admin` | Per-server admin view with system metrics |

The admin token is checked via a secure HTTP-only cookie (24h session).

## Docker Compose Example

```yaml
services:
  gamewatch:
    build: .
    ports:
      - "3000:3000"
    environment:
      - GAMEWATCH_ADMIN_TOKEN=${GAMEWATCH_ADMIN_TOKEN:-}
    volumes:
      - ./gamewatch.yaml:/app/gamewatch.yaml
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

Use `host.docker.internal` to reach game servers running on the Docker host.

Note: The config volume is mounted without `:ro` to allow the admin settings editor to write changes.
