import Link from "next/link";
import { getConfig } from "@/lib/config";
import { Card } from "@/components/shared/card";

export default function HelpPage() {
  const { site } = getConfig();
  const isJa = site.locale === "ja";

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-4 py-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">
          {isJa ? "ヘルプ" : "Help"}
        </h1>
        <Link
          href="/"
          className="text-sm text-accent hover:underline"
        >
          {isJa ? "← サーバー一覧に戻る" : "← Back to servers"}
        </Link>
      </header>

      {/* What is Gamewatch */}
      <Card title={isJa ? "Gamewatch とは" : "What is Gamewatch"}>
        <div className="flex flex-col gap-3 text-sm leading-relaxed">
          <p>
            {isJa
              ? "Gamewatch は、ゲームサーバーの稼働状況をリアルタイムで確認できるオープンソースのダッシュボードです。"
              : "Gamewatch is an open-source dashboard for monitoring game servers in real-time."}
          </p>
          <p>
            {isJa
              ? "複数のゲームサーバーを1つの画面で管理でき、プレイヤー一覧・ワールドマップ・MOD情報などを表示します。"
              : "Monitor multiple game servers from a single dashboard — player lists, world maps, mod info, and more."}
          </p>
        </div>
      </Card>

      {/* Features */}
      <Card title={isJa ? "主な機能" : "Features"}>
        <div className="flex flex-col gap-2 text-sm">
          <Feature
            icon="🖥️"
            text={isJa
              ? "サーバーステータス — オンライン状態、プレイヤー数、バージョン情報をリアルタイム表示"
              : "Server Status — Online state, player count, version in real-time"}
          />
          <Feature
            icon="👥"
            text={isJa
              ? "参加者一覧 — オンライン/オフラインプレイヤーの一覧とステータス（キル数・レベル・プレイ時間など）"
              : "Player List — Online/offline players with stats (kills, level, playtime)"}
          />
          <Feature
            icon="🗺️"
            text={isJa
              ? "ワールドマップ — ゲーム内マップにプレイヤーの位置をリアルタイム表示（15秒更新）"
              : "World Map — Live player positions on the game map (updates every 15s)"}
          />
          <Feature
            icon="📍"
            text={isJa
              ? "Blip 表示（FiveM） — 警察・病院・ショップなどの施設マーカーをマップ上に表示"
              : "Blips (FiveM) — Police, hospital, shop markers on the map"}
          />
          <Feature
            icon="🏆"
            text={isJa
              ? "ランキング — ゾンビキル数やプレイ時間のリーダーボード"
              : "Rankings — Leaderboards for zombie kills, playtime, etc."}
          />
          <Feature
            icon="🔧"
            text={isJa
              ? "MOD / リソース一覧 — インストール済みの MOD やリソースの一覧表示"
              : "Mod/Resource List — View installed mods and resources"}
          />
          <Feature
            icon="⚙️"
            text={isJa
              ? "サーバー設定 — 難易度・ルート量・ブラッドムーン周期などのゲーム設定を表示"
              : "Server Settings — Difficulty, loot abundance, blood moon frequency, etc."}
          />
          <Feature
            icon="🔄"
            text={isJa
              ? `自動リフレッシュ — ${site.refreshInterval}秒ごとに自動更新（設定変更可能）`
              : `Auto-refresh — Updates every ${site.refreshInterval}s (configurable)`}
          />
        </div>
      </Card>

      {/* Supported Games */}
      <Card title={isJa ? "対応ゲーム" : "Supported Games"}>
        <div className="flex flex-col gap-2 text-sm">
          <GameRow
            name="7 Days to Die"
            status={isJa ? "対応済み" : "Supported"}
            supported
            detail={isJa
              ? "Allocs Web API 経由。ステータス・プレイヤー・マップ・ランキング・MOD・イベント"
              : "Via Allocs Web API. Status, players, map, rankings, mods, events"}
          />
          <GameRow
            name="FiveM"
            status={isJa ? "対応済み" : "Supported"}
            supported
            detail={isJa
              ? "標準 HTTP API + gamewatch_api リソース。ステータス・プレイヤー・GTA V マップ・Blip・リソース一覧"
              : "Standard HTTP API + gamewatch_api resource. Status, players, GTA V map, blips, resources"}
          />
          <GameRow
            name="Minecraft"
            status={isJa ? "準備中" : "Coming Soon"}
            detail={isJa ? "RCON / Query プロトコル対応予定" : "RCON / Query protocol planned"}
          />
          <GameRow
            name="Palworld"
            status={isJa ? "準備中" : "Coming Soon"}
            detail={isJa ? "REST API 対応予定" : "REST API planned"}
          />
          <GameRow
            name="Rust"
            status={isJa ? "準備中" : "Coming Soon"}
            detail={isJa ? "RCON / WebSocket 対応予定" : "RCON / WebSocket planned"}
          />
          <GameRow
            name="ARK: Survival Ascended"
            status={isJa ? "準備中" : "Coming Soon"}
            detail={isJa ? "RCON 対応予定" : "RCON planned"}
          />
        </div>
      </Card>

      {/* Quick Start */}
      <Card title={isJa ? "セットアップ方法" : "Quick Start"}>
        <div className="flex flex-col gap-4 text-sm leading-relaxed">
          <Step
            n={1}
            title={isJa ? "リポジトリをクローン" : "Clone the repository"}
            code="git clone https://github.com/toshi-developer/gamewatch.git && cd gamewatch"
          />
          <Step
            n={2}
            title={isJa ? "設定ファイルを作成" : "Create config file"}
            code="cp gamewatch.example.yaml gamewatch.yaml"
          />
          <Step
            n={3}
            title={isJa ? "gamewatch.yaml を編集して、サーバー情報を設定" : "Edit gamewatch.yaml with your server info"}
            code={`# gamewatch.yaml
site:
  name: "My Game Servers"
  locale: "ja"

servers:
  - id: "sdtd"
    game: "sdtd"
    label: "7 Days to Die"
    apiUrl: "http://localhost:8081"

  - id: "fivem"
    game: "fivem"
    label: "FiveM Server"
    apiUrl: "http://localhost:30120"`}
          />
          <Step
            n={4}
            title={isJa ? "Docker Compose で起動" : "Start with Docker Compose"}
            code="docker compose up -d"
          />
          <p className="text-muted">
            {isJa
              ? "→ ブラウザで http://localhost:3000 にアクセスすると、ダッシュボードが表示されます。"
              : "→ Open http://localhost:3000 in your browser to see the dashboard."}
          </p>
        </div>
      </Card>

      {/* Adding a Server */}
      <Card title={isJa ? "サーバーの追加方法" : "Adding a Server"}>
        <div className="flex flex-col gap-3 text-sm leading-relaxed">
          <p>
            {isJa
              ? "gamewatch.yaml の servers セクションにエントリを追加するだけで、新しいサーバーを追加できます。"
              : "Add an entry to the servers section in gamewatch.yaml to add a new server."}
          </p>
          <CodeBlock code={`servers:
  # 既存のサーバー
  - id: "sdtd"
    game: "sdtd"
    label: "7DTD Server"
    apiUrl: "http://localhost:8081"

  # ↓ 新しいサーバーを追加
  - id: "fivem-2"
    game: "fivem"
    label: "FiveM Server #2"
    apiUrl: "http://192.168.1.100:30120"`} />
          <p className="text-muted">
            {isJa
              ? "設定変更後、Docker コンテナを再起動してください: docker compose restart"
              : "After editing, restart the Docker container: docker compose restart"}
          </p>
        </div>
      </Card>

      {/* Game-specific setup */}
      <Card title={isJa ? "ゲーム別セットアップ" : "Game-Specific Setup"}>
        <div className="flex flex-col gap-5 text-sm leading-relaxed">
          {/* 7DTD */}
          <div>
            <h3 className="mb-2 font-semibold text-accent">7 Days to Die</h3>
            <p className="mb-2">
              {isJa
                ? "Allocs Server Fixes MOD が必要です。公開アクセスには serveradmin.xml に webmodules を追加してください。"
                : "Requires Allocs Server Fixes mod. Add webmodules to serveradmin.xml for public access."}
            </p>
            <CodeBlock code={`<!-- serveradmin.xml -->
<webmodules>
  <module name="webapi.getserverinfo" permission_level="2000" />
  <module name="webapi.getplayersonline" permission_level="2000" />
  <module name="webapi.getplayerlist" permission_level="2000" />
  <module name="webapi.getstats" permission_level="2000" />
  <module name="webapi.getplayerslocation" permission_level="2000" />
  <module name="web.map" permission_level="2000" />
</webmodules>`} />
          </div>

          {/* FiveM */}
          <div>
            <h3 className="mb-2 font-semibold text-accent">FiveM</h3>
            <p className="mb-2">
              {isJa
                ? "基本的なステータス・プレイヤー一覧は標準 API で動作します。マップ上のプレイヤー位置と Blip を表示するには、同梱の Lua リソースをインストールしてください。"
                : "Basic status and player list work with standard APIs. For player positions and blips on the map, install the included Lua resource."}
            </p>
            <CodeBlock code={`# リソースをコピー
cp -r resources/fivem/gamewatch_api /path/to/resources/[standalone]/

# server.cfg に追加（[standalone] を ensure している場合は不要）
ensure gamewatch_api`} />
          </div>
        </div>
      </Card>

      {/* Config Reference */}
      <Card title={isJa ? "設定リファレンス" : "Config Reference"}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-card-border text-left text-xs text-muted">
                <th className="pb-2 pr-4">{isJa ? "キー" : "Key"}</th>
                <th className="pb-2 pr-4">{isJa ? "説明" : "Description"}</th>
                <th className="pb-2">{isJa ? "デフォルト" : "Default"}</th>
              </tr>
            </thead>
            <tbody className="text-xs">
              <ConfigRow k="site.name" desc={isJa ? "サイト名" : "Site name"} def="Gamewatch" />
              <ConfigRow k="site.locale" desc={isJa ? "言語" : "Language"} def="ja" />
              <ConfigRow k="site.refreshInterval" desc={isJa ? "自動更新間隔（秒）" : "Auto-refresh (sec)"} def="30" />
              <ConfigRow k="servers[].id" desc={isJa ? "サーバーID（URL用）" : "Server ID (for URL)"} def="—" />
              <ConfigRow k="servers[].game" desc={isJa ? "ゲーム種別" : "Game type"} def="—" />
              <ConfigRow k="servers[].label" desc={isJa ? "表示名" : "Display name"} def="—" />
              <ConfigRow k="servers[].apiUrl" desc={isJa ? "API エンドポイント" : "API endpoint"} def="—" />
              <ConfigRow k="servers[].auth.tokenName" desc={isJa ? "API トークン名（7DTD）" : "Token name (7DTD)"} def="—" />
              <ConfigRow k="servers[].resourceName" desc={isJa ? "リソース名（FiveM）" : "Resource name (FiveM)"} def="gamewatch_api" />
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          {isJa
            ? "環境変数でオーバーライド可能: GAMEWATCH_SITE_NAME, GAMEWATCH_SERVERS_0_API_URL など"
            : "Override via env vars: GAMEWATCH_SITE_NAME, GAMEWATCH_SERVERS_0_API_URL, etc."}
        </p>
      </Card>

      {/* Links */}
      <Card title={isJa ? "リンク" : "Links"}>
        <div className="flex flex-col gap-2 text-sm">
          <ExtLink href="https://github.com/toshi-developer/gamewatch" label="GitHub Repository" />
          <ExtLink href="https://github.com/toshi-developer/gamewatch/issues" label={isJa ? "Issue / フィードバック" : "Issues / Feedback"} />
          <ExtLink href="https://github.com/toshi-developer/gamewatch/blob/main/docs/configuration.md" label={isJa ? "設定ドキュメント（詳細）" : "Configuration Docs (detailed)"} />
          <ExtLink href="https://github.com/toshi-developer/gamewatch/blob/main/docs/providers.md" label={isJa ? "Provider 開発ガイド" : "Provider Development Guide"} />
        </div>
      </Card>
    </div>
  );
}

function Feature({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex gap-2">
      <span>{icon}</span>
      <span>{text}</span>
    </div>
  );
}

function GameRow({
  name,
  status,
  supported,
  detail,
}: {
  name: string;
  status: string;
  supported?: boolean;
  detail: string;
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-card-border/50 pb-2 last:border-0 last:pb-0">
      <div className="flex items-center gap-2">
        <span
          className={`inline-block h-2 w-2 rounded-full ${
            supported ? "bg-green" : "bg-muted"
          }`}
        />
        <span className="font-medium">{name}</span>
        <span className={`text-xs ${supported ? "text-green" : "text-muted"}`}>
          {status}
        </span>
      </div>
      <span className="ml-4 text-xs text-muted">{detail}</span>
    </div>
  );
}

function Step({
  n,
  title,
  code,
}: {
  n: number;
  title: string;
  code: string;
}) {
  return (
    <div>
      <p className="mb-1 font-medium">
        <span className="mr-2 inline-flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs text-accent">
          {n}
        </span>
        {title}
      </p>
      <CodeBlock code={code} />
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg bg-background p-3 text-xs leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function ConfigRow({
  k,
  desc,
  def,
}: {
  k: string;
  desc: string;
  def: string;
}) {
  return (
    <tr className="border-b border-card-border/30 last:border-0">
      <td className="py-1.5 pr-4 font-mono text-accent">{k}</td>
      <td className="py-1.5 pr-4">{desc}</td>
      <td className="py-1.5 text-muted">{def}</td>
    </tr>
  );
}

function ExtLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="text-accent hover:underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      {label} →
    </a>
  );
}
