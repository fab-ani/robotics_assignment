"use client";

import { useState } from "react";
import AssetPicker from "@/components/AssetPicker";
import ImageDisplay from "@/components/ImageDisplay";
import TaskCard from "@/components/TaskCard";
import CodeBlock from "@/components/CodeBlock";
import LoadingOverlay from "@/components/LoadingOverlay";
import { postImage } from "@/lib/api";
import { downloadPythonScript, downloadNotebook } from "@/lib/exportCode";

const MIN_LOADING_MS = 3000;

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

const QA = {
  task1: [
    {
      q: "What is the difference between BGR and RGB?",
      a: "OpenCV stores color images with channels ordered Blue-Green-Red (BGR) by default, the reverse of the more common RGB convention used by Matplotlib, PIL, and most displays. The pixel data is identical; only the channel order differs, so images must be converted with cv2.cvtColor(img, cv2.COLOR_BGR2RGB) before being displayed correctly in RGB-based tools.",
    },
    {
      q: "Why is grayscale conversion important in computer vision applications?",
      a: "Grayscale conversion collapses three color channels into one intensity channel, reducing data volume by roughly two-thirds and removing color noise irrelevant to many vision tasks. This speeds up downstream operations such as thresholding, edge detection, and feature matching, which depend on intensity gradients rather than color.",
    },
  ],
  task2: [
    {
      q: "What happens to image quality when the image size is reduced?",
      a: "Reducing image size discards pixel information, causing loss of fine detail and texture. At very small sizes (e.g. 50x50) features like text or sharp edges become blurred or unrecognizable, since multiple original pixels are averaged into a single output pixel during interpolation.",
    },
    {
      q: "Why is image resizing useful in robotics and machine learning?",
      a: "Resizing standardizes input dimensions for neural networks and reduces computational load for real-time robotic vision systems, allowing faster inference on embedded hardware with limited processing power, at the cost of some detail.",
    },
  ],
  task3: [
    {
      q: "What information was removed?",
      a: "Cropping discards all pixel data outside the defined region of interest (x, y, w, h), removing background context and any objects or details located outside that bounding box.",
    },
    {
      q: "Give one robotics application where image cropping is useful.",
      a: "In barcode/QR-code scanning robots, cropping isolates the code's bounding region from a wider camera frame, eliminating background clutter and improving decode reliability and processing speed.",
    },
  ],
  task4: [
    {
      q: "Why is image blurring used?",
      a: "Blurring (smoothing) suppresses high-frequency noise and minor texture variation by averaging neighboring pixel values, producing a cleaner image for subsequent processing steps.",
    },
    {
      q: "How can blurring improve object detection?",
      a: "By removing small-scale noise and irrelevant texture, blurring prevents detection algorithms from reacting to spurious gradients, helping edge and contour detectors focus on genuine object boundaries rather than sensor noise.",
    },
  ],
  task5: [
    {
      q: "Explain the effect of increasing threshold values.",
      a: "As the threshold value increases, fewer pixels exceed it and are classified as white (foreground); more of the image is pushed toward black (background). Very high thresholds can erase legitimate foreground details, while very low thresholds let noise and background through as false foreground.",
    },
    {
      q: "Where is image thresholding used in industrial automation?",
      a: "Thresholding is widely used in automated visual inspection to segment parts from a conveyor belt background, enabling fast binary classification of defects, presence/absence checks, and dimensional measurement.",
    },
  ],
  task6: [
    {
      q: "What is an edge?",
      a: "An edge is a location in an image where pixel intensity changes sharply, typically marking the boundary between two distinct regions or objects.",
    },
    {
      q: "Why is edge detection important in robotic vision systems?",
      a: "Edge detection extracts the structural outline of objects independent of color or lighting variation, which robots use for shape recognition, obstacle boundary identification, and precise grasp-point localization.",
    },
  ],
};

function QABlock({ items }: { items: { q: string; a: string }[] }) {
  return (
    <div className="mt-4 space-y-3 border-t border-[#27272A] pt-4">
      {items.map((item, i) => (
        <div key={i} className="text-xs">
          <p className="font-bold text-[#FAFAFA] mb-1">
            {String.fromCharCode(97 + i)}) {item.q}
          </p>
          <p className="text-[#A1A1AA] leading-relaxed">{item.a}</p>
        </div>
      ))}
    </div>
  );
}

export default function Assignment1() {
  const [file, setFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState("image.jpg");
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [courseName, setCourseName] = useState("Intelligent Control and Robotics");
  const [regNumber, setRegNumber] = useState("");

  const [task1, setTask1] = useState<any>(null);
  const [task2, setTask2] = useState<any>(null);
  const [task3, setTask3] = useState<any>(null);
  const [task4, setTask4] = useState<any>(null);
  const [task5, setTask5] = useState<any>(null);
  const [task6, setTask6] = useState<any>(null);

  const [cropParams, setCropParams] = useState({ x: "50", y: "50", w: "200", h: "200" });
  const [blurKernel, setBlurKernel] = useState("15");
  const [cannyLower, setCannyLower] = useState("100");
  const [cannyUpper, setCannyUpper] = useState("200");

  async function runTask(taskName: string, endpoint: string, setter: (d: any) => void, extra?: Record<string, string>) {
    if (!file) return;
    setLoading(taskName);
    setError(null);
    try {
      const [data] = await Promise.all([
        postImage(endpoint, file, extra),
        delay(MIN_LOADING_MS),
      ]);
      setter(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  async function runAll() {
    if (!file) return;
    setLoading("all");
    setError(null);
    try {
      const [results] = await Promise.all([
        Promise.all([
          postImage("/api/task1", file),
          postImage("/api/task2", file),
          postImage("/api/task3", file, cropParams),
          postImage("/api/task4", file, { kernel: blurKernel }),
          postImage("/api/task5", file),
          postImage("/api/task6", file, { lower: cannyLower, upper: cannyUpper }),
        ]),
        delay(MIN_LOADING_MS),
      ]);
      const [d1, d2, d3, d4, d5, d6] = results;
      setTask1(d1); setTask2(d2); setTask3(d3);
      setTask4(d4); setTask5(d5); setTask6(d6);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(null);
    }
  }

  const isLoading = loading !== null;

  const task1Code = `import cv2
import matplotlib.pyplot as plt

# Load the image
image = cv2.imread("${fileName}")
print(f"Dimensions: {image.shape[1]} x {image.shape[0]}")

# Convert to Grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Convert BGR to RGB for display
rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

# Display all three
plt.figure(figsize=(12, 4))

plt.subplot(1, 3, 1)
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.title("Original (BGR)")

plt.subplot(1, 3, 2)
plt.imshow(gray, cmap="gray")
plt.title("Grayscale")

plt.subplot(1, 3, 3)
plt.imshow(rgb)
plt.title("RGB Converted")

plt.tight_layout()
plt.show()`;

  const task2Code = `import cv2

image = cv2.imread("${fileName}")

# Resize to different dimensions
sizes = [200, 100, 50]

for size in sizes:
    resized = cv2.resize(image, (size, size),
                         interpolation=cv2.INTER_AREA)
    cv2.imshow(f"Resized {size}x{size}", resized)

cv2.waitKey(0)
cv2.destroyAllWindows()`;

  const task3Code = `import cv2

image = cv2.imread("${fileName}")

# Define Region of Interest (ROI)
x, y, w, h = ${cropParams.x}, ${cropParams.y}, ${cropParams.w}, ${cropParams.h}

# Crop using NumPy slicing
cropped_image = image[${cropParams.y}:${cropParams.y}+${cropParams.h}, ${cropParams.x}:${cropParams.x}+${cropParams.w}]

cv2.imshow("Original", image)
cv2.imshow("Cropped ROI", cropped_image)
cv2.waitKey(0)
cv2.destroyAllWindows()`;

  const task4Code = `import cv2

image = cv2.imread("${fileName}")

# Apply Gaussian Blur
kernel_size = (${blurKernel}, ${blurKernel})
blurred = cv2.GaussianBlur(image, kernel_size, 0)

cv2.imshow("Original", image)
cv2.imshow("Gaussian Blur", blurred)
cv2.waitKey(0)
cv2.destroyAllWindows()`;

  const task5Code = `import cv2

image = cv2.imread("${fileName}")
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply thresholding at different values
thresholds = [50, 100, 150]

for thresh_val in thresholds:
    ret, binary = cv2.threshold(
        gray, thresh_val, 255,
        cv2.THRESH_BINARY
    )
    cv2.imshow(f"Threshold={thresh_val}", binary)

cv2.waitKey(0)
cv2.destroyAllWindows()`;

  const task6Code = `import cv2

image = cv2.imread("${fileName}")
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply Canny Edge Detection
edges = cv2.Canny(gray, ${cannyLower}, ${cannyUpper})

cv2.imshow("Original", image)
cv2.imshow("Edge Detection", edges)
cv2.waitKey(0)
cv2.destroyAllWindows()`;

  const codeSections = [
    { title: "Task 1: Read and Display an Image", code: task1Code },
    { title: "Task 2: Image Resizing", code: task2Code },
    { title: "Task 3: Image Cropping", code: task3Code },
    { title: "Task 4: Image Blurring", code: task4Code },
    { title: "Task 5: Image Binarization (Thresholding)", code: task5Code },
    { title: "Task 6: Edge Detection", code: task6Code },
  ];

  const baseName = (studentName || "student").trim().toLowerCase().replace(/\s+/g, "_");

  function handleDownloadPy() {
    downloadPythonScript(`${baseName}_opencv_assignment.py`, codeSections);
  }
  function handleDownloadIpynb() {
    downloadNotebook(`${baseName}_opencv_assignment.ipynb`, codeSections);
  }

  const allTasksRun = task1 && task2 && task3 && task4 && task5 && task6;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-bold tracking-wide uppercase text-[#FAFAFA]">Assignment 1: Introduction to OpenCV</h1>
        <p className="text-[#A1A1AA] text-xs tracking-widest uppercase mt-2">Basic Image Processing</p>
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
          setTask1(null); setTask2(null); setTask3(null);
          setTask4(null); setTask5(null); setTask6(null);
          setError(null);
        }} label="Select an image to process" filter="general" />
        {file && (
          <button
            onClick={runAll}
            disabled={isLoading}
            className="w-full bg-[#FAFAFA] text-[#09090B] py-3 rounded text-xs font-bold tracking-widest uppercase hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          >
            {loading === "all" ? "Processing All Tasks..." : "Run All Tasks"}
          </button>
        )}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded text-xs font-mono">
            {error}
          </div>
        )}
      </div>

      {/* Task 1 */}
      <TaskCard title="Task 1: Read and Display an Image">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {filePreview && !task1 && loading !== "task1" && loading !== "all" && (
              <>
                <div className="space-y-2">
                  <p className="text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA] text-center">Selected Image</p>
                  <div className="bg-[#09090B] border border-[#27272A] rounded p-1.5">
                    <img src={filePreview} alt="Selected" className="max-w-full h-auto mx-auto rounded" />
                  </div>
                </div>
                <button onClick={() => runTask("task1", "/api/task1", setTask1)} disabled={!file || isLoading}
                  className="bg-[#FAFAFA] text-[#09090B] px-5 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white disabled:opacity-30 transition-all">
                  Run Task 1
                </button>
              </>
            )}
            {!filePreview && !task1 && (
              <p className="text-xs text-[#A1A1AA]/60">Select an image above to display it here.</p>
            )}
            <LoadingOverlay active={loading === "task1" || (!task1 && loading === "all")} label="Reading & converting image" />
            {task1 && loading !== "task1" && (
              <>
                <p className="text-xs text-[#A1A1AA] font-mono">
                  Dimensions: {task1.dimensions.width} x {task1.dimensions.height}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <ImageDisplay src={task1.original} label="Original (BGR)" />
                  <ImageDisplay src={task1.grayscale} label="Grayscale" />
                  <ImageDisplay src={task1.rgb} label="RGB Converted" />
                </div>
              </>
            )}
            <QABlock items={QA.task1} />
          </div>
          <CodeBlock code={task1Code} running={loading === "task1" || (!task1 && loading === "all")} />
        </div>
      </TaskCard>

      {/* Task 2 */}
      <TaskCard title="Task 2: Image Resizing">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {!task2 && loading !== "task2" && loading !== "all" && (
              <button onClick={() => runTask("task2", "/api/task2", setTask2)} disabled={!file || isLoading}
                className="bg-[#FAFAFA] text-[#09090B] px-5 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white disabled:opacity-30 transition-all">
                Run Task 2
              </button>
            )}
            <LoadingOverlay active={loading === "task2" || (!task2 && loading === "all")} label="Resizing image" />
            {task2 && loading !== "task2" && (
              <div className="grid grid-cols-4 gap-3 items-end">
                <ImageDisplay src={task2.original} label="Original" />
                <ImageDisplay src={task2.resized["200x200"]} label="200 x 200" />
                <ImageDisplay src={task2.resized["100x100"]} label="100 x 100" />
                <ImageDisplay src={task2.resized["50x50"]} label="50 x 50" />
              </div>
            )}
            <QABlock items={QA.task2} />
          </div>
          <CodeBlock code={task2Code} running={loading === "task2" || (!task2 && loading === "all")} />
        </div>
      </TaskCard>

      {/* Task 3 */}
      <TaskCard title="Task 3: Image Cropping">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-4 gap-3">
              {(["x", "y", "w", "h"] as const).map((key) => (
                <div key={key}>
                  <label className="block text-[10px] font-mono tracking-widest text-[#A1A1AA] mb-1 uppercase">{key}</label>
                  <input type="number" value={cropParams[key]}
                    onChange={(e) => setCropParams({ ...cropParams, [key]: e.target.value })}
                    className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
                </div>
              ))}
            </div>
            {!task3 && loading !== "task3" && loading !== "all" && (
              <button onClick={() => runTask("task3", "/api/task3", setTask3, cropParams)} disabled={!file || isLoading}
                className="bg-[#FAFAFA] text-[#09090B] px-5 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white disabled:opacity-30 transition-all">
                Run Task 3
              </button>
            )}
            <LoadingOverlay active={loading === "task3" || (!task3 && loading === "all")} label="Cropping image" />
            {task3 && loading !== "task3" && (
              <div className="grid grid-cols-2 gap-3">
                <ImageDisplay src={task3.original} label="Original" />
                <ImageDisplay src={task3.cropped} label="Cropped ROI" />
              </div>
            )}
            <QABlock items={QA.task3} />
          </div>
          <CodeBlock code={task3Code} running={loading === "task3" || (!task3 && loading === "all")} />
        </div>
      </TaskCard>

      {/* Task 4 */}
      <TaskCard title="Task 4: Image Blurring">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="max-w-xs">
              <label className="block text-xs font-medium text-gray-500 mb-1">Kernel Size (odd number)</label>
              <input type="number" value={blurKernel} onChange={(e) => setBlurKernel(e.target.value)}
                step={2} min={1}
                className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
            </div>
            {!task4 && loading !== "task4" && loading !== "all" && (
              <button onClick={() => runTask("task4", "/api/task4", setTask4, { kernel: blurKernel })} disabled={!file || isLoading}
                className="bg-[#FAFAFA] text-[#09090B] px-5 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white disabled:opacity-30 transition-all">
                Run Task 4
              </button>
            )}
            <LoadingOverlay active={loading === "task4" || (!task4 && loading === "all")} label="Applying Gaussian blur" />
            {task4 && loading !== "task4" && (
              <div className="grid grid-cols-2 gap-3">
                <ImageDisplay src={task4.original} label="Original" />
                <ImageDisplay src={task4.blurred} label={`Blurred (kernel: ${blurKernel})`} />
              </div>
            )}
            <QABlock items={QA.task4} />
          </div>
          <CodeBlock code={task4Code} running={loading === "task4" || (!task4 && loading === "all")} />
        </div>
      </TaskCard>

      {/* Task 5 */}
      <TaskCard title="Task 5: Image Binarization (Thresholding)">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {!task5 && loading !== "task5" && loading !== "all" && (
              <button onClick={() => runTask("task5", "/api/task5", setTask5)} disabled={!file || isLoading}
                className="bg-[#FAFAFA] text-[#09090B] px-5 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white disabled:opacity-30 transition-all">
                Run Task 5
              </button>
            )}
            <LoadingOverlay active={loading === "task5" || (!task5 && loading === "all")} label="Applying thresholding" />
            {task5 && loading !== "task5" && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <ImageDisplay src={task5.original} label="Original" />
                  <ImageDisplay src={task5.grayscale} label="Grayscale" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <ImageDisplay src={task5.thresholds["50"]} label="Threshold = 50" />
                  <ImageDisplay src={task5.thresholds["100"]} label="Threshold = 100" />
                  <ImageDisplay src={task5.thresholds["150"]} label="Threshold = 150" />
                </div>
              </>
            )}
            <QABlock items={QA.task5} />
          </div>
          <CodeBlock code={task5Code} running={loading === "task5" || (!task5 && loading === "all")} />
        </div>
      </TaskCard>

      {/* Task 6 */}
      <TaskCard title="Task 6: Edge Detection">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 max-w-md">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Lower Threshold</label>
                <input type="number" value={cannyLower} onChange={(e) => setCannyLower(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Upper Threshold</label>
                <input type="number" value={cannyUpper} onChange={(e) => setCannyUpper(e.target.value)}
                  className="w-full bg-[#09090B] border border-[#27272A] rounded px-3 py-2 text-sm text-[#FAFAFA] focus:outline-none focus:border-[#A1A1AA] transition-colors" />
              </div>
            </div>
            {!task6 && loading !== "task6" && loading !== "all" && (
              <button onClick={() => runTask("task6", "/api/task6", setTask6, { lower: cannyLower, upper: cannyUpper })} disabled={!file || isLoading}
                className="bg-[#FAFAFA] text-[#09090B] px-5 py-2 rounded text-xs font-bold tracking-wide uppercase hover:bg-white disabled:opacity-30 transition-all">
                Run Task 6
              </button>
            )}
            <LoadingOverlay active={loading === "task6" || (!task6 && loading === "all")} label="Detecting edges" />
            {task6 && loading !== "task6" && (
              <div className="grid grid-cols-2 gap-3">
                <ImageDisplay src={task6.original} label="Original" />
                <ImageDisplay src={task6.edges} label="Canny Edge Detection" />
              </div>
            )}
            <QABlock items={QA.task6} />
          </div>
          <CodeBlock code={task6Code} running={loading === "task6" || (!task6 && loading === "all")} />
        </div>
      </TaskCard>

      {/* Task 7: Comparative Analysis */}
      <TaskCard title="Task 7: Comparative Analysis">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#09090B]">
                <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">Operation</th>
                <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">Purpose</th>
                <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">Advantages</th>
                <th className="border border-[#27272A] px-4 py-3 text-left text-[10px] font-mono tracking-widest uppercase text-[#A1A1AA]">Limitations</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-[#27272A] px-4 py-3 text-xs font-bold text-[#FAFAFA]">Grayscale</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Reduces color channels to single intensity channel for simpler processing</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Reduces computational complexity; simplifies analysis</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Loses color information which may be critical for some tasks</td>
              </tr>
              <tr className="bg-[#09090B]/50">
                <td className="border border-[#27272A] px-4 py-3 text-xs font-bold text-[#FAFAFA]">Resize</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Changes image dimensions for standardization or performance</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Faster processing; consistent input size for ML models</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Downscaling causes loss of detail and fine features</td>
              </tr>
              <tr>
                <td className="border border-[#27272A] px-4 py-3 text-xs font-bold text-[#FAFAFA]">Crop</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Extracts region of interest (ROI) from image</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Focuses on relevant area; removes distracting background</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Requires knowing ROI location; discards context</td>
              </tr>
              <tr className="bg-[#09090B]/50">
                <td className="border border-[#27272A] px-4 py-3 text-xs font-bold text-[#FAFAFA]">Blur</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Smooths image to reduce noise and fine details</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Effective noise reduction; improves downstream detection</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Blurs edges; may remove important small features</td>
              </tr>
              <tr>
                <td className="border border-[#27272A] px-4 py-3 text-xs font-bold text-[#FAFAFA]">Thresholding</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Converts grayscale to binary for segmentation</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Simple and fast; effective for high-contrast images</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Sensitive to threshold choice; poor on uneven lighting</td>
              </tr>
              <tr className="bg-[#09090B]/50">
                <td className="border border-[#27272A] px-4 py-3 text-xs font-bold text-[#FAFAFA]">Edge Detection</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Identifies object boundaries using gradient changes</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Highlights shape and structure; useful for object detection</td>
                <td className="border border-[#27272A] px-4 py-3 text-xs text-[#A1A1AA]">Sensitive to noise; requires threshold tuning</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TaskCard>

      {/* Task 8: Discussion */}
      <TaskCard title="Task 8: Robotics Application Discussion">
        <div className="prose prose-sm max-w-none space-y-4">
          <h3 className="text-sm font-bold tracking-wide text-[#FAFAFA]">1. Mobile Robots</h3>
          <p className="text-[#A1A1AA] text-xs leading-relaxed">
            Mobile robots use grayscale conversion and edge detection for obstacle avoidance and path planning.
            Image resizing enables real-time processing on embedded systems with limited computational power.
            For example, a warehouse robot uses cropping to focus on QR codes for navigation waypoints.
          </p>
          <h3 className="text-sm font-bold tracking-wide text-[#FAFAFA]">2. Autonomous Vehicles</h3>
          <p className="text-[#A1A1AA] text-xs leading-relaxed">
            Autonomous vehicles rely heavily on edge detection for lane detection and road boundary identification.
            Thresholding is used to segment traffic signs from complex backgrounds, while blurring reduces sensor
            noise from cameras operating in varying lighting conditions.
          </p>
          <h3 className="text-sm font-bold tracking-wide text-[#FAFAFA]">3. Industrial Robotic Inspection</h3>
          <p className="text-[#A1A1AA] text-xs leading-relaxed">
            In quality control, thresholding and edge detection identify surface defects on manufactured parts.
            Image cropping isolates inspection zones on assembly lines, and resizing standardizes images for
            automated defect classification systems.
          </p>
          <h3 className="text-sm font-bold tracking-wide text-[#FAFAFA]">4. Object Recognition Systems</h3>
          <p className="text-[#A1A1AA] text-xs leading-relaxed">
            Object recognition pipelines begin with grayscale conversion to reduce dimensionality, followed by
            blurring to suppress noise. Edge detection extracts shape features, and resizing normalizes inputs
            for neural network classifiers used in pick-and-place robotic systems.
          </p>
          <h3 className="text-sm font-bold tracking-wide text-[#FAFAFA]">5. Intelligent Control Systems</h3>
          <p className="text-[#A1A1AA] text-xs leading-relaxed">
            Intelligent control systems integrate visual feedback from cameras for closed-loop control.
            Image preprocessing (grayscale, threshold, edge detection) enables real-time feature extraction
            for visual servoing, where a robot arm adjusts its position based on camera feedback to precisely
            grasp objects.
          </p>
        </div>
      </TaskCard>

      {/* ───────────── REPORT ───────────── */}
      <div className="pt-4">
        <h2 className="text-sm font-bold tracking-wide uppercase text-[#FAFAFA] mb-4">Report</h2>

        {!allTasksRun ? (
          <div className="bg-[#18181B] border border-[#27272A] rounded-lg p-10 text-center space-y-2">
            <p className="text-xs font-mono tracking-widest uppercase text-[#A1A1AA]">Report Locked</p>
            <p className="text-xs text-[#A1A1AA]/60 max-w-md mx-auto">
              Run all 6 tasks above (use &ldquo;Run All Tasks&rdquo;) to unlock the compiled report. This ensures
              the report always reflects a complete, consistent run. Adjust your crop or parameters and re-run
              to see results change live.
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
            <h1 className="text-3xl font-bold">Assignment 1: Introduction to OpenCV</h1>
            <p className="text-sm text-gray-600">Basic Image Processing Using OpenCV</p>
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
              This report documents the implementation and results of six core image processing operations
              using Python and OpenCV: reading &amp; color-space conversion, resizing, cropping, blurring,
              thresholding, and edge detection. Each operation was applied to a single source image
              ({fileName}) using an interactive web tool, and the outputs, source code, and analysis are
              presented below exactly as produced.
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

          {/* Per-task report blocks */}
          {[
            { n: 1, title: "Task 1: Read and Display an Image", data: task1, code: task1Code, qa: QA.task1 },
            { n: 2, title: "Task 2: Image Resizing", data: task2, code: task2Code, qa: QA.task2 },
            { n: 3, title: "Task 3: Image Cropping", data: task3, code: task3Code, qa: QA.task3 },
            { n: 4, title: "Task 4: Image Blurring", data: task4, code: task4Code, qa: QA.task4 },
            { n: 5, title: "Task 5: Image Binarization (Thresholding)", data: task5, code: task5Code, qa: QA.task5 },
            { n: 6, title: "Task 6: Edge Detection", data: task6, code: task6Code, qa: QA.task6 },
          ].map(({ n, title, data, code, qa }) => (
            <section key={n}>
              <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">{title}</h2>
              {data ? (
                <>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {n === 1 && (
                      <>
                        <div><img src={`data:image/png;base64,${data.original}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Original</p></div>
                        <div><img src={`data:image/png;base64,${data.grayscale}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Grayscale</p></div>
                        <div><img src={`data:image/png;base64,${data.rgb}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">RGB</p></div>
                      </>
                    )}
                    {n === 2 && (
                      <>
                        <div><img src={`data:image/png;base64,${data.resized["200x200"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">200x200</p></div>
                        <div><img src={`data:image/png;base64,${data.resized["100x100"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">100x100</p></div>
                        <div><img src={`data:image/png;base64,${data.resized["50x50"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">50x50</p></div>
                      </>
                    )}
                    {n === 3 && (
                      <>
                        <div><img src={`data:image/png;base64,${data.original}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Original</p></div>
                        <div><img src={`data:image/png;base64,${data.cropped}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Cropped ROI</p></div>
                      </>
                    )}
                    {n === 4 && (
                      <>
                        <div><img src={`data:image/png;base64,${data.original}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Original</p></div>
                        <div><img src={`data:image/png;base64,${data.blurred}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Blurred</p></div>
                      </>
                    )}
                    {n === 5 && (
                      <>
                        <div><img src={`data:image/png;base64,${data.thresholds["50"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Threshold 50</p></div>
                        <div><img src={`data:image/png;base64,${data.thresholds["100"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Threshold 100</p></div>
                        <div><img src={`data:image/png;base64,${data.thresholds["150"]}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Threshold 150</p></div>
                      </>
                    )}
                    {n === 6 && (
                      <>
                        <div><img src={`data:image/png;base64,${data.original}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Original</p></div>
                        <div><img src={`data:image/png;base64,${data.edges}`} className="w-full rounded border border-gray-300" /><p className="text-[10px] text-gray-500 text-center mt-1">Edges</p></div>
                      </>
                    )}
                  </div>
                  <pre className="bg-gray-100 border border-gray-300 rounded p-3 text-[11px] overflow-x-auto"><code>{code}</code></pre>
                  <div className="mt-3 space-y-2">
                    {qa.map((item, i) => (
                      <div key={i} className="text-xs">
                        <p className="font-bold text-gray-900">{String.fromCharCode(97 + i)}) {item.q}</p>
                        <p className="text-gray-600 leading-relaxed">{item.a}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-xs text-gray-400 italic">Pending. Run this task above to include its results.</p>
              )}
            </section>
          ))}

          {/* Comparative Analysis */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Comparative Analysis</h2>
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-left">Operation</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Purpose</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Advantages</th>
                  <th className="border border-gray-300 px-3 py-2 text-left">Limitations</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold">Grayscale</td>
                  <td className="border border-gray-300 px-3 py-2">Reduces color channels to single intensity channel</td>
                  <td className="border border-gray-300 px-3 py-2">Reduces complexity; simplifies analysis</td>
                  <td className="border border-gray-300 px-3 py-2">Loses color information</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold">Resize</td>
                  <td className="border border-gray-300 px-3 py-2">Changes image dimensions</td>
                  <td className="border border-gray-300 px-3 py-2">Faster processing; consistent ML input size</td>
                  <td className="border border-gray-300 px-3 py-2">Loss of detail when downscaling</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold">Crop</td>
                  <td className="border border-gray-300 px-3 py-2">Extracts region of interest</td>
                  <td className="border border-gray-300 px-3 py-2">Focuses on relevant area</td>
                  <td className="border border-gray-300 px-3 py-2">Discards context outside ROI</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold">Blur</td>
                  <td className="border border-gray-300 px-3 py-2">Smooths noise and fine detail</td>
                  <td className="border border-gray-300 px-3 py-2">Effective noise reduction</td>
                  <td className="border border-gray-300 px-3 py-2">May remove small features</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold">Thresholding</td>
                  <td className="border border-gray-300 px-3 py-2">Converts grayscale to binary</td>
                  <td className="border border-gray-300 px-3 py-2">Simple, fast segmentation</td>
                  <td className="border border-gray-300 px-3 py-2">Sensitive to lighting/threshold choice</td>
                </tr>
                <tr>
                  <td className="border border-gray-300 px-3 py-2 font-bold">Edge Detection</td>
                  <td className="border border-gray-300 px-3 py-2">Identifies object boundaries</td>
                  <td className="border border-gray-300 px-3 py-2">Highlights shape/structure</td>
                  <td className="border border-gray-300 px-3 py-2">Sensitive to noise</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Discussion */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Robotics Application Discussion</h2>
            <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
              <p><strong>1. Mobile Robots:</strong> Grayscale conversion and edge detection support obstacle avoidance and path planning; resizing enables real-time processing on embedded hardware.</p>
              <p><strong>2. Autonomous Vehicles:</strong> Edge detection supports lane detection; thresholding segments traffic signs; blurring reduces sensor noise.</p>
              <p><strong>3. Industrial Robotic Inspection:</strong> Thresholding and edge detection identify surface defects; cropping isolates inspection zones.</p>
              <p><strong>4. Object Recognition Systems:</strong> Grayscale + blur + edge detection form the preprocessing pipeline feeding classifiers in pick-and-place systems.</p>
              <p><strong>5. Intelligent Control Systems:</strong> Real-time preprocessing enables visual servoing, where a robot arm adjusts position from camera feedback.</p>
            </div>
          </section>

          {/* Conclusion */}
          <section>
            <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-3">Conclusion</h2>
            <p className="text-sm leading-relaxed text-gray-700">
              This assignment demonstrated six fundamental OpenCV image processing operations, each contributing
              a distinct capability to a robotic vision pipeline: color-space handling and display, resizing for
              computational efficiency, cropping for region isolation, blurring for noise suppression, thresholding
              for segmentation, and edge detection for structural feature extraction. Together these operations
              form the preprocessing foundation that more advanced robotic perception systems (object recognition,
              autonomous navigation, and industrial inspection) build upon.
            </p>
          </section>
        </div>
        </>
        )}
      </div>
    </div>
  );
}
