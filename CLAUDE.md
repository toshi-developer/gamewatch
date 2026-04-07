# game-server-dashboard — CLAUDE.md

専用サーバ上のゲームサーバー向け **運用ダッシュボード**。稼働状況の可視化に加え、再起動・バックアップ・MOD／リソース一覧など **操作をブラウザからまとめる** ことを目的とする。

## 案件概要

- **案件名**: game-server-dashboard（自社プロダクト／実験。確定したら更新）
- **クライアント**: —
- **ココナラ案件ID**: —
- **ステータス**: 開発中（読み取り専用ダッシュボード MVP）
- **受注日**: —
- **納品予定日**: —

## 要件（ドラフト）

- **表示**: サーバー／コンテナの状態、プレイヤー数・バージョン等（データソースはゲーム・エージェント次第）
- **操作**: 安全な範囲での再起動、スナップショット／バックアップ起動、メンテナンス通知の下書き 等（具体コマンドはエージェント経由を推奨）
- **一覧**: MOD・リソース・設定ファイルのインベントリ（読み取り中心から開始しやすい）
- **認証**: 管理者のみ（セッション、OAuth、またはリバースプロキシ側 IAP 等は要決定）

## 技術スタック（想定）

- **UI**: **Next.js 16**（App Router）+ **TypeScript** + **Tailwind CSS v4**（ワークスペースの Web 規約に合わせる）
- **API**: Route Handlers / Server Actions。実サーバー操作は **ローカルエージェント**（Go 等）または **SSH＋限定コマンド** で挟み、ダッシュボードから直接 SSH しない構成を推奨
- **デプロイ**: **Cloud Run**（`output: "standalone"`）またはオンプレ／VPS 上の同一ネットワーク内。メトリクス連携が必要なら既存の **`projects/mod/game-monitor-agent`**（InfluxDB / Grafana）と役割分担する

## 既存リポジトリとの関係

| プロジェクト | 役割 |
|--------------|------|
| `game-monitor-agent` | メトリクス収集・InfluxDB 投入（監視） |
| `private-servers/*` | 個人用サーバ設定・スクリプト |
| **本リポジトリ** | 運用 UI・操作オーケストレーション（ダッシュボード） |

## ディレクトリ構成

```
game-server-dashboard/
├── CLAUDE.md
├── app/
│   ├── layout.tsx         # ルートレイアウト（メタデータ・フォント）
│   ├── page.tsx           # ダッシュボードトップ（SSR + revalidate 10s）
│   └── globals.css        # Tailwind v4 テーマ（ダーク基調）
├── components/
│   ├── card.tsx           # 汎用カードコンポーネント
│   ├── stat-block.tsx     # 統計値表示ブロック
│   ├── server-status.tsx  # サーバー情報・ゲーム日数・ブラッドムーン
│   ├── player-list.tsx    # 参加者一覧テーブル
│   ├── game-events.tsx    # イベント状況（ブラッドムーン・夜間・エアドロップ等）
│   └── mod-list.tsx       # MOD 一覧（カテゴリ別）
├── lib/
│   ├── sdtd-api.ts        # Allocs Web API クライアント（型定義 + fetch）
│   ├── get-dashboard-data.ts  # データ取得の統合レイヤー（API → fallback mock）
│   └── mock-data.ts       # 開発用モックデータ
├── data/
│   └── mods.json          # MOD 一覧（private-servers/7dtd/mods.json から抽出）
└── docs/                  # 画面ワイヤー・API 契約・脅威モデル
```

## メモ

- マルチテナント SaaS にするか、**自前サーバ1台用**に絞るかで設計が大きく変わる。最初は **単一サイト・少数サーバ** が現実的
- ゲーム種別（7DTD / FiveM / Palworld 等）は **プロバイダプラグイン** 想定でインターフェースだけ先に決めると拡張しやすい
