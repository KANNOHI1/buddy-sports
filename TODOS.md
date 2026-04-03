# TODOS — buddy-sports

## 未修正バグ

- [ ] Bug 3: ドッジボール（hasBus=true + 週1択）でジュニアフィルタ時に fee-chip が何も出ない（バス選択が非表示、週チップも非表示のため）
## 解決済み（確認済み）

- [x] Bug 1: バスバッジがジュニア年齢フィルタ時も表示される → syncBusBadgeWithAge で age !== 'all' && age !== 'elementary' → display:none
- [x] Bug 2: バスなし（bus-n）カードにバスあり/なし選択ボタンが表示される → hasBus がfee行ラベルの A/B 有無で判定（bus-n カードは false）
- [x] Bug 4: フィルタが全幅に広がる → .control-group { flex: 0 0 auto } 設定済み
- [x] Bug 5: ジュニアフィルタ時にセミジュニアも表示される → inferRowAgesFromText でジュニア判定前にセミジュニア語を除去（2026-04-04）
- [x] 初期状態: カテゴリ=すべて・年齢=ジュニア・合計欄は空 に変更（2026-04-04）

## 完了済み

- [x] PDFとの照合・小学生Aコース月会費修正（2026-04-03）
- [x] info-boxes アコーディオン化（2026-04-03）
- [x] バス詳細情報追加（2026-04-03）
- [x] プロジェクト独立化（Workshop から buddy-sports/ へ移行）（2026-04-03）
