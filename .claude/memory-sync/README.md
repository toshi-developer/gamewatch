# Claude Code メモリ同期ディレクトリ

このディレクトリは Claude Code の auto memory を git 管理で複数PCに同期するためのもの。

## 別PC環境構築時の手順

```bash
TARGET=/home/vscode/.claude/projects/-workspaces-workspace-projects-web-lp-game-server-dashboard
mkdir -p "$TARGET"
rm -rf "$TARGET/memory"
ln -s /workspaces/workspace/projects/web-lp/game-server-dashboard/.claude/memory-sync "$TARGET/memory"
```

## 注意

- 機密情報（APIキー・パスワード・個人情報）は記載しない
