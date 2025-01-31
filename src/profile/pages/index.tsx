// pages/UserProfilePage.tsx
import React, { useState } from "react";
import { Tabs } from "antd"; // npm install antd
import { customAvatar, getUser } from "../../utils";
import AccountTab from "./account";
import CustomersTab from "./customers";
import HistoryTab from "./history";

// Define the user profile structure
export interface UserProfile {
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
  country_code: string;
  phone_number: string;
  password: string;
  avatar?: string;
  activation_code?: string;
  role: string;
}
const initialUser = getUser();
console.log(initialUser);

export const UserProfilePage: React.FC = () => {
  const [user, setUser] = useState(initialUser);

  const tabItems = [
    {
      key: "account",
      label: "Account",
      children: <AccountTab user={user} setUser={setUser} />,
    },
    {
      key: "customers",
      label: "Customers",
      children: <CustomersTab />,
    },
    {
      key: "history",
      label: "History",
      children: <HistoryTab />,
    },
  ];

  // Combine full name (for fallback avatar initials)
  const fullName = `${user?.firstname} ${user?.lastname}`.trim();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="rounded-md bg-white p-6 shadow sm:p-8">
        <div className="flex items-center space-x-4">
          {user?.avatar
            ? // <img
              //   src={user?.avatar}
              //   alt={fullName || "User Avatar"}
              //   className="h-16 w-16 rounded-full object-cover"
              // />
              customAvatar(fullName || "User")
            : customAvatar(fullName || "User")}
          <div>
            <h1 className="text-xl font-bold text-gray-800 capitalize">
              {fullName}
            </h1>
            <p className="text-sm text-gray-500 ">{user?.email}</p>
            <p className="text-sm text-gray-500">
              {user?.role || "Ziya staff"}
            </p>
          </div>
        </div>

        {/* AntD Tabs */}
        <div className="mt-6">
          <Tabs defaultActiveKey="account" items={tabItems} />
        </div>
      </div>
    </div>
  );
};
