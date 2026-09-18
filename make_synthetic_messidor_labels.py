"""Create clearly marked synthetic labels for pipeline smoke tests only."""

from __future__ import annotations

import argparse
import random
from pathlib import Path

import pandas as pd


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--pairs", type=Path, default=Path("data/Messidor2/labels.csv"))
    parser.add_argument(
        "--output",
        type=Path,
        default=Path("data/Messidor2/labels_synthetic.csv"),
    )
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()

    pairs = pd.read_csv(args.pairs, sep=None, engine="python")
    image_names = sorted({name for column in pairs.columns for name in pairs[column].dropna()})
    rng = random.Random(args.seed)
    rows = []
    for image_name in image_names:
        grade = rng.choices([0, 1, 2, 3, 4], weights=[45, 20, 18, 10, 7])[0]
        rows.append(
            {
                "image_name": image_name,
                "adjudicated_dr_grade": grade,
                "adjudicated_gradable": 1,
            }
        )

    pd.DataFrame(rows).to_csv(args.output, index=False)
    print(f"Wrote {len(rows)} SYNTHETIC labels to {args.output}")
    print("WARNING: These labels are fabricated and must not be reported as Messidor-2 ground truth.")


if __name__ == "__main__":
    main()