# Person B — Lesion Detection + External Validation
## Team SERIX | SIH26038

---

## Your Module Responsibilities

| Module | File | Dataset |
|---|---|---|
| Lesion U-Net training | `train_lesion.py` | IDRiD Task A |
| Lesion inference service | `services/lesion_service.py` | — |
| Anatomy heuristics | `services/anatomy_service.py` | — |
| Report assembly | `services/report_service.py` | — |
| External validation | `validate_external.py` | Messidor-2 |

---

## Step 0 — Install Dependencies

```bash
pip install -r requirements.txt
pip install segmentation-models-pytorch --break-system-packages
```

---

## Step 1 — Set Up IDRiD Dataset 

Download IDRiD Task A (Segmentation) from:
https://idrid.grand-challenge.org → Task A

Organise into this structure:

```
data/IDRiD/
    images/
        train/     ← IDRiD_01.jpg to IDRiD_54.jpg
        test/      ← IDRiD_55.jpg to IDRiD_81.jpg
    masks/
        train/
            MA/    ← IDRiD_01_MA.tif ...   (microaneurysms)
            HE/    ← IDRiD_01_HE.tif ...   (haemorrhages)
            EX/    ← IDRiD_01_EX.tif ...   (hard exudates)
            SE/    ← IDRiD_01_SE.tif ...   (soft exudates)
        test/
            MA/  HE/  EX/  SE/
```

NOTE: Not every image has masks for all 4 lesion types.
Missing mask = no lesion of that type. The dataset loader handles this.

---

## Step 2 — Start Lesion Training NOW

```bash
python train_lesion.py
```

- Trains U-Net with EfficientNet-B2 encoder on 54 training images
- Uses heavy augmentation to compensate for small dataset
- Saves best checkpoint to `models/lesion_model.pt`
- Watch `mean_auc` column — target > 0.80 overall
- EX and HE will train well. MA is hardest (tiny lesions).

**Do Steps 3, 4, 5 while training runs.**

---

## Step 3 — Test Anatomy Service Immediately (no model needed)

```python
# Quick test in Python shell
import asyncio
import io
from fastapi import UploadFile
from services import anatomy_service

with open("data/IDRiD/images/train/IDRiD_01.jpg", "rb") as f:
    raw = f.read()

upload = UploadFile(filename="test.jpg", file=io.BytesIO(raw))
result = asyncio.run(anatomy_service.segment(upload))
print(result)
```

Expected output:
```json
{
  "anatomy": {
    "optic_disc_detected": true,
    "fovea_detected": true
  }
}
```

---

## Step 4 — Test Report Service (uses dummy lesions until training done)

```bash
uvicorn main:app --reload --port 8000
```

Call `/api/report` with any retinal image.
Report service will use dummy lesions until `lesion_model.pt` exists.
Once training completes, restart uvicorn — real lesions load automatically.

---

## Step 5 — Messidor-2 External Validation

Download Messidor-2 from: https://www.adcis.net/en/third-party/messidor2/

Organise:
```
data/Messidor2/
    images/         ← all JPEG images
    labels.csv      ← image_name, adjudicated_dr_grade (0-4), adjudicated_gradable (1/0)
```

Run AFTER Person A's `calibrated_model.pt` exists:
```bash
python validate_external.py
```

Outputs:
- `models/external_validation_report.txt` — summary metrics
- `models/external_validation_results.csv` — per-image predictions

---

## Metrics to Report

From lesion training log (`models/lesion_log.csv`):

| Lesion | AUROC Target |
|---|---|
| EX (Hard Exudates) | > 0.90 |
| HE (Haemorrhages) | > 0.85 |
| SE (Soft Exudates) | > 0.85 |
| MA (Microaneurysms) | > 0.70 |

From external validation (`models/external_validation_report.txt`):

| Metric | Target |
|---|---|
| Sensitivity (Messidor-2) | > 85% |
| Specificity (Messidor-2) | > 80% |
| AUC (Messidor-2) | > 0.90 |

A 3-5% drop vs APTOS validation is expected and honest.
Do NOT claim zero domain shift.

---

## Microaneurysm Honesty Rule

MA lesions occupy very few pixels (2-10px at typical resolution).
Do NOT claim:
    "We detect every microaneurysm at sub-pixel accuracy."

DO say:
    "Our model detects microaneurysm regions above a minimum size
    threshold. Very small or isolated MAs may be missed.
    Sensitivity on IDRiD MA test set: XX%."

Judges respect scientific honesty more than exaggerated claims.

---

## Full Folder Map After Setup

```
serix/
├── train_lesion.py          ← START HERE
├── validate_external.py     ← run after Person A's model is ready
├── services/
│   ├── lesion_service.py    ← YOUR MODULE
│   ├── anatomy_service.py   ← YOUR MODULE
│   └── report_service.py    ← shared (assembles all modules)
├── models/
│   ├── lesion_model.pt               ← created by train_lesion.py
│   ├── lesion_log.csv                ← per-epoch metrics
│   ├── external_validation_report.txt
│   └── external_validation_results.csv
└── data/
    ├── IDRiD/
    │   ├── images/train/  test/
    │   └── masks/train/   test/
    └── Messidor2/
        ├── images/
        └── labels.csv
```

---

## Common Errors

**CUDA OOM:**
→ Reduce `batch_size` in CFG from 4 to 2

**FileNotFoundError for .tif mask:**
→ Normal — not all images have all lesion types.
→ Loader fills missing masks with zeros automatically.

**mean_auc stuck at 0.5:**
→ Model not learning. Try: lower lr from 3e-4 to 1e-4.
→ Check mask loading — ensure binary threshold (> 127) is applied.

**Messidor-2 image not found:**
→ Check image extension — some Messidor-2 zips use .jpeg not .jpg.
→ Modify validate_external.py line: `img_name += ".jpg"` → `".jpeg"`.
