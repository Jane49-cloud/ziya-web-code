/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useParams } from "react-router-dom";
import { customAvatar } from "../../utils";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { Tabs, Card, Empty, Spin, Table } from "antd";
import { useGetUserByIdQuery } from "../../users/features/userSlice";

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetUserByIdQuery(id);
  const user = data?.staff.staffData;
  // const role = data?.staff.userRole;
  // console.log(user);

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
    last_login,
    date_created,
    country,
    city,
  } = user;

  const staffDetails = [
    {
      key: "1",
      label: "Full Name",
      value: `${firstname} ${middlename} ${lastname}`,
    },
    { key: "2", label: "Email", value: email },
    {
      key: "3",
      label: "Phone Number",
      value: `${country_code} ${phone_number}`,
    },
    { key: "4", label: "Location", value: `${city}, ${country}` },
    {
      key: "5",
      label: "Joined",
      value: new Date(date_created).toLocaleDateString(),
    },
    {
      key: "6",
      label: "Last Login",
      value: new Date(last_login).toLocaleString(),
    },
  ];

  const columns = [
    {
      title: "Field",
      dataIndex: "label",
      key: "label",
      render: (text: string) => <span className="text-gray-600">{text}</span>,
    },
    {
      title: "Details",
      dataIndex: "value",
      key: "value",
    },
  ];

  return (
    <div className="py-6">
      {/* Profile Header */}
      <Card bordered={false} className="shadow-sm mb-10">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 flex justify-center items-center rounded-full bg-gray-200">
            {customAvatar(`${firstname} ${lastname}`)}
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">{`${firstname} ${middlename} ${lastname}`}</h2>
            <p className="text-gray-500">{email}</p>
            {/* <p className="text-green-500 capitalize">({role?.name})</p> */}

            <p className="flex items-center text-gray-600 mt-2">
              <FaPhoneAlt className="mr-2 text-gray-400" />
              {country_code} {phone_number}
            </p>
            <p className="flex items-center text-gray-600 mt-1">
              <FaEnvelope className="mr-2 text-gray-400" />
              {email}
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Tabs */}
      <Tabs defaultActiveKey="1" className="mt-10">
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
            />
          </Card>
        </Tabs.TabPane>

        {/* Assigned Customers Tab */}
        <Tabs.TabPane tab="Assigned Customers" key="2">
          {user.customers && user.customers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {user.customers.map((customer: any) => (
                <div
                  key={customer.id}
                  className="bg-gray-100 p-4 rounded-lg text-left"
                >
                  <div>{customAvatar(customer.name)}</div>
                  <p className="mt-2 text-sm text-gray-600">{customer.name}</p>
                </div>
              ))}
            </div>
          ) : (
            <Empty description="No customers assigned yet" />
          )}
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default PublicProfile;
