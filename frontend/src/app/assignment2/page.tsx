"use client";

import { useState, useMemo } from "react";
import AssetPicker from "@/components/AssetPicker";
import ImageDisplay from "@/components/ImageDisplay";
import TaskCard from "@/components/TaskCard";
import CodeBlock from "@/components/CodeBlock";
import LoadingOverlay from "@/components/LoadingOverlay";
import BoundingBoxCropper from "@/components/BoundingBoxCropper";
import { postImage } from "@/lib/api";
import { downloadPythonScript, downloadNotebook } from "@/lib/exportCode";

const MIN_LOADING_MS = 3000;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export default function Assignment2() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("image.jpg");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("Intelligent Control and Robotics");
  const [regNumber, setRegNumber] = useState("");

  const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 0, h: 0 });
  const cropParams = useMemo(() => ({
    x: String(Math.round(cropRect.x)),
    y: String(Math.round(cropRect.y)),
    w: String(Math.round(cropRect.w)),
    h: String(Math.round(cropRect.h)),
  }), [cropRect]);
  const [actualText, setActualText] = useState("");

  const [preprocessResult, setPreprocessResult] = useState<any>(null);
  const [ocrResult, setOcrResult] = useState<any>(null);

  async function runPreprocess() {
    if (!file) return;
    setLoading("preprocess");
    setError(null);
    try {
      const [data] = await Promise.all([
        postImage("/api/ocr/preprocess", file, cropParams),
        delay(MIN_LOADING_MS),
      ]);
      setPreprocessResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function runOCR() {
    if (!file) return;
    setLoading("ocr");
    setError(null);
    try {
      const [data] = await Promise.all([
        postImage("/api/ocr/extract", file, {
          ...cropParams,
          actual_text: actualText,
        }),
        delay(MIN_LOADING_MS),
      ]);
      setOcrResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  const isLoading = loading !== null;
  const cx = cropParams.x, cy = cropParams.y, cw = cropParams.w, ch = cropParams.h;

  const bestResult = ocrResult?.results?.length
    ? ocrResult.results.reduce((best: any, r: any) => (r.accuracy > best.accuracy ? r : best), ocrResult.results[0])
    : null;

  const task1Code = `import cv2

# Load the image
image = cv2.imread("${fileName}")

# Display image dimensions
height, width, channels = image.shape
print(f"Width: {width}, Height: {height}")
print(f"Channels: {channels}")

# Display the original image
cv2.imshow("Original Image", image)
cv2.waitKey(0)
cv2.destroyAllWindows()`;

  const task2Code = `import cv2

image = cv2.imread("${fileName}")

# Define ROI coordinates
x, y, w, h = ${cx}, ${cy}, ${cw}, ${ch}

# Crop the region of interest
cropped_image = image[${cy}:${cy}+${ch}, ${cx}:${cx}+${cw}]

cv2.imshow("Original", image)
cv2.imshow("Cropped ROI", cropped_image)
cv2.waitKey(0)
cv2.destroyAllWindows()`;

  const task3Code = `import cv2

image = cv2.imread("${fileName}")

# Crop ROI first
cropped = image[${cy}:${cy}+${ch}, ${cx}:${cx}+${cw}]

# Step 1: Convert to Grayscale
gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)

# Step 2: Apply Thresholding
thresholds = [50, 120, 180]

for thresh_val in thresholds:
    ret, binary = cv2.threshold(
        gray, thresh_val, 255,
        cv2.THRESH_BINARY
    )
    cv2.imshow(f"Threshold={thresh_val}", binary)

cv2.waitKey(0)
cv2.destroyAllWindows()`;

  const task4Code = `import cv2
import pytesseract

image = cv2.imread("${fileName}")

# Crop and preprocess
cropped = image[${cy}:${cy}+${ch}, ${cx}:${cx}+${cw}]
gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)
ret, binary = cv2.threshold(gray, 120, 255,
                             cv2.THRESH_BINARY)

# Extract text using Tesseract OCR
ocr_text = pytesseract.image_to_string(binary)
print(f"OCR Output: {ocr_text.strip()}")

# Compare with actual text
actual_text = "${actualText || "ATC"}"
print(f"Actual Text: {actual_text}")
print(f"OCR Output:  {ocr_text.strip()}")`;

  const task5Code = `# OCR Accuracy Evaluation
actual_text = "${actualText || "ATC"}"
ocr_output  = "${ocrResult?.results?.[1]?.ocr_text || "..."}"

# Count correctly recognized characters
correct = sum(
    1 for a, b in zip(actual_text, ocr_output)
    if a == b
)
total = len(actual_text)

accuracy = (correct / total) * 100
print(f"Actual:   {actual_text}")
print(f"OCR:      {ocr_output}")
print(f"Correct:  {correct}/{total}")
print(f"Accuracy: {accuracy:.2f}%")`;

  const task6Code = `import cv2
import pytesseract

image = cv2.imread("${fileName}")
cropped = image[${cy}:${cy}+${ch}, ${cx}:${cx}+${cw}]
gray = cv2.cvtColor(cropped, cv2.COLOR_BGR2GRAY)

# Test OCR under different thresholds
thresholds = [50, 120, 180]
actual_text = "${actualText || "ATC"}"

for thresh_val in thresholds:
    ret, binary = cv2.threshold(
        gray, thresh_val, 255,
        cv2.THRESH_BINARY
    )
    ocr_text = pytesseract.image_to_string(
        binary
    ).strip()

    correct = sum(
        1 for a, b in zip(actual_text, ocr_text)
        if a == b
    )
    accuracy = (correct / len(actual_text)) * 100

    print(f"Threshold: {thresh_val}")
    print(f"  OCR:      {ocr_text}")
    print(f"  Accuracy: {accuracy:.2f}%")`;

  const codeSections = [
    { title: "Task 1: Image Acquisition and Display", code: task1Code },
    { title: "Task 2: Region of Interest (ROI) Selection", code: task2Code },
    { title: "Task 3: Image Preprocessing", code: task3Code },
    { title: "Task 4: OCR Text Extraction", code: task4Code },
    { title: "Task 5: OCR Accuracy Evaluation", code: task5Code },
    { title: "Task 6: OCR Improvement Investigation", code: task6Code },
  ];

  const baseName = (studentName || "student").trim().toLowerCase().replace(/\s+/g, "_");

  function handleDownloadPy() {
    downloadPythonScript(`${baseName}_ocr_assignment.py`, codeSections);
  }
  function handleDownloadIpynb() {
    downloadNotebook(`${baseName}_ocr_assignment.ipynb`, codeSections);
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-wide uppercase text-[#FAFAFA]">Assignment 2: OCR Vision System</h1>
        <p className="text-[#A1A1AA] text-xs tracking-widest uppercase mt-2">Text Recognition Using OpenCV and Tesseract</p>
      </div>

      <div className="bg-[#18181B] rounded-lg border border-[#27272A] p-6 space-y-4">
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-[9px] font-mono tracking-widest text-[#A1A1AA] mb-1 uppercase">Name</label>
            <input type="text" value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Your Name"
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
          </div>
          <div>
            <label className="block text-[9px] font-mono tracking-widest text-[#A1A1AA] mb-1 uppercase">Course</label>
            <input type="text" value={courseName} onChange={(e) => setCourseName(e.target.value)} placeholder="Course Name"
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
          </div>
          <div>
            <label className="block text-[9px] font-mono tracking-widest text-[#A1A1AA] mb-1 uppercase">Reg. Number</label>
            <input type="text" value={regNumber} onChange={(e) => setRegNumber(e.target.value)} placeholder="Registration No."
              className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-xs text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
          </div>
        </div>
        <AssetPicker onSelect={(f) => {
          setFile(f);
          setFileName(f.name);
          setFilePreview(URL.createObjectURL(f));
          setCropRect({ x: 0, y: 0, w: 0, h: 0 });
          setPreprocessResult(null);
          setOcrResult(null);
        }} label="Select an image containing text" filter="all" />
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Task 1: Image Acquisition */}
      <TaskCard title="Task 1: Image Acquisition and Display">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {filePreview ? (
              <>
                <div className="space-y-2">
                  <p className="text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA] text-center">Original Image</p>
                  <div className="bg-[#09090B] border border-[#27272A] rounded p-1.5">
                    <img src={filePreview} alt="Original" className="max-w-full h-auto mx-auto rounded" />
                  </div>
                </div>
                {preprocessResult && (
                  <p className="text-xs text-[#A1A1AA] font-mono">
                    Dimensions: {preprocessResult.dimensions.width} x {preprocessResult.dimensions.height}
                  </p>
                )}
              </>
            ) : (
              <p className="text-xs text-[#A1A1AA]/60">Select an image above to display it here.</p>
            )}
          </div>
          <CodeBlock code={task1Code} />
        </div>
      </TaskCard>

      {/* Task 2: ROI Selection */}
      <TaskCard title="Task 2: Region of Interest (ROI) Selection">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {filePreview ? (
              <>
                <BoundingBoxCropper
                  imageSrc={filePreview}
                  crop={cropRect}
                  onChange={setCropRect}
                />
                <div className="grid grid-cols-4 gap-3">
                  {(["x", "y", "w", "h"] as const).map((key) => (
                    <div key={key}>
                      <label className="block text-[10px] font-mono tracking-widest text-[#A1A1AA] mb-1 uppercase">{key}</label>
                      <input type="number"
                        value={Math.round(cropRect[key])}
                        onChange={(e) => setCropRect({ ...cropRect, [key]: Number(e.target.value) || 0 })}
                        className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
                    </div>
                  ))}
                </div>
                {preprocessResult && (
                  <ImageDisplay src={preprocessResult.cropped} label="Cropped ROI Result" />
                )}
              </>
            ) : (
              <p className="text-xs text-[#A1A1AA]/60">Upload an image first to select a region of interest.</p>
            )}
            <div className="mt-4 space-y-1 border-t border-[#27272A] pt-4 text-xs">
              <p className="font-bold text-[#FAFAFA]">Discussion: Why is cropping important before OCR?</p>
              <p className="text-[#A1A1AA] leading-relaxed">
                Cropping isolates the text region from surrounding background clutter (frames, logos, textures).
                Tesseract performs character segmentation on the whole input, so any non-text content in frame
                can be misread as characters or shift segmentation boundaries, directly lowering OCR accuracy.
              </p>
            </div>
          </div>
          <CodeBlock code={task2Code} running={loading === "preprocess"} />
        </div>
      </TaskCard>

      {/* Task 3: Preprocessing */}
      <TaskCard title="Task 3: Image Preprocessing">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {loading !== "preprocess" && (
              <button onClick={runPreprocess} disabled={!file || isLoading}
                className="bg-[#FAFAFA] text-[#09090B] px-5 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white disabled:opacity-30 transition-all">
                Run Preprocessing
              </button>
            )}
            <LoadingOverlay active={loading === "preprocess"} label="Preprocessing image" />
            {preprocessResult && loading !== "preprocess" && (
              <>
                <ImageDisplay src={preprocessResult.grayscale} label="Grayscale" />
                <div className="grid grid-cols-3 gap-3">
                  <ImageDisplay src={preprocessResult.thresholds["50"]} label="Threshold = 50" />
                  <ImageDisplay src={preprocessResult.thresholds["120"]} label="Threshold = 120" />
                  <ImageDisplay src={preprocessResult.thresholds["180"]} label="Threshold = 180" />
                </div>
              </>
            )}
            <div className="mt-4 space-y-1 border-t border-[#27272A] pt-4 text-xs">
              <p className="font-bold text-[#FAFAFA]">Discussion: Which threshold produces the best result?</p>
              <p className="text-[#A1A1AA] leading-relaxed">
                {bestResult
                  ? `Based on the OCR run below, threshold ${bestResult.threshold} produced the highest accuracy (${bestResult.accuracy}%) for this image. Run Task 4 to populate this result.`
                  : "Run Task 4 (OCR Extraction) below to determine which threshold value gives the highest character accuracy for this specific image."}
              </p>
            </div>
          </div>
          <CodeBlock code={task3Code} running={loading === "preprocess"} />
        </div>
      </TaskCard>

      {/* Task 4: OCR Extraction */}
      <TaskCard title="Task 4: OCR Text Extraction">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono tracking-widest text-[#A1A1AA] mb-1">
                Actual Text in Image (for accuracy comparison)
              </label>
              <input type="text" value={actualText} onChange={(e) => setActualText(e.target.value)}
                placeholder="e.g., ATC"
                className="w-full max-w-md bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
            </div>
            {loading !== "ocr" && (
              <button onClick={runOCR} disabled={!file || isLoading}
                className="bg-[#FAFAFA] text-[#09090B] px-5 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white disabled:opacity-30 transition-all">
                Run OCR Extraction
              </button>
            )}
            <LoadingOverlay active={loading === "ocr"} label="Extracting text with Tesseract" />
            {ocrResult && ocrResult.results && loading !== "ocr" && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-[#09090B]">
                      <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">Actual Text</th>
                      <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">OCR Output</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-[#27272A] px-4 py-3 font-mono text-xs text-[#FAFAFA]">
                        {ocrResult.actual_text || "N/A"}
                      </td>
                      <td className="border border-[#27272A] px-4 py-3 font-mono text-xs text-[#FAFAFA]">
                        {ocrResult.results[1]?.ocr_text || "N/A"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <CodeBlock code={task4Code} running={loading === "ocr"} />
        </div>
      </TaskCard>

      {/* Task 5: Accuracy Evaluation */}
      <TaskCard title="Task 5: OCR Accuracy Evaluation">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {ocrResult && ocrResult.results ? (
              <>
                <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-4 text-xs space-y-1">
                  <p><span className="font-bold text-[#FAFAFA]">Actual Text:</span> <span className="font-mono">{ocrResult.actual_text || "N/A"}</span></p>
                  <p><span className="font-bold text-[#FAFAFA]">Best OCR Output:</span> <span className="font-mono">{bestResult?.ocr_text || "N/A"}</span></p>
                  <p><span className="font-bold text-[#FAFAFA]">Best Accuracy:</span> {bestResult?.accuracy ?? "N/A"}% (threshold {bestResult?.threshold})</p>
                </div>
                <p className="text-xs text-[#A1A1AA]">
                  <strong>Formula:</strong> Accuracy = (Correctly Recognized Characters / Total Characters) x 100
                </p>
              </>
            ) : (
              <p className="text-xs text-[#A1A1AA]/60">Run OCR extraction first to see accuracy results.</p>
            )}
          </div>
          <CodeBlock code={task5Code} running={loading === "ocr"} />
        </div>
      </TaskCard>

      {/* Task 6: OCR Improvement */}
      <TaskCard title="Task 6: OCR Improvement Investigation">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {ocrResult && ocrResult.results ? (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-[#09090B]">
                        <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">Threshold</th>
                        <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">OCR Result</th>
                        <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">Accuracy (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ocrResult.results.map((r: any) => (
                        <tr key={r.threshold}>
                          <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">{r.threshold}</td>
                          <td className="border border-[#27272A] px-4 py-3 font-mono text-xs text-[#FAFAFA]">{r.ocr_text || "N/A"}</td>
                          <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">{r.accuracy}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-[#09090B] border border-[#27272A] rounded-lg p-4 text-xs text-[#A1A1AA]">
                  <p className="font-bold text-[#FAFAFA] mb-1">
                    Discussion: Best threshold was {bestResult?.threshold} ({bestResult?.accuracy}% accuracy)
                  </p>
                  <p>
                    Different threshold values affect OCR accuracy because they control how pixel intensities
                    are converted to binary. A threshold too low (e.g., 50) may retain noise, while too high
                    (e.g., 180) may erase parts of the text. The optimal threshold depends on the contrast
                    between text and background in the specific image.
                  </p>
                </div>
              </>
            ) : (
              <p className="text-xs text-[#A1A1AA]/60">Run OCR extraction first to compare threshold results.</p>
            )}
          </div>
          <CodeBlock code={task6Code} running={loading === "ocr"} />
        </div>
      </TaskCard>

      {/* ───────────── REPORT ───────────── */}
      <div className="pt-4">
        <h2 className="text-sm font-bold tracking-wide uppercase text-[#FAFAFA] mb-4">Report</h2>

        {!(preprocessResult && ocrResult) ? (
          <div className="bg-[#18181B] border border-[#27272A] rounded-lg p-10 text-center space-y-2">
            <p className="text-xs font-mono tracking-widest uppercase text-[#A1A1AA]">Report Locked</p>
            <p className="text-xs text-[#A1A1AA]/60 max-w-md mx-auto">
              Run Preprocessing (Task 3) and OCR Extraction (Task 4) above to unlock the compiled report. This
              ensures the report always reflects a complete run. Adjust your crop and re-run to see the
              accuracy change live.
            </p>
          </div>
        ) : (
        <>
        <div className="flex flex-wrap items-center justify-end gap-2 mb-4 no-print">
          <button onClick={() => window.print()}
            className="bg-[#FAFAFA] text-[#09090B] px-4 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white transition-all">
            Export PDF
          </button>
          <button onClick={handleDownloadPy}
            className="bg-[#18181B] border border-[#27272A] text-[#FAFAFA] px-4 py-2 rounded text-xs font-bold tracking-wide uppercase hover:border-[#A1A1AA] transition-all">
            Download .py
          </button>
          <button onClick={handleDownloadIpynb}
            className="bg-[#18181B] border border-[#27272A] text-[#FAFAFA] px-4 py-2 rounded text-xs font-bold tracking-wide uppercase hover:border-[#A1A1AA] transition-all">
            Download .ipynb
          </button>
        </div>

        <div id="report-section" className="bg-white text-gray-900 rounded-lg p-10 space-y-12">
          {/* Title Page */}
          <div className="report-page text-center space-y-4 py-16">
            <img src="/assets/college_logo.png" alt="College Logo" className="w-28 h-28 mx-auto object-contain" />
            <p className="text-xs tracking-widest uppercase text-gray-500">{courseName}</p>
            <h1 className="text-3xl font-bold">Assignment 2: OCR Vision System</h1>
            <p className="text-sm text-gray-600">Text Recognition Using OpenCV and Tesseract OCR</p>
            <div className="pt-12 space-y-1 text-sm">
              <p><strong>Student Name:</strong> {studentName || "_______________"}</p>
              <p><strong>Registration Number:</strong> {regNumber || "_______________"}</p>
              <p><strong>Course:</strong> {courseName || "_______________"}</p>
              <p><strong>Date:</strong> {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Introduction */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Introduction</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              This report documents the design and implementation of an OCR-based vision system using OpenCV
              and Tesseract OCR. The pipeline acquires an image ({fileName}), isolates the text region with a
              region-of-interest crop, applies grayscale conversion and binary thresholding, extracts text with
              Tesseract, and evaluates recognition accuracy across multiple threshold values.
            </p>
          </section>

          {/* Source Image */}
          {filePreview && (
            <section>
              <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Source Image</h2>
              <img src={filePreview} alt="Source" className="max-w-sm rounded border border-gray-300" />
              <p className="text-xs text-gray-500 mt-2">File: {fileName}</p>
            </section>
          )}

          {/* Task 1 */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Task 1: Image Acquisition and Display</h2>
            {preprocessResult ? (
              <p className="text-xs text-gray-600 mb-3">Dimensions: {preprocessResult.dimensions.width} x {preprocessResult.dimensions.height}</p>
            ) : (
              <p className="text-xs text-gray-400 italic mb-3">Run preprocessing above to record image dimensions.</p>
            )}
            <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-[11px] overflow-x-auto"><code>{task1Code}</code></pre>
            <div className="mt-3 text-xs">
              <p className="font-bold text-gray-900">Discussion: Image acquisition considerations</p>
              <p className="text-gray-600 leading-relaxed">
                The selected image{preprocessResult ? ` measures ${preprocessResult.dimensions.width} x ${preprocessResult.dimensions.height} pixels across 3 color channels (BGR).` : " dimensions are recorded after preprocessing."}
                {" "}Higher resolution images provide more pixel data per character, which generally improves OCR accuracy, but also increases processing time.
                In a robotics context, image acquisition conditions (lighting, distance, camera angle) directly affect the quality of text visible in the frame.
              </p>
            </div>
          </section>

          {/* Task 2 */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Task 2: Region of Interest (ROI) Selection</h2>
            {preprocessResult ? (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div><img src={`data:image/png;base64,${preprocessResult.original}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Original</p></div>
                <div><img src={`data:image/png;base64,${preprocessResult.cropped}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Cropped ROI</p></div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic mb-3">Run preprocessing above to include the cropped ROI result.</p>
            )}
            <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-[11px] overflow-x-auto"><code>{task2Code}</code></pre>
            <div className="mt-3 text-xs">
              <p className="font-bold text-gray-900">Discussion: Why is cropping important before OCR?</p>
              <p className="text-gray-600 leading-relaxed">
                Cropping isolates the text region from surrounding background clutter (frames, logos, textures).
                Tesseract performs character segmentation on the whole input, so any non-text content in frame
                can be misread as characters or shift segmentation boundaries, directly lowering OCR accuracy.
              </p>
            </div>
          </section>

          {/* Task 3 */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Task 3: Image Preprocessing</h2>
            {preprocessResult ? (
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div><img src={`data:image/png;base64,${preprocessResult.thresholds["50"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Threshold 50</p></div>
                <div><img src={`data:image/png;base64,${preprocessResult.thresholds["120"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Threshold 120</p></div>
                <div><img src={`data:image/png;base64,${preprocessResult.thresholds["180"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Threshold 180</p></div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic mb-3">Run preprocessing above to include thresholded outputs.</p>
            )}
            <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-[11px] overflow-x-auto"><code>{task3Code}</code></pre>
            <div className="mt-3 text-xs">
              <p className="font-bold text-gray-900">Discussion: Which threshold produces the best result?</p>
              <p className="text-gray-600 leading-relaxed">
                {bestResult
                  ? `Threshold ${bestResult.threshold} produced the highest accuracy (${bestResult.accuracy}%) for this image.`
                  : "Run OCR extraction to determine which threshold value gives the highest character accuracy."}
              </p>
            </div>
          </section>

          {/* Task 4 */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Task 4: OCR Text Extraction</h2>
            {ocrResult ? (
              <table className="w-full text-xs border-collapse mb-3">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Actual Text</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">OCR Output</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 font-mono">{ocrResult.actual_text || "N/A"}</td>
                    <td className="border border-gray-300 px-3 py-2 font-mono">{ocrResult.results[1]?.ocr_text || "N/A"}</td>
                  </tr>
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-400 italic mb-3">Run OCR extraction above to include results.</p>
            )}
            <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-[11px] overflow-x-auto"><code>{task4Code}</code></pre>
            <div className="mt-3 text-xs">
              <p className="font-bold text-gray-900">Discussion: OCR configuration and results</p>
              <p className="text-gray-600 leading-relaxed">
                Tesseract was run with page segmentation mode 6 (--psm 6), which assumes the input is a single
                uniform block of text. This is appropriate for a cropped region containing one line or a short
                phrase. The preprocessing pipeline (grayscale conversion at threshold 120) was applied before
                Tesseract to improve contrast between text and background.
                {ocrResult
                  ? ` The OCR returned "${ocrResult.results[1]?.ocr_text || "N/A"}" against the actual text "${ocrResult.actual_text || "N/A"}".`
                  : ""}
              </p>
            </div>
          </section>

          {/* Task 5 */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Task 5: OCR Accuracy Evaluation</h2>
            {ocrResult ? (
              <div className="text-xs space-y-1 mb-3">
                <p><strong>Actual Text:</strong> {ocrResult.actual_text || "N/A"}</p>
                <p><strong>Best OCR Output:</strong> {bestResult?.ocr_text || "N/A"}</p>
                <p><strong>Best Accuracy:</strong> {bestResult?.accuracy ?? "N/A"}% (threshold {bestResult?.threshold})</p>
                <p className="text-gray-500">Formula: Accuracy = (Correctly Recognized Characters / Total Characters) x 100</p>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic mb-3">Run OCR extraction above to include accuracy results.</p>
            )}
            <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-[11px] overflow-x-auto"><code>{task5Code}</code></pre>
            <div className="mt-3 text-xs">
              <p className="font-bold text-gray-900">Discussion: Interpreting the accuracy metric</p>
              <p className="text-gray-600 leading-relaxed">
                The character-level accuracy metric counts how many characters in the OCR output match the
                corresponding position in the actual text. A score of 100% means every character was correctly
                recognized. Accuracy below 100% can result from noise in the image, poor contrast, font style,
                or incorrect segmentation by Tesseract. For practical robotics applications (e.g., reading
                nameplates or labels), an accuracy above 90% is typically needed for reliable automated action.
              </p>
            </div>
          </section>

          {/* Task 6 */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Task 6: OCR Improvement Investigation</h2>
            {ocrResult ? (
              <table className="w-full text-xs border-collapse mb-3">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-3 py-2 text-left">Threshold</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">OCR Result</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Accuracy (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {ocrResult.results.map((r: any) => (
                    <tr key={r.threshold}>
                      <td className="border border-gray-300 px-3 py-2">{r.threshold}</td>
                      <td className="border border-gray-300 px-3 py-2 font-mono">{r.ocr_text || "N/A"}</td>
                      <td className="border border-gray-300 px-3 py-2">{r.accuracy}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-xs text-gray-400 italic mb-3">Run OCR extraction above to include the comparison table.</p>
            )}
            <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-[11px] overflow-x-auto"><code>{task6Code}</code></pre>
            <div className="mt-3 text-xs">
              <p className="font-bold text-gray-900">
                Discussion: Best threshold {bestResult ? `was ${bestResult.threshold} (${bestResult.accuracy}% accuracy)` : ""}
              </p>
              <p className="text-gray-600 leading-relaxed">
                Different threshold values affect OCR accuracy because they control how pixel intensities are
                converted to binary. A threshold too low retains noise, while one too high erases parts of the
                text. The optimal threshold depends on the contrast between text and background in the image.
              </p>
            </div>
          </section>

          {/* Conclusion */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Conclusion</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              This assignment implemented a complete OCR vision pipeline: image acquisition, ROI cropping,
              grayscale and threshold preprocessing, Tesseract-based text extraction, and quantitative accuracy
              evaluation across threshold levels{bestResult ? ` (best result: threshold ${bestResult.threshold} at ${bestResult.accuracy}% accuracy)` : ""}.
              This pipeline mirrors how robots read labels, nameplates, and signage in real-world environments,
              and demonstrates that preprocessing choices have a measurable, quantifiable effect on recognition
              accuracy.
            </p>
          </section>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
