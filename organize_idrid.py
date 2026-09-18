"""Organize a downloaded IDRiD Task A dataset.

Examples:
    venv/bin/python organize_idrid.py ~/Downloads/IDRiD
    venv/bin/python organize_idrid.py ~/Downloads/IDRiD --destination data/IDRiD --move

The default behavior copies files and leaves the downloaded dataset untouched.
"""

from __future__ import annotations

import argparse
import shutil
from pathlib import Path


IMAGE_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp"}
MASK_TYPES = ("MA", "HE", "EX", "SE")


def classify_mask(path: Path) -> str | None:
    """Return the lesion type for an IDRiD mask filename."""
    stem = path.stem.upper()
    for lesion_type in MASK_TYPES:
        if f"_{lesion_type}" in stem or stem.endswith(lesion_type):
            return lesion_type
    return None


def is_image_file(path: Path) -> bool:
    return path.suffix.lower() in IMAGE_EXTENSIONS


def split_for(path: Path, source_root: Path) -> str:
    parts = {part.lower() for part in path.relative_to(source_root).parts}
    if any("test" in part for part in parts):
        return "test"
    return "train"


def destination_for(path: Path, source_root: Path, destination_root: Path) -> Path | None:
    """Determine the target path for one dataset file."""
    relative_parts = {part.lower() for part in path.relative_to(source_root).parts}
    mask_type = classify_mask(path)

    if mask_type is not None or "mask" in relative_parts or "masks" in relative_parts:
        if mask_type is None:
            return None
        split = split_for(path, source_root)
        return destination_root / "masks" / split / mask_type / path.name

    if is_image_file(path):
        split = split_for(path, source_root)
        return destination_root / "images" / split / path.name

    return None


def organize(source: Path, destination: Path, move: bool) -> tuple[int, int]:
    copied = 0
    skipped = 0

    files = sorted(path for path in source.rglob("*") if path.is_file())
    for path in files:
        target = destination_for(path, source, destination)
        if target is None:
            skipped += 1
            continue

        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists():
            if target.stat().st_size == path.stat().st_size:
                print(f"SKIP exists: {target}")
                skipped += 1
                continue
            raise FileExistsError(f"Different file already exists: {target}")

        if move:
            shutil.move(str(path), str(target))
        else:
            shutil.copy2(path, target)
        print(f"{'MOVE' if move else 'COPY'} {path} -> {target}")
        copied += 1

    return copied, skipped


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source", type=Path, help="Downloaded IDRiD folder")
    parser.add_argument(
        "--destination",
        type=Path,
        default=Path("data/IDRiD"),
        help="Target dataset folder (default: data/IDRiD)",
    )
    parser.add_argument(
        "--move",
        action="store_true",
        help="Move files instead of copying them",
    )
    args = parser.parse_args()

    source = args.source.expanduser().resolve()
    destination = args.destination.expanduser().resolve()

    if not source.is_dir():
        parser.error(f"Source folder does not exist: {source}")
    if source == destination:
        parser.error(
            "Source and destination must be different. "
            "Use the A. Segmentation folder as source and data/IDRiD as destination."
        )

    copied, skipped = organize(source, destination, args.move)
    print(f"\nDone: {copied} files organized, {skipped} files skipped.")
    print(f"Dataset location: {destination}")


if __name__ == "__main__":
    main()
