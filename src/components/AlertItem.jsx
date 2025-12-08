// src/components/AlertItem.jsx
import React from "react";

const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

export default function AlertItem({ alert, onView }) {
  const priorityStyles = {
  "Very Critical": "bg-red-600/80 text-red-100",
  Critical: "bg-red-500/80 text-red-100",
  High: "bg-orange-500/80 text-orange-100",
  Medium: "bg-yellow-500/80 text-yellow-100",
  Low: "bg-green-500/80 text-green-100",   // ✅ change from gray to green
};

  return (
    <div className="p-4 bg-white/5 hover:bg-white/10 rounded-lg transition-colors duration-200 text-sm">
      <div className="grid grid-cols-[1fr_2fr_1fr_1fr_1fr_auto] items-center gap-4">
        {/* risk class */}
        <div
          className={`font-bold px-3 py-1 rounded-md text-center text-xs ${
            priorityStyles[alert.priority] || "bg-slate-500/80"
          }`}
        >
          {alert.priority}
        </div>

        {/* suspected ATM place */}
        <div className="flex items-center gap-2">
          <LocationIcon />
          <span className="font-semibold">{alert.location}</span>
        </div>

        {/* time */}
        <div className="flex items-center gap-2 text-gray-300">
          <ClockIcon />
          <span>{alert.time}</span>
        </div>

        {/* total complaints */}
        <div className="text-gray-300">{alert.complaints} complaints</div>

        {/* estimated loss */}
        <div className="font-semibold text-white">
          ₹
          {new Intl.NumberFormat("en-IN", {
            maximumSignificantDigits: 3,
          }).format(alert.amount / 100000)}
          L
        </div>

        {/* only View button */}
        <button
          onClick={() => onView(alert)}
          className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-2 px-4 rounded-lg border border-slate-500"
        >
          <EyeIcon />
          <span>View</span>
        </button>
      </div>

      <div className="mt-3 flex justify-end items-center gap-2">
        <span className="text-xs font-bold text-gray-400">
          AI INSIGHT: {alert.ai_insight_text}
        </span>
      </div>
    </div>
  );
}
