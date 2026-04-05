"""PDFからクラブデータを構造化JSONとして抽出する"""
import json, re, os
import pdfplumber

PDF_PATH = r"C:\Users\c6341\iCloudDrive\バディスポーツ\2026\クラブ活動一覧_20260403.pdf"
OUTPUT = "docs/audit/pdf_data.json"

def extract():
    pages_data = []
    with pdfplumber.open(PDF_PATH) as pdf:
        for i, page in enumerate(pdf.pages):
            text = page.extract_text() or ""
            tables = [t for t in (page.extract_tables() or []) if t]
            pages_data.append({
                "page": i + 1,
                "text": text,
                "tables": tables
            })
    full_text = "\n".join(p["text"] for p in pages_data)
    return {"source": "PDF", "raw_text": full_text, "pages": pages_data}

if __name__ == "__main__":
    os.makedirs("docs/audit", exist_ok=True)
    data = extract()
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"PDF抽出完了 → {OUTPUT}")
    print(f"総ページ数: {len(data['pages'])}")
    print("--- 全文 ---")
    print(data['raw_text'])
