# PDF ↔ HTML 整合性徹底チェック 実装計画

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PDF（クラブ活動一覧_20260403.pdf）と index.html の全データ（クラブ名・対象年齢・スケジュール・月会費・注記）を機械的に照合し、すべての差分を修正する。

**Architecture:** ①Python スクリプトで PDF・HTML 双方からデータを構造化抽出 → ②差分レポートを生成 → ③Claude が修正リストを確定 → ④Codex が index.html を修正 → ⑤second-opinion（Codex diff review）で修正内容を検証 → ⑥テスト＋ブラウザ確認。

**Tech Stack:** Python 3.11（pdfplumber / BeautifulSoup4）、Node.js（既存テスト）、Codex CLI（修正実装・レビュー）

---

## 使用 Skills マッピング

| フェーズ | Skill |
|---|---|
| PDF・HTML データ抽出 | `mcp__python-interpreter` |
| 差分レポート生成 | `mcp__python-interpreter` |
| 修正実装 | `codex`（implementor agent） |
| diff レビュー | `second-opinion`（Codex diff review） |
| 完了前検証 | `verification-before-completion` |

---

## ファイル構成

| ファイル | 役割 |
|---|---|
| `scripts/extract_pdf.py` | PDF から全クラブデータを JSON 出力 |
| `scripts/extract_html.py` | index.html から全クラブデータを JSON 出力 |
| `scripts/diff_report.py` | 2つの JSON を比較しレポートを出力 |
| `docs/audit/pdf_data.json` | PDF 抽出結果 |
| `docs/audit/html_data.json` | HTML 抽出結果 |
| `docs/audit/diff_report.md` | 差分レポート（Claude が確認・確定） |
| `index.html` | 修正対象（Codex が編集） |
| `tests/buddy_sports_guide.test.cjs` | 既存テスト（必要に応じて追加） |

---

## Chunk 1: データ抽出スクリプトの実装と実行

### Task 1: PDF 抽出スクリプト

**Files:**
- Create: `scripts/extract_pdf.py`

- [ ] **Step 1: pdfplumber で PDF を開き、テキストをページごとに抽出する**

```python
# scripts/extract_pdf.py
"""PDFからクラブデータを構造化JSONとして抽出する"""
import json, re, sys
try:
    import pdfplumber
except ImportError:
    import subprocess, sys as _sys
    subprocess.check_call([_sys.executable, '-m', 'pip', 'install', 'pdfplumber'])
    import pdfplumber

PDF_PATH = r"C:\Users\c6341\iCloudDrive\バディスポーツ\2026\クラブ活動一覧_20260403.pdf"
OUTPUT = "docs/audit/pdf_data.json"

def extract():
    clubs = []
    with pdfplumber.open(PDF_PATH) as pdf:
        full_text = "\n".join(page.extract_text() or "" for page in pdf.pages)
    # テキストをそのままJSONに保存（後続の diff スクリプトで比較）
    result = {
        "source": "PDF",
        "raw_text": full_text,
        "pages": []
    }
    with pdfplumber.open(PDF_PATH) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            tables = [t for t in (page.extract_tables() or []) if t]
            result["pages"].append({
                "page": i + 1,
                "text": text,
                "tables": tables
            })
    return result

if __name__ == "__main__":
    import os
    os.makedirs("docs/audit", exist_ok=True)
    data = extract()
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"PDF抽出完了 → {OUTPUT}")
    print(f"総ページ数: {len(data['pages'])}")
    print("--- 全文（先頭2000文字）---")
    print(data['raw_text'][:2000])
```

- [ ] **Step 2: `mcp__python-interpreter` で実行**

```
mcp__python-interpreter__run_python_file を使って scripts/extract_pdf.py を実行
```

期待出力: `PDF抽出完了 → docs/audit/pdf_data.json` + ページ数表示 + 全文先頭2000文字

---

### Task 2: HTML 抽出スクリプト

**Files:**
- Create: `scripts/extract_html.py`

- [ ] **Step 1: BeautifulSoup4 で index.html をパースし、全カードの構造化データを抽出**

```python
# scripts/extract_html.py
"""index.html からクラブデータを構造化JSONとして抽出する"""
import json, re, sys
try:
    from bs4 import BeautifulSoup
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, '-m', 'pip', 'install', 'beautifulsoup4'])
    from bs4 import BeautifulSoup

HTML_PATH = "index.html"
OUTPUT = "docs/audit/html_data.json"

def extract():
    with open(HTML_PATH, encoding="utf-8") as f:
        soup = BeautifulSoup(f.read(), "html.parser")

    clubs = []
    for section in soup.select(".section"):
        section_id = section.get("id", "unknown")
        for card in section.select(".card"):
            name = card.select_one(".ch h3")
            name_text = name.get_text(strip=True) if name else ""
            data_ages = card.get("data-ages", "")

            # スケジュール行
            schedule_rows = []
            for tr in card.select(".sc tr"):
                tds = [td.get_text(strip=True) for td in tr.select("td")]
                if tds:
                    schedule_rows.append(tds)

            # 月会費行
            fee_rows = []
            for fr in card.select(".fr"):
                fn = fr.select_one(".fn")
                fv = fr.select_one(".fv")
                fee_rows.append({
                    "label": fn.get_text(strip=True) if fn else "",
                    "value": fv.get_text(strip=True) if fv else ""
                })

            # 注記
            notes = [n.get_text(strip=True) for n in card.select(".note")]

            # バスバッジ
            bus_badges = [b.get_text(strip=True) for b in card.select(".bus")]

            clubs.append({
                "section": section_id,
                "name": name_text,
                "data_ages": data_ages,
                "bus_badges": bus_badges,
                "schedule": schedule_rows,
                "fee_rows": fee_rows,
                "notes": notes
            })

    return {"source": "HTML", "clubs": clubs}

if __name__ == "__main__":
    import os
    os.makedirs("docs/audit", exist_ok=True)
    data = extract()
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"HTML抽出完了 → {OUTPUT}")
    print(f"総クラブ数: {len(data['clubs'])}")
    for c in data["clubs"]:
        print(f"  [{c['section']}] {c['name']} / 年齢: {c['data_ages']} / fee行: {len(c['fee_rows'])}")
```

- [ ] **Step 2: `mcp__python-interpreter` で実行**

期待出力: 全クラブ名・セクション・fee行数の一覧

---

### Task 3: 差分レポートスクリプト

**Files:**
- Create: `scripts/diff_report.py`

- [ ] **Step 1: PDF テキストと HTML クラブ名を突き合わせ、差分を Markdown で出力**

```python
# scripts/diff_report.py
"""PDF raw_text と HTML clubs を突き合わせ差分レポートを生成する"""
import json, re
from pathlib import Path

PDF_JSON = "docs/audit/pdf_data.json"
HTML_JSON = "docs/audit/html_data.json"
REPORT = "docs/audit/diff_report.md"

def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def find_in_pdf(pdf_text, club_name):
    """クラブ名がPDFテキストに存在するか検索"""
    # 絵文字・記号を除去して比較
    clean_name = re.sub(r'[^\w\s\u3040-\u9fff]', '', club_name).strip()
    return clean_name[:10] in pdf_text if clean_name else False

def main():
    pdf = load(PDF_JSON)
    html = load(HTML_JSON)
    pdf_text = pdf.get("raw_text", "")
    clubs = html["clubs"]

    lines = ["# PDF ↔ HTML 整合性差分レポート\n"]
    lines.append(f"PDFページ数: {len(pdf['pages'])}  /  HTMLクラブ数: {len(clubs)}\n")
    lines.append("---\n")

    for club in clubs:
        name = club["name"]
        found_in_pdf = find_in_pdf(pdf_text, name)
        lines.append(f"\n## {name}")
        lines.append(f"- セクション: `{club['section']}`")
        lines.append(f"- data-ages: `{club['data_ages']}`")
        lines.append(f"- PDF検索: {'✅ 存在' if found_in_pdf else '❌ 見つからない（要確認）'}")
        lines.append(f"- スケジュール行数: {len(club['schedule'])}")
        for row in club['schedule']:
            lines.append(f"  - {' | '.join(row)}")
        lines.append(f"- 月会費行:")
        for fr in club['fee_rows']:
            lines.append(f"  - `{fr['label']}` → `{fr['value']}`")
        if club['notes']:
            lines.append(f"- 注記: {' / '.join(club['notes'])}")

    report = "\n".join(lines)
    Path(REPORT).write_text(report, encoding="utf-8")
    print(f"差分レポート → {REPORT}")
    print(report[:3000])

if __name__ == "__main__":
    main()
```

- [ ] **Step 2: `mcp__python-interpreter` で実行**

期待出力: `docs/audit/diff_report.md` に全クラブの PDF 照合結果

- [ ] **Step 3: diff_report.md を Read して内容確認**

---

## Chunk 2: 差分レポートの人間レビューと修正リスト確定

### Task 4: Claude による差分レポートレビュー

- [ ] **Step 1: diff_report.md を読み込み、PDFとの差異を確認する**

照合観点:
- クラブ名が PDF に存在するか
- スケジュール行の学年（ジュニア/ミドル/シニア/小学生）に漏れがないか
- 月会費の数値（金額・週回数・A/Bコース）が PDF と一致するか
- 注記（運営費・教材費など）の金額が一致するか

- [ ] **Step 2: 修正リストを `docs/audit/fix_list.md` に出力する**

フォーマット:
```markdown
## 修正リスト

| # | クラブ名 | 修正種別 | 現在のHTML | PDFの正しい値 | 行番号目安 |
|---|---|---|---|---|---|
| 1 | サッカー | fee ラベル | 幼児 週1回Aコース | 幼児 週1回 | 591 |
...
```

---

## Chunk 3: Codex による index.html 修正実装

### Task 5: Codex に修正を委任

**Skill: `codex`（implementor agent）**

- [ ] **Step 1: fix_list.md の内容を Codex に渡して実装を依頼する**

Codex へのプロンプトテンプレート:
```
以下の修正リストに基づいて index.html を修正してください。

修正ルール:
- 月会費ラベル（.fn）・値（.fv）の文字列のみ修正
- スケジュールテーブル（.sc）の <td> テキストのみ修正
- JavaScript コードは変更しない
- 1修正 = 1コミット（git add index.html && git commit -m "fix: ..."）

修正リスト:
[fix_list.md の内容をそのまま貼り付ける]
```

- [ ] **Step 2: Codex の実装完了を確認し、`git log --oneline -10` でコミット履歴を確認**

---

## Chunk 4: second-opinion（Codex diff review）

### Task 6: Codex によるコードレビュー

**Skill: `second-opinion`（Codex invocation）**

- [ ] **Step 1: git diff を取得する**

```bash
git diff HEAD~N..HEAD  # N = Codex が作ったコミット数
```

- [ ] **Step 2: `second-opinion` プロンプトで Codex に diff を送る**

```bash
prompt_file="$(mktemp)"
output_file="$(mktemp)"
stderr_log="$(mktemp)"

cat > "$prompt_file" <<'EOF'
You are acting as a reviewer for a proposed code change made by another engineer.
Focus on issues that impact correctness, performance, security, maintainability, or developer experience.
Flag only actionable issues introduced by the pull request.
When you flag an issue, provide a short, direct explanation and cite the affected file and line range.
Prioritize severe issues and avoid nit-level comments unless they block understanding of the diff.
After listing findings, produce an overall correctness verdict ("patch is correct" or "patch is incorrect") with a concise justification and a confidence score between 0 and 1.
Ensure that file citations and line numbers are exactly correct using the tools available; if they are incorrect your comments will be rejected.

Focus: HTMLデータ修正の正確性 — PDFの月会費金額・ラベル・スケジュール学年が正しく反映されているか

Diff to review:
---
[git diff の内容]
---
EOF

codex exec \
  -c model='"gpt-5.3-codex"' \
  -c model_reasoning_effort='"xhigh"' \
  --sandbox read-only \
  --ephemeral \
  -o "$output_file" \
  - < "$prompt_file" > /dev/null 2>"$stderr_log"

cat "$output_file"
```

- [ ] **Step 3: Codex のレビュー結果を確認し、指摘事項があれば Task 5 に戻る**

判定基準:
- `"patch is correct"` + confidence ≥ 0.85 → 次フェーズへ
- `"patch is incorrect"` または指摘事項あり → Codex に追加修正を依頼

---

## Chunk 5: テスト実行と最終検証

### Task 7: テスト実行

**Skill: `verification-before-completion`**

- [ ] **Step 1: 既存テストを実行**

```bash
node tests/buddy_sports_guide.test.cjs
```

期待出力: `buddy_sports_guide regression tests passed`

- [ ] **Step 2: テストが失敗した場合は `systematic-debugging` スキルでデバッグ**

- [ ] **Step 3: 必要に応じてテストに回帰ケースを追加**

例（追加テンプレート）:
```javascript
// 修正した fee ラベルに「Aコース」が残っていないか確認
function testFeeLabels() {
  const html = getModuleHtml();
  assert.ok(
    !html.includes('幼児 週1回Aコース'),
    '幼児 週1回Aコース は PDFに存在しない（修正済みのはず）'
  );
}
```

- [ ] **Step 4: git add してコミット**

```bash
git add tests/buddy_sports_guide.test.cjs
git commit -m "test: PDF照合回帰テスト追加"
```

---

### Task 8: ブラウザ検証

- [ ] **Step 1: `mcp__playwright` でサイトを開く（ローカル or GitHub Pages）**

確認チェックリスト:
- [ ] カテゴリ=すべて・年齢=ジュニア の初期状態
- [ ] サッカー（週1選択）→ 月会費が表示される
- [ ] フラッグフットボール → 週1・週2チップが表示される
- [ ] スイミング → 週0チップが表示されない
- [ ] ミライキッズ → ジュニアフィルタで表示される
- [ ] 文化部英会話 → ジュニアフィルタで表示される

- [ ] **Step 2: スクリーンショットを保存して確認**

```
mcp__playwright__browser_take_screenshot
```

---

### Task 9: git push

- [ ] **Step 1: 最終確認後 push**

```bash
git push origin main
```

---

## 想定される主要差分項目（前回 PDF 照合で判明済み）

| クラブ | 差分の可能性 |
|---|---|
| サッカー | ✅ 修正済み（幼児週1回Aコース→週1回） |
| フラッグフットボール | ✅ 修正済み（週2追加） |
| ミライキッズ | ✅ 修正済み（ジュニア行追加） |
| ピアノ | スケジュールは「年長以上」のため非表示は正しい動作 |
| スイミング | ✅ 修正済み（週0除外） |
| **残り全クラブ** | **本計画で徹底チェック** |

---

## 検証完了条件

1. `node tests/buddy_sports_guide.test.cjs` → PASS
2. second-opinion（Codex review）→ `"patch is correct"` + confidence ≥ 0.85
3. ブラウザでジュニアフィルタ時に全セクションが正常表示
4. 月会費の数値が PDF と 1件残らず一致

---

**Plan complete and saved to `docs/plans/2026-04-04-pdf-html-consistency-audit.md`. Ready to execute?**
