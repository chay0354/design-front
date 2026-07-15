"""Fetch product thumbnail URLs via the design-back API (ScrapingBee on server)."""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PACKAGES_PATH = ROOT / "src" / "data" / "themePackages.json"
PLACEHOLDER = "/assets/packages/item-decor.svg"
API_BASE = os.environ.get("PRODUCT_IMAGE_API_URL", "https://design-back.vercel.app").rstrip("/")


def fetch_product_image(link: str) -> str | None:
    query = urllib.parse.urlencode({"url": link})
    req = urllib.request.Request(
        f"{API_BASE}/api/product-image?{query}",
        headers={"Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=90) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, ValueError, json.JSONDecodeError):
        return None

    image = payload.get("imageUrl")
    return image if isinstance(image, str) and image.startswith("http") else None


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
                image = fetch_product_image(link)
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
