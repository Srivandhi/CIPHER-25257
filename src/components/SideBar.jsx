// src/components/SideBar.jsx
import React from "react";

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
    <line x1="12" y1="9" x2="12" y2="13"></line>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

export default function Sidebar({ setPriorityFilter, priorityFilter }) {
  const overviewStats = [
    {
      label: "Today's Complaints",
      value: "6,262",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
      ),
    },
    { label: "Critical Alerts", value: "12", icon: <WarningIcon /> },
    {
      label: "High Alerts",
      value: "62",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      ),
    },
    {
      label: "Medium Alerts",
      value: "6,052",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
    },
  ];

  const handlePriorityChange = (e) => {
    const { name, checked } = e.target;
    setPriorityFilter((prev) => ({ ...prev, [name]: checked }));
  };

  return (
    <aside className="bg-gradient-to-b from-[#032042] to-[#0951a8] text-white p-6 flex flex-col gap-8 overflow-y-auto">
      <div>
        <div className="flex items-center gap-3 mb-6">
          <FilterIcon />
          <h2 className="text-2xl font-bold">Filters</h2>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Priority Level</h3>
            <div className="flex flex-col gap-3">
              {["Critical", "High", "Medium"].map((level) => (
                <label key={level} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name={level}
                    checked={priorityFilter[level]}
                    onChange={handlePriorityChange}
                    className="form-checkbox h-5 w-5 bg-gray-800 border-gray-600 rounded"
                  />
                  <span
                    className={`px-3 py-1 text-sm font-bold rounded-md ${
                      level === "Critical"
                        ? "bg-red-500/80"
                        : level === "High"
                        ? "bg-orange-500/80"
                        : "bg-yellow-500/80"
                    }`}
                  >
                    {level}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white/5 p-4 rounded-lg mt-4">
        <h3 className="font-bold mb-4">Today's Overview</h3>
        <div className="flex flex-col gap-3">
          {overviewStats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between bg-black/20 p-3 rounded-md"
            >
              <div className="flex items-center gap-3">
                <div className="text-blue-300">{stat.icon}</div>
                <span className="text-sm text-gray-300">{stat.label}</span>
              </div>
              <span className="font-bold text-lg">{stat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
