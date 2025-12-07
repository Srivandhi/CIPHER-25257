// src/App.jsx
import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import LoginPage from "./page";                 // ./page/index.jsx
import CipherDashboard from "./CipherDashboard"; // your CIPHER dashboard component


export default function App() {
  const navigate = useNavigate();

  // called when "Action" button is pressed on a complaint
  const handleOpenDashboard = (complaint) => {
    navigate(`/dashboard/${complaint.id}`, { state: { complaint } });
  };

  return (
    <Routes>
      <Route
        path="/"
        element={<LoginPage onAction={handleOpenDashboard} />}
      />
      <Route path="/dashboard/:complaintId" element={<CipherDashboard />} />
    </Routes>
  );
}


