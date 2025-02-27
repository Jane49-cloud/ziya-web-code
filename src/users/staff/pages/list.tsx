import { useState } from "react";
import { UsersTable } from "../components/usersTable";
import { UsersCardGrid } from "../components/userCards";
import { useGetAllUsersQuery } from "../../features/userSlice";

export function AllUsers() {
  const [viewMode] = useState<"table" | "card">("table");

  const { data, isLoading, error } = useGetAllUsersQuery(undefined);
  const users = data?.staffs;
  // console.log(users);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">Error loading users.</div>;
  if (!users || users?.length === 0) return <div>No users found.</div>;

  return (
    <div>
      <div className="flex justify-end mb-4">
        {/* <button
          onClick={() => setViewMode("table")}
          className={`px-5 py-2 rounded-l-md ${
            viewMode === "table" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Table View
        </button>
        <button
          onClick={() => setViewMode("card")}
          className={`px-4 py-2 rounded-r-md ${
            viewMode === "card" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Card View
        </button> */}
      </div>
      {viewMode === "table" ? (
        <UsersTable users={users} />
      ) : (
        <UsersCardGrid users={users} />
      )}
    </div>
  );
}
