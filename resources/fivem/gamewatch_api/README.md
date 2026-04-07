# gamewatch_api — FiveM Resource

A lightweight FiveM server resource that exposes player positions and map blips via HTTP for the [Gamewatch](https://github.com/toshi-developer/gamewatch) dashboard.

## Installation

1. Copy this folder to your FiveM server's resources directory:

```bash
cp -r gamewatch_api /path/to/resources/[standalone]/gamewatch_api
```

2. Add to your `server.cfg` (or use a folder `ensure`):

```
ensure gamewatch_api
```

3. Restart your FiveM server.

## Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `GET /gamewatch_api/players` | GET | Returns online player positions (id, name, ping, x, y, z) |
| `GET /gamewatch_api/blips` | GET | Returns cached map blips (sprite, x, y, z, color) |

## How It Works

- **Player positions**: Server-side script reads `GetEntityCoords` for each connected player
- **Blips**: Client-side script iterates all map blips every 30 seconds and sends them to the server via a server event. Blip data is available as soon as the first player connects.

## Configuration

In your `gamewatch.yaml`, set the resource name if you renamed it:

```yaml
servers:
  - id: "fivem"
    game: "fivem"
    apiUrl: "http://localhost:30120"
    resourceName: "gamewatch_api"  # default
```

## License

Apache License 2.0 — same as the Gamewatch project.
