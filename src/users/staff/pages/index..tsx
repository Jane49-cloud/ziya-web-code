import { useState } from "react";
import { AddUser } from "../../../auth/pages/addUser";
import { TabNavigation } from "../components/navigation";
import { AllUsers } from "./list";

const TABS = [
  { id: "all", label: "All Users" },
  { id: "add", label: "Add User" },
  { id: "reports", label: "Reports" },
  { id: "settings", label: "Settings" },
];

export default function Staff() {
  const [activeTab, setActiveTab] = useState("all");

  const handleUserCreated = () => {
    setActiveTab("all");
  };

  return (
    <div className="p-4">
      <TabNavigation
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      <div className="mt-6">
        {activeTab === "all" && <AllUsers />}
        {/* Pass the callback to <AddUser /> */}
        {activeTab === "add" && <AddUser onUserCreated={handleUserCreated} />}
        {activeTab !== "all" && activeTab !== "add" && (
          <div className="text-center text-gray-500 mt-10">
            Under Construction...
          </div>
        )}
      </div>
    </div>
  );
}
