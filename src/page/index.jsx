// src/page/index.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./index.css";
// import complaintsData from "./sampleComplaints";
import { fetchHistoryComplaints } from "../services/apiService";
import { subscribeToAllComplaints, submitComplaint } from "../services/complaintService";

export default function LoginPage() {
  const navigate = useNavigate();

  // All complaints
  const [complaints, setComplaints] = useState([]);
  const [historyComplaints, setHistoryComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard, history_complaints, history_alerts

  useEffect(() => {
    // Subscribe to active complaints (dashboard)
    const unsubscribe = subscribeToAllComplaints((data) => {
      const mapped = data.map((c) => ({
        ...c,
        complaint_timestamp: c.time_of_complaint || c.complaint_timestamp || new Date().toISOString(),
      }));
      // Sort: newest first
      mapped.sort(
        (a, b) =>
          new Date(b.complaint_timestamp) - new Date(a.complaint_timestamp)
      );
      setComplaints(mapped);
    });

    return () => unsubscribe();
  }, []);

  // Fetch history complaints (mock for now, or could be separate collection)
  useEffect(() => {
    fetchHistoryComplaints()
      .then((data) => {
        const mappedHist = data.map((c) => ({
          ...c,
          complaint_timestamp: c.time_of_complaint || c.complaint_timestamp,
        }));
        mappedHist.sort(
          (a, b) =>
            new Date(b.complaint_timestamp) - new Date(a.complaint_timestamp)
        );
        setHistoryComplaints(mappedHist);
      })
      .catch((err) => console.error("Failed to fetch history", err));
  }, []);

  // Filters
  const [timeRange, setTimeRange] = useState("all");
  const [fraudTypeFilter, setFraudTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [idSearch, setIdSearch] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
    // Fallback to internal ID if complaint_id is missing to avoid /undefined URL
    navigate(`/dashboard/${complaint.complaint_id || complaint.id}`, {
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
    <div className="login-root">
      {/* HEADER */}
      <header className="login-header">
        <div className="login-header-left">
          <div className="logo-badge">🛡️</div>
          <div className="app-title">Cybercrime Predictive Dashboard</div>
        </div>

        <div className="login-header-right">
          <div className="login-header-center" style={{ marginRight: '24px' }}>
            <span className="live-dot" />
            <span className="live-text">Live Mode (Firebase)</span>
          </div>

          {/* TEMP: Simulation Button */}
          <button
            onClick={() => {
              // Use IDs that are known to the backend (from sampleComplaints.js) 
              // to ensure hotspots are found.
              const validIds = [
                "CMP-MH-2001", "CMP-MH-2002", "CMP-MH-2003",
                "CMP-MH-2004", "CMP-MH-2005", "CMP-MH-2006",
                "CMP-MH-2007", "CMP-MH-2008"
              ];
              const randomId = validIds[Math.floor(Math.random() * validIds.length)];

              const sample = {
                complaint_id: randomId, // Use valid ID for backend mapping (Hotspots will work!)
                complaint_timestamp: new Date().toISOString().replace("T", " ").split(".")[0],
                victim_state: "Maharashtra",
                victim_district: "Mumbai City",
                victim_taluka: "Dadar",
                victim_village: "Prabhadevi",
                victim_pincode: 400025,
                victim_rural_urban: "Urban",
                victim_lat: 19.0160,
                victim_lon: 72.8300,
                channel: "NCRP",
                fraud_type: "UPI Scam",
                bank_name: "HDFC",
                reported_loss_amount: Math.floor(Math.random() * 50000) + 5000,
                num_transactions: 3,
                device_type: "Android",
                is_otp_shared: 0,
                clicked_malicious_link: 1,
                account_age_months: 36,
                linked_fraud_ring: "Ring_A",
                status: "Open",
                urgency_score: Math.random()
              };
              submitComplaint(sample);
            }}
            style={{
              marginRight: '16px',
              padding: '4px 8px',
              fontSize: '12px',
              background: '#3b82f6',
              color: 'white',
              borderRadius: '4px',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            + Sim Complaint
          </button>

          <span className="header-date" style={{ fontWeight: 500, fontSize: '14px', marginRight: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>📅</span>
            {currentTime.toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
            })}
          </span>

          <div className="bell-badge" style={{ marginRight: '16px' }}>
            🔔
            <span className="bell-count">15</span>
          </div>

          <div className="user-chip">
            <span style={{ display: 'block', fontSize: '13px', fontWeight: '600' }}>LEA Officer</span>
            <span style={{ display: 'block', fontSize: '10px', opacity: 0.8 }}>Chennai Region</span>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="login-content">
        {/* SIDEBAR FILTERS */}
        <aside className="login-filters">
          <h2 className="filters-title">Filters</h2>

          <div className="filter-block">
            <label className="filter-label">Time Range</label>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All Time</option>
            </select>
          </div>

          <div className="filter-block">
            <label className="filter-label">Fraud Type</label>
            <select
              value={fraudTypeFilter}
              onChange={(e) => setFraudTypeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Types</option>
              <option value="KYC Update Scam">KYC Update Scam</option>
              <option value="Card Skimming">Card Skimming</option>
              <option value="OTP Fraud">OTP Fraud</option>
              <option value="UPI Scam">UPI Scam</option>
              <option value="Loan App Scam">Loan App Scam</option>
            </select>
          </div>

          <div className="filter-block">
            <label className="filter-label">Location</label>
            <input
              type="text"
              placeholder="District / City"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-block">
            <label className="filter-label">Complaint ID</label>
            <input
              type="text"
              placeholder="Search by ID"
              value={idSearch}
              onChange={(e) => setIdSearch(e.target.value)}
              className="filter-input"
            />
          </div>

          <div style={{ paddingTop: '10px' }}>
            <button
              className={`sidebar-nav-btn ${activeTab === "history_complaints" ? "active" : ""}`}
              onClick={() => setActiveTab(activeTab === "history_complaints" ? "dashboard" : "history_complaints")}
            >
              {activeTab === "history_complaints" ? "Dashboard" : "History of Complaints"}
            </button>
          </div>
        </aside>

        {/* RIGHT SIDE – TABS & LIST */}
        <main className="login-main">
          {/* TABS HEADER REMOVED - Using Sidebar Nav */}

          {/* TAB CONTENT: DASHBOARD */}
          {activeTab === "dashboard" && (
            <div className="complaints-list">
              {filteredComplaints.length === 0 ? (
                <div className="no-results">
                  No complaints match the current filters.
                </div>
              ) : (
                filteredComplaints.map((c) => (
                  <article className="complaint-card" key={c.complaint_id}>
                    <div className="complaint-card-top">
                      <div className="complaint-id-chip">
                        <div className="flex items-center">
                          <span className="id-text">{c.complaint_id}</span>
                        </div>
                        <div className="complaint-subtitle">{c.fraud_type} detected</div>
                      </div>
                      <div className="complaint-card-actions">
                        <button className="btn-secondary" onClick={() => handleViewDocs(c)}>
                          View Docs
                        </button>
                        <button className="btn-primary" onClick={() => handleAction(c)}>
                          Action
                        </button>
                        <button className="btn-danger" onClick={() => handleReject(c)}>
                          Reject
                        </button>
                      </div>
                    </div>

                    <div className="complaint-meta-grid">
                      <div className="meta-item">
                        <span className="meta-label">Time</span>
                        <span className="meta-value">
                          {new Date(c.complaint_timestamp.replace(" ", "T")).toLocaleTimeString("en-IN", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Location</span>
                        <span className="meta-value">
                          {c.victim_district} – {c.victim_taluka}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Reported Amount</span>
                        <span className="meta-value amount-text">
                          ₹{new Intl.NumberFormat("en-IN").format(c.reported_loss_amount)}
                        </span>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}

          {/* TAB CONTENT: HISTORY OF COMPLAINTS */}
          {/* TAB CONTENT: HISTORY OF COMPLAINTS */}
          {activeTab === "history_complaints" && (
            <div className="complaints-list">
              <div className="no-results" style={{ background: 'rgba(255,255,255,0.1)' }}>
                Archive View - Read Only (Filtered by Search/Type)
              </div>
              {/* Note: We currently apply client-side filters to history data too using the same filter states */}
              {(historyComplaints.filter(c => {
                // fraud type
                if (fraudTypeFilter !== "All" && c.fraud_type !== fraudTypeFilter) return false;
                // location
                if (locationFilter.trim() !== "") {
                  const loc = (c.victim_district + " " + c.victim_taluka + " " + c.victim_state).toLowerCase();
                  if (!loc.includes(locationFilter.toLowerCase())) return false;
                }
                // id search
                if (idSearch.trim() !== "" && !c.complaint_id.toLowerCase().includes(idSearch.toLowerCase())) return false;

                return true;
              })).map((c) => (
                <article className="complaint-card" key={c.complaint_id + "_hist"} style={{ opacity: 0.8 }}>
                  <div className="complaint-card-top">
                    <div className="complaint-id-chip">
                      <span className="id-text" style={{ color: '#cbd5e1' }}>{c.complaint_id}</span>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <span style={{
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        padding: '4px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {c.status || "Resolved"}
                      </span>
                    </div>
                  </div>
                  <div className="complaint-meta-grid" style={{ marginTop: '0', paddingTop: '8px', border: 'none' }}>
                    <div className="meta-item">
                      <span className="meta-value">{c.victim_district}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-value">₹{new Intl.NumberFormat("en-IN").format(c.reported_loss_amount)}</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-value">{c.fraud_type}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {/* TAB CONTENT: HISTORY OF ALERTS (High Urgency Items) */}
          {activeTab === "history_alerts" && (
            <div className="complaints-list">
              <div className="no-results" style={{ background: 'rgba(255,255,255,0.1)' }}>
                High Urgency / Alert History
              </div>
              {filteredComplaints.filter(c => c.urgency_score > 0.6).length === 0 ? (
                <div className="no-results">No high urgency alerts found over 60%.</div>
              ) : (
                filteredComplaints.filter(c => c.urgency_score > 0.6).map((c) => (
                  <article className="complaint-card" key={c.complaint_id + "_alert"} style={{ borderLeft: '4px solid #ef4444' }}>
                    <div className="complaint-card-top">
                      <div className="complaint-id-chip">
                        <div className="flex items-center">
                          <span className="id-text">ALERT: {c.complaint_id}</span>
                          <span className="risk-badge" style={{ background: '#f59e0b' }}>SCORE: {(c.urgency_score * 100).toFixed(0)}</span>
                        </div>
                        <div className="complaint-subtitle">Hotspot Analysis Recommended</div>
                      </div>
                      <div className="complaint-card-actions">
                        <button className="btn-primary" onClick={() => handleAction(c)}>
                          View Hotspots
                        </button>
                      </div>
                    </div>
                    <div className="complaint-meta-grid">
                      <div className="meta-item">
                        <div className="meta-label" style={{ color: '#fca5a5' }}>Alert Trigger</div>
                        <div className="meta-value">High Urgency Score</div>
                      </div>
                      <div className="meta-item">
                        <div className="meta-label">Location</div>
                        <div className="meta-value">{c.victim_district}</div>
                      </div>
                      <div className="meta-item">
                        <div className="meta-label">Time</div>
                        <div className="meta-value">{c.complaint_timestamp}</div>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </main>
      </div >

      {/* VIEW DOCS MODAL */}
      {
        selectedComplaint && (
          <div className="modal-backdrop">
            <div className="modal">
              <div className="modal-header">
                <h3>Complaint Details – {selectedComplaint.complaint_id}</h3>
                <button onClick={closeDocs} className="modal-close">
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-row">
                  <span className="modal-label">Fraud Type</span>
                  <span className="modal-val">{selectedComplaint.fraud_type}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Bank Name</span>
                  <span className="modal-val">{selectedComplaint.bank_name}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Amount</span>
                  <span className="modal-val">₹{new Intl.NumberFormat("en-IN").format(selectedComplaint.reported_loss_amount)}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Location</span>
                  <span className="modal-val">{selectedComplaint.victim_district}, {selectedComplaint.victim_taluka}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Channel</span>
                  <span className="modal-val">{selectedComplaint.channel}</span>
                </div>
                <div className="modal-row">
                  <span className="modal-label">Time</span>
                  <span className="modal-val">{selectedComplaint.complaint_timestamp}</span>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
