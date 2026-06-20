# VeriMed - AI-Powered Counterfeit Medicine Intelligence Ecosystem

VeriMed is a premium health-security monorepo featuring a FastAPI backend and a fully responsive Vite React Web + Mobile Dashboard. The ecosystem is designed to assist pharmacists and patients in verifying drug packaging integrity and serialization signatures (India DCGI regulations), even under offline conditions.

## Project Structure

```
verimed/
├── backend/                  # FastAPI backend API
│   ├── app/
│   │   ├── main.py                   # App initialization & lifespan triggers
│   │   ├── config.py                 # Core configurations & thresholds
│   │   ├── db.py                     # Database AsyncSession configurations
│   │   ├── models.py                 # 12 SQLAlchemy database schemas
│   │   ├── schemas.py                # Pydantic schemas for network IO
│   │   ├── routers/                  # Segmented REST routes (CV, QR, Anomalies, Sync, News)
│   │   ├── services/                 # Simulated ML, QR crypto, and Risk Engines
│   │   └── seed/                     # Seeding modules (50 Genuine + 50 Counterfeit)
│   ├── requirements.txt              # Backend dependencies
│   └── docker-compose.yml            # Multi-container orchestration (API + PG + Redis)
└── web/                      # [Pivoted] Vite React Web + Mobile Responsive SPA
    ├── src/
    │   ├── components/               # Reusable Glassmorphism widgets (radial gauge, map)
    │   ├── pages/                    # Views (Dashboard, Scanner, Risk radar, Alerts, Sync)
    │   ├── lib/                      # Zustand state store context & API client
    │   └── App.tsx                   # Page aggregator shell
    ├── index.html
    └── package.json
```

---

## Running the Ecosystem

### 1. Start the Backend Server (Terminal 1)
Navigate to the backend directory, install Python dependencies, and run the service:
```powershell
cd "C:\Users\agarw\.gemini\antigravity\scratch\verimed\backend"
pip install -r requirements.txt
python -m uvicorn app.main:app --reload
```
- Access Swagger docs at: `http://localhost:8000/docs`

---

### 2. Start the React Web Client (Terminal 2)
Navigate to the web directory and run the dev server:
```powershell
cd "C:\Users\agarw\.gemini\antigravity\scratch\verimed\web"
npm run dev
```
- Metro will start the server and open **`http://localhost:3000`** in your browser.
- *Tip: Resize your browser window to simulate mobile layout bottom tab bar navigation!*

---

## Walkthrough Guide

Use this step-by-step test script to evaluate the ecosystem features:

1. **Dashboard Controls**:
   - See the dynamic counts (total scans & counterfeits blocked) and the regional risk cards.
   - Note the glowing **Online** indicator at the bottom left.
2. **Verify Packaging (Image Scan)**:
   - Go to the **Scanner** tab.
   - Click **Simulate Genuine** -> see the analysis screen process packaging alignment, text kerning, and color gamut parameters.
   - Review the radial gauge and metrics confirming *Verified Authentic*.
   - Return to Scan and click **Simulate Suspect** -> see the analysis flag layout anomalies.
   - Tap **File suspicious product report** to pre-fill a regulatory investigation report.
3. **Scan QR Code**:
   - Change the segment to **QR Cryptography Check**.
   - Tap **Simulate Genuine** to parse valid serialization codes.
   - Tap **Simulate Suspect** to test a signature verify failure. Note the custom batch status indicators (*Recalled*).
4. **Geopolitical Risk Map**:
   - Navigate to the **Risk Radar** tab -> view the geopolitical radar hotspots.
   - Tap any hotspot (e.g. *Sub-Saharan Africa*) to slide up the glass drawer showing real-time threat indices, counterfeit counts, and dominant anomaly flags.
5. **Offline-First Synchronization**:
   - Go to the **Operator** tab.
   - Toggle **Simulate Online Connection** to **OFF** -> note the dashboard indicator changes to *Offline Mirror*.
   - Run another scan in the Scanner tab -> view the result processed against local localStorage cache files.
   - Open the **Sync Center** -> note the outbox indicates `1 Queue Item`.
   - Toggle **Online Connection** to **ON** in Settings -> return to Sync Center -> tap **Execute Complete Sync**. The outbox drains, uploads logs, and pulls updated batch records from the server!
