import { useParams } from "react-router-dom";
import { Spin, Empty, Tabs, Card, Row, Col, message } from "antd";
import { FaPhoneAlt, FaIdBadge } from "react-icons/fa";
import { useGetCustomerByIdQuery } from "../features/customerSlice";
import { useGetLoansByCustomerIdQuery } from "../../Loans/features/loanSlice";
import CustomerTabs from "../tabs/customerTabs";
import CustomerBusinessList from "../components/customerBusinessList";
// import CustomerLoansList from "./customerLoans";
import { formatDate, formatName, getInitials } from "../../utils";
import CustomerPasswordReset from "../components/customerPasswordReset";
import { SubscriptionModal } from "../components/subscriptionModal";
import { useCreateSubscriptionMutation } from "../features/customerSlice";
import { useState, useMemo } from "react";
import CustomerSubscriptionHistoryTab from "../components/subscriptions/customerSubscriptionHistoryTab";
import CustomerWalletTab from "../components/wallet/customerWalletTab";
import CustomerTransactionsTab from "../components/wallet/customerTransactionsTab";

const CustomerPage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: customerData, isLoading: customerLoading, refetch } =
    useGetCustomerByIdQuery(id);
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [createSubscription, { isLoading: creatingSubscription }] =
    useCreateSubscriptionMutation();
  const { data: loanData } = useGetLoansByCustomerIdQuery(Number(id), {
    skip: !id,
  });

  const customer = customerData?.customer;
  const loans = loanData?.loans || [];

  // const isSubscriptionActive = (status: unknown) => {
  //   if (typeof status === "string") {
  //     return status.toLowerCase() === "active";
  //   }
  //   return Number(status) === 1;
  // };

  const fullName = useMemo(() => {
    if (!customer) return "";

    const rawName = `${customer.firstname ?? ""} ${customer.middlename ?? ""} ${customer.lastname ?? ""
      }`
      .replace(/\s+/g, " ")
      .trim();

    return formatName(rawName);
  }, [customer]);

  const lastLoginDisplay = customer?.last_login
    ? new Date(customer.last_login)?.toLocaleString()
    : "No login recorded";

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

  const handleCreateSubscription = async ({
    start_date,
    end_date,
  }: {
    start_date: string;
    end_date: string;
  }) => {
    if (!customer) return;
    try {
      await createSubscription({
        customer_id: customer.id,
        start_date,
        end_date,
      }).unwrap();
      message.success("Subscription activated successfully");
      setSubscriptionModalOpen(false);
      await refetch();
    } catch (err: unknown) {
      const apiError = (err as { data?: { error?: string } })?.data?.error;
      message.error(apiError || "Failed to create subscription");
    }
  };

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
      <div className="mb-8 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-white/60 via-slate-50/50 to-white/10 p-8 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/40 bg-gradient-to-br from-[#32c5f4] via-[#1c5f81] to-[#091423] text-2xl font-semibold text-white shadow-md">
              {getInitials(fullName)}
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-slate-900 md:text-3xl">
                {fullName || "Unnamed Customer"}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {customer.email || "No email on file"}
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 backdrop-blur-sm">
                  <FaPhoneAlt className="text-primary" />
                  {customer.country_code} {customer.phone_number || "N/A"}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 backdrop-blur-sm">
                  <FaIdBadge className="text-primary" />
                  {customer.identification_number || "Not provided"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-4 text-sm text-slate-600 md:items-end md:text-right">

            {/* Pending, works on changing this to arrears */}

            {/* <Tag
              color={isSubscriptionActive(customer.subscription_status) ? "green" : "red"}
              className="self-start rounded-full px-4 py-1 text-sm md:self-end"
            >
              {isSubscriptionActive(customer.subscription_status)
                ? "Subscribed"
                : "Unsubscribed"}
            </Tag> */}
            {/* {!isSubscriptionActive(customer.subscription_status) && (
              <Button
                type="primary"
                size="large"
                onClick={() => setSubscriptionModalOpen(true)}
              >
                Activate Subscription
              </Button>
            )} */}
            <div className="space-y-1">
              <div>
                <strong className="text-slate-500">Customer ID:</strong> {customer.id}
              </div>
              <div>
                <strong className="text-slate-500">Joined:</strong> {formatDate(customer.date_created)}
              </div>
              <div>
                <strong className="text-slate-500">Last Login:</strong> {lastLoginDisplay}
              </div>
            </div>
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
                {formatDate(latestLoan.date_issued)}
              </h3>
            </Col>
          </Row>
        </Card>
      )}

      {/* Tabbed Section */}
      <Tabs defaultActiveKey="1">
        <Tabs.TabPane tab="Customer Details" key="1">
          <CustomerTabs
            customer={customer}
            recentLoans={loans.slice(0, 3)}
            onCustomerUpdated={() => refetch()}
          />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Businesses" key="2">
          <CustomerBusinessList customerId={customer.id} />
        </Tabs.TabPane>
        {/* <Tabs.TabPane tab="Loans" key="3">
          <CustomerLoansList customerId={customer.id} />
        </Tabs.TabPane> */}
        <Tabs.TabPane tab="Subscription History" key="4">
          <CustomerSubscriptionHistoryTab customerId={customer.id} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Reset Password" key="5">
          <CustomerPasswordReset customerId={customer.id} />
        </Tabs.TabPane>

        {/* addeded working on */}

        <Tabs.TabPane tab="Wallet" key="6">
          <CustomerWalletTab customerId={customer.id} />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Transactions" key="7">
          <CustomerTransactionsTab customerId={customer.id} />
        </Tabs.TabPane>



      </Tabs>

      <SubscriptionModal
        open={subscriptionModalOpen}
        onCancel={() => setSubscriptionModalOpen(false)}
        onSubmit={handleCreateSubscription}
        loading={creatingSubscription}
      />
    </div>
  );
};

export default CustomerPage;
