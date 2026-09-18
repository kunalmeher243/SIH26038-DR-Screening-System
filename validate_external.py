"""
validate_external.py
External validation on Messidor-2 dataset.

Tests domain shift: how well does a model trained on APTOS
perform on a different camera + population?

Messidor-2 folder structure expected:
    data/Messidor2/
        images/            ← JPEG files
        labels.csv         ← columns: image_name, adjudicated_gradable,
                                       adjudicated_dr_grade (0-4)
                              OR: image, referrable (0 or 1)

RUN (after training + calibration):
    python validate_external.py

OUTPUTS:
    models/external_validation_report.txt
    models/external_validation_results.csv
"""

import os
import io
import asyncio
import numpy as np
import pandas as pd
import torch
from PIL import Image
from pathlib import Path
from fastapi import UploadFile
from sklearn.metrics import (
    roc_auc_score, confusion_matrix,
    accuracy_score, classification_report
)
from services import model_service

# ── Config ────────────────────────────────────────────────────────────────────

DATA_DIR   = "data/Messidor2"
IMG_DIR    = os.path.join(DATA_DIR, "images")
LABEL_FILE = os.environ.get(
    "MESSIDOR_LABEL_FILE", os.path.join(DATA_DIR, "labels.csv")
)
OUT_DIR    = "models"


# ── Load Messidor-2 Labels ────────────────────────────────────────────────────

def load_messidor_labels() -> pd.DataFrame:
    """
    Messidor-2 label formats vary by source.
    This handles both common formats.
    """
    df = pd.read_csv(LABEL_FILE, sep=None, engine="python")

    # Normalise column names
    rename = {}
    for c in df.columns:
        cl = c.lower()
        if "image" in cl or "file" in cl or "name" in cl:
            rename[c] = "image_name"
        elif "refer" in cl:
            rename[c] = "referrable"
        elif "gradable" in cl:
            rename[c] = "gradable"
        elif "grade" in cl or "dr" in cl:
            rename[c] = "dr_grade"

    df = df.rename(columns=rename)

    # Create binary referrable column if missing
    if "referrable" not in df.columns and "dr_grade" in df.columns:
        df["referrable"] = (df["dr_grade"] >= 2).astype(int)

    if "image_name" not in df.columns:
        raise ValueError(
            "Messidor-2 labels.csv must contain an image column. "
            "The current file appears to be a left/right image-pair list."
        )
    if "referrable" not in df.columns:
        raise ValueError(
            "Messidor-2 labels.csv must contain either 'referrable' or "
            "'dr_grade'/'adjudicated_dr_grade'. The current file has no "
            "ground-truth labels, so sensitivity, specificity, and AUC "
            "cannot be computed."
        )

    # Filter to gradable images only (if column exists)
    if "gradable" in df.columns:
        before = len(df)
        df = df[df["gradable"] == 1].reset_index(drop=True)
        print(f"[INFO] Filtered to gradable: {len(df)}/{before} images")

    print(f"[INFO] Messidor-2: {len(df)} images")
    print(f"[INFO] Referable:  {df['referrable'].sum()} ({df['referrable'].mean():.1%})")
    return df


# ── Inference on Single Image ─────────────────────────────────────────────────

async def predict_single(img_path: str) -> dict:
    """Runs model_service.grade on one image file."""
    with open(img_path, "rb") as f:
        raw = f.read()
    upload = UploadFile(filename=Path(img_path).name, file=io.BytesIO(raw))
    return await model_service.grade(upload)


# ── Main Validation ───────────────────────────────────────────────────────────

async def run_validation():
    print("\n" + "="*65)
    print("  External Validation — Messidor-2")
    print("  NEVER used in training. Tests domain shift only.")
    print("="*65 + "\n")

    df = load_messidor_labels()

    # Validate the label schema before allocating/loading the GPU model.
    model_service.load_model()

    y_true, y_pred_level, y_pred_prob, y_routed = [], [], [], []
    failed = []

    for i, row in df.iterrows():
        img_name = str(row["image_name"])
        if not img_name.lower().endswith((".jpg", ".jpeg", ".png")):
            img_name += ".jpg"

        img_path = os.path.join(IMG_DIR, img_name)
        if not os.path.exists(img_path):
            failed.append(img_name)
            continue

        try:
            result = await predict_single(img_path)
            y_true.append(int(row["referrable"]))
            y_pred_level.append(result["dr_level"])
            y_pred_prob.append(
                sum(result["class_probabilities"][str(k)] for k in [2, 3, 4])
            )
            y_routed.append(result["routing"])

            if (i + 1) % 50 == 0:
                print(f"  Processed {i+1}/{len(df)} images...")

        except Exception as e:
            failed.append(f"{img_name}: {e}")

    if failed:
        print(f"\n[WARNING] {len(failed)} images failed:")
        for f in failed[:5]:
            print(f"  {f}")

    y_true       = np.array(y_true)
    y_pred_level = np.array(y_pred_level)
    y_pred_prob  = np.array(y_pred_prob)
    y_pred_bin   = (y_pred_level >= 2).astype(int)

    # ── Metrics ───────────────────────────────────────────────────────────────
    tn, fp, fn, tp = confusion_matrix(y_true, y_pred_bin, labels=[0,1]).ravel()
    sensitivity    = tp / (tp + fn + 1e-8)
    specificity    = tn / (tn + fp + 1e-8)
    accuracy       = accuracy_score(y_true, y_pred_bin)
    auc            = roc_auc_score(y_true, y_pred_prob)

    # Human review rate
    n_review = sum(1 for r in y_routed if r == "HUMAN_REVIEW")

    print("\n" + "="*65)
    print("  MESSIDOR-2 EXTERNAL VALIDATION RESULTS")
    print("="*65)
    print(f"  Total images evaluated : {len(y_true)}")
    print(f"  Referable (ground truth): {y_true.sum()} ({y_true.mean():.1%})")
    print()
    print(f"  Sensitivity (referable DR): {sensitivity:.4f}  ({sensitivity:.1%})")
    print(f"  Specificity               : {specificity:.4f}  ({specificity:.1%})")
    print(f"  Accuracy                  : {accuracy:.4f}  ({accuracy:.1%})")
    print(f"  AUC (referable)           : {auc:.4f}")
    print(f"  Human review routed       : {n_review}/{len(y_true)} ({n_review/len(y_true):.1%})")
    print()
    print("  Confusion Matrix (binary referable):")
    print(f"    TP={tp}  FP={fp}")
    print(f"    FN={fn}  TN={tn}")
    print()
    print("  ⚠  False Negatives (missed referable) =", fn)
    print("     These are the most dangerous errors — inspect manually.")
    print("="*65)

    # Save results
    results_df = pd.DataFrame({
        "image":       df["image_name"][:len(y_true)].values,
        "true_refer":  y_true,
        "pred_level":  y_pred_level,
        "pred_refer":  y_pred_bin,
        "pred_prob":   y_pred_prob,
        "routing":     y_routed,
    })
    results_path = os.path.join(OUT_DIR, "external_validation_results.csv")
    results_df.to_csv(results_path, index=False)

    report_text = f"""
SERIX — DR Screening System
External Validation Report — Messidor-2
{'='*50}

Dataset:      Messidor-2
Training set: APTOS 2019 + IDRiD (NO Messidor-2 in training)
Purpose:      Domain shift test

RESULTS
{'─'*50}
Total evaluated : {len(y_true)}
Sensitivity     : {sensitivity:.4f} ({sensitivity:.1%})
Specificity     : {specificity:.4f} ({specificity:.1%})
Accuracy        : {accuracy:.4f} ({accuracy:.1%})
AUC             : {auc:.4f}
Human review    : {n_review}/{len(y_true)} ({n_review/len(y_true):.1%})

Confusion Matrix:
  TP={tp}  FP={fp}
  FN={fn}  TN={tn}

False Negatives (missed referrals): {fn}

INTERPRETATION
{'─'*50}
A 3-5% drop in sensitivity vs APTOS validation is expected
and represents real-world domain shift (different camera,
different population, different illumination conditions).
This is honest. A zero-drop claim would be suspicious.
The IQA module provides partial defense against worst-case
domain shift by flagging ungradable images before grading.
{'='*50}
"""

    report_path = os.path.join(OUT_DIR, "external_validation_report.txt")
    with open(report_path, "w") as f:
        f.write(report_text)

    print(f"\n[DONE] Results saved to {results_path}")
    print(f"[DONE] Report  saved to {report_path}")


if __name__ == "__main__":
    asyncio.run(run_validation())
