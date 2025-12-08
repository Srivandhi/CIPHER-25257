// src/components/SideBar.jsx
import React from "react";

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const WarningIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-yellow-400">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.46 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export default function Sidebar({ priorityFilter, setPriorityFilter }) {
  // 🔥 Risk levels with clear red→green progression
  const riskLevels = [
    {
      key: "Very Critical",
      range: "0.9 – 1.0",
      color: "bg-red-600",
      border: "border-red-400",
    },
    {
      key: "Critical",
      range: "0.8 – 0.9",
      color: "bg-orange-500",
      border: "border-orange-400",
    },
    {
      key: "High",
      range: "0.7 – 0.8",
      color: "bg-yellow-400",
      border: "border-yellow-300",
    },
    {
      key: "Medium",
      range: "0.6 – 0.7",
      color: "bg-lime-400",
      border: "border-lime-300",
    },
    {
      key: "Low",
      range: "0.5 – 0.6",
      color: "bg-green-500",      // ✅ make Low clearly GREEN
      border: "border-green-400", // ✅ green border too
    },
  ];

  const handlePriorityChange = (e) => {
    const { name, checked } = e.target;
    setPriorityFilter((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  return (
    <aside className="bg-gradient-to-b from-[#031833] to-[#0b4a8b] text-white p-6 flex flex-col gap-8 overflow-y-auto">
      {/* HEADER + FILTERS */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <FilterIcon />
          <h2 className="text-2xl font-bold">Filters</h2>
        </div>

        {/* RISK LEVEL FILTER */}
        <div>
          <h3 className="text-sm font-semibold mb-4 uppercase tracking-wide">
            Risk Level (Score Band)
          </h3>

          <div className="flex flex-col gap-3">
            {riskLevels.map((level) => (
              <label
                key={level.key}
                className="flex items-center gap-3 cursor-pointer group"
              >
                {/* checkbox */}
                <input
                  type="checkbox"
                  name={level.key}
                  checked={priorityFilter[level.key] || false}
                  onChange={handlePriorityChange}
                  className={`h-5 w-5 rounded bg-gray-900 border-gray-600
                              accent-current`}  // browsers that support accent-color
                  style={{ accentColor: level.key === "Low" ? "#16a34a" : undefined }} // ✅ force green for Low
                />

                {/* label with colored chip + range */}
                <div
                  className={`flex flex-col px-3 py-2 rounded-md w-full border ${level.border}
                              bg-gradient-to-r from-black/30 to-transparent`}
                >
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-bold w-fit text-white ${level.color}`}
                  >
                    {level.key}
                  </span>
                  <span className="text-xs text-gray-300 mt-1">
                    Score: {level.range}
                  </span>
                </div>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* OVERVIEW (you can keep or tweak numbers) */}
      <div className="bg-white/5 p-4 rounded-lg mt-4">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <WarningIcon />
          Today's Overview
        </h3>

        <div className="flex flex-col gap-3">
          <div className="flex justify-between bg-black/20 p-3 rounded-md">
            <span className="text-sm text-gray-300">Today's Complaints</span>
            <span className="font-bold">6,262</span>
          </div>

          <div className="flex justify-between bg-black/20 p-3 rounded-md">
            <span className="text-sm text-gray-300">Very Critical Alerts</span>
            <span className="font-bold text-red-400">8</span>
          </div>

          <div className="flex justify-between bg-black/20 p-3 rounded-md">
            <span className="text-sm text-gray-300">Critical Alerts</span>
            <span className="font-bold text-orange-400">12</span>
          </div>

          <div className="flex justify-between bg-black/20 p-3 rounded-md">
            <span className="text-sm text-gray-300">High Alerts</span>
            <span className="font-bold text-yellow-300">62</span>
          </div>

          <div className="flex justify-between bg-black/20 p-3 rounded-md">
            <span className="text-sm text-gray-300">Medium Alerts</span>
            <span className="font-bold text-lime-300">6,052</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
