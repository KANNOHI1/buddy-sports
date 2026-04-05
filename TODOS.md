# TODOS — buddy-sports

## 未修正バグ

（なし）

## 解決済み（確認済み）

- [x] Bug 1: バスバッジがジュニア年齢フィルタ時も表示される → syncBusBadgeWithAge で age !== 'all' && age !== 'elementary' → display:none
- [x] Bug 2: バスなし（bus-n）カードにバスあり/なし選択ボタンが表示される → hasBus がfee行ラベルの A/B 有無で判定（bus-n カードは false）
- [x] Bug 3: ドッジボール（hasBus=true + 週1択）でジュニアフィルタ時に fee-chip が何も出ない → weekOptions.length===1 で自動選択（Fix 2, 2026-04-05）
- [x] Bug 4: フィルタが全幅に広がる → .control-group { flex: 0 0 auto } 設定済み
- [x] Bug 5: ジュニアフィルタ時にセミジュニアも表示される → inferRowAgesFromText でジュニア判定前にセミジュニア語を除去（2026-04-04）
- [x] 初期状態: カテゴリ=すべて・年齢=ジュニア・合計欄は空 に変更（2026-04-04）
- [x] 月会費表示バグ4件修正（8カード対応, 2026-04-05）:
  - Bug A: isExcludedLabel 関数追加（大人・一般を含む子ども向け行が誤除外）→ 器械体操・テニス・エイベックス・フラダンス・卓球
  - Bug B: weekOptions.length===1 自動選択 → ミライキッズ・ドッジボール + 全単一週カード
  - Bug C: refreshFeeSummary の pickWeek 上書き防止 → チアダンス
  - Fix 4: .fr なしカード早期リターン（チアダンス参照テキスト保持）

## 完了済み

- [x] PDFとの照合・小学生Aコース月会費修正（2026-04-03）
- [x] info-boxes アコーディオン化（2026-04-03）
- [x] バス詳細情報追加（2026-04-03）
- [x] プロジェクト独立化（Workshop から buddy-sports/ へ移行）（2026-04-03）
- [x] PDF↔HTML整合性チェック 10件データ修正（2026-04-05）
- [x] エイペックス→エイベックス 名称修正（2026-04-05）
- [x] ボクシング「（予定）」追記（2026-04-05）
