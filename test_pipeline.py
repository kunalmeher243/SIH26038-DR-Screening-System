"""
test_pipeline.py
Quick smoke test for Person A's modules.
Run this BEFORE connecting to the web app.

USAGE:
    python test_pipeline.py --image path/to/any_retinal_image.jpg

Tests IQA and Enhancement without needing a trained model.
Tests Grade and Grad-CAM only if models/calibrated_model.pt exists.
"""

import sys
import asyncio
import argparse
import json
from pathlib import Path
from fastapi import UploadFile
import io


def make_upload(path: str) -> UploadFile:
    with open(path, "rb") as f:
        data = f.read()
    return UploadFile(filename=Path(path).name, file=io.BytesIO(data))


async def run_tests(image_path: str):
    print(f"\n{'='*60}")
    print(f"  Pipeline smoke test — {image_path}")
    print(f"{'='*60}\n")

    # ── Test 1: IQA ──────────────────────────────────────────────────────────
    print("[ TEST 1 ] Image Quality Assessment")
    from services import iqa_service
    result = await iqa_service.assess(make_upload(image_path))
    print(json.dumps(result, indent=2))
    print(f"  → Quality label: {result['quality_label']}  Score: {result['quality_score']}\n")

    # ── Test 2: Enhancement ───────────────────────────────────────────────────
    print("[ TEST 2 ] Enhancement")
    from services import enhance_service
    result = await enhance_service.enhance(make_upload(image_path))
    print(f"  → Techniques: {result['techniques_applied']}")
    print(f"  → Trustworthy: {result['enhancement_trustworthy']}")
    print(f"  → Enhanced image base64 length: {len(result['enhanced_image'])} chars\n")

    # ── Test 3: Grade (only if model exists) ─────────────────────────────────
    from pathlib import Path
    if Path("models/calibrated_model.pt").exists() or Path("models/best_model.pt").exists():
        print("[ TEST 3 ] DR Grading")
        from services import model_service
        result = await model_service.grade(make_upload(image_path))
        print(json.dumps(result, indent=2))
        print(f"  → DR Level: {result['dr_level']}  Refer: {result['refer']}\n")

        # ── Test 4: Grad-CAM ─────────────────────────────────────────────────
        print("[ TEST 4 ] Grad-CAM")
        from services import gradcam_service
        result = await gradcam_service.generate(make_upload(image_path))
        print(f"  → Grad-CAM base64 length: {len(result['gradcam_image'])} chars\n")
        assert result["gradcam_image"].startswith("data:image/png;base64,")
        assert result["gradcam_image_base64"]
    else:
        print("[ TEST 3 ] Grade — SKIPPED (no model checkpoint found)")
        print("           Run train_classifier.py then calibrate.py first.\n")

    print("[ DONE ] Smoke tests passed. Ready to connect to web app.\n")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", required=True, help="Path to a retinal image (JPG or PNG)")
    args = parser.parse_args()

    if not Path(args.image).exists():
        print(f"ERROR: Image not found: {args.image}")
        sys.exit(1)

    asyncio.run(run_tests(args.image))


if __name__ == "__main__":
    main()
