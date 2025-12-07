// src/CipherDashboard.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import {
  fetchAtmHotspotsForComplaint,
} from "./services/apiService";
// ... import your Header, Sidebar, MapDisplay, AlertsSection, AlertDetailModal etc.

export default function CipherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const { complaintId } = useParams();

  const complaint = location.state?.complaint; // passed from LoginPage

  const [alerts, setAlerts] = useState([]);
  const [hotspots, setHotspots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [priorityFilter, setPriorityFilter] = useState({
    Critical: true,
    High: true,
    Medium: true,
  });
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!complaint) {
      // no complaint – go back to list
      navigate("/");
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        // call your FastAPI endpoint using complaint shape
        const data = await fetchAtmHotspotsForComplaint({
          ...complaint,
          complaint_id: complaint.id,
          time_of_complaint: new Date(), // or real value if you have it
        });

        const atmList = data[complaint.id] || [];

        const uiAlerts = atmList.map((atm) => ({
          id: `${complaint.id}-${atm.atm_id}`,
          priority: atm.risk_class,
          location: atm.suspected_atm_place,
          time: new Date(atm.time_of_complaint).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          amount: atm.estimated_loss,
          complaints: atm.total_complaints,
          position: [atm.lat, atm.lon],
          status: "Open",
          ai_insight_text: `Rank ${atm.rank} ATM, risk score ${(atm.risk_score_norm * 100).toFixed(1)}%`,
          fraudType: atm.fraud_type,
          involvedBank: atm.bank_name,
          complaintIds: [atm.complaint_id],
          trend: "Rising",
          confidenceScore: (atm.risk_score_norm * 100).toFixed(1),
          aiExplanation: `Model ranked this ATM #${atm.rank} for complaint ${atm.complaint_id}.`,
        }));

        setAlerts(uiAlerts);
        setHotspots(atmList); // if MapDisplay uses hotspots; or just use alerts
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [complaint, navigate]);

  // then render your existing dashboard layout using alerts/hotspots...
}
