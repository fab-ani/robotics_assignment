# Robotics Assignment Web App

Interactive web application for two university robotics assignments:

- **Assignment 1** – OpenCV image processing (read, resize, crop, blur, threshold, edge detection)
- **Assignment 2** – OCR Vision System with Tesseract (ROI selection, preprocessing, text extraction, accuracy evaluation)

**Stack:** Next.js 15 (frontend) + Flask (backend)

---

## Local Development

### Prerequisites

- Node.js 18+
- Python 3.10+
- [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) (Windows installer) or `sudo apt install tesseract-ocr` (Linux/Mac)

### Backend

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# Mac / Linux
source venv/bin/activate

pip install -r requirements.txt
python app.py
```

Server starts at `http://localhost:5000`. Verify with `http://localhost:5000/api/health`.

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # already points to http://localhost:5000
npm run dev
```

App opens at `http://localhost:3000`.

---

## Deployment

### Backend on Railway

1. Push this repo to GitHub.
2. Create a new Railway project and connect the GitHub repo.
3. Set the **Root Directory** to `backend`.
4. Railway auto-detects `nixpacks.toml` and installs `tesseract-ocr` as a system package.
5. The `Procfile` starts gunicorn automatically.
6. Add the environment variable:
   ```
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```
7. Copy the Railway service URL (e.g. `https://robotics-backend.up.railway.app`).

### Frontend on Vercel

1. Import the GitHub repo into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Add the environment variable:
   ```
   NEXT_PUBLIC_API_URL=https://robotics-backend.up.railway.app
   ```
4. Deploy. Vercel handles the Next.js build automatically.

---

## Environment Variables

| Location | Variable | Description |
|---|---|---|
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | Flask backend base URL |
| Railway (backend) | `FRONTEND_URL` | Comma-separated allowed origins for CORS |
| Railway (backend) | `FLASK_DEBUG` | Set `true` only in dev |

---

## Project Structure

```
robotics_assignment/
├── backend/
│   ├── app.py              # Flask API (OpenCV + Tesseract endpoints)
│   ├── requirements.txt
│   ├── Procfile            # Railway process definition
│   ├── nixpacks.toml       # System packages (tesseract-ocr)
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx            # Home page
│   │   │   ├── assignment1/page.tsx
│   │   │   └── assignment2/page.tsx
│   │   ├── components/
│   │   │   ├── AssetPicker.tsx
│   │   │   ├── BoundingBoxCropper.tsx
│   │   │   ├── CodeBlock.tsx
│   │   │   ├── LoadingOverlay.tsx
│   │   │   └── TaskCard.tsx
│   │   └── lib/
│   │       ├── api.ts
│   │       └── exportCode.ts
│   ├── public/assets/      # Bundled images + college logo
│   ├── .env.example
│   └── package.json
└── README.md
```

---

Prepared by Fabian H. Mbona
