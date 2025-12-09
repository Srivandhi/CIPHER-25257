// src/pages/CipherDashboard.jsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import Header from "./components/Header";
import Sidebar from "./components/SideBar";
import MapDisplay from "./components/MapDisplay";
import AlertsSection from "./components/AlertsSection";
import AlertDetailModal from "./components/AlertDetailModal";

import { fetchAtmHotspotsForComplaint } from "./services/apiService";
import { subscribeToComplaint } from "./services/complaintService";

export default function CipherDashboard() {
  const location = useLocation();
  const navigate = useNavigate();

  // complaint passed from LoginPage via navigate("/cipher", { state: { complaint } })
  const complaint = location.state?.complaint;

  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [isLive, setIsLive] = useState(false);
  const [priorityFilter, setPriorityFilter] = useState({
    "Very Critical": true,
    Critical: true,
    High: true,
    Medium: true,
    Low: true,
  });

  // NEW: Live Status for the active complaint
  const [liveComplaintStatus, setLiveComplaintStatus] = useState("Open");



  // If opened directly without a complaint, go back to login
  // If opened directly without a complaint, go back to login
  useEffect(() => {
    if (!complaint) {
      navigate("/");
    }
  }, [complaint, navigate]);

  // Subscribe to live status
  useEffect(() => {
    if (!complaint?.id) return;
    // Uses the ID (either doc ID or complaint_id depending on flow).
    const unsub = subscribeToComplaint(complaint.id, (data) => {
      if (data && data.status) {
        setLiveComplaintStatus(data.status);
      }
    });
    return () => unsub();
  }, [complaint]);

  useEffect(() => {
    if (!complaint) return;

    const load = async () => {
      try {
        setLoading(true);

        // 🔹 Call FastAPI prediction endpoint
        // 🚨 DEMO FIX: If ID is missing/undefined, fallback to a known valid ID so map isn't empty
        let effectiveComplaintId = complaint.complaint_id || complaint.id;
        if (!effectiveComplaintId || effectiveComplaintId === 'undefined') {
          effectiveComplaintId = "CMP-MH-2001";
        }

        const atmData = await fetchAtmHotspotsForComplaint({
          ...complaint,
          complaint_id: effectiveComplaintId
        });

        const atmList = atmData[effectiveComplaintId] || [];

        // 🔹 Map backend ATMRisk → UI alert object
        const uiAlerts = atmList.map((atm) => ({
          id: `${effectiveComplaintId}-${atm.atm_id}`,

          // for list & map coloring
          priority: atm.risk_class, // Critical / High / Medium
          location: atm.suspected_atm_place,
          time: new Date(atm.time_of_complaint).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          amount: atm.estimated_loss,
          complaints: atm.total_complaints,
          position: [atm.lat, atm.lon],
          status: "Open",

          ai_insight_text: `Rank ${atm.rank} ATM, risk score ${(atm.risk_score_norm * 100).toFixed(
            1
          )}%`,

          // case details for modal
          fraudType: atm.fraud_type,
          involvedBank: atm.bank_name,
          complaintIds: [atm.complaint_id],
          trend: "Rising",
          confidenceScore: (atm.risk_score_norm * 100).toFixed(1),
          aiExplanation: `Model ranked this ATM #${atm.rank} for complaint ${atm.complaint_id}.`,

          // 🔹 fields used by MapDisplay popup
          atmId: atm.atm_id,
          atmName: atm.atm_name,
          riskClass: atm.risk_class,
          riskScore: (atm.risk_score_norm * 100).toFixed(1), // percentage
        }));

        console.log("ALERTS SENT TO MAP:", uiAlerts);
        setAlerts(uiAlerts);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [complaint]);

  const filteredAlerts = alerts.filter((a) => {
    return priorityFilter[a.priority];
  });

  if (!complaint) {
    return null; // navigate() will already have triggered
  }

  if (loading && alerts.length === 0) {
    return (
      <div className="bg-[#0f234c] min-h-screen text-white flex items-center justify-center text-2xl">
        Loading Dashboard Data...
      </div>
    );
  }

  return (
    <div className="bg-[#0f234c] min-h-screen text-white font-sans">
      <div className="grid grid-cols-[350px_1fr] h-screen">
        {/* LEFT SIDEBAR */}
        <Sidebar
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
        />

        {/* MAIN CONTENT */}
        <main className="flex flex-col h-screen">
          <Header
            isLive={isLive}
            onLiveToggle={() => setIsLive(!isLive)}
            complaintStatus={liveComplaintStatus}
          />
          <div className="p-6 flex-grow overflow-y-auto">
            {/* MAP with ATM markers */}
            <MapDisplay alerts={filteredAlerts} />

            {/* Recent alerts list */}
            <AlertsSection
              alerts={filteredAlerts}
              onViewAlert={setSelectedAlert}
            />
          </div>
        </main>

        {/* DETAIL MODAL */}
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
        />
      </div>
    </div>
  );
}
