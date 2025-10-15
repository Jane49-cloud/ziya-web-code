import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftOutlined } from "@ant-design/icons";
import { Card, Tag, Row, Col, Typography, Space, Button } from "antd";
import { HiOutlineCurrencyDollar, HiOutlineUsers } from "react-icons/hi";
import {
  FaCalendarCheck,
  FaUserCheck,
  FaUser,
  FaMoneyBillWave,
  FaCoins,
} from "react-icons/fa";
import LoanRepaymentHistory from "../../customer/pages/LoanRepaymentHistory";
import { useGetUserByIdQuery } from "../../users/features/userSlice";
import { formatDate } from "../../utils";

interface LoanType {
  id: number;
  amount: number;
  balance: number;
  currency?: string;
  date_issued?: string;
  approved_by?: number;
  customer_id?: number;
  group_name?: string;
  recipient_firstname?: string;
  recipient_lastname?: string;
}

const SingleLoanPage = () => {
  const navigate = useNavigate();
  const [loan, setLoan] = useState<LoanType | null>(null);

  useEffect(() => {
    const storedLoan = localStorage.getItem("selectedLoan");
    if (storedLoan) {
      setLoan(JSON.parse(storedLoan));
    }
  }, []);

  const { data, isLoading: isUserLoading } = useGetUserByIdQuery(
    loan?.approved_by ?? 0,
    { skip: !loan?.approved_by }
  );

  const approvingUser = data?.staff?.staffData;
  // Math & Formatting
  const amount = Number(loan?.amount ?? 0);
  const balance = Number(loan?.balance ?? 0);
  const repaid = amount - balance;

  const formattedAmount = amount.toLocaleString();
  const formattedRepaid = repaid.toLocaleString();
  const formattedBalance = balance.toLocaleString();
  const formattedDate = formatDate(loan?.date_issued ?? "");

  const repaymentPercentage = amount > 0 ? (repaid / amount) * 100 : 0;
  const isFullyPaid = repaymentPercentage >= 100;

  const fullName =
    loan?.recipient_firstname || loan?.recipient_lastname
      ? `${loan?.recipient_firstname ?? ""} ${loan?.recipient_lastname ?? ""}`
      : "N/A";

  const summaryCards = summaryCardsFactory(
    formattedAmount,
    formattedRepaid,
    formattedBalance
  );

  const infoCards = [
    {
      title: "Recipient",
      value: fullName,
      icon: <FaUser className="text-lg" />,
    },
    {
      title: "Group",
      value: loan?.group_name ?? "N/A",
      icon: <HiOutlineUsers className="text-lg" />,
    },
    {
      title: "Approved On",
      value: formattedDate,
      icon: <FaCalendarCheck className="text-lg" />,
    },
    {
      title: "Approved By",
      value: isUserLoading
        ? "Loading..."
        : approvingUser
        ? `${approvingUser.firstname} ${approvingUser.lastname}`
        : "Group Admin",
      icon: <FaUserCheck className="text-lg" />,
    },
  ];

  if (!loan) {
    return (
      <div className="px-6 flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="text-6xl text-gray-300 mb-4">📄</div>
          <p className="text-gray-500 text-lg font-medium">No Loan Selected</p>
          <p className="text-gray-400 text-sm mt-2">
            Please select a loan to view details
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 md:px-8">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          className="!px-0 text-primary"
        >
          Back to Loans
        </Button>

        <Card
          bordered={false}
          className="shadow-lg rounded-2xl overflow-hidden"
        >
          <div className="relative overflow-hidden bg-gradient-to-r from-[#1f7dc8] via-[#32c5f4] to-[#8ad7ff] px-6 py-6">
            <div className="absolute inset-y-0 right-0 opacity-30">
              <div className="h-full w-40 rounded-full bg-white blur-3xl" />
            </div>
            <div className="relative flex items-center justify-between">
              <div>
                <Typography.Title level={3} className="!text-white !mb-1">
                  Loan #{loan.id}
                </Typography.Title>
                <Typography.Text className="text-slate-100/80">
                  Portfolio overview and repayment summary
                </Typography.Text>
              </div>
              <Tag
                color={
                  isFullyPaid
                    ? "green"
                    : repaymentPercentage > 50
                    ? "orange"
                    : "red"
                }
                className="rounded-full px-4 py-1 text-sm shadow-sm"
              >
                {isFullyPaid
                  ? "Fully Paid"
                  : `${repaymentPercentage.toFixed(1)}% Paid`}
              </Tag>
            </div>
          </div>

          <div className="px-6 pb-6 pt-4">
            <Row gutter={[16, 16]} className="mb-6">
              {summaryCards.map((card) => (
                <Col xs={24} md={8} key={card.title}>
                  <SummaryCard
                    icon={card.icon}
                    title={card.title}
                    value={card.value}
                    palette={card.palette}
                  />
                </Col>
              ))}
            </Row>

            <div className="loan-progress mb-8">
              <div className="flex justify-between items-center mb-2">
                <Typography.Text className="text-sm text-slate-500">
                  Repayment Progress
                </Typography.Text>
                <Typography.Text className="text-sm font-semibold text-slate-700">
                  {repaymentPercentage.toFixed(1)}%
                </Typography.Text>
              </div>
              <div className="h-3 w-full rounded-full bg-slate-200">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#1f7dc8] via-[#32c5f4] to-[#8ad7ff] transition-all duration-500"
                  style={{ width: `${Math.min(repaymentPercentage, 100)}%` }}
                />
              </div>
            </div>

            <Row gutter={[16, 16]}>
              {infoCards.map((info) => (
                <Col xs={24} md={12} key={info.title}>
                  <LoanInfoCard
                    icon={info.icon}
                    title={info.title}
                    value={info.value}
                  />
                </Col>
              ))}
            </Row>
          </div>
        </Card>

        <Card bordered={false} className="shadow-sm rounded-2xl">
          <Typography.Title level={4} className="!mb-4">
            Repayment History
          </Typography.Title>
          <LoanRepaymentHistory
            loanId={loan.id}
            loanAmount={amount}
            customerId={loan.customer_id ?? 0}
          />
        </Card>
      </Space>
    </div>
  );
};

export default SingleLoanPage;

// Reusable card components
type SummaryPalette = {
  container: string;
  icon: string;
  title: string;
  value: string;
};

const summaryPalettes: Record<string, SummaryPalette> = {
  amount: {
    container: "bg-[#f0f7ff] border border-[#c9e1ff]",
    icon: "bg-[#1f7dc8]",
    title: "text-[#1f7dc8]",
    value: "text-[#0f3e63]",
  },
  repaid: {
    container: "bg-[#f2fbf5] border border-[#cfeedd]",
    icon: "bg-[#22a06b]",
    title: "text-[#1b7e52]",
    value: "text-[#114a32]",
  },
  outstanding: {
    container: "bg-[#fff6f3] border border-[#ffd9cc]",
    icon: "bg-[#f25f3a]",
    title: "text-[#c74829]",
    value: "text-[#7d2a14]",
  },
};

const SummaryCard = ({
  icon,
  title,
  value,
  palette,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  palette: SummaryPalette;
}) => (
  <div
    className={`rounded-xl px-4 py-5 shadow-sm flex items-center gap-4 ${palette.container}`}
  >
    <div className={`rounded-lg p-3 text-white shadow ${palette.icon}`}>
      {icon}
    </div>
    <div>
      <Typography.Text
        className={`block text-xs font-semibold uppercase tracking-wide ${palette.title}`}
      >
        {title}
      </Typography.Text>
      <Typography.Text className={`block text-2xl font-bold ${palette.value}`}>
        {value}
      </Typography.Text>
    </div>
  </div>
);

const LoanInfoCard = ({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
    <div className="rounded-full bg-slate-900 p-3 text-white shadow-md">
      {icon}
    </div>
    <div>
      <Typography.Text className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        {title}
      </Typography.Text>
      <Typography.Paragraph className="!mb-0 text-base font-medium text-slate-900">
        {value}
      </Typography.Paragraph>
    </div>
  </div>
);

const summaryCardsFactory = (
  formattedAmount: string,
  formattedRepaid: string,
  formattedBalance: string
) => [
  {
    title: "Loan Amount",
    value: `KES ${formattedAmount}`,
    icon: <HiOutlineCurrencyDollar className="text-xl" />,
    palette: summaryPalettes.amount,
  },
  {
    title: "Amount Repaid",
    value: `KES ${formattedRepaid}`,
    icon: <FaMoneyBillWave className="text-xl" />,
    palette: summaryPalettes.repaid,
  },
  {
    title: "Outstanding",
    value: `KES ${formattedBalance}`,
    icon: <FaCoins className="text-xl" />,
    palette: summaryPalettes.outstanding,
  },
];
