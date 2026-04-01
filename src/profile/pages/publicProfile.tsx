/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { customAvatar, formatName, getRole } from "../../utils";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import {
  Tabs,
  Card,
  Empty,
  Spin,
  Table,
  Button,
  Tag,
  Descriptions,
} from "antd";
import { UserOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { useGetUserByIdQuery } from "../../users/features/userSlice";
import ResetPasswordForm from "../../users/staff/components/resetPassword";
import { useGetStaffRoleQuery } from "../../roles/features/rolesSlice";
import AccountTab from "./account";

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, refetch } = useGetUserByIdQuery(id);
  const user = data?.staff;

  // admin = dev
  const currentViewerRole = getRole();
  const canEditRole =
    currentViewerRole === "admin" || currentViewerRole === "support" || currentViewerRole === "dev";
  const {
    data: roleData,
    isLoading: roleLoading,
    refetch: refetchRole,
  } = useGetStaffRoleQuery(user?.role, {
    skip: !user?.role,
  });

  const userRole = roleData?.role;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (!user) {
    return <Empty description="User not found" />;
  }

  const {
    firstname,
    lastname,
    middlename,
    email,
    phone_number,
    country_code,
    // last_login,
    // date_created,
    // country,
    // city,
  } = user;

  const fullName = formatName(
    `${firstname ?? ""} ${middlename ?? ""} ${lastname ?? ""}`.trim(),
  );

  const staffDetails = [
    {
      key: "1",
      label: "Full Name",
      value: fullName,
    },
    { key: "2", label: "Email", value: email },
    {
      key: "3",
      label: "Phone Number",
      value: `${country_code} ${phone_number}`,
    },
    // { key: "4", label: "Location", value: `${city}, ${country}` },
    // {
    //   key: "5",
    //   label: "Joined",
    //   value: new Date(date_created).toLocaleDateString(),
    // },
    // {
    //   key: "6",
    //   label: "Last Login",
    //   value: last_login ? new Date(last_login).toLocaleString() : "Never",
    // },
  ];

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      width: "30%",
      render: (text: string) => (
        <span className="text-gray-600 font-medium">{text}</span>
      ),
    },
    {
      title: "Details",
      dataIndex: "value",
      key: "value",
    },
  ];

  const getRoleStatusColor = (status: number) => {
    return status === 1 ? "success" : "default";
  };

  const handleProfileUpdateSuccess = () => {
    refetch();
    refetchRole();
  };

  return (
    <div className="py-6">
      {/* Profile Header */}
      <Card bordered={false} className="shadow-sm mb-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <Button
              type="link"
              onClick={() => navigate("/staff")}
              className="px-0 text-[#1677ff]"
            >
              ← Back to Staff
            </Button>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 flex justify-center items-center rounded-full bg-gradient-to-br from-blue-100 to-indigo-100">
                {customAvatar(fullName)}
              </div>
              <div>
                <h2 className="text-3xl font-semibold text-gray-900">
                  {fullName}
                </h2>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <p className="text-gray-500">{email}</p>
                  {roleLoading ? (
                    <Spin size="small" />
                  ) : userRole ? (
                    <Tag
                      color="blue"
                      className="capitalize px-3 py-1"
                      icon={<UserOutlined />}
                    >
                      {userRole.name}
                    </Tag>
                  ) : (
                    <Tag color="default" icon={<InfoCircleOutlined />}>
                      No role assigned
                    </Tag>
                  )}
                </div>

                <div className="mt-3 space-y-1">
                  <p className="flex items-center text-gray-600 text-sm">
                    <FaPhoneAlt className="mr-2 text-gray-400" />
                    {country_code} {phone_number}
                  </p>
                  <p className="flex items-center text-gray-600 text-sm">
                    <FaEnvelope className="mr-2 text-gray-400" />
                    {email}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Role Details Card */}
      {userRole && !roleLoading && (
        <Card
          bordered={false}
          className="shadow-sm mb-6 bg-gradient-to-br from-blue-50 to-indigo-50"
          style={{ marginTop: 5 }}
        >
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-600 mb-3">
                Current Role Details
              </h4>
              <Descriptions column={1} size="small">
                <Descriptions.Item
                  label={<span className="font-medium">Role Name</span>}
                >
                  <span className="capitalize font-semibold">
                    {userRole.name}
                  </span>
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-medium">Description</span>}
                >
                  {userRole.description || "No description available"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={<span className="font-medium">Status</span>}
                >
                  <Tag color={getRoleStatusColor(userRole.status)}>
                    {userRole.status === 1 ? "Active" : "Inactive"}
                  </Tag>
                </Descriptions.Item>
              </Descriptions>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Tabs */}
      <Tabs defaultActiveKey="1" className="mt-6">
        {/* Account Details Tab */}
        <Tabs.TabPane tab="Account Details" key="1">
          <Card bordered={false} className="shadow-sm">
            <h3 className="text-xl font-semibold mb-4">Staff Information</h3>
            <Table
              columns={columns}
              dataSource={staffDetails}
              pagination={false}
              showHeader={false}
              bordered
              size="middle"
            />
          </Card>
        </Tabs.TabPane>

        {/* Assigned Customers Tab */}
        <Tabs.TabPane tab="Assigned Customers" key="2">
          {user.customers && user.customers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.customers.map((customer: any) => (
                <Card
                  key={customer.id}
                  className="hover:shadow-md transition-shadow"
                  bodyStyle={{ padding: 16 }}
                >
                  <div className="flex items-center gap-3">
                    {customAvatar(customer.name)}
                    <div>
                      <p className="font-medium text-gray-900">
                        {customer.name}
                      </p>
                      <p className="text-xs text-gray-500">ID: {customer.id}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Empty description="No customers assigned yet" />
          )}
        </Tabs.TabPane>

        {/* Reset Password Tab */}
        <Tabs.TabPane tab="Reset Password" key="3">
          <Card bordered={false} className="shadow-sm">
            <ResetPasswordForm id={user.id} />
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Update Details" key="4">
          <Card bordered={false} className="shadow-sm">
            <AccountTab
              user={user}
              onUpdateSuccess={handleProfileUpdateSuccess}
              canEditRole={canEditRole}
            />
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default PublicProfile;
