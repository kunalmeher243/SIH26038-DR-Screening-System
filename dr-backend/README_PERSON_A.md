# Person A — IQA + Classifier + Grad-CAM
## Team SERIX | SIH26038

---

## Step 0 — Setup (do this first, once)

```bash
pip install -r requirements.txt
mkdir -p models data/train_images
```

Place APTOS 2019 files:
```
data/
    train.csv          ← from Kaggle: id_code, diagnosis columns
    train_images/      ← all .png files
```

---

## Step 1 — Start Training NOW

```bash
python train_classifier.py
```

- Takes 6-8 hours on local GPU
- Saves checkpoint every epoch to `models/`
- Best checkpoint saved by **referable DR sensitivity** (not accuracy)
- Watch the `val_sens` column — target > 0.90

**Do Steps 2 and 3 while training runs in background.**

---

## Step 2 — Test IQA Immediately (no model needed)

Grab any retinal image from APTOS 2019 train_images/ folder.

```bash
python test_pipeline.py --image data/train_images/000c1434d8d7.png
```

Check the quality_label output. If GRADABLE images are being flagged UNGRADABLE,
tune the thresholds in `services/iqa_service.py`:

```python
BLUR_THRESHOLD      = 80.0   # lower = more permissive
GRADABLE_CUTOFF     = 0.70   # lower = more permissive
BORDERLINE_CUTOFF   = 0.45   # lower = more permissive
```

---

## Step 3 — Run FastAPI Server

```bash
uvicorn main:app --reload --port 8000
```

- If model not trained yet: /api/quality and /api/enhance work immediately
- /api/grade and /api/report will fail until training completes
- Web dev can test IQA + Enhancement endpoints right now

Visit http://localhost:8000/docs to test all endpoints in browser.

---

## Step 4 — Calibrate After Training

```bash
python calibrate.py
```

- Run once after `train_classifier.py` completes
- Writes `models/calibrated_model.pt`
- Reports ECE before and after — target ECE < 0.05
- Restart uvicorn after calibration: it will auto-load the calibrated model

---

## Step 5 — Full Pipeline Test

```bash
python test_pipeline.py --image data/train_images/000c1434d8d7.png
```

All 4 tests should pass:
- [ ] IQA returns quality label
- [ ] Enhancement returns base64 images
- [ ] Grade returns DR level + calibrated confidence
- [ ] Grad-CAM returns base64 heatmap

---

## File Map

```
serix/
├── train_classifier.py     ← START HERE
├── calibrate.py            ← run after training
├── test_pipeline.py        ← smoke test
├── main.py                 ← FastAPI server
├── requirements.txt
├── utils/
│   └── image_utils.py      ← shared utilities (do not modify)
├── services/
│   ├── iqa_service.py      ← YOUR MODULE: image quality
│   ├── enhance_service.py  ← YOUR MODULE: CLAHE enhancement
│   ├── model_service.py    ← YOUR MODULE: EfficientNet grading
│   ├── gradcam_service.py  ← YOUR MODULE: Grad-CAM
│   └── report_service.py   ← assembles all modules (shared)
├── models/                 ← created by training
│   ├── best_model.pt
│   ├── calibrated_model.pt
│   ├── temperature.txt
│   └── training_log.csv
└── data/                   ← you provide this
    ├── train.csv
    └── train_images/
```

---

## Metrics to Report at Internal Hackathon

From `models/training_log.csv`, report these from the best epoch:

| Metric | Target |
|---|---|
| Referable DR Sensitivity | > 90% |
| Specificity | > 85% |
| Quadratic Kappa | > 0.80 |
| AUC (referable vs non) | > 0.95 |
| ECE (after calibration) | < 0.05 |

---

## Common Errors

**CUDA out of memory:**
→ Reduce `batch_size` in CFG from 16 to 8

**FileNotFoundError: train.csv:**
→ Check data/ folder structure. CSV must have `id_code` and `diagnosis` columns.

**ModuleNotFoundError: timm:**
→ Run `pip install -r requirements.txt` again

**Grad-CAM returns black image:**
→ Model is not producing gradient — check target layer in gradcam_service.py
→ Try `model.blocks[-2]` instead of `model.blocks[-1]`
