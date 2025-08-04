import { useParams } from "react-router-dom";
import { Spin, Empty, Tabs, Card, Row, Col } from "antd";
import { FaPhoneAlt, FaIdBadge } from "react-icons/fa";
import { useGetCustomerByIdQuery } from "../features/customerSlice";
import { useGetLoansByCustomerIdQuery } from "../../Loans/features/loanSlice";
import CustomerTabs from "../tabs/customerTabs";
import CustomerBusinessList from "../components/customerBusinessList";
import CustomerLoansList from "./customerLoans";
import { customAvatar, formatDate } from "../../utils";

const CustomerPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: customerData, isLoading: customerLoading } =
    useGetCustomerByIdQuery(id);
  const { data: loanData } = useGetLoansByCustomerIdQuery(Number(id), {
    skip: !id,
  });

  const customer = customerData?.customer;
  const loans = loanData?.loans || [];

  const latestLoan = loans.length
    ? [...loans].sort(
        (a, b) =>
          new Date(b.date_created).getTime() -
          new Date(a.date_created).getTime()
      )[0]
    : null;

  const balance = latestLoan ? latestLoan.balance : 0;
  const amount = latestLoan ? latestLoan.amount : 0;
  const totalPaid = amount && balance ? amount - balance : 0;

  if (customerLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Spin size="large" />
      </div>
    );
  }

  if (!customer) return <Empty description="Customer not found" />;

  return (
    <div className="p-6">
      {/* Customer Header */}
      <div className=" mb-8 border border-gray-100 rounded p-8">
        <div className="flex items-center space-x-6 ">
          <div className="w-24 h-24 flex justify-center items-center rounded-full bg-gray-200">
            {customAvatar(
              `${customer.firstname} ${customer.middlename || ""} ${
                customer.lastname
              }`
            )}
          </div>
          <div>
            <h2 className="text-3xl font-semibold text-gray-900">
              {`${customer.firstname} ${customer.middlename || ""} ${
                customer.lastname
              }`}
            </h2>
            <p className="flex items-center text-gray-600 mt-2">
              <FaPhoneAlt className="mr-2 text-gray-400" />
              {customer.country_code} {customer.phone_number}
            </p>
            <p className="flex items-center text-gray-600 mt-1">
              <FaIdBadge className="mr-2 text-gray-400" />
              {customer.identification_number}
            </p>
          </div>
        </div>
      </div>

      {/* Loan Summary Card */}
      {latestLoan && (
        <Card
          className="rounded-md mb-8"
          style={{
            borderLeft: "5px solid #1677ff",
            backgroundColor: "#f0f6ff",
          }}
        >
          <Row gutter={24}>
            <Col span={6}>
              <p className="text-gray-500 text-sm mb-1">Latest Loan Amount</p>
              <h3 className="text-lg font-semibold text-blue-700">
                KSH {Number(amount).toLocaleString()}
              </h3>
            </Col>
            <Col span={6}>
              <p className="text-gray-500 text-sm mb-1">Outstanding Balance</p>
              <h3 className="text-lg font-semibold text-red-600">
                KSH {Number(balance).toLocaleString()}
              </h3>
            </Col>
            <Col span={6}>
              <p className="text-gray-500 text-sm mb-1">Total Paid</p>
              <h3 className="text-lg font-semibold text-green-600">
                KSH {Number(totalPaid).toLocaleString()}
              </h3>
            </Col>
            <Col span={6}>
              <p className="text-gray-500 text-sm mb-1">Issued On</p>
              <h3 className="text-base text-gray-700">
                {formatDate(latestLoan.date_created)}
              </h3>
            </Col>
          </Row>
        </Card>
      )}

      {/* Tabbed Section */}
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Customer Details" key="1">
          <CustomerTabs customer={customer} recentLoans={loans.slice(0, 3)} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Businesses" key="2">
          <CustomerBusinessList customerId={customer.id} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Loans" key="3">
          <CustomerLoansList customerId={customer.id} />
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default CustomerPage;
