// Dashboard.tsx
import React from "react";

interface DashboardProps {
  userRole: string;
}

const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const isAdmin = userRole === "admin ";
  const isManager = userRole === "manager";
  const isStandardUser = userRole === "user";

  return (
    <div className="p-6 space-y-6 bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>

      <div className="p-3 text-sm bg-yellow-100 text-yellow-600 rounded-md">
        <strong>Under Construction</strong>: features may not be fully
        implemented yet.
      </div>

      {isAdmin && (
        <section className="border p-4 rounded-md space-y-2">
          <h2 className="text-xl font-semibold">Admin Stats</h2>
          <p>
            Total Users: <strong>150</strong>
          </p>
          <p>
            Server Health: <span className="text-green-600">Online</span>
          </p>
        </section>
      )}

      {/* Manager and above */}
      {(isAdmin || isManager) && (
        <section className="border p-4 rounded-md space-y-2">
          <h2 className="text-xl font-semibold">Manager Stats</h2>
          <p>
            Pending Approvals: <strong>23</strong>
          </p>
          <p>
            Team Performance: <strong>85%</strong>
          </p>
        </section>
      )}

      {(isStandardUser || isManager || isAdmin) && (
        <section className="border p-4 rounded-md space-y-2">
          <h2 className="text-xl font-semibold">General Dashboard</h2>
          <p>
            Welcome, <strong>{userRole.toUpperCase()}</strong>!
          </p>
          <p>Your recent activity will appear here.</p>
        </section>
      )}
    </div>
  );
};

export default Dashboard;
