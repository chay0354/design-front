import json
import re
import zipfile
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path

URL_RE = re.compile(r"^https?://")

THEMES = [
    {
        "id": "animals",
        "name": "חיות",
        "linkCol": 1,
        "backupCol": 2,
        "notesCol": 3,
        "description": "חבילת עיצוב בנושא חיות — אלמנטים, ריהוט משלים וטקסטיל.",
        "colorPalette": ["#4a7c59", "#8fbc8f", "#f4e4c1", "#d4a574", "#e8f5e9"],
        "price": 495,
    },
    {
        "id": "adventures",
        "name": "הרפתקאות",
        "linkCol": 4,
        "backupCol": 5,
        "notesCol": 6,
        "description": "חבילת עיצוב הרפתקאות — פריטים מותאמים לחדר פעיל ומלא דמיון.",
        "colorPalette": ["#c17f59", "#e8a87c", "#f4e4c1", "#8b7355", "#f5f1ed"],
        "price": 520,
    },
    {
        "id": "sea-ships",
        "name": "ים וספינות",
        "linkCol": 7,
        "backupCol": 8,
        "notesCol": 9,
        "description": "חבילת עיצוב ים וספינות — גוונים מרגיעים ופריטים ימיים.",
        "colorPalette": ["#0077be", "#4fb3d9", "#a8d8ea", "#f9f7f3", "#ffb347"],
        "price": 530,
    },
    {
        "id": "transport",
        "name": "כלי תחבורה",
        "linkCol": 10,
        "backupCol": 11,
        "notesCol": 12,
        "description": "חבילת עיצוב כלי תחבורה — מכוניות, מטוסים ומסלולי דמיון.",
        "colorPalette": ["#455a64", "#78909c", "#ffca28", "#eceff1", "#37474f"],
        "price": 510,
    },
]


def col_to_idx(col: str) -> int:
    idx = 0
    for ch in col:
        idx = idx * 26 + (ord(ch.upper()) - ord("A") + 1)
    return idx - 1


def read_rows(xlsx: Path) -> list[list[str]]:
    with zipfile.ZipFile(xlsx) as z:
        shared: list[str] = []
        root = ET.fromstring(z.read("xl/sharedStrings.xml"))
        ns = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
        for si in root.findall("m:si", ns):
            texts = [t.text or "" for t in si.findall(".//m:t", ns)]
            shared.append("".join(texts))

        sheet = ET.fromstring(z.read("xl/worksheets/sheet1.xml"))
        rows: list[list[str]] = []
        for row in sheet.findall("m:sheetData/m:row", ns):
            cells: dict[int, str] = {}
            for c in row.findall("m:c", ns):
                ref = c.get("r", "")
                col = "".join(ch for ch in ref if ch.isalpha())
                col_idx = col_to_idx(col)
                cell_type = c.get("t")
                v = c.find("m:v", ns)
                if v is None:
                    continue
                val = v.text or ""
                if cell_type == "s":
                    val = shared[int(val)]
                cells[col_idx] = val.strip()
            if cells:
                max_col = max(cells)
                rows.append([cells.get(i, "") for i in range(max_col + 1)])
        return rows


def main() -> None:
    root = Path(__file__).resolve().parents[1]
    xlsx = root / "docs" / "petite dreams.xlsx"
    rows = read_rows(xlsx)

    packages = []
    for theme in THEMES:
        categories: dict[str, list[dict]] = defaultdict(list)
        current_category = "כללי"
        current_room = "כללי"

        for row in rows:
            label = row[0] if row else ""
            if label.startswith("חדרי"):
                current_room = label
                current_category = label
                continue
            if label in {"נושאים", "פריטים לרכישה:", "מה שאפור משתנה תלוי נושא"}:
                continue

            has_any_link = any(
                URL_RE.match(row[t["linkCol"]] if len(row) > t["linkCol"] else "")
                for t in THEMES
            )
            if label and not has_any_link:
                if label not in {"לינק גיבוי", "הערות לפריט", ""}:
                    current_category = label
                continue

            link = row[theme["linkCol"]] if len(row) > theme["linkCol"] else ""
            backup = row[theme["backupCol"]] if len(row) > theme["backupCol"] else ""
            notes = row[theme["notesCol"]] if len(row) > theme["notesCol"] else ""
            purchase = link if URL_RE.match(link) else (backup if URL_RE.match(backup) else "")
            if not purchase:
                continue

            item_name = label if label and not URL_RE.match(label) else "פריט לרכישה"
            categories[current_category].append(
                {
                    "name": item_name,
                    "link": purchase,
                    "backupLink": backup if URL_RE.match(backup) and backup != purchase else "",
                    "notes": notes,
                    "room": current_room,
                    "image": "/assets/packages/item-decor.svg",
                }
            )

        shopping_categories = [
            {"category": category, "items": items}
            for category, items in categories.items()
            if items
        ]

        packages.append(
            {
                "id": theme["id"],
                "name": f"חבילת {theme['name']}",
                "theme": theme["name"],
                "questionnaireTheme": theme["name"],
                "price": theme["price"],
                "gender": "unisex",
                "ageRange": [0, 12],
                "colorPalette": theme["colorPalette"],
                "description": theme["description"],
                "previewImage": theme["id"],
                "includes": list(categories.keys())[:5] or ["אלמנטים עיצוביים"],
                "heroImage": "",
                "galleryImages": [],
                "shoppingCategories": shopping_categories,
            }
        )

    out = root / "src" / "data" / "themePackages.json"
    out.write_text(json.dumps(packages, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Wrote {out} ({len(packages)} packages)")


if __name__ == "__main__":
    main()
