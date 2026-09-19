# -*- coding: utf-8 -*-
"""Copy Design Packages images into public/assets and write a catalog manifest."""
from __future__ import annotations

import hashlib
import json
import re
import shutil
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "Design Packages"
DEST = ROOT / "public" / "assets" / "design-packages"
MANIFEST = ROOT / "src" / "data" / "designPackageImages.json"

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

IMAGE_EXT = {".png", ".jpg", ".jpeg", ".webp"}
SKIP_DIR = ("מוצרים לשימוש פנימי", "שימוש פנימי")
SKIP_NAME = ("armchair", "blanket", "kallax", "layout", "bin.png", "ikea", "social_")


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
    n = name.lower().replace(" ", "")
    if "טיזר" in name or "teaser" in n:
        return "teaser"
    if "leading" in n or n.startswith("01leading"):
        return "hero"
    if "02cu" in n:
        return "closeup"
    if name.startswith("ChatGPT") or name.startswith("Gemini"):
        return "room"
    return "other"


def should_skip(path: Path) -> bool:
    parts = path.parts
    if any(part in SKIP_DIR for part in parts):
        return True
    name = path.name.lower()
    return any(token in name for token in SKIP_NAME)


def file_hash(path: Path) -> str:
    digest = hashlib.sha1()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 256), b""):
            digest.update(chunk)
    return digest.hexdigest()[:10]


if DEST.exists():
    shutil.rmtree(DEST)
DEST.mkdir(parents=True)

seen_hashes: dict[str, str] = {}
entries: dict[str, dict[str, list[str] | str]] = defaultdict(lambda: {"teaser": "", "hero": "", "gallery": []})

source_files = [
    path
    for path in SRC.rglob("*")
    if path.is_file() and path.suffix.lower() in IMAGE_EXT and not should_skip(path)
]
source_files.sort(key=lambda path: (0 if "טיזר" in path.name or "teaser" in path.name.lower() else 1, str(path)))

for path in source_files:
    rel = path.relative_to(SRC)
    joined = " / ".join(rel.parts)
    gender_folder = rel.parts[0]
    gender = {"boys": "boy", "unisex": "unisex", "girls": "girl"}.get(gender_folder)
    theme = detect_theme(joined)
    age = detect_age(joined)
    color = detect_color(joined) or "shared"
    role = classify(path.name)
    if not gender or not theme or not age:
        continue

    digest = file_hash(path)
    key = f"{gender}:{age}:{theme}:{color}"
    bucket = entries[key]

    if digest in seen_hashes:
        public = seen_hashes[digest]
        if role == "teaser" and not bucket["teaser"]:
            bucket["teaser"] = public
        continue

    safe_ext = path.suffix.lower()
    dest_name = f"{role}-{digest}{safe_ext}"
    dest_dir = DEST / gender / age / theme / color
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest_path = dest_dir / dest_name
    shutil.copy2(path, dest_path)
    public = f"/assets/design-packages/{gender}/{age}/{theme}/{color}/{dest_name}"
    seen_hashes[digest] = public

    bucket = entries[key]
    if role == "teaser" and not bucket["teaser"]:
        bucket["teaser"] = public
    elif role == "hero" and not bucket["hero"]:
        bucket["hero"] = public
    else:
        gallery = bucket["gallery"]
        assert isinstance(gallery, list)
        gallery.append(public)

# Prefer a room/other image as hero when missing.
for bucket in entries.values():
    gallery = bucket["gallery"]
    assert isinstance(gallery, list)
    if not bucket["hero"]:
        bucket["hero"] = bucket["teaser"] or (gallery[0] if gallery else "")
    if isinstance(gallery, list) and len(gallery) > 8:
        bucket["gallery"] = gallery[:8]

MANIFEST.parent.mkdir(parents=True, exist_ok=True)
MANIFEST.write_text(json.dumps(entries, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"copied {len(seen_hashes)} unique images")
print(f"keys {len(entries)}")
print(f"manifest {MANIFEST}")
