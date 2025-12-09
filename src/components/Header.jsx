// src/components/Header.jsx
import React, { useState, useEffect } from "react";

const LiveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-red-500">
    <circle cx="12" cy="12" r="10"></circle>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
    <circle cx="12" cy="7" r="4"></circle>
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
  </svg>
);

export default function Header({ isLive, onLiveToggle, complaintStatus }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-gradient-to-b from-[#032042] to-[#0951a8] text-white flex items-center justify-between px-6 py-4 shadow-lg">
      <div className="flex items-center gap-4">
        {/* Updated Icon to Shield as per previous requests */}
        <div style={{ fontSize: '32px' }}>🛡️</div>
        <div>
          <h1 className="text-2xl font-bold tracking-wide">Cybercrime Predictive Dashboard</h1>
          {isLive && complaintStatus && (
            <div className="text-xs font-mono text-cyan-300 mt-1">
              CASE STATUS: <span className="font-bold text-white bg-blue-600 px-2 py-0.5 rounded">{complaintStatus}</span>
            </div>
          )}
        </div>
      </div>

      <div
        onClick={onLiveToggle}
        className={`flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-colors ${isLive ? "bg-red-600 animate-pulse" : "bg-black bg-opacity-20"
          }`}
      >
        <LiveIcon />
        <span className="font-semibold">{isLive ? "Live Mode" : "Go Live"}</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <CalendarIcon />
          <span style={{ fontWeight: 500, fontSize: '14px' }}>
            {currentTime.toLocaleString('en-IN', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit', hour12: false
            })}
          </span>
        </div>
        <div className="h-8 w-px bg-white/30"></div>
        <div className="relative">
          <BellIcon />
          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center border-2 border-[#0951a8]">
            15
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-blue-500 rounded-full flex items-center justify-center">
            <UserIcon />
          </div>
          <div>
            <p className="font-bold text-sm">LEA Officer</p>
            <p className="text-xs text-gray-300">Chennai Region</p>
          </div>
        </div>
      </div>
    </header>
  );
}
