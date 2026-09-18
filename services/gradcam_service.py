"""
services/gradcam_service.py
Grad-CAM heatmap generation for EfficientNet-B4.

Grad-CAM highlights image regions that influenced the DR classification.
Combined with lesion overlay, this forms the explainability layer.

Returns base64-encoded PNG: original image with heat overlay.
"""

import numpy as np
import torch
from fastapi import UploadFile
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image
from utils.image_utils import (
    bytes_to_numpy, preprocess_for_model,
    numpy_to_float, numpy_to_base64, get_device
)
from services.model_service import get_model
import cv2


def _result(visualization: np.ndarray) -> dict:
    """Return both raw base64 and a browser-ready image data URL."""
    encoded = numpy_to_base64(visualization)
    return {
        "gradcam_image": f"data:image/png;base64,{encoded}",
        "gradcam_image_base64": encoded,
    }


def get_target_layer(model):
    """
    Returns the last convolutional block of EfficientNet-B4.
    This layer has the best spatial resolution / semantic trade-off.
    Change this if using a different architecture.
    """
    # EfficientNet-B4 in timm: model.blocks[-1] is the last MBConv block
    return [model.blocks[-1]]


async def generate(file: UploadFile) -> dict:
    """
    Entry point called by FastAPI router or report_service.
    Returns Grad-CAM overlay as base64 PNG string.
    """
    model, temperature, device = get_model()

    raw     = await file.read()
    img_rgb = bytes_to_numpy(raw)

    # Resize to model input size for visualization
    img_resized = cv2.resize(img_rgb, (380, 380))
    img_float   = numpy_to_float(img_resized)    # float32 [0,1] for overlay

    tensor = preprocess_for_model(img_rgb).to(device)

    target_layers = get_target_layer(model)

    with GradCAM(model=model, target_layers=target_layers) as cam:
        # targets=None → use predicted class automatically
        grayscale_cam = cam(
            input_tensor=tensor,
            targets=None
        )[0]   # shape: (H, W) float in [0,1]

    # Overlay heatmap on resized original image
    visualization = show_cam_on_image(
        img_float,
        grayscale_cam,
        use_rgb=True,
        colormap=cv2.COLORMAP_JET,
        image_weight=0.5   # 50% original, 50% heatmap
    )

    return _result(visualization)


async def generate_from_bytes(file_bytes: bytes) -> dict:
    """
    Variant used by report_service when bytes are already loaded.
    Avoids re-reading the file.
    """
    model, temperature, device = get_model()

    from utils.image_utils import bytes_to_numpy
    img_rgb     = bytes_to_numpy(file_bytes)
    img_resized = cv2.resize(img_rgb, (380, 380))
    img_float   = numpy_to_float(img_resized)
    tensor      = preprocess_for_model(img_rgb).to(device)

    target_layers = get_target_layer(model)

    with GradCAM(model=model, target_layers=target_layers) as cam:
        grayscale_cam = cam(input_tensor=tensor, targets=None)[0]

    visualization = show_cam_on_image(
        img_float, grayscale_cam, use_rgb=True,
        colormap=cv2.COLORMAP_JET, image_weight=0.5
    )

    return _result(visualization)
