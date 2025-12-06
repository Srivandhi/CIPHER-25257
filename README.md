
---

````markdown
# 🛡️ CIPHER: Cybercrime Predictive Dashboard  

[![GitHub Repo](https://img.shields.io/badge/GitHub-Repo-blue?logo=github)](https://github.com/YUVAN0907/CIPHER/)
[![Python](https://img.shields.io/badge/Python-3.11+-yellow?logo=python)]()
[![React](https://img.shields.io/badge/Frontend-React.js-blue?logo=react)]()
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI-green?logo=fastapi)]()
[![License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-blue?logo=postgresql)]()

---

### 🚀 Overview  
**CIPHER** (Cybercrime Predictive Dashboard) is an **AI-powered solution** that transforms cybercrime management from **reactive** to **proactive**.  
It predicts **cash withdrawal/fraud hotspots**, issues **real-time alerts**, and helps **Law Enforcement Agencies (LEAs)** and **banks** take **preventive actions** before crimes occur.  

Built on the **F.A.R.M Stack** – FastAPI ⚙️ + React 🌐 + Scikit-learn 🤖 + PostgreSQL 🗃️ + Leaflet 🗺️.

---

## ✨ Key Features  

✅ **Predictive Hotspot Mapping** – Forecasts high-risk zones for cyber fraud or ATM withdrawals.  
⚡ **Real-Time Alerts** – Uses WebSockets for instant, zero-latency notifications.  
🧠 **Hybrid Intelligence Engine** – Combines live complaint trends with predictive analytics.  
🌍 **Multilingual NLP Support** – Analyzes text in multiple languages for broader coverage.  
👮 **LEA Action Dashboard** – Interactive heatmap for visual analysis and decision-making.  

---

## 🧱 System Architecture  

```mermaid
graph TD;
    A[Frontend (React + Leaflet)] --> B[Backend (FastAPI)];
    B --> C[Machine Learning Model (Scikit-learn)];
    B --> D[Database (PostgreSQL)];
    B --> E[WebSocket Layer (Real-time Alerts)];
    D --> F[Risk Heatmap Dashboard];
````

---

## ⚙️ Technology Stack

| Layer                | Component     | Technology                   |
| -------------------- | ------------- | ---------------------------- |
| **Backend/API**      | Framework     | FastAPI, Uvicorn             |
| **Machine Learning** | Model         | Scikit-learn, Pandas, Joblib |
| **Frontend/UI**      | Library       | React.js, Vite               |
| **Database/ORM**     | Storage       | PostgreSQL, SQLAlchemy       |
| **Mapping**          | Visualization | Leaflet / React-Leaflet      |
| **Real-Time**        | Communication | FastAPI WebSockets           |

---

<details>
<summary>📦 <b>Setup & Installation</b> (Click to Expand)</summary>

### 🔧 Prerequisites

* Python 3.11+
* Node.js & npm
* PostgreSQL (configured and running)

### 🖥️ Backend Setup

```bash
pip install -r requirements.txt
python init_db.py
python load_data.py
python ml_pipeline.py
uvicorn app.main:app --reload
```

### 💻 Frontend Setup

```bash
npm install
npm run dev
```

### ⚡ Trigger Data Processing

```bash
curl -X POST http://127.0.0.1:8000/api/process-complaints
```

Access the dashboard at 👉 `http://localhost:5173`

</details>

---

## 📂 Project Structure

```
CIPHER/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── database.py
│   │   ├── utils.py
│   ├── init_db.py
│   ├── load_data.py
│   ├── ml_pipeline.py
│   └── model/
│       └── text_risk_predictor.pkl
├── frontend/
│   └── src/
└── cybercrime_multilingual_dataset_2000_rows.csv
```

---

## 🔗 API Endpoints

| Method | Endpoint                  | Description                    |
| ------ | ------------------------- | ------------------------------ |
| `POST` | `/api/process-complaints` | Processes and generates alerts |
| `GET`  | `/api/alerts`             | Fetch current alerts           |
| `WS`   | `/ws/alerts`              | Real-time alert stream         |

📘 Visit `http://127.0.0.1:8000/docs` for Swagger API Documentation.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository
2. Create your branch (`feature/your-feature`)
3. Commit & push your changes
4. Open a Pull Request

---


### 🧠 Inspiration

Built with ❤️ for proactive **cybercrime prediction, prevention, and national cybersecurity enhancement**.

> “The best way to fight cybercrime is to predict it before it happens.” ⚔️

---

```

---
