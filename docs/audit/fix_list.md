# PDF ↔ HTML 差分 修正リスト（確定版）

PDF: クラブ活動一覧_20260403.pdf（2026.4.3改訂）  
HTML: index.html

---

## 修正 1: サッカー — 幼児週3行を削除（PDFに記載なし）

**ファイル**: `index.html` 行 593  
**現状**:
```html
<div class="fr"><span class="fn">幼児 週3回</span><span class="fv">¥16,500</span></div>
```
**修正後**: この行を削除

---

## 修正 2: 器械体操 — 幼児週3削除 + 小学生週3A/B追加

**ファイル**: `index.html` 行 615-617  
**現状**:
```html
<div class="fr"><span class="fn">幼児 週1/2/3</span><span class="fv">¥9,900 / ¥13,200 / ¥16,500</span></div>
<div class="fr"><span class="fn">小学生一般 週1A/B</span><span class="fv">¥13,750 / ¥9,900</span></div>
<div class="fr"><span class="fn">小学生一般 週2A/B</span><span class="fv">¥17,050 / ¥13,200</span></div>
```
**修正後**:
```html
<div class="fr"><span class="fn">幼児 週1/2</span><span class="fv">¥9,900 / ¥13,200</span></div>
<div class="fr"><span class="fn">小学生一般 週1A/B</span><span class="fv">¥13,750 / ¥9,900</span></div>
<div class="fr"><span class="fn">小学生一般 週2A/B</span><span class="fv">¥17,050 / ¥13,200</span></div>
<div class="fr"><span class="fn">小学生一般 週3A/B</span><span class="fv">¥20,350 / ¥16,500</span></div>
```

---

## 修正 3: 柔道 — 小学生週3A/B追加

**ファイル**: `index.html` 行 671-673  
**現状**:
```html
<div class="fr"><span class="fn">幼児 週1/2/3</span><span class="fv">¥9,900 / ¥13,200 / ¥16,500</span></div>
<div class="fr"><span class="fn">小学生 週1A/B</span><span class="fv">¥13,750 / ¥9,900</span></div>
<div class="fr"><span class="fn">小学生 週2A/B</span><span class="fv">¥17,050 / ¥13,200</span></div>
```
**修正後**:
```html
<div class="fr"><span class="fn">幼児 週1/2/3</span><span class="fv">¥9,900 / ¥13,200 / ¥16,500</span></div>
<div class="fr"><span class="fn">小学生 週1A/B</span><span class="fv">¥13,750 / ¥9,900</span></div>
<div class="fr"><span class="fn">小学生 週2A/B</span><span class="fv">¥17,050 / ¥13,200</span></div>
<div class="fr"><span class="fn">小学生 週3A/B</span><span class="fv">¥20,350 / ¥16,500</span></div>
```

---

## 修正 4: ボルダリング — 小学生週1B追加

**ファイル**: `index.html` 行 726  
**現状**:
```html
<div class="fr"><span class="fn">小学生 週1A</span><span class="fv">¥18,910</span></div>
```
**修正後**:
```html
<div class="fr"><span class="fn">小学生 週1A/B</span><span class="fv">¥18,910 / ¥15,060</span></div>
```

---

## 修正 5: フラッグフットボール — 金額全面修正（¥10,450/¥15,400 → 固定¥11,550）

**ファイル**: `index.html` 行 799  
**現状**:
```html
<div class="fr"><span class="fn">幼児・小学生 週1/2</span><span class="fv">¥10,450 / ¥15,400</span></div>
```
**修正後**:
```html
<div class="fr"><span class="fn">幼児・小学生</span><span class="fv">¥11,550</span></div>
```
※ ¥10,450/¥15,400 は隣列 FUNAJUKU の料金。PDFフラッグ列は「幼児・小学生：¥11,550」

---

## 修正 6: 英会話 — BコースのみからA/Bコース両方に修正

**ファイル**: `index.html` 行 941  
**現状**:
```html
<div class="fr"><span class="fn">幼児・小学生 週1/2/3</span><span class="fv">¥11,220 / ¥16,500 / ¥24,420</span></div>
```
**修正後**:
```html
<div class="fr"><span class="fn">幼児・小学生 週1回A/B</span><span class="fv">¥15,070 / ¥11,220</span></div>
<div class="fr"><span class="fn">幼児・小学生 週2回A/B</span><span class="fv">¥20,350 / ¥16,500</span></div>
<div class="fr"><span class="fn">幼児・小学生 週3回A/B</span><span class="fv">¥28,270 / ¥24,420</span></div>
```

---

## 修正 7: ミライキッズ — fee修正 + スケジュール学年修正

**ファイル**: `index.html` 行 950, 954

### 7a. スケジュール行（行950）
**現状**:
```html
<tr><td>ジュニア〜シニア</td><td>火・木 ①15:00-15:40 / ②16:00-16:40</td></tr>
```
**修正後**:
```html
<tr><td>ミドル〜シニア</td><td>火・木 ①15:00-15:40 / ②16:00-16:40</td></tr>
```
※ PDFでジュニア行は「／」（授業なし）

### 7b. 月会費行（行954）
**現状**:
```html
<div class="fr"><span class="fn">幼児・小学生 週1</span><span class="fv">¥9,900</span></div>
```
**修正後**:
```html
<div class="fr"><span class="fn">幼児・小学生 週1回A/B</span><span class="fv">¥13,750 / ¥9,900</span></div>
```

---

## 修正 8: ピアノ — スケジュール学年・曜日修正 + data-ages修正

**ファイル**: `index.html` 行 918, 923

### 8a. data-ages（行918）
**現状**: `data-ages="senior elementary"`  
**修正後**: `data-ages="junior elementary"`

### 8b. スケジュール行（行923）
**現状**:
```html
<tr><td>シニア</td><td>火・水・木・金 各30分</td></tr>
```
**修正後**:
```html
<tr><td>ジュニア</td><td>月・火・水・木 各30分</td></tr>
```
※ PDF: ジュニア行「月・火・水・木⇒各３０分」/ シニア行は空欄

---

## 修正 9: スイミング — 注記の金額・期間を修正

**ファイル**: `index.html` 行 1107  
**現状**:
```html
<p class="note">指定水着：男子¥4,850/女子¥7,590 / 進級帽子¥880 / 11〜2月暖房費¥600/月</p>
```
**修正後**:
```html
<p class="note">指定水着：男子¥4,840/女子¥7,590 / 進級帽子¥880 / 11〜3月暖房費¥660/月</p>
```
※ PDF: 男子¥4,840（¥4,850ではない）/ 11月～3月、¥660（¥600ではない）

---

## 修正 10: ボクシング — カード追加（HTMLに未掲載）

**ファイル**: `index.html` 行 910 の後（`</div></div>` と `<!-- 文化部クラブ -->` の間）

**追加するHTML**:
```html
<div class="card sport-school" data-ages="middle senior elementary">
<div class="ch"><h3>🥊 バディスクール ボクシング</h3><div class="sub">3F バスケットコート</div></div>
<div class="cb">
<span class="bus bus-y">🚌 シャトルバス①お台場 ②豊洲</span>
<table class="sc"><tr><th>学年</th><th>曜日・時間</th></tr>
<tr><td>ミドル〜シニア</td><td>月 15:00-15:50</td></tr>
<tr><td>小学生</td><td>月 17:00-18:00（予定）</td></tr>
</table>
<div class="fee"><h4>月会費</h4>
<div class="fr"><span class="fn">幼児・小学生</span><span class="fv">¥9,900</span></div>
</div></div></div>
```
※ PDFではスケジュール欄の小学生行が空欄のため（予定）と表記

---

## 確認済み・変更不要

| クラブ | 確認結果 |
|---|---|
| サッカー（小学生fee） | ✅ A/B週2/週3 正確 |
| バスケ | ✅ 幼児週3あり・小学生週3まで正確 |
| 陸上 | ✅ 幼児週3あり・小学生週3まで正確 |
| テニス | ✅ 正確 |
| 野球 | ✅ 週1A/Bのみ・正確 |
| ドッジボール | ✅ 正確 |
| 青トレ&ランニング | ✅ 正確 |
| FUNAJUKU | ✅ 週1/2 ¥10,450/¥15,400 正確 |
| 英語フラッグ | ✅ 幼児¥11,550 正確 |
| レスリング | ✅ 正確 |
| 体操アクロバット | ✅ 正確 |
| 剣道 | ✅ 正確 |
| ZERO・ONEダンス | ✅ 正確 |
| 空手道 | ✅ 正確 |
| サッカースクール | ✅ 正確 |
| バスケ3x3 | ✅ 正確 |
| チア | ✅ 正確 |
| バレエ | ✅ 正確 |
| スカッシュ | ✅ 正確 |
| フラダンス | ✅ 正確 |
| エイペックス | ✅ 正確 |
| 卓球 | ✅ 正確 |
| 文化スクール全5種 | ✅ 正確 |
