/* eslint-disable @typescript-eslint/no-unused-vars */
import { FC } from "react";
import { Tabs } from "antd";
import { RoleList } from "./pages/roleList";
import { RoleForm } from "./pages/roleForm";

const { TabPane } = Tabs;

export const RolesTabs: FC<{
  activeKey: string;
  setActiveKey: (key: string) => void;
}> = ({ activeKey, setActiveKey }) => {
  const handleSubmit = () => {
    setActiveKey("1");
  };

  return (
    <Tabs activeKey={activeKey} onChange={setActiveKey}>
      <TabPane tab="All Roles" key="1">
        <RoleList
          onEdit={(_roleId) => setActiveKey("2")}
          onDelete={() => setActiveKey("1")}
        />
      </TabPane>
      <TabPane tab="Create Role" key="2">
        <RoleForm onSubmit={handleSubmit} roles={[]} />
      </TabPane>
    </Tabs>
  );
};
