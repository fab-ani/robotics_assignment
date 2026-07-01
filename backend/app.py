import os
import base64
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    import pytesseract

    _windows_tesseract = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
    if os.name == "nt" and os.path.exists(_windows_tesseract):
        pytesseract.pytesseract.tesseract_cmd = _windows_tesseract
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False

app = Flask(__name__)  
CORS(app, origins=os.environ.get("FRONTEND_URL", "*").split(","))


def encode_image(img):
    _, buffer = cv2.imencode(".png", img)
    return base64.b64encode(buffer).decode("utf-8")


def decode_image(file):
    file_bytes = np.frombuffer(file.read(), np.uint8)
    return cv2.imdecode(file_bytes, cv2.IMREAD_COLOR)


# ─── Assignment 1 ────────────────────────────────────────────────────────────


@app.route("/api/task1", methods=["POST"])
def task1_read_display():
    """Read and display: original, grayscale, RGB."""
    file = request.files.get("image")
    if not file:
        return jsonify(error="No image provided"), 400

    img = decode_image(file)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)

    h, w = img.shape[:2]

    return jsonify(
        original=encode_image(img),
        grayscale=encode_image(gray),
        rgb=encode_image(rgb),
        dimensions={"width": w, "height": h},
    )


@app.route("/api/task2", methods=["POST"])
def task2_resize():
    """Resize to 50x50, 100x100, 200x200."""
    file = request.files.get("image")
    if not file:
        return jsonify(error="No image provided"), 400

    img = decode_image(file)
    sizes = [50, 100, 200]
    resized = {}
    for s in sizes:
        r = cv2.resize(img, (s, s), interpolation=cv2.INTER_AREA)
        resized[f"{s}x{s}"] = encode_image(r)

    return jsonify(original=encode_image(img), resized=resized)


@app.route("/api/task3", methods=["POST"])
def task3_crop():
    """Crop a region of interest."""
    file = request.files.get("image")
    if not file:
        return jsonify(error="No image provided"), 400

    x = int(request.form.get("x", 50))
    y = int(request.form.get("y", 50))
    w = int(request.form.get("w", 200))
    h = int(request.form.get("h", 200))

    img = decode_image(file)
    ih, iw = img.shape[:2]

    x = min(x, iw - 1)
    y = min(y, ih - 1)
    w = min(w, iw - x)
    h = min(h, ih - y)

    cropped = img[y : y + h, x : x + w]

    return jsonify(original=encode_image(img), cropped=encode_image(cropped))


@app.route("/api/task4", methods=["POST"])
def task4_blur():
    """Apply Gaussian blur."""
    file = request.files.get("image")
    if not file:
        return jsonify(error="No image provided"), 400

    kernel = int(request.form.get("kernel", 15))
    if kernel % 2 == 0:
        kernel += 1

    img = decode_image(file)
    blurred = cv2.GaussianBlur(img, (kernel, kernel), 0)

    return jsonify(original=encode_image(img), blurred=encode_image(blurred))


@app.route("/api/task5", methods=["POST"])
def task5_threshold():
    """Binary thresholding at 50, 100, 150."""
    file = request.files.get("image")
    if not file:
        return jsonify(error="No image provided"), 400

    img = decode_image(file)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    results = {}
    for t in [50, 100, 150]:
        _, binary = cv2.threshold(gray, t, 255, cv2.THRESH_BINARY)
        results[str(t)] = encode_image(binary)

    return jsonify(original=encode_image(img), grayscale=encode_image(gray), thresholds=results)


@app.route("/api/task6", methods=["POST"])
def task6_edge():
    """Canny edge detection."""
    file = request.files.get("image")
    if not file:
        return jsonify(error="No image provided"), 400

    lower = int(request.form.get("lower", 100))
    upper = int(request.form.get("upper", 200))

    img = decode_image(file)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    edges = cv2.Canny(gray, lower, upper)

    return jsonify(original=encode_image(img), edges=encode_image(edges))


# ─── Assignment 2 ────────────────────────────────────────────────────────────


@app.route("/api/ocr/preprocess", methods=["POST"])
def ocr_preprocess():
    """Assignment 2: preprocess + crop + threshold at 50, 120, 180."""
    file = request.files.get("image")
    if not file:
        return jsonify(error="No image provided"), 400

    x = int(request.form.get("x", 0))
    y = int(request.form.get("y", 0))
    w = int(request.form.get("w", 0))
    h = int(request.form.get("h", 0))

    img = decode_image(file)
    ih, iw = img.shape[:2]

    if w == 0 or h == 0:
        cropped = img.copy()
    else:
        x = min(x, iw - 1)
        y = min(y, ih - 1)
        w = min(w, iw - x)
        h = min(h, ih - y)
        cropped = img[y : y + h, x : x + w]

    gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)

    thresholds = {}
    for t in [50, 120, 180]:
        _, binary = cv2.threshold(gray, t, 255, cv2.THRESH_BINARY)
        thresholds[str(t)] = encode_image(binary)

    return jsonify(
        original=encode_image(img),
        cropped=encode_image(cropped),
        grayscale=encode_image(gray),
        thresholds=thresholds,
        dimensions={"width": iw, "height": ih},
    )


@app.route("/api/ocr/extract", methods=["POST"])
def ocr_extract():
    """Extract text using Tesseract on different threshold levels."""
    if not HAS_TESSERACT:
        return jsonify(error="pytesseract is not installed"), 500

    file = request.files.get("image")
    if not file:
        return jsonify(error="No image provided"), 400

    actual_text = request.form.get("actual_text", "")
    x = int(request.form.get("x", 0))
    y = int(request.form.get("y", 0))
    w = int(request.form.get("w", 0))
    h = int(request.form.get("h", 0))

    img = decode_image(file)
    ih, iw = img.shape[:2]

    if w == 0 or h == 0:
        cropped = img.copy()
    else:
        x = min(x, iw - 1)
        y = min(y, ih - 1)
        w = min(w, iw - x)
        h = min(h, ih - y)
        cropped = img[y : y + h, x : x + w]

    gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)

    # Scale up small crops for better OCR accuracy
    scale_h, scale_w = gray.shape[:2]
    if scale_h < 200 or scale_w < 200:
        scale = max(200 / scale_h, 200 / scale_w, 2.0)
        gray = cv2.resize(gray, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)

    tesseract_config = "--psm 6"

    results = []
    for t in [50, 120, 180]:
        _, binary = cv2.threshold(gray, t, 255, cv2.THRESH_BINARY)
        ocr_text = pytesseract.image_to_string(binary, config=tesseract_config).strip()
        # Clean up: remove non-printable chars, collapse whitespace
        ocr_text = " ".join(ocr_text.split())

        accuracy = 0.0
        if actual_text:
            actual_clean = actual_text.replace(" ", "").upper()
            ocr_clean = ocr_text.replace(" ", "").upper()
            correct = sum(1 for a, b in zip(actual_clean, ocr_clean) if a == b)
            total = max(len(actual_clean), 1)
            accuracy = round((correct / total) * 100, 2)

        results.append(
            {"threshold": t, "ocr_text": ocr_text, "accuracy": accuracy}
        )

    return jsonify(actual_text=actual_text, results=results)


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify(
        status="ok",
        tesseract_available=HAS_TESSERACT,
    )


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug)
