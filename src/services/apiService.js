

// src/services/apiService.js
import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000";

export const fetchAtmHotspotsForComplaint = async (complaintPayload) => {
  const url = `${API_BASE_URL}/api/complaints/atm-hotspots`;
  const response = await axios.post(url, complaintPayload);
  return response.data; // { [complaint_id]: [ ATMRisk, ... ] }
};
