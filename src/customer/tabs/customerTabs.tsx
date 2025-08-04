import { FC, useState } from "react";
import { Card, Input, Typography } from "antd";
import { formatDate } from "../../utils";

const { Search } = Input;
const { Text } = Typography;

interface Customer {
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
}

const CustomerTabs: FC<CustomerTabsProps> = ({ customer, recentLoans }) => {
  const [searchText, setSearchText] = useState("");

  const customerData = [
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
      value: customer.identification_type,
    },
    {
      key: "5",
      label: "Identification Number",
      value: customer.identification_number,
    },
    {
      key: "6",
      label: "Last Login",
      value: new Date(customer.last_login).toLocaleString(),
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
  ];

  const filteredData = customerData.filter(
    (item) =>
      item.label.toLowerCase().includes(searchText.toLowerCase()) ||
      item.value.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <div className="w-full flex flex-col lg:flex-row gap-6 mt-10">
      {/* Customer Info Card */}
      <div className="w-full lg:w-1/2">
        <Card className="shadow-sm rounded-lg">
          <div className="flex justify-end mb-4">
            <Search
              placeholder="Search details"
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 200 }}
              allowClear
            />
          </div>

          <div className="">
            {filteredData.map((item) => (
              <div
                key={item.key}
                className="flex justify-between py-3 items-center  mb-2 rounded  p-2  border border-gray-50 hover:bg-gray-50 transition"
              >
                <span className="text-sm text-gray-600 font-medium">
                  {item.label}
                </span>
                <span className="text-sm text-gray-800">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Loans */}
      <div className="w-full lg:w-1/2">
        <Card
          title="Recent Loans"
          className="shadow-sm rounded-lg bg-amber-300"
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
                    className="w-full bg-[whitesmoke] border border-gray-200 rounded-md p-3 hover:shadow-sm transition"
                  >
                    <p className="text-xs text-gray-500 mb-3">
                      {formatDate(loan.date_created)}
                    </p>

                    <div className="flex flex-wrap text-sm text-gray-700 gap-x-6 gap-y-2">
                      <span>
                        <strong>ID:</strong> #{loan?.id}
                      </span>
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
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default CustomerTabs;
