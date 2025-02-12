/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useParams } from "react-router-dom";
import { customAvatar } from "../../utils";
import { FaPhoneAlt, FaEnvelope } from "react-icons/fa";
import { Tabs, Card, Empty, Spin } from "antd";
import { useGetUserByIdQuery } from "../../users/features/userSlice";

const PublicProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: user, isLoading } = useGetUserByIdQuery(id);

  // Loading state
  if (isLoading) {
    return <Spin size="large" className="flex justify-center items-center" />;
  }

  // If no user is found
  if (!user) {
    return <Empty description="User not found" />;
  }

  const {
    firstname,
    lastname,
    email,
    phone_number,
    avatar,
    customers,
    city,
    country,
    created_at,
  } = user;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Profile Header */}
      <div className="flex items-center space-x-6">
        <div className="w-24 h-24 flex justify-center items-center rounded-full bg-gray-200">
          {avatar ? (
            <img
              src={avatar}
              alt={`${firstname} ${lastname}`}
              className="w-20 h-20 rounded-full"
            />
          ) : (
            customAvatar(`${firstname} ${lastname}`)
          )}
        </div>
        <div>
          <h2 className="text-3xl font-semibold text-gray-900">{`${firstname} ${lastname}`}</h2>
          <p className="text-gray-500">{email}</p>
          <p className="flex items-center text-gray-600 mt-2">
            <FaPhoneAlt className="mr-2 text-gray-400" />
            {phone_number}
          </p>
          <p className="flex items-center text-gray-600 mt-1">
            <FaEnvelope className="mr-2 text-gray-400" />
            {email}
          </p>
        </div>
      </div>

      {/* Profile Tabs */}
      <Tabs defaultActiveKey="1" className="mt-6">
        {/* About Tab */}
        <Tabs.TabPane tab="About" key="1">
          <Card bordered={false}>
            <h3 className="text-xl font-semibold mb-4">About {firstname}</h3>
            <p>
              <strong>Location:</strong> {city}, {country}
            </p>
            <p>
              <strong>Joined:</strong>{" "}
              {new Date(created_at).toLocaleDateString()}
            </p>
          </Card>
        </Tabs.TabPane>

        {/* Assigned Customers Tab */}
        <Tabs.TabPane tab="Assigned Customers" key="2">
          {customers && customers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {customers.map((customer: any) => (
                <div
                  key={customer.id}
                  className="bg-gray-100 p-4 rounded-lg text-center"
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
