import { useParams } from "react-router-dom";
import { Spin, Empty, Tabs, Card } from "antd";
import CustomerBusinessList from "../components/customerBusinessList";
import { useGetCustomerByIdQuery } from "../features/customerSlice";
import CustomerTabs from "../tabs/customerTabs";
import { customAvatar } from "../../utils";
import { FaEnvelope } from "react-icons/fa6";
import { FaPhoneAlt } from "react-icons/fa";

const CustomerPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading } = useGetCustomerByIdQuery(id);
  const customer = data?.customer;

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!customer) return <Empty description="Customer not found" />;

  return (
    <div className="p-6">
      <Card bordered={false} className="shadow-sm mb-10">
        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 flex justify-center items-center rounded-full bg-gray-200">
            {customAvatar(`${customer?.firstname} ${customer?.lastname}`)}
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">{`${customer?.firstname} ${customer?.middlename} ${customer?.lastname}`}</h2>
            <p className="text-gray-500">{customer?.email}</p>
            <p className="flex items-center text-gray-600 mt-2">
              <FaPhoneAlt className="mr-2 text-gray-400" />
              {customer?.country_code} {customer?.phone_number}
            </p>
            <p className="flex items-center text-gray-600 mt-1">
              <FaEnvelope className="mr-2 text-gray-400" />
              {customer?.email}
            </p>
          </div>
        </div>
      </Card>
      <Tabs defaultActiveKey="1" className="mt-6">
        <Tabs.TabPane tab="Customer Details" key="1">
          <CustomerTabs customer={customer} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Businesses" key="2">
          <CustomerBusinessList customerId={customer.id} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default CustomerPage;
