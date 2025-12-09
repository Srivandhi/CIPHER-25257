
// src/services/apiService.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export async function fetchAtmHotspotsForComplaint(complaint) {
  const payload = {
    ...complaint,
    time_of_complaint: complaint.complaint_timestamp || new Date().toISOString(), // map field name, default to now
  };

  const res = await axios.post(
    `${API_BASE_URL}/api/complaints/atm-hotspots`,
    payload
  );
  return res.data; // { [complaint_id]: [ATMRisk, ...] }
}

// Fetch all complaints
export const fetchAllComplaints = async () => {
  const response = await fetch(`${API_BASE_URL}/api/complaints`);
  if (!response.ok) {
    throw new Error("Failed to fetch complaints");
  }
  return response.json();
};

// Fetch history complaints
export const fetchHistoryComplaints = async () => {
  const response = await fetch(`${API_BASE_URL}/api/history`);
  if (!response.ok) {
    throw new Error("Failed to fetch history complaints");
  }
  return response.json();
};
