# CLAUDE.md — buddy-sports

バディスポーツクラブ有明 活動ガイド（https://kannohi1.github.io/buddy-sports/）

---

## プロジェクト概要

- **形式**: 単一HTMLファイル（index.html）— ビルドステップなし、フレームワークなし
- **言語**: 日本語
- **公開**: GitHub Pages（main ブランチから自動デプロイ）
- **リポジトリ**: https://github.com/KANNOHI1/buddy-sports

## テスト

```bash
node tests/buddy_sports_guide.test.cjs
```

## Claude と Codex の役割分担

| 役割 | 担当 |
|---|---|
| 設計・調査・計画・判断 | Claude |
| コードの実装・ファイル書き込み・修正 | Codex のみ |

Claudeはコードを直接書かない。実装はすべてCodexに委任する。

## セッション開始時

1. TODOS.md でバグ・タスク状況を確認
2. index.html を確認（単一ファイルにすべて含まれている）
3. テストを実行して現在の状態を確認
