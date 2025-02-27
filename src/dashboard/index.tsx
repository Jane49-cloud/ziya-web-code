import React from "react";
import AdminDashboard from "./adminDashboard";
import StaffDashboard from "./staffDashboard";
import { getRole } from "../utils";
const Dashboard: React.FC = () => {
  const role = getRole();
  const userRole = role?.name || "guest";

  return (
    <div>
      {userRole === "admin" || userRole === "dev" ? (
        <AdminDashboard />
      ) : (
        <StaffDashboard />
      )}
    </div>
  );
};

export default Dashboard;
