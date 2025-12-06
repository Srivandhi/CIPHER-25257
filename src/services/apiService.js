// src/services/apiService.js (Finalized)

import axios from 'axios';

// The base URL of our FastAPI backend
const API_BASE_URL = "http://127.0.0.1:8000";

/**
 * Fetches aggregated alerts from the backend.
 * @param {object} filters - The filters to apply, e.g., { priority_levels: ['Critical', 'High'], limit: 50 }
 * @returns {Promise<Array>} A promise that resolves to an array of alert objects.
 */
export const fetchAlerts = async (filters = {}) => {
  // Construct URL with query parameters for filtering
  const params = new URLSearchParams();
  
  if (filters.priority_levels && filters.priority_levels.length > 0) {
    filters.priority_levels.forEach(level => params.append("priority_levels", level));
  }
  
  // FIX: Ensure a high limit is always passed to avoid the default limit of 4 or 10
  const limit = filters.limit || 50; 
  params.append("limit", limit);
  
  const url = `${API_BASE_URL}/api/alerts?${params.toString()}`;

  try {
    const response = await axios.get(url);
    if (response.status !== 200) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.data;
  } catch (error) {
    console.error("Failed to fetch alerts:", error);
    return []; 
  }
};

/**
 * Fetches predicted high-risk hotspots.
 * @returns {Promise<Array>} A promise that resolves to an array of hotspot objects.
 */
export const fetchHotspots = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/api/hotspots`);
        return response.data;
    } catch (error) {
        console.error("Error fetching predicted hotspots:", error);
        return []; 
    }
};

/**
 * Triggers the background task to process complaints.
 * @returns {Promise<object>} A promise that resolves to the success message.
 */
export const triggerProcessing = async () => {
    const url = `${API_BASE_URL}/api/process-complaints`;

    try {
        const response = await axios.post(url);
        if (response.status !== 202) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.data;
    } catch (error) {
        console.error("Failed to trigger processing:", error);
        return { message: "Error triggering process." };
    }
};