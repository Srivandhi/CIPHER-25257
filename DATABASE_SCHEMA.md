# Database Schema Documentation

This document outlines the database architecture for the Cybercrime Predictive Dashboard. The system utilizes two separate SQLite databases to optimize performance and separate live operational data from historical records.

## 1. Main Database (`cipher.db`)
**Purpose**: Stores live data, including active complaints, ATM reference data, and training associations. Used for real-time dashboard display and risk analysis.

### Table: `atms`
Stores the master list of suspected ATM locations used for hotspot mapping and proximity analysis.

| Column | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | **PRIMARY KEY** | Internal database ID (Auto-increment). |
| `suspected_atm_index` | Integer | Unique Index | The original ID from the source CSV dataset. |
| `suspected_atm_lat` | Float | | Latitude of the ATM. |
| `suspected_atm_lon` | Float | | Longitude of the ATM. |
| `suspected_atm_place` | String | | Description of the ATM location/address. |
| `suspected_atm_name` | String | | Name of the ATM/Bank. |
| `atm_total_complaints`| Integer | | Historical count of complaints associated with this ATM. |
| `atm_avg_loss` | Float | | Average financial loss recorded at this location. |

### Table: `complaints`
Stores active, incoming complaints that appear on the "Live Mode" dashboard.

| Column | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `complaint_id` | String | **PRIMARY KEY** | Unique identifier for the complaint (e.g., C-2025-...). |
| `complaint_timestamp` | DateTime | | Time when the complaint was registered. |
| `urgency_score` | Float | | AI-calculated risk score (0-100). |
| `victim_state` | String | | State where the victim resides. |
| `victim_district` | String | | District of the victim. |
| `victim_lat/lon` | Float | | Geolocation of the victim. |
| `fraud_type` | String | | Type of fraud (e.g., Card Cloning, Phishing). |
| `bank_name` | String | | Bank involved in the transaction. |
| `reported_loss_amount`| Float | | Financial loss in INR. |
| `status` | String | | *Implicitly 'Open' or 'Active'.* |

### Table: `rank_pairs`
A data association table mainly used for the predictive model training or correlation analysis. It links complaints to specific ATMs.

| Column | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | **PRIMARY KEY** | Internal ID. |
| `complaint_id` | String | ForeignKey* | Links to `complaints.complaint_id`. |
| `atm_id` | Integer | ForeignKey* | Links to `atms.suspected_atm_index`. |
| `label` | Integer | | Classification label (e.g., 1 for Suspect, 0 for Non-Suspect). |
| `atm_distance_km` | Float | | Distance between the victim and the ATM. |

---

## 2. History Database (`history.db`)
**Purpose**: Archives resolved or closed complaints to keep the main operational database lightweight.

### Table: `history_complaints`
Stores historical data for reporting and trend analysis.

| Column | Type | Key | Description |
| :--- | :--- | :--- | :--- |
| `id` | Integer | **PRIMARY KEY** | Internal ID. |
| `complaint_id` | String | Unique Index | Original Complaint ID (Preserved). |
| `complaint_timestamp` | DateTime | | Original timestamp. |
| `status` | String | | Current status (Default: "Resolved"). |
| `resolution_date` | DateTime | | Timestamp when the case was moved to history. |
| `resolution_notes` | String | | Optional officer notes upon resolution. |
| *...plus all standard complaint columns (victim_loc, fraud_type, etc.)* | | | Data mirrored from `complaints` table for completeness. |

---

## Relationships

1.  **Complaint to ATM (Implicit via Logic)**:
    *   The predictive model spatially joins `complaints` with `atms` based on distance (Vicinity Search).
    *   `rank_pairs` explicitly formalizes this link for training data:
        *   `rank_pairs.complaint_id` → `complaints.complaint_id`
        *   `rank_pairs.atm_id` → `atms.suspected_atm_index`

2.  **Active to History (Lifecycle)**:
    *   Records flow from `complaints` (Live DB) → `history_complaints` (History DB) upon resolution.
    *   There is no join relationship between them; they are mutually exclusive states of a complaint.
