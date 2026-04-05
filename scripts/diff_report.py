"""PDF raw_text と HTML clubs を突き合わせ差分レポートを生成する"""
import json, re
from pathlib import Path

PDF_JSON = "docs/audit/pdf_data.json"
HTML_JSON = "docs/audit/html_data.json"
REPORT = "docs/audit/diff_report.md"

def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)

def search_pdf(pdf_text, keyword):
    """キーワードがPDFテキストに存在するか（前後の文脈も返す）"""
    idx = pdf_text.find(keyword)
    if idx == -1:
        return None
    return pdf_text[max(0, idx-30):idx+80].replace("\n", " ")

def extract_pdf_fees(pdf_text, club_name_hint):
    """PDFテキストからクラブ名付近の金額行を抽出"""
    lines = pdf_text.split("\n")
    result = []
    in_section = False
    for line in lines:
        if club_name_hint[:6] in line:
            in_section = True
        if in_section:
            if re.search(r'[¥￥]\s*\d', line) or re.search(r'\d{4,}', line):
                result.append(line.strip())
            if len(result) > 15:
                break
    return result

def main():
    pdf = load(PDF_JSON)
    html = load(HTML_JSON)
    pdf_text = pdf.get("raw_text", "")
    clubs = html["clubs"]

    lines = [
        "# PDF ↔ HTML 整合性差分レポート",
        "",
        f"PDFページ数: {len(pdf['pages'])}  /  HTMLクラブ数: {len(clubs)}",
        "",
        "---",
        ""
    ]

    issues = []

    for club in clubs:
        name = club["name"]
        # 絵文字除去してPDF検索
        clean_name = re.sub(r'[^\w\s\u3040-\u9fff\u30a0-\u30ff]', '', name).strip()
        search_key = clean_name[:8] if clean_name else ""
        context = search_pdf(pdf_text, search_key) if search_key else None

        lines.append(f"\n## {name}")
        lines.append(f"- セクション: `{club['section']}`")
        lines.append(f"- data-ages: `{club['data_ages']}`")
        lines.append(f"- PDF検索(`{search_key}`): {'✅ ' + context if context else '❌ 見つからない'}")

        lines.append(f"- スケジュール:")
        for row in club['schedule']:
            lines.append(f"  - {' | '.join(row)}")

        lines.append(f"- 月会費行:")
        for fr in club['fee_rows']:
            label = fr['label']
            value = fr['value']
            lines.append(f"  - `{label}` → `{value}`")

            # 金額チェック: HTMLの金額がPDFに存在するか
            amounts = re.findall(r'\d{1,3}(?:,\d{3})+|\d{4,}', value.replace(',', ''))
            for amt_str in re.findall(r'\d{4,}', value.replace(',', '').replace('¥', '').replace('￥', '')):
                formatted = f"{int(amt_str):,}"
                if formatted not in pdf_text and amt_str not in pdf_text:
                    issues.append(f"❌ [{name}] fee `{label}` の金額 ¥{formatted} がPDFに見当たらない")

        if club['notes']:
            lines.append(f"- 注記: {' / '.join(club['notes'])}")

    lines.append("\n\n---\n\n# 要確認事項まとめ\n")
    if issues:
        for issue in issues:
            lines.append(f"- {issue}")
    else:
        lines.append("- 金額の不一致は検出されませんでした（目視確認を推奨）")

    report = "\n".join(lines)
    Path(REPORT).write_text(report, encoding="utf-8")
    print(f"差分レポート → {REPORT}")
    print(f"\n要確認事項: {len(issues)}件")
    for i in issues:
        print(" ", i)

if __name__ == "__main__":
    main()
