"""Fetch product thumbnail URLs (og:image) for shopping list items."""

from __future__ import annotations

import json
import re
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGES_PATH = ROOT / "src" / "data" / "themePackages.json"
PLACEHOLDER = "/assets/packages/item-decor.svg"
USER_AGENT = "Mozilla/5.0 (compatible; PetiteDreams/1.0)"
OG_IMAGE_RE = re.compile(
    r'<meta[^>]+property=["\']og:image["\'][^>]+content=["\']([^"\']+)["\']',
    re.IGNORECASE,
)
OG_IMAGE_RE_ALT = re.compile(
    r'<meta[^>]+content=["\']([^"\']+)["\'][^>]+property=["\']og:image["\']',
    re.IGNORECASE,
)


def fetch_og_image(url: str) -> str | None:
    req = urllib.request.Request(
        url,
        headers={
            "User-Agent": USER_AGENT,
            "Accept": "text/html,application/xhtml+xml",
            "Accept-Language": "he-IL,he;q=0.9,en;q=0.8",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as response:
            html = response.read().decode("utf-8", "ignore")
    except (urllib.error.URLError, TimeoutError, ValueError):
        return None

    for pattern in (OG_IMAGE_RE, OG_IMAGE_RE_ALT):
        match = pattern.search(html)
        if match:
            image = match.group(1).strip()
            if image.startswith("//"):
                image = f"https:{image}"
            return image
    return None


def main() -> None:
    packages = json.loads(PACKAGES_PATH.read_text(encoding="utf-8"))
    cache: dict[str, str] = {}
    updated = 0
    failed = 0

    for pkg in packages:
        for category in pkg.get("shoppingCategories", []):
            for item in category.get("items", []):
                link = item.get("link", "").strip()
                if not link:
                    continue

                if link in cache:
                    item["image"] = cache[link]
                    continue

                current = item.get("image", PLACEHOLDER)
                if current and current != PLACEHOLDER and current.startswith("http"):
                    cache[link] = current
                    continue

                print(f"Fetching: {link[:70]}...")
                image = fetch_og_image(link)
                if image:
                    item["image"] = image
                    cache[link] = image
                    updated += 1
                    print(f"  -> {image[:80]}...")
                else:
                    item["image"] = PLACEHOLDER
                    cache[link] = PLACEHOLDER
                    failed += 1
                    print("  -> not found, using placeholder")

                time.sleep(0.4)

    PACKAGES_PATH.write_text(
        json.dumps(packages, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"Done. Updated {updated} images, {failed} failed.")


if __name__ == "__main__":
    main()
