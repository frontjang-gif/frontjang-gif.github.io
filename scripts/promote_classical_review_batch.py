#!/usr/bin/env python3
"""Promote a review batch of Tistory Classical drafts without marking it confirmed."""

import argparse
import json
import re
from pathlib import Path

import yaml


ID_PATTERN = re.compile(r"^\d{4}-\d{2}-\d{2}-(\d+)-")
FRONT_MATTER_PATTERN = re.compile(r"\A---\n(.*?)\n---\n", re.DOTALL)


def post_id(path: Path) -> str | None:
    match = ID_PATTERN.match(path.name)
    return match.group(1) if match else None


def original_source(body: str, url: str) -> str:
    heading = "## Sources\n"
    if heading not in body:
        body = body.rstrip() + "\n\n" + heading
    if url not in body:
        body = body.rstrip() + f"\n\n- [Original Tistory post]({url})\n"
    return body


def draft_metadata(front_matter: str) -> dict:
    try:
        return yaml.safe_load(front_matter) or {}
    except yaml.YAMLError:
        title = re.search(r"^title:\s*(.*)$", front_matter, re.MULTILINE)
        date = re.search(r"^date:\s*(.*)$", front_matter, re.MULTILINE)
        return {
            "title": title.group(1).strip().strip("\\\"") if title else "Untitled review draft",
            "date": date.group(1).strip() if date else "",
            "artist": [],
            "cover": "",
        }


def promote(source: Path, destination: Path, record: dict) -> None:
    content = source.read_text(encoding="utf-8")
    match = FRONT_MATTER_PATTERN.match(content)
    if not match:
        raise ValueError(f"Missing front matter: {source}")

    metadata = draft_metadata(match.group(1))
    metadata["date"] = str(metadata.get("date", ""))[:10]
    metadata["confirmed"] = False
    metadata["frontmatterVersion"] = 2
    metadata.setdefault("folder", "")
    metadata["review"] = True
    body = original_source(content[match.end():], record["url"])
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        "---\n" + yaml.safe_dump(metadata, allow_unicode=True, sort_keys=False).strip() + "\n---\n" + body,
        encoding="utf-8",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--manifest", type=Path, required=True)
    parser.add_argument("--drafts", type=Path, required=True)
    parser.add_argument("--destination", type=Path, required=True)
    parser.add_argument("--limit", type=int, default=100)
    args = parser.parse_args()

    manifest = json.loads(args.manifest.read_text(encoding="utf-8"))
    records = {record["id"]: record for record in manifest["posts"]}
    candidates = []
    for source in sorted(args.drafts.glob("*.md")):
        identifier = post_id(source)
        record = records.get(identifier)
        if record and record["status"] != "imported":
            candidates.append((source, record))

    for source, record in candidates[:args.limit]:
        promote(source, args.destination / source.name, record)

    print(f"Promoted {min(args.limit, len(candidates))} review drafts to {args.destination}")


if __name__ == "__main__":
    main()
