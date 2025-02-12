import React, { useEffect, useState } from "react";
import { Tabs } from "antd";
import { useLoadUserQuery } from "../../redux/api";
import { customAvatar, getUser } from "../../utils";
import AccountTab from "./account";
import CustomersTab from "./customers";
// import HistoryTab from "./history";
import { UpdatePassword } from "./updatePassword";

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

export const UserProfilePage: React.FC = () => {
  const { data: userData, refetch } = useLoadUserQuery(null);
  const [user, setUser] = useState<UserProfile | null>(getUser());

  useEffect(() => {
    if (userData) {
      setUser(userData);
      localStorage.setItem("ziya-profile", JSON.stringify(userData));
    }
  }, [userData]);

  useEffect(() => {
    refetch();
  }, [refetch]);

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
      key: "Password",
      label: "update password",
      children: <UpdatePassword />,
    },
  ];

  const fullName = `${user?.firstname ?? ""} ${user?.lastname ?? ""}`.trim();

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="rounded-md bg-white p-6 shadow sm:p-8">
        <div className="flex items-center space-x-4">
          {customAvatar(fullName || "User")}
          <div>
            <h1 className="text-xl font-bold text-gray-800 capitalize">
              {fullName}
            </h1>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <p className="text-sm text-gray-500">
              {user?.role || "Ziya staff"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <Tabs defaultActiveKey="account" items={tabItems} />
        </div>
      </div>
    </div>
  );
};
