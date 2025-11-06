import { FC, useMemo, useState } from "react";
import { Card, Typography, Divider, Avatar, Button } from "antd";
import { EditOutlined } from "@ant-design/icons";
import { formatDate } from "../../utils";
import { getInitials } from "../../utils";
import CustomerForm from "../components/customerForm";

const { Text } = Typography;

interface Customer {
  id: number;
  firstname: string;
  middlename?: string;
  lastname: string;
  email: string;
  country_code: string;
  phone_number: string;
  status: number;
  identification_type: string;
  identification_number: string;
  last_login: string;
  date_created: string;
  date_updated: string;
}

interface Loan {
  id: number;
  amount: number;
  balance: number;
  currency: string;
  date_created: string;
}

interface CustomerTabsProps {
  customer: Customer;
  recentLoans: Loan[];
  onCustomerUpdated?: () => void;
}

const CustomerTabs: FC<CustomerTabsProps> = ({
  customer,
  recentLoans,
  onCustomerUpdated,
}) => {
  const [isEditModalOpen, setEditModalOpen] = useState(false);

  const customerData = useMemo(
    () => [
      {
        key: "1",
        label: "Full Name",
        value: `${customer.firstname} ${customer.middlename || ""} ${
          customer.lastname
        }`.trim(),
      },
      {
        key: "2",
        label: "Phone",
        value: `${customer.country_code} ${customer.phone_number}`,
      },
      {
        key: "3",
        label: "Status",
        value: customer.status === 1 ? "Active" : "Inactive",
      },
      {
        key: "4",
        label: "Identification Type",
        value: customer.identification_type || "—",
      },
      {
        key: "5",
        label: "Identification Number",
        value: customer.identification_number || "—",
      },
      {
        key: "6",
        label: "Last Login",
        value: customer.last_login
          ? new Date(customer.last_login).toLocaleString()
          : "Never",
      },
      {
        key: "7",
        label: "Date Created",
        value: new Date(customer.date_created).toLocaleDateString(),
      },
      {
        key: "8",
        label: "Last Updated",
        value: new Date(customer.date_updated).toLocaleString(),
      },
    ],
    [customer]
  );

  return (
    <div className="mt-6 flex w-full flex-col gap-6 lg:flex-row">
      {/* Customer Info Card */}
      <div className="w-full lg:w-1/2">
        <Card className="shadow-sm" bodyStyle={{ padding: 24 }}>
          <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <Avatar size={56} className="bg-blue-600 font-semibold">
                {getInitials(
                  `${customer.firstname} ${customer.middlename || ""} ${
                    customer.lastname
                  }`
                )}
              </Avatar>
              <div>
                <Text className="block text-lg font-semibold text-gray-900">
                  {`${customer.firstname} ${customer.middlename || ""} ${
                    customer.lastname
                  }`.replace(/\s+/g, " ").trim()}
                </Text>
                <Text type="secondary" className="mt-1 block text-sm">
                  {customer.email || "No email on file"}
                </Text>
              </div>
            </div>
            <Button
              icon={<EditOutlined />}
              onClick={() => setEditModalOpen(true)}
            >
              Edit Customer
            </Button>
          </div>
          <Divider className="my-2" />
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {customerData.map((item) => (
              <div
                key={item.key}
                className="rounded-lg border border-gray-100 bg-white px-4 py-3 shadow-sm transition hover:border-blue-200 hover:shadow"
              >
                <span className="block text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {item.label}
                </span>
                <span className="mt-1 block text-sm text-gray-900">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Loans */}
      <div className="w-full lg:w-1/2">
        <Card
          title={<span className="text-base font-semibold">Recent Loans</span>}
          className="shadow-sm"
          bodyStyle={{ padding: 24 }}
        >
          {recentLoans.length === 0 ? (
            <Text type="secondary">No recent loans found.</Text>
          ) : (
            <div className="flex flex-col gap-4">
              {recentLoans.map((loan) => {
                const paid = loan.amount - loan.balance;
                return (
                  <div
                    key={loan.id}
                    className="rounded-lg border border-gray-100 bg-slate-50 p-4 transition hover:border-blue-200 hover:bg-white hover:shadow"
                  >
                    <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
                      <span className="font-semibold uppercase tracking-wide">
                        Loan #{loan.id}
                      </span>
                      <span>{formatDate(loan.date_created)}</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-sm text-gray-700 md:grid-cols-2">
                      <span>
                        <strong>Amount:</strong> {loan.currency}{" "}
                        {loan.amount.toLocaleString()}
                      </span>
                      <span>
                        <strong>Balance:</strong> {loan.currency}{" "}
                        {loan.balance.toLocaleString()}
                      </span>
                      <span>
                        <strong>Paid:</strong> {loan.currency}{" "}
                        {paid.toLocaleString()}
                      </span>
                      <span>
                        <strong>Status:</strong> {loan.balance === 0 ? "Cleared" : "Active"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>

      <CustomerForm
        visible={isEditModalOpen}
        onClose={() => setEditModalOpen(false)}
        customer={customer}
        onSuccess={() => {
          setEditModalOpen(false);
          onCustomerUpdated?.();
        }}
      />
    </div>
  );
};

export default CustomerTabs;
