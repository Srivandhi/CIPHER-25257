# Control Layer Overview

This document details the **Control Layer** of the Cybercrime Predictive Dashboard. The control layer manages data flow, business logic execution, and communication between the frontend interface and the backend database/AI models.

## 1. Backend Control Layer (`backend/main.py`)
**Framework**: FastAPI (Python)
**Role**: Central orchestration of API requests, data processing, and response formatting.

### Key Components

*   **API App Initialization**:
    *   Initializes the FastAPI application (`app`).
    *   Configures **CORS Middleware** to allow secure communication with the React Frontend running on `localhost:5173`.

*   **Data Models (Pydantic)**:
    *   `Complaint`: Validates incoming complaint data structure (Schema Enforcement).
    *   `ATMRisk`: Defines the structure of the predictive response object.

### Key Endpoints (Controllers)

| Endpoint | Method | Functionality |
| :--- | :--- | :--- |
| `/api/complaints` | `GET` | **Fetch All**: Retrieves all active complaints from the live database (`cipher.db`). |
| `/api/complaints` | `POST` | **Create**: Registers a new complaint into the system. |
| `/api/complaints/atm-hotspots` | `POST` | **Predict & Analyze**: The core intelligence controller.<br>1. Receives a complaint.<br>2. Saves it to DB.<br>3. Invokes `predict_atm_risk`.<br>4. Returns Top 50 risky ATMs. |
| `/api/history` | `GET` | **Fetch History**: Retrieves archived/resolved complaints from the `history.db`. |

---

## 2. Logic Controller (`predict.py`)
**Role**: Encapsulates the specific business logic for AI/ML operations, keeping the API layer clean.

### Core Function: `predict_atm_risk(complaint)`
1.  **Data Loading**: Fetches the master list of ATMs from the database.
2.  **Feature Engineering**:
    *   Calculates `victim_atm_distance_km`.
    *   Encodes categorical variables (e.g., `fraud_type`, `bank_name`) using the pre-trained encoders.
3.  **Model Inference**: Runs the Random Forest model (`cipher_ranker_bundle.pkl`) to generate raw risk scores.
4.  **Risk Classification**:
    *   Normalizes scores (0-1).
    *   Applies **Hybrid Ranking Logic**:
        *   Top 1-5: **Very Critical**
        *   Top 6-10: **Critical**
        *   Top 11-15: **High**
        *   Top 16-20: **Medium**
        *   Top 21-25: **Low** (but relevant)

---

## 3. Frontend Control Layer (`src/services/apiService.js`)
**Framework**: JavaScript (Axios/Fetch)
**Role**: Manages all outbound network requests from the UI to the Backend.

### Key Functions

*   `fetchAtmHotspotsForComplaint(complaint)`:
    *   **Trigger**: User clicks "Action" on a complaint.
    *   **Activity**: POSTs complaint data to the prediction endpoint.
    *   **Result**: Returns the list of high-risk ATMs to populate the Map and Alerts sections.

*   `fetchAllComplaints()`:
    *   **Trigger**: Dashboard load.
    *   **Activity**: GETs current active cases to populate the sidebar list.

*   `fetchHistoryComplaints()`:
    *   **Trigger**: User toggles to "History" view.
    *   **Activity**: GETs resolved cases from the history endpoint.

---

## Summary of Data Flow
1.  **User Action**: Clicks "Analyze" on dashboard -> **Frontend Controller** (`apiService.js`) sends POST request.
2.  **API Routing**: **Backend Controller** (`main.py`) receives request at `/api/complaints/atm-hotspots`.
3.  **Processing**: Calls **Logic Controller** (`predict.py`) -> Loads Data -> Runs AI Model.
4.  **Response**: JSON data with Top 50 ATMs returned to Frontend.
5.  **Display**: Frontend maps the data to visual components (`MapDisplay`, `AlertsSection`).
