# -*- coding: utf-8 -*-
from pathlib import Path
import json

ROOT = Path(__file__).resolve().parents[1] / "Design Packages"

THEME_ALIASES = [
    ("גיבורי על ג", "junior-superheroes"),
    ("גיבורי על", "superheroes"),
    ("הרפתקאות", "adventures"),
    ("ים וספנות", "sea-ships"),
    ("ים וספינות", "sea-ships"),
    ("כלי תחבורה", "transport"),
    ("ספארי פסטל", "pastel-safari"),
    ("ספארי", "safari"),
    ("דינוזאורים", "dinosaurs"),
    ("חלל", "space"),
    ("טבע וחקר", "nature-explore"),
    ("גיימרים", "gamers"),
    ("חופים וצדפים", "beaches-shells"),
    ("יער נורדי", "nordic-forest"),
    ("עננים וחלומות", "clouds-dreams"),
]

COLOR_ALIASES = [
    ("natural", "warm-natural"),
    ("green", "fresh-greens"),
    ("blue", "calming-blues"),
    ("colorful", "happy-colorful"),
    ("happy", "happy-colorful"),
    ("gray", "elegant-grays"),
    ("grey", "elegant-grays"),
    ("pink", "soft-pinks"),
    ("טבעי", "warm-natural"),
    ("ירוק", "fresh-greens"),
    ("כחול", "calming-blues"),
]

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp", ".gif"}


def detect_theme(text: str) -> str | None:
    for needle, theme_id in THEME_ALIASES:
        if needle in text:
            return theme_id
    return None


def detect_age(text: str) -> str | None:
    for age in ("0-2", "3-5", "6-10"):
        if age in text:
            return age
    return None


def detect_color(text: str) -> str | None:
    lower = text.lower()
    for needle, scale_id in COLOR_ALIASES:
        if needle in lower or needle in text:
            return scale_id
    return None


def classify(name: str) -> str:
    n = name.lower()
    if "לטיזר" in name or "teaser" in n:
        return "teaser"
    if "leading" in n or "01leading" in n.replace(" ", ""):
        return "hero"
    if "02cu" in n.replace(" ", "") or n.startswith("02cu"):
        return "closeup"
    if name.startswith("ChatGPT") or name.startswith("Gemini"):
        return "room"
    skip = (
        "armchair", "blanket", "kallax", "layout", "bin.png", "ikea",
        "social_", ".mp4",
    )
    if any(s in n for s in skip):
        return "skip"
    return "other"


rows = []
for path in ROOT.rglob("*"):
    if not path.is_file() or path.suffix.lower() not in IMAGE_EXT:
        continue
    rel = path.relative_to(ROOT)
    parts = list(rel.parts)
    gender = parts[0] if parts[0] in {"boys", "unisex", "girls"} else None
    gender_id = {"boys": "boy", "unisex": "unisex", "girls": "girl"}.get(gender or "")
    joined = " / ".join(parts)
    theme = detect_theme(joined)
    age = detect_age(joined)
    color = detect_color(joined)
    role = classify(path.name)
    rows.append({
        "gender": gender_id,
        "age": age,
        "theme": theme,
        "color": color,
        "role": role,
        "name": path.name,
        "rel": str(rel).replace("\\", "/"),
    })

print(f"files={len(rows)}")
print("\nBy key:")
from collections import Counter
keys = Counter(
    (r["gender"], r["age"], r["theme"], r["color"], r["role"])
    for r in rows
    if r["role"] != "skip"
)
for key, n in sorted(keys.items(), key=lambda x: (str(x[0][0]), str(x[0][1]), str(x[0][2]), str(x[0][3]), str(x[0][4]))):
    print(f"  {n:3}  {key}")

out = Path(__file__).resolve().parents[1] / "scripts" / "design-packages-inventory.json"
out.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"wrote {out}")
