import { getConfig } from "./config";

const strings: Record<string, Record<string, string>> = {
  ja: {
    "server.online": "オンライン",
    "server.offline": "オフライン",
    "server.players": "プレイヤー",
    "server.status": "サーバーステータス",
    "server.settings": "サーバー設定",
    "players.title": "参加者一覧",
    "players.online": "{n}人オンライン",
    "players.registered": "{n}人登録",
    "players.none": "現在プレイヤーはいません",
    "players.name": "名前",
    "players.status": "状態",
    "players.level": "レベル",
    "players.ping": "Ping",
    "players.playtime": "プレイ時間",
    "players.lastSeen": "最終ログイン",
    "map.title": "ワールドマップ",
    "map.loading": "マップを読み込み中...",
    "mods.title": "MOD 一覧",
    "mods.resources": "リソース一覧",
    "mods.count": "{n}件",
    "mods.none": "MOD 情報がありません",
    "ranking.zombieKills": "ゾンビキル ランキング",
    "ranking.playtime": "プレイ時間 ランキング",
    "events.title": "イベント",
    "refresh.countdown": "{n}秒後に更新",
    "home.title": "サーバー一覧",
    "common.on": "ON",
    "common.off": "OFF",
    "common.player": "プレイヤー",
    "common.justNow": "たった今",
    "common.minutesAgo": "{n}分前",
    "common.hoursAgo": "{n}時間前",
    "common.daysAgo": "{n}日前",
  },
  en: {
    "server.online": "Online",
    "server.offline": "Offline",
    "server.players": "Players",
    "server.status": "Server Status",
    "server.settings": "Server Settings",
    "players.title": "Player List",
    "players.online": "{n} online",
    "players.registered": "{n} registered",
    "players.none": "No players currently",
    "players.name": "Name",
    "players.status": "Status",
    "players.level": "Level",
    "players.ping": "Ping",
    "players.playtime": "Playtime",
    "players.lastSeen": "Last Seen",
    "map.title": "World Map",
    "map.loading": "Loading map...",
    "mods.title": "Mod List",
    "mods.resources": "Resources",
    "mods.count": "{n} items",
    "mods.none": "No mod information available",
    "ranking.zombieKills": "Zombie Kill Ranking",
    "ranking.playtime": "Playtime Ranking",
    "events.title": "Events",
    "refresh.countdown": "Refreshing in {n}s",
    "home.title": "Servers",
    "common.on": "ON",
    "common.off": "OFF",
    "common.player": "Player",
    "common.justNow": "Just now",
    "common.minutesAgo": "{n}m ago",
    "common.hoursAgo": "{n}h ago",
    "common.daysAgo": "{n}d ago",
  },
};

export function t(
  key: string,
  params?: Record<string, string | number>,
): string {
  const locale = getConfig().site.locale;
  let str = strings[locale]?.[key] ?? strings.en[key] ?? key;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      str = str.replace(`{${k}}`, String(v));
    }
  }
  return str;
}
