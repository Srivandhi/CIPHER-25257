// src/page/index.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
// import complaintsData from "./sampleComplaints";
import { fetchAllComplaints } from "../services/apiService";

export default function LoginPage() {
  const navigate = useNavigate();

  // All complaints
  const [complaints, setComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, history_complaints, history_alerts

  useEffect(() => {
    fetchAllComplaints()
      .then((data) => {
        const mapped = data.map((c) => ({
          ...c,
          complaint_timestamp: c.time_of_complaint || c.complaint_timestamp,
        }));
        // Sort by newest first
        mapped.sort(
          (a, b) =>
            new Date(b.complaint_timestamp) - new Date(a.complaint_timestamp)
        );
        setComplaints(mapped);
      })
      .catch((err) => console.error("Failed to fetch complaints", err));
  }, []);

  // Filters
  const [timeRange, setTimeRange] = useState("all");
  const [fraudTypeFilter, setFraudTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [idSearch, setIdSearch] = useState("");

  // Modal for "View Docs"
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ---------- FILTER LOGIC ----------
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // fraud type
      if (fraudTypeFilter !== "All" && c.fraud_type !== fraudTypeFilter) {
        return false;
      }

      // location
      if (locationFilter.trim() !== "") {
        const loc = (
          c.victim_district +
          " " +
          c.victim_taluka +
          " " +
          c.victim_state
        ).toLowerCase();
        if (!loc.includes(locationFilter.toLowerCase())) return false;
      }

      // id search
      if (
        idSearch.trim() !== "" &&
        !c.complaint_id.toLowerCase().includes(idSearch.toLowerCase())
      ) {
        return false;
      }

      // time range
      if (timeRange !== "all") {
        const now = new Date("2025-10-04T00:00:00");
        const t = new Date(c.complaint_timestamp.replace(" ", "T"));
        const diffMs = now - t;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);

        if (timeRange === "24h" && diffDays > 1) return false;
        if (timeRange === "7d" && diffDays > 7) return false;
        if (timeRange === "30d" && diffDays > 30) return false;
      }

      return true;
    });
  }, [complaints, timeRange, fraudTypeFilter, locationFilter, idSearch]);

  // ---------- HANDLERS ----------
  const handleAction = (complaint) => {
    navigate(`/dashboard/${complaint.complaint_id}`, {
      state: { complaint },
    });
  };

  const handleReject = (complaint) => {
    if (!window.confirm(`Reject complaint ${complaint.complaint_id}?`)) return;
    setComplaints((prev) =>
      prev.filter((c) => c.complaint_id !== complaint.complaint_id)
    );
  };

  const handleViewDocs = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeDocs = () => setSelectedComplaint(null);

  // ---------- RENDER COMPONENT ----------
  return (
    <div className="flex h-screen bg-[#6b85a3] font-sans overflow-hidden">
      {/* 1. LEFT SIDEBAR FILTERS (Blue/Grey Theme) */}
      <aside className="w-64 bg-[#5c728f] text-white flex flex-col shadow-xl z-20">
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 rounded bg-yellow-400 flex items-center justify-center text-blue-900 font-bold text-xl">
              !
            </div>
            <h1 className="font-bold text-lg leading-tight">Filters</h1>
          </div>
        </div>

        <div className="p-6 flex flex-col gap-6 overflow-y-auto">
          {/* Time Range */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-200">
              Time Range
            </label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-black/20 text-white rounded p-2 border border-white/10 outline-none focus:border-yellow-400 transition-colors"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {/* Fraud Type */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-200">
              Fraud Type
            </label>
            <select
              value={fraudTypeFilter}
              onChange={(e) => setFraudTypeFilter(e.target.value)}
              className="bg-black/20 text-white rounded p-2 border border-white/10 outline-none focus:border-yellow-400 transition-colors"
            >
              <option value="All">All Types</option>
              <option value="OTP Fraud">OTP Fraud</option>
              <option value="UPI Phishing">UPI Phishing</option>
              <option value="ATM Skimming">ATM Skimming</option>
              <option value="Loan App Fraud">Loan App Fraud</option>
              <option value="Debit Card Fraud">Debit Card Fraud</option>
              <option value="Impersonation / Digital Arrest">
                Impersonation / Digital Arrest
              </option>
            </select>
          </div>

          {/* Location */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-200">
              Location
            </label>
            <input
              type="text"
              placeholder="District / City"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="bg-black/20 text-white rounded p-2 border border-white/10 outline-none focus:border-yellow-400 transition-colors placeholder-gray-400"
            />
          </div>

          {/* Complaint ID */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-gray-200">
              Complaint ID
            </label>
            <input
              type="text"
              placeholder="Search by ID"
              value={idSearch}
              onChange={(e) => setIdSearch(e.target.value)}
              className="bg-black/20 text-white rounded p-2 border border-white/10 outline-none focus:border-yellow-400 transition-colors placeholder-gray-400"
            />
          </div>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col bg-[#7992b1] relative">
        {/* TOP HEADER / NAV */}
        <header className="bg-[#6b85a3] text-white p-4 shadow-md z-10">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 flex items-center justify-center shadow-lg">
                <span className="text-xl">🛡️</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-wide text-white drop-shadow-md">
                  Cybercrime Predictive Dashboard
                </h1>
                <div className="flex items-center gap-2">
                  <span className="bg-green-500/20 text-green-300 text-xs px-2 py-0.5 rounded border border-green-500/30 animate-pulse">
                    ● Live Mode
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-gray-200">
                <span>🗓️ 2 Oct 2025 , 11.59</span>
              </div>
              <div className="relative cursor-pointer">
                <span className="text-xl">🔔</span>
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] flex items-center justify-center rounded-full font-bold">
                  15
                </span>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-white/20">
                <div className="text-right hidden md:block">
                  <div className="font-bold text-sm">LEA Officer</div>
                  <div className="text-xs text-gray-300">Chennai Region</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold border-2 border-white/30">
                  👤
                </div>
              </div>
            </div>
          </div>

          {/* TABS */}
          <div className="flex gap-8 mt-2 border-b border-white/10 px-4">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === "dashboard"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              Dashboard
              {activeTab === "dashboard" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-red-400 rounded-t-md shadow-[0_0_10px_rgba(248,113,113,0.5)]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("history_complaints")}
              className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === "history_complaints"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              History of Complaints
              {activeTab === "history_complaints" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-400 rounded-t-md shadow-[0_0_10px_rgba(96,165,250,0.5)]" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("history_alerts")}
              className={`pb-3 px-4 text-sm font-bold uppercase tracking-wider transition-all relative ${activeTab === "history_alerts"
                  ? "text-white"
                  : "text-gray-400 hover:text-gray-200"
                }`}
            >
              History of Alerts
              {activeTab === "history_alerts" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-yellow-400 rounded-t-md shadow-[0_0_10px_rgba(250,204,21,0.5)]" />
              )}
            </button>
          </div>
        </header>

        {/* TAB CONTENTS */}
        <div className="flex-1 overflow-y-auto p-6 relative">
          {/* TAB 1: DASHBOARD (Active Complaints) */}
          {activeTab === "dashboard" && (
            <div className="flex flex-col gap-4 max-w-5xl mx-auto">
              {filteredComplaints.length === 0 ? (
                <div className="text-center text-white/50 mt-12 text-lg">
                  No complaints found matching filters.
                </div>
              ) : (
                filteredComplaints.map((c) => (
                  <div
                    key={c.complaint_id}
                    className="bg-[#8aa2c0]/40 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow flex flex-col gap-3 group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex gap-3">
                        <div className="bg-white/10 p-2 rounded text-2xl h-fit">
                          🆔
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-white text-lg">
                              {c.complaint_id}
                            </span>
                            {c.urgency_score > 0.8 && (
                              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">CRITICAL</span>
                            )}
                          </div>
                          <div className="text-white/90 font-medium">
                            {c.fraud_type} detected
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 opacity-90 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleViewDocs(c)}
                          className="bg-gray-200 hover:bg-white text-gray-800 text-xs font-bold py-1.5 px-3 rounded shadow"
                        >
                          View Docs
                        </button>
                        <button
                          onClick={() => handleAction(c)}
                          className="bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold py-1.5 px-4 rounded shadow"
                        >
                          Action
                        </button>
                        <button
                          onClick={() => handleReject(c)}
                          className="bg-red-500 hover:bg-red-400 text-white text-xs font-bold py-1.5 px-3 rounded shadow"
                        >
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm text-gray-200 mt-2 bg-black/10 p-3 rounded-md border border-white/5">
                      <div className="flex items-center gap-2">
                        <span>🕒</span>
                        {new Date(
                          c.complaint_timestamp.replace(" ", "T")
                        ).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        {c.victim_district} - {c.victim_taluka}
                      </div>
                      <div className="flex items-center gap-2 font-bold text-white">
                        <span>💵</span>₹{c.reported_loss_amount}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: HISTORY OF COMPLAINTS (Read Only / Past) */}
          {activeTab === "history_complaints" && (
            <div className="flex flex-col gap-4 max-w-5xl mx-auto">
              <div className="bg-white/10 p-4 rounded text-center text-white mb-4">
                Showing archive of processed complaints.
              </div>
              {filteredComplaints.map((c) => (
                <div
                  key={c.complaint_id + "_hist"}
                  className="bg-gray-600/40 border border-white/10 rounded-lg p-4 flex flex-col gap-2 opacity-75 hover:opacity-100 transition-opacity"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-gray-300">{c.complaint_id}</span>
                    <span className="text-green-400 text-xs font-bold border border-green-400/30 px-2 py-0.5 rounded">RESOLVED</span>
                  </div>
                  <div className="text-sm text-gray-200">{c.fraud_type} - {c.bank_name}</div>
                  <div className="text-xs text-gray-400">
                    {c.victim_district}, {c.victim_state} • ₹{c.reported_loss_amount}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: HISTORY OF ALERTS (Placeholder / Mock) */}
          {activeTab === "history_alerts" && (
            <div className="flex flex-col gap-4 max-w-5xl mx-auto text-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Mock Alert History Cards */}
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 border border-white/10 p-4 rounded-lg shadow-lg">
                    <div className="flex justify-between items-center mb-3">
                      <span className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded border border-red-500/30">CRITICAL HOTSPOT</span>
                      <span className="text-xs text-gray-400">2 days ago</span>
                    </div>
                    <h3 className="font-bold text-lg mb-1">ATM #{2000 + i} - Mumbai</h3>
                    <p className="text-sm text-gray-400 mb-4">High concentration of skimming reports in Andheri East.</p>
                    <div className="flex justify-between items-center border-t border-white/10 pt-3">
                      <span className="text-xs text-gray-500">Risk Score: 98%</span>
                      <button className="text-blue-400 text-sm hover:underline">View Report</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* VIEW DOCS MODAL */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-[#1e293b] text-white p-6 rounded-lg w-full max-w-md shadow-2xl border border-white/10">
            <div className="flex justify-between items-center mb-4 border-b border-white/10 pb-2">
              <h3 className="text-xl font-bold">Complaint {selectedComplaint.complaint_id}</h3>
              <button onClick={closeDocs} className="text-gray-400 hover:text-white text-xl">
                ✕
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-300">
              <p>
                <strong className="text-gray-100">Fraud Type:</strong> {selectedComplaint.fraud_type}
              </p>
              <p>
                <strong className="text-gray-100">Bank:</strong> {selectedComplaint.bank_name}
              </p>
              <p>
                <strong className="text-gray-100">Amount:</strong> ₹
                {new Intl.NumberFormat("en-IN").format(
                  selectedComplaint.reported_loss_amount
                )}
              </p>
              <p>
                <strong className="text-gray-100">Location:</strong>{" "}
                {selectedComplaint.victim_village}, {selectedComplaint.victim_taluka},{" "}
                {selectedComplaint.victim_district}
              </p>
              <p>
                <strong className="text-gray-100">Channel:</strong> {selectedComplaint.channel}
              </p>
              <p>
                <strong className="text-gray-100">Device:</strong> {selectedComplaint.device_type}
              </p>
              <p>
                <strong className="text-gray-100">Timestamp:</strong>{" "}
                {selectedComplaint.complaint_timestamp}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
