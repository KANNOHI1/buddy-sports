"""index.html からクラブデータを構造化JSONとして抽出する"""
import json, os
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
            name_el = card.select_one(".ch h3")
            name = name_el.get_text(strip=True) if name_el else ""

            schedule_rows = []
            for tr in card.select(".sc tr"):
                tds = [td.get_text(strip=True) for td in tr.select("td")]
                if tds:
                    schedule_rows.append(tds)

            fee_rows = []
            for fr in card.select(".fr"):
                fn = fr.select_one(".fn")
                fv = fr.select_one(".fv")
                fee_rows.append({
                    "label": fn.get_text(strip=True) if fn else "",
                    "value": fv.get_text(strip=True) if fv else ""
                })

            notes = [n.get_text(strip=True) for n in card.select(".note")]
            bus_badges = [b.get_text(strip=True) for b in card.select(".bus")]

            clubs.append({
                "section": section_id,
                "name": name,
                "data_ages": card.get("data-ages", ""),
                "bus_badges": bus_badges,
                "schedule": schedule_rows,
                "fee_rows": fee_rows,
                "notes": notes
            })

    return {"source": "HTML", "clubs": clubs}

if __name__ == "__main__":
    os.makedirs("docs/audit", exist_ok=True)
    data = extract()
    with open(OUTPUT, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(f"HTML抽出完了 → {OUTPUT}")
    print(f"総クラブ数: {len(data['clubs'])}")
    for c in data["clubs"]:
        fee_labels = [fr["label"] for fr in c["fee_rows"]]
        print(f"  [{c['section']}] {c['name']}")
        print(f"    schedule: {[r[0] for r in c['schedule']]}")
        print(f"    fees: {fee_labels}")
