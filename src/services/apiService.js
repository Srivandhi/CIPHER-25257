// src/services/apiService.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchAtmHotspotsForComplaint(complaint) {
  const payload = {
    ...complaint,
    time_of_complaint: complaint.complaint_timestamp, // map field name
  };

  const res = await axios.post(
    `${API_BASE_URL}/api/complaints/atm-hotspots`,
    payload
  );
  return res.data; // { [complaint_id]: [ATMRisk, ...] }
}
