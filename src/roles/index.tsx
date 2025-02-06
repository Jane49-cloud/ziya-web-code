import { useState } from "react";
import { RolesTabs } from "./tabs";

export function RolesManagement() {
  const [activeTabKey, setActiveTabKey] = useState("1");

  return (
    <div className="p-4">
      <RolesTabs activeKey={activeTabKey} setActiveKey={setActiveTabKey} />
    </div>
  );
}
