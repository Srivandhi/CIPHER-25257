// src/page/index.jsx
import React, { useState, useMemo } from "react";
import "./index.css";
import complaintsData from "./sampleComplaints";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  // all complaints loaded from sampleComplaints.js
  const [complaints, setComplaints] = useState(complaintsData);

  // filters
  const [timeRange, setTimeRange] = useState("24h");
  const [fraudTypeFilter, setFraudTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [idSearch, setIdSearch] = useState("");

  // modal state for "View Docs"
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  // ---------- FILTER LOGIC ----------
  const filteredComplaints = useMemo(() => {
    return complaints.filter((c) => {
      // fraud type filter
      if (fraudTypeFilter !== "All" && c.fraud_type !== fraudTypeFilter) {
        return false;
      }

      // location filter (match district/taluka/state text)
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

      // ID search
      if (
        idSearch.trim() !== "" &&
        !c.complaint_id.toLowerCase().includes(idSearch.toLowerCase())
      ) {
        return false;
      }

      // time range (very simple: based on date difference in days)
      if (timeRange !== "all") {
        const now = new Date("2025-10-04T00:00:00"); // fixed "today" for demo
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

  // ---------- BUTTON HANDLERS ----------

  // Action -> go to CIPHER dashboard for this complaint
  const handleAction = (complaint) => {
    navigate(`/dashboard/${complaint.complaint_id}`, {
      state: { complaint },
    });
  };

  // Reject -> remove from list
  const handleReject = (complaint) => {
    if (!window.confirm(`Reject complaint ${complaint.complaint_id}?`)) return;
    setComplaints((prev) =>
      prev.filter((c) => c.complaint_id !== complaint.complaint_id)
    );
  };

  // View Docs -> open modal with details
  const handleViewDocs = (complaint) => {
    setSelectedComplaint(complaint);
  };

  const closeDocs = () => setSelectedComplaint(null);

  return (
    <div className="main-container">
      {/* TOP BAR */}
      <div className="frame">
        <div className="group">
          <div className="flex-row-c">
            <span className="span-15">15</span>
            <div className="ellipse" />
          </div>
          <div className="mi-notification" />
        </div>
        <div className="group-1" />
        <div className="group-2" />
        <div className="line" />
        <span className="cybercrime-predictive-dashboard">
          Cybercrime Predictive Dashboard
        </span>
        <div className="noto-warning" />
        <div className="rectangle" />
        <div className="frame-3">
          <span className="span-lea-officer">LEA Officer</span>
          <span className="span-chennai-region">Chennai Region</span>
        </div>
        <div className="uil-calender" />
        <span className="span-oct-2-oct-2025-11-59">2 Oct 2025 , 11.59</span>
        <span className="live-mode">Live Mode</span>
        <div className="fluent-live-filled" />
      </div>

      {/* LEFT SIDE: FILTERS */}
      <div className="frame-7">
        <div className="group-8">
          <div className="frame-9">
            <div className="cil-filter" />
            <span className="span-filters">Filters</span>
          </div>

          {/* Time Range */}
          <span className="span-time-range">Time Range</span>
          <div className="rectangle-a" />
          <div className="frame-b">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="filter-select"
            >
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="all">All</option>
            </select>
          </div>

          {/* Fraud Type */}
          <span className="span-fraud-type">Fraud Type</span>
          <div className="rectangle-c" />
          <select
            value={fraudTypeFilter}
            onChange={(e) => setFraudTypeFilter(e.target.value)}
            className="filter-select"
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

          {/* Location */}
          <span className="span-location">Location</span>
          <div className="rectangle-e" />
          <input
            type="text"
            placeholder="District / City"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="filter-input"
          />

          {/* Complaint ID */}
          <span className="span-complaint-id">Complaint ID</span>
          <div className="rectangle-11" />
          <input
            type="text"
            placeholder="Search by ID"
            value={idSearch}
            onChange={(e) => setIdSearch(e.target.value)}
            className="filter-input"
          />
        </div>
      </div>

      {/* DASHBOARD TITLE */}
      <div className="frame-13">
        <span className="dashboard">Dashboard</span>
      </div>

      {/* RIGHT SIDE: COMPLAINT CARDS */}
      <div className="complaints-list-container">
        {filteredComplaints.length === 0 ? (
          <div className="no-results">No complaints match the filters.</div>
        ) : (
          filteredComplaints.map((c) => (
            <div className="frame-14 complaint-card" key={c.complaint_id}>
              <div className="flex-row-b">
                <div className="frame-15">
                  <div className="ix-id" />
                  <span className="cmp">{c.complaint_id}</span>
                </div>
                <div className="frame-16">
                  {/* View Docs */}
                  <div className="group-17">
                    <button
                      className="rectangle-18 button-text"
                      onClick={() => handleViewDocs(c)}
                    >
                      View Docs
                    </button>
                  </div>
                  {/* Action */}
                  <div className="group-19">
                    <button
                      className="rectangle-1a button-text"
                      onClick={() => handleAction(c)}
                    >
                      Action
                    </button>
                  </div>
                  {/* Reject */}
                  <div className="group-1b">
                    <button
                      className="rectangle-1c button-text"
                      onClick={() => handleReject(c)}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>

              {/* Short description */}
              <span className="multiple-upi-fraud">
                {c.fraud_type} reported – {c.bank_name} –{" "}
                {c.victim_district}, {c.victim_state}
              </span>

              {/* Meta row: amount, time, location */}
              <div className="flex-row-db">
                <div className="humbleicons-money" />
                <div className="frame-1d">
                  <div className="famicons-time-outline" />
                  <span className="am">
                    {new Date(
                      c.complaint_timestamp.replace(" ", "T")
                    ).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <div className="frame-1e">
                  <div className="akar-icons-location" />
                  <span className="chennai-t-nagar">
                    {c.victim_district} - {c.victim_taluka}
                  </span>
                </div>
                <div className="reported-amount">
                  <span className="reported-amount-1f">Reported Amount : </span>
                  <span className="reported-amount-20">
                    ₹
                    {new Intl.NumberFormat("en-IN").format(
                      c.reported_loss_amount
                    )}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* VIEW DOCS MODAL */}
      {selectedComplaint && (
        <div className="docs-modal-backdrop">
          <div className="docs-modal">
            <div className="docs-modal-header">
              <h2>Complaint Details – {selectedComplaint.complaint_id}</h2>
              <button onClick={closeDocs} className="modal-close">
                ✕
              </button>
            </div>
            <div className="docs-modal-body">
              <p>
                <strong>Fraud Type:</strong> {selectedComplaint.fraud_type}
              </p>
              <p>
                <strong>Bank:</strong> {selectedComplaint.bank_name}
              </p>
              <p>
                <strong>Amount:</strong> ₹
                {new Intl.NumberFormat("en-IN").format(
                  selectedComplaint.reported_loss_amount
                )}
              </p>
              <p>
                <strong>Location:</strong>{" "}
                {selectedComplaint.victim_village},{" "}
                {selectedComplaint.victim_taluka},{" "}
                {selectedComplaint.victim_district},{" "}
                {selectedComplaint.victim_state} –{" "}
                {selectedComplaint.victim_pincode}
              </p>
              <p>
                <strong>Channel:</strong> {selectedComplaint.channel}
              </p>
              <p>
                <strong>Device:</strong> {selectedComplaint.device_type}
              </p>
              <p>
                <strong>Timestamp:</strong>{" "}
                {selectedComplaint.complaint_timestamp}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
