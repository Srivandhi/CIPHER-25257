// src/components/AlertsSection.jsx
import React from "react";
import AlertItem from "./AlertItem";

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default function AlertsSection({ alerts, onViewAlert }) {
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          <WarningIcon />
          <h2 className="text-3xl font-bold text-white">Recent Alerts</h2>
        </div>
        <button className="border border-blue-500 text-white font-bold py-2 px-5 rounded-lg hover:bg-blue-500 transition-colors">
          View All Alerts
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {alerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} onView={onViewAlert} />
        ))}
      </div>
    </div>
  );
}
