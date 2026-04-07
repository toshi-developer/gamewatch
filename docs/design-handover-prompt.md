# Gamewatch ダッシュボードデザイン — Stich 引き渡しプロンプト

## プロジェクト概要

**Gamewatch** はゲームサーバーの稼働状況をリアルタイムで確認できるオープンソースのダッシュボード（Next.js 16 + Tailwind CSS v4）です。

- **リポジトリ**: https://github.com/toshi-developer/gamewatch
- **本番URL**: http://162.43.7.73:3001
  - `/servers/sdtd` — 7 Days to Die ダッシュボード
  - `/servers/fivem` — FiveM ダッシュボード
- **対象ユーザー**: 配信の視聴者・サーバー参加者（スト鯖ページ）

## 依頼内容

各ゲームの世界観に合わせた、**視聴者向けのとがったダッシュボードデザイン**を作ってください。現在の実装はエンジニアが暫定で組んだもので、デザインの作り込みが不十分です。

### ゴール

- 各ゲームの世界観・雰囲気に没入できるビジュアル
- 視聴者が一目で「このゲームのサーバーだ」と分かるデザイン
- 情報の視認性を維持しつつ、エンタメ性のあるレイアウト
- モバイル対応（配信視聴者はスマホからアクセスすることが多い）

## 対象ゲームと世界観

### 7 Days to Die (`/servers/sdtd`)

**ジャンル**: ゾンビサバイバル / ポストアポカリプス

**世界観キーワード**: 荒廃、廃墟、ゾンビ、サバイバル、7日周期のブラッドムーン（ゾンビ大量発生）、昼は探索・夜は篭城、クラフト、拠点防衛

**デザインの方向性案**:
- ダーク・グリッティ（汚れた質感、ざらつき）
- ダークレッド / ミリタリーグリーン / アンバー系
- 血痕・ひび割れ・錆びたテクスチャ
- ブラッドムーンカウントダウンは最も目立つ要素（恐怖感・緊張感）
- 夜間はさらにダークに、昼間は若干明るく
- フォントはミリタリー・ステンシル系

**表示コンテンツ**（優先度順）:
1. サーバーステータス（LIVE/OFFLINE、プレイヤー数、Day数、ゲーム内時間）
2. ブラッドムーンカウントダウン（プログレスバー付き、残り1日で赤点滅）
3. 昼夜インジケーター（24hタイムライン、昼夜の色分け）
4. キルサマリー（合計ゾンビキル、デス、K/D、Kills/h、Top Killer）
5. お知らせバナー
6. SNS/Discordリンク
7. 履歴グラフ（プレイヤー数推移）
8. サーバー設定（難易度、ルート量、ブラッドムーン周期等）
9. ワールドマップ（Leaflet、プレイヤー位置表示）
10. ランキング（ゾンビキル、プレイ時間）
11. 参加者一覧（オンライン/オフライン）
12. MOD一覧（カテゴリ別）

### FiveM (`/servers/fivem`)

**ジャンル**: GTA V ロールプレイ / ストリート

**世界観キーワード**: ロサンゼルス、ストリート、ネオン、夜の街、車、警察、犯罪、ロールプレイ、GTA

**デザインの方向性案**:
- ネオン・サイバー（光る線、グロー効果）
- パープル / シアン / ホットピンク / ダークネイビー
- GTA V のロード画面やマップ画面のような雰囲気
- カードにネオンボーダー、グラスモーフィズム
- フォントはモダン・クリーン系（Geist でOK）

**表示コンテンツ**（優先度順）:
1. サーバーステータス（LIVE/OFFLINE、プレイヤー数、フレームワーク名）
2. お知らせバナー
3. SNS/Discordリンク
4. サーバー設定（フレームワーク、最大人数、インベントリ、電話、ボイス）
5. 履歴グラフ（プレイヤー数推移）
6. ワールドマップ（GTA V衛星マップ + プレイヤー位置 + Blip）
7. Blip凡例（Police, Hospital, Shop 等のカテゴリ別カラー）
8. プレイヤー一覧
9. リソース一覧（インストール済みリソースをタグ表示）

## 技術スタック・制約

- **Next.js 16** App Router + React 19 + TypeScript
- **Tailwind CSS v4**（`@theme inline` でカスタムプロパティ定義、`tailwind.config.ts` は使わない）
- **Leaflet**（マップ）— `"use client"` + `next/dynamic` で SSR 無効化済み
- **フォント**: Geist Sans / Geist Mono（Google Fonts）
- サーバーコンポーネントがデフォルト。`"use client"` はフック・ブラウザAPI使用時のみ
- 画像は `next/image` を使用

## 現在のファイル構成

### テーマ・スタイル

```
app/globals.css                   ← Tailwind テーマ定義 + ゲーム別CSS変数（.theme-sdtd / .theme-fivem）
```

### ゲーム別ダッシュボード（メインの編集対象）

```
components/game-specific/sdtd/
  sdtd-dashboard.tsx              ← 7DTD ダッシュボード全体のレイアウト・コンポジション
  blood-moon-bar.tsx              ← ブラッドムーンカウントダウン（プログレスバー）
  day-night-indicator.tsx         ← 昼夜タイムライン
  sdtd-extras.tsx                 ← キルサマリーバー（Zombie Kills, Deaths, K/D, Kills/h, Top Killer）

components/game-specific/fivem/
  fivem-dashboard.tsx             ← FiveM ダッシュボード全体のレイアウト・コンポジション
  blip-legend.tsx                 ← Blipカテゴリ凡例
```

### 共有コンポーネント（ゲーム横断で使用）

```
components/shared/
  card.tsx                        ← 汎用カードコンポーネント
  stat-block.tsx                  ← 統計値表示（ラベル + 大きな数字）
  auto-refresh.tsx                ← 自動更新カウントダウン（"use client"）
  announcement.tsx                ← お知らせバナー
  social-links.tsx                ← SNS/Discordリンクボタン
  server-settings.tsx             ← サーバー設定（キー・値グリッド）
  player-table.tsx                ← プレイヤー一覧テーブル
  ranking.tsx                     ← ランキング（Top 5）
  mod-list.tsx                    ← MOD/リソース一覧
  history-chart.tsx               ← 履歴グラフ（SVG、"use client"）
  game-map/
    map-wrapper.tsx               ← Leaflet動的インポートラッパー（"use client"）
    map-view.tsx                  ← Leaflet本体（"use client"）
  footer.tsx                      ← フッター
  generic-dashboard.tsx           ← 汎用ダッシュボード（未対応ゲーム用フォールバック）
```

### ページルーティング

```
app/servers/[serverId]/page.tsx   ← サーバーページ（ゲーム種別で sdtd-dashboard / fivem-dashboard に委譲）
app/page.tsx                      ← ホーム（サーバー一覧）
```

## 現在のデザインテーマ（CSS変数）

```css
/* 7DTD */
.theme-sdtd {
  --background: #0a0806;    /* ダークブラウン */
  --foreground: #d4c8b8;    /* くすんだベージュ */
  --card: #1a1410;
  --card-border: #3d2e1e;
  --accent: #c0392b;        /* ダークレッド */
  --green: #4a7c3f;         /* ミリタリーグリーン */
  --red: #c0392b;
  --muted: #7a6b5d;
}

/* FiveM */
.theme-fivem {
  --background: #080812;    /* ディープネイビー */
  --foreground: #e0e6f0;
  --card: #0f0f20;
  --card-border: #1a1a3e;
  --accent: #a855f7;        /* ネオンパープル */
  --green: #00ffaa;          /* ネオングリーン */
  --red: #ff3366;            /* ホットピンク */
  --muted: #6366a0;
}
```

## 注意事項

- **共有コンポーネント**（`components/shared/`）は CSS 変数を通じてテーマに従うので、ゲーム別ダッシュボードからの CSS 変数の上書きでスタイルが切り替わる
- **Leaflet マップ**のスタイルは `map-view.tsx` 内の `<style>` タグで定義（tooltip のスタイル等）
- **SVG チャート**（`history-chart.tsx`）は外部ライブラリなし。色はハードコードされているので、テーマに合わせて変更可能
- `sdtd-dashboard.tsx` と `fivem-dashboard.tsx` がそれぞれの全体レイアウト。ここを編集すればページ全体のデザインを変えられる
- 新しい画像・アイコンを追加する場合は `public/` ディレクトリに配置
- ダッシュボードは `min-h-screen` で全画面。レイアウトの Footer は別途表示される
