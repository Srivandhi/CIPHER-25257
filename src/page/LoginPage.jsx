// page/LoginPage.jsx (or wherever your first page is)
import { useNavigate } from "react-router-dom";

function ComplaintCard({ complaint }) {
  const navigate = useNavigate();

  const handleAction = () => {
    // VERY IMPORTANT: pass state: { complaint }
    navigate("/cipher-dashboard", { state: { complaint } });
  };

  return (
    <div className="complaint-card">
      <div>{complaint.complaint_id}</div>
      {/* ... other UI ... */}
      <button onClick={handleAction}>Action</button>
    </div>
  );
}
