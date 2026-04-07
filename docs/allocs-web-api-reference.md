# Allocs Web API Reference (7 Days to Die)

調査日: 2026-04-06

## 概要

7 Days to Die サーバーには 2 つの Web サーバーモジュールが存在する:

| MOD | バージョン（game-01） | 役割 |
|-----|----------------------|------|
| **TFP_WebServer** | v2.5.0.0 | TFP（The Fun Pimps）公式の統合 Web サーバー。Alpha 21 以降はゲーム本体に同梱。Web ダッシュボード UI + REST API + SSE ストリームを提供 |
| **Allocs_WebAndMapRendering** | v51 | Alloc 氏の Server Fixes の一部。マップタイルレンダリング + 追加 API エンドポイントを提供。Alpha 21 以降は TFP 実装と共存する形で動作 |

ダッシュボード URL: `http://<ip>:8081/legacymap`

> **注意**: Alpha 21 以降、TFP_WebServer が公式に JSON REST API を内蔵するようになった。Allocs の API は互換性を保ちながら追加データ（プレイヤーインベントリ、エンティティ位置情報等）を提供する。以下のエンドポイント一覧は Allocs v51 + TFP_WebServer v2.5 の組み合わせで利用可能なもの。

---

## 認証

### 方法 1: Web トークン（推奨 / 外部ツール向け）

サーバーコンソールで発行する:

```
webtokens add <tokenname> <secret> <permission_level>
```

HTTP リクエスト時は以下の **2 つのヘッダー** を付与する:

```
X-SDTD-API-TOKENNAME: <tokenname>
X-SDTD-API-SECRET: <secret>
```

または、クエリパラメータでも渡せる:

```
GET /api/getstats?adminuser=<tokenname>&admintoken=<secret>
```

### 方法 2: Steam ログイン（ブラウザ操作向け）

Web ダッシュボードにアクセスし Steam 認証を行う。`serveradmin.xml` で設定された権限レベルが適用される（未設定なら 1000）。

### パーミッションレベル

| レベル | 意味 |
|--------|------|
| 0 | 最高権限（スーパーアドミン） |
| 1 | アドミン |
| 1000 | Steam 認証ユーザーのデフォルト |
| 2000 | 未認証（公開アクセス） |

エンドポイントごとにアクセスに必要なパーミッションレベルを設定できる:

```
webpermission add <module_name> <level>
webpermission list
```

---

## API エンドポイント一覧

ベース URL: `http://<ip>:8081`

### 1. `/api/getstats`

サーバーの基本統計情報を取得する。

- **パーミッション名**: `webapi.getstats`
- **デフォルト権限**: 2000（公開）
- **パラメータ**: なし

**レスポンス**:
```json
{
  "gametime": {
    "days": 7,
    "hours": 14,
    "minutes": 32
  },
  "players": 3,
  "hostiles": 12,
  "animals": 45
}
```

---

### 2. `/api/getplayersonline`

現在オンラインのプレイヤー一覧を取得する。

- **パーミッション名**: `webapi.getplayersonline`
- **デフォルト権限**: 2000（公開）
- **パラメータ**: なし

**レスポンス**: 配列
```json
[
  {
    "steamid": "76561198012345678",
    "userid": "Steam_76561198012345678",
    "entityid": 171,
    "ip": "192.168.1.10",
    "name": "PlayerName",
    "online": true,
    "position": { "x": 1024, "y": 68, "z": -512 },
    "level": 42,
    "health": 100,
    "stamina": 100,
    "zombiekills": 1523,
    "playerkills": 0,
    "playerdeaths": 12,
    "score": 1511,
    "totalplaytime": 86400,
    "lastonline": "2026-04-06T12:00:00",
    "ping": 45
  }
]
```

---

### 3. `/api/getplayerlist`

全プレイヤー（オフライン含む）の一覧を取得する。ページネーション対応。

- **パーミッション名**: `webapi.viewallplayers`
- **デフォルト権限**: 2000（公開）
- **パラメータ**:
  - `rowsperpage` (number) — 1 ページあたりの件数（デフォルト不明、大きい値で全件取得可能）
  - `page` (number) — ページ番号

**レスポンス**:
```json
{
  "total": 150,
  "totalUnfiltered": 150,
  "firstResult": 0,
  "players": [
    {
      "steamid": "76561198012345678",
      "entityid": 171,
      "ip": "192.168.1.10",
      "name": "PlayerName",
      "online": false,
      "position": { "x": 1024, "y": 68, "z": -512 },
      "totalplaytime": 86400,
      "lastonline": "2026-04-06T12:00:00",
      "ping": 0,
      "banned": false
    }
  ]
}
```

---

### 4. `/api/getserverinfo`

サーバー設定・状態の詳細情報を取得する。

- **パーミッション名**: (不明 / 組み込み)
- **パラメータ**: なし

**レスポンス**: 各フィールドが `{ "type": "string", "value": "..." }` 形式のオブジェクト。

```json
{
  "GameType": { "type": "string", "value": "GameSurvival" },
  "GameName": { "type": "string", "value": "My Server" },
  "GameHost": { "type": "string", "value": "My Server" },
  "ServerDescription": { "type": "string", "value": "" },
  "ServerWebsiteURL": { "type": "string", "value": "" },
  "LevelName": { "type": "string", "value": "Navezgane" },
  "GameMode": { "type": "string", "value": "GameModeSurvival" },
  "Version": { "type": "string", "value": "Alpha 21.2 (b37)" },
  "IP": { "type": "string", "value": "162.43.7.73" },
  "CountryCode": { "type": "string", "value": "JP" },
  "SteamID": { "type": "string", "value": "..." },
  "CompatibilityVersion": { "type": "string", "value": "..." },
  "Platform": { "type": "string", "value": "Linux" },
  "Port": { "type": "int", "value": "26900" },
  "CurrentPlayers": { "type": "int", "value": "3" },
  "MaxPlayers": { "type": "int", "value": "8" },
  "GameDifficulty": { "type": "int", "value": "3" },
  "DayNightLength": { "type": "int", "value": "60" },
  "ZombiesRun": { "type": "int", "value": "0" },
  "DayCount": { "type": "int", "value": "7" },
  "Ping": { "type": "int", "value": "0" },
  "DropOnDeath": { "type": "int", "value": "0" },
  "DropOnQuit": { "type": "int", "value": "0" },
  "BloodMoonEnemyCount": { "type": "int", "value": "8" },
  "EnemyDifficulty": { "type": "int", "value": "0" },
  "PlayerKillingMode": { "type": "int", "value": "3" },
  "CurrentServerTime": { "type": "int", "value": "..." },
  "DayLightLength": { "type": "int", "value": "18" },
  "BlockDurabilityModifier": { "type": "int", "value": "100" },
  "AirDropFrequency": { "type": "int", "value": "72" },
  "LootAbundance": { "type": "int", "value": "100" },
  "LootRespawnDays": { "type": "int", "value": "7" },
  "MaxSpawnedZombies": { "type": "int", "value": "64" },
  "LandClaimSize": { "type": "int", "value": "41" },
  "LandClaimDeadZone": { "type": "int", "value": "30" },
  "LandClaimExpiryTime": { "type": "int", "value": "7" },
  "LandClaimDecayMode": { "type": "int", "value": "0" },
  "LandClaimOnlineDurabilityModifier": { "type": "int", "value": "4" },
  "LandClaimOfflineDurabilityModifier": { "type": "int", "value": "4" },
  "MaxSpawnedAnimals": { "type": "int", "value": "50" },
  "IsDedicated": { "type": "bool", "value": "True" },
  "IsPasswordProtected": { "type": "bool", "value": "False" },
  "ShowFriendPlayerOnMap": { "type": "bool", "value": "True" },
  "BuildCreate": { "type": "bool", "value": "False" },
  "EACEnabled": { "type": "bool", "value": "True" },
  "Architecture64": { "type": "bool", "value": "True" },
  "StockSettings": { "type": "bool", "value": "False" },
  "StockFiles": { "type": "bool", "value": "True" },
  "RequiresMod": { "type": "bool", "value": "False" },
  "AirDropMarker": { "type": "bool", "value": "False" },
  "EnemySpawnMode": { "type": "bool", "value": "True" },
  "IsPublic": { "type": "bool", "value": "True" }
}
```

---

### 5. `/api/getplayerslocation`

プレイヤーの位置情報を取得する。

- **パーミッション名**: `webapi.getplayerslocation`
- **デフォルト権限**: 2000（公開）
- **パラメータ**:
  - `offline` (boolean) — `true` でオフラインプレイヤーも含む

**レスポンス**: 配列
```json
[
  {
    "steamid": "76561198012345678",
    "userid": "Steam_76561198012345678",
    "name": "PlayerName",
    "online": true,
    "position": { "x": 1024, "y": 68, "z": -512 }
  }
]
```

---

### 6. `/api/getlandclaims`

ランドクレームブロックの位置情報を取得する。

- **パーミッション名**: `webapi.getlandclaims`（一覧） / `webapi.viewallclaims`（全プレイヤー分）
- **デフォルト権限**: `getlandclaims` = 1000 / `viewallclaims` = 1
- **パラメータ**:
  - `steamid` (string) — 特定プレイヤーのみ取得（省略で全員）

**レスポンス**:
```json
{
  "claimsize": 41,
  "claimowners": [
    {
      "steamid": "76561198012345678",
      "claimactive": true,
      "playername": "PlayerName",
      "claims": [
        { "x": 1024, "y": 68, "z": -512 }
      ]
    }
  ]
}
```

---

### 7. `/api/getplayerinventory`

特定プレイヤーのインベントリを取得する。

- **パーミッション名**: `webapi.getplayerinventory`
- **デフォルト権限**: 1
- **パラメータ**:
  - `steamid` (string) — Steam ID（17桁の場合は自動で `userid` にも `Steam_` プレフィックス付きで渡される）
  - `userid` (string) — ユーザーID（`Steam_XXXXX` 形式）

**レスポンス**:
```json
{
  "playername": "PlayerName",
  "userid": "Steam_76561198012345678",
  "steamid": "76561198012345678",
  "bag": [
    { "count": 1, "name": "gunPistol", "icon": "gunHandgunT1Pistol", "iconcolor": "255,255,255", "qualitycolor": "..." }
  ],
  "belt": [
    { "count": 64, "name": "foodCanChili", "icon": "foodCanChili", "iconcolor": "255,255,255" }
  ],
  "equipment": {
    "head": null,
    "eyes": null,
    "face": null,
    "armor": null,
    "jacket": null,
    "shirt": null,
    "legarmor": null,
    "pants": null,
    "boots": null,
    "gloves": null
  }
}
```

---

### 8. `/api/getplayerinventories`

全オンラインプレイヤーのインベントリを一括取得する。

- **パーミッション名**: `webapi.getplayerinventory`（同じ）
- **デフォルト権限**: 1
- **パラメータ**: なし

**レスポンス**: `InventoryResponse` の配列（上記と同じ構造）

---

### 9. `/api/gethostilelocation`

敵対エンティティ（ゾンビ）の位置情報を取得する。

- **パーミッション名**: `webapi.gethostilelocation`
- **デフォルト権限**: 1
- **パラメータ**: なし

**レスポンス**: 配列
```json
[
  {
    "id": 12345,
    "name": "zombieBoe",
    "position": { "x": 1000, "y": 56, "z": -300 }
  }
]
```

---

### 10. `/api/getanimalslocation`

動物エンティティの位置情報を取得する。

- **パーミッション名**: `webapi.getanimalslocation`
- **デフォルト権限**: 1
- **パラメータ**: なし

**レスポンス**: 配列（`gethostilelocation` と同じ構造）
```json
[
  {
    "id": 67890,
    "name": "animalChicken",
    "position": { "x": 500, "y": 70, "z": -200 }
  }
]
```

---

### 11. `/api/getlog`

サーバーログを取得する。

- **パーミッション名**: `webapi.GetLog`
- **デフォルト権限**: 1
- **パラメータ**:
  - `firstLine` (number) — 取得開始行番号
  - `count` (number) — 取得行数（デフォルト: 50）

**レスポンス**:
```json
{
  "firstLine": 100,
  "lastLine": 149,
  "entries": [
    {
      "date": "2026-04-06",
      "time": "12:00:00",
      "uptime": "123.456",
      "msg": "Player 'PlayerName' joined the game",
      "trace": "",
      "type": "Log"
    }
  ]
}
```

---

### 12. `/api/getwebuiupdates`

Web UI のポーリング用。最新のゲーム状態をまとめて取得する。

- **パーミッション名**: (不明)
- **パラメータ**:
  - `latestLine` (number) — 最後に取得したログ行番号（差分取得用）

**レスポンス**:
```json
{
  "gametime": {
    "days": 7,
    "hours": 14,
    "minutes": 32
  },
  "players": 3,
  "hostiles": 12,
  "animals": 45,
  "newlogs": 5
}
```

---

### 13. `/api/executeconsolecommand`

サーバーコンソールコマンドをリモート実行する。

- **パーミッション名**: `webapi.executeconsolecommand`
- **デフォルト権限**: 0（スーパーアドミンのみ）
- **パラメータ**:
  - `command` (string) — 実行するコマンド文字列

**レスポンス**:
```json
{
  "command": "listplayers",
  "parameters": "",
  "result": "Total of 3 in the game\n..."
}
```

> **セキュリティ注意**: このエンドポイントはサーバーに任意のコマンドを実行させるため、トークンの権限レベルを 0 に制限し、シークレットを厳重に管理すること。ダッシュボードから使う場合は、実行可能なコマンドをホワイトリストで制限する設計を推奨。

---

### 14. `/api/getallowedcommands`

現在の認証レベルで実行可能なコンソールコマンドの一覧を取得する。

- **パーミッション名**: (不明)
- **パラメータ**: なし

**レスポンス**:
```json
{
  "commands": [
    {
      "command": "listplayers",
      "description": "Lists the players",
      "help": "Usage: listplayers"
    },
    {
      "command": "kick",
      "description": "Kicks a player from the game",
      "help": "Usage: kick <name/entity id> [reason]"
    }
  ]
}
```

---

### 15. マップタイル

Allocs_WebAndMapRendering が提供するマップ画像タイル。

- **URL パターン**: `/map/<zoomlevel>/<x>/<z>.png`
- **パーミッション名**: `web.map`
- **デフォルト権限**: 2000（公開）

Leaflet 等のマップライブラリから直接利用可能。

---

## webpermission モジュール一覧（まとめ）

`webpermission list` コマンドで確認可能。主要なものは以下:

| モジュール名 | デフォルト権限 | 説明 |
|-------------|--------------|------|
| `web.map` | 2000 | マップ表示 |
| `webapi.getstats` | 2000 | サーバー統計 |
| `webapi.getplayersonline` | 2000 | オンラインプレイヤー |
| `webapi.getplayerslocation` | 2000 | プレイヤー位置 |
| `webapi.viewallplayers` | 2000 | 全プレイヤー一覧 |
| `webapi.getlandclaims` | 1000 | ランドクレーム |
| `webapi.viewallclaims` | 1 | 全クレーム閲覧 |
| `webapi.getplayerinventory` | 1 | プレイヤーインベントリ |
| `webapi.gethostilelocation` | 1 | 敵対エンティティ位置 |
| `webapi.getanimalslocation` | 1 | 動物位置 |
| `webapi.GetLog` | 1 | サーバーログ |
| `webapi.executeconsolecommand` | 0 | コンソールコマンド実行 |

---

## サーバーセットアップ例（game-01 用）

```bash
# SSH でサーバーに接続
ssh -i ~/.ssh/private_infra root@162.43.7.73

# 7DTD サーバーコンソールで以下を実行:

# 1. Web トークンを作成（ダッシュボード用）
webtokens add dashboard <strong-secret-here> 0

# 2. パーミッションを設定（必要に応じて公開範囲を調整）
webpermission add webapi.getplayerinventory 0
webpermission add webapi.gethostilelocation 0
webpermission add webapi.getanimalslocation 0
webpermission add webapi.GetLog 0
webpermission add webapi.viewallclaims 0
```

---

## ダッシュボード設計への示唆

### すぐに使えるデータ（権限 2000 = 公開）

- サーバー稼働状況（`getstats`）
- オンラインプレイヤー数・一覧（`getplayersonline`）
- 全プレイヤー一覧（`getplayerlist`）
- サーバー設定情報（`getserverinfo`）
- マップタイル（`/map/`）

### アドミントークンが必要なデータ

- プレイヤーインベントリ（`getplayerinventory` / `getplayerinventories`）
- ゾンビ・動物の位置（`gethostilelocation` / `getanimalslocation`）
- サーバーログ（`getlog`）
- コンソールコマンド実行（`executeconsolecommand`）

### ポーリング戦略

- `getwebuiupdates` を定期的にポーリング（10-30秒間隔）して、`newlogs` > 0 なら `getlog` で差分取得
- `getstats` で gametime / players / hostiles / animals の変化を監視
- プレイヤー位置はマップ表示時のみ `getplayerslocation` をポーリング

### 注意事項

- `executeconsolecommand` は任意コマンド実行が可能なため、ダッシュボード側でホワイトリスト制御を必ず実装すること
- API トークンのシークレットはサーバーサイド（Route Handler / Server Action）でのみ使用し、クライアントに露出させないこと
- Alpha 21 以降の TFP 公式 Web サーバーは SSE（Server-Sent Events）ストリームも提供するが、Allocs API はポーリング方式のみ

---

## 情報源

- [Allocs Server Fixes Wiki - Integrated Webserver](https://7dtd.illy.bz/wiki/Integrated%20Webserver)
- [Allocs Server Fixes Wiki - Server Fixes](https://7dtd.illy.bz/wiki/Server%20fixes)
- [CSMM Docs - Allocs](https://docs.csmm.app/en/CSMM/allocs.html)
- [7daystodie-api-wrapper (npm)](https://github.com/CatalysmsServerManager/7-Days-to-Die-API-wrapper) — TypeScript 型定義がレスポンススキーマの実質的なリファレンス
