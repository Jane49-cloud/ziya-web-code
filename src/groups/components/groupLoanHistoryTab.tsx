/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from "react";
import {
  Card,
  Table,
  Typography,
  Space,
  Button,
  Input,
  Statistic,
  Row,
  Col,
} from "antd";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { useGetGroupLoansQuery } from "../features";
import GroupLoanFormModal from "./groupFormModal";
import GroupPaymentFormModal from "./groupPaymentFormModal";

const { Title, Text } = Typography;

interface GroupLoanHistoryTabProps {
  groupId: number;
  groupAdminId: number;
}

const GroupLoanHistoryTab: React.FC<GroupLoanHistoryTabProps> = ({
  groupId,
  groupAdminId,
}) => {
  const { data, isLoading, isFetching, refetch } = useGetGroupLoansQuery(
    groupId,
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
      pollingInterval: 30000,
    }
  );
  const loans = useMemo(() => data?.loans || [], [data?.loans]);

  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");
  const [searchTerm, setSearchTerm] = useState("");
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editLoan, setEditLoan] = useState<any>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  const navigate = useNavigate();

  const filteredLoans = useMemo(() => {
    const needle = searchTerm.trim().toLowerCase();
    if (!needle) return loans;

    return loans.filter((loan: any) => {
      const recipient = `${loan.customer_firstname ?? ""} ${
        loan.customer_lastname ?? ""
      }`
        .trim()
        .toLowerCase();
      const loanType = String(loan.loan_type ?? "").toLowerCase();
      return (
        recipient.includes(needle) ||
        loanType.includes(needle) ||
        String(loan.cycle ?? "")
          .toLowerCase()
          .includes(needle)
      );
    });
  }, [loans, searchTerm]);

  const sortedLoans = useMemo(
    () =>
      [...filteredLoans].sort((a, b) =>
        sortOrder === "ascend"
          ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ),
    [filteredLoans, sortOrder]
  );

  const totalLoaned = sortedLoans.reduce((sum, loan) => {
    const amount =
      typeof loan.amount === "string" ? parseFloat(loan.amount) : loan.amount;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const formatCurrency = (value: number) => `KES ${value.toLocaleString()}`;

  const columns = [
    {
      title: "Recipient",
      key: "recipient",
      render: (_: any, record: any) => (
        <Button
          type="link"
          className="p-0"
          onClick={() => navigate(`/customer/${record.issued_to}`)}
        >
          {record.customer_firstname} {record.customer_lastname}
        </Button>
      ),
    },
    {
      title: "Amount (KES)",
      dataIndex: "amount",
      key: "amount",
      render: (amount: number) => `KES ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Balance (KES)",
      dataIndex: "balance",
      key: "balance",
      render: (amount: number) => `KES ${Number(amount).toLocaleString()}`,
    },
    {
      title: "Loan Type",
      dataIndex: "loan_type",
      key: "loan_type",
      render: (type: string) => type || "N/A",
    },
    {
      title: "Cycle",
      dataIndex: "cycle",
      key: "cycle",
    },
    {
      title: "Issued On",
      dataIndex: "date_issued",
      key: "date_issued",
      render: (_: string, record: any) => {
        const date = record.date_issued ?? record.created_at;
        return date ? moment(date).format("DD MMM YYYY") : "—";
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setEditLoan(record);
              setShowLoanModal(true);
            }}
          >
            Edit
          </Button>
          <Button
            size="small"
            onClick={() => {
              setSelectedLoan(record);
              setShowPaymentModal(true);
            }}
          >
            Payment
          </Button>
        </Space>
      ),
    },
  ];

  const activeLoans = sortedLoans.length;
  const averageAmount = activeLoans ? Math.round(totalLoaned / activeLoans) : 0;

  return (
    <Card bordered={false} className="shadow-sm">
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Title level={4} className="!mb-1">
              Group Loan Portfolio
            </Title>
            <Text type="secondary">
              Monitor issued loans, track balances, and capture repayments in
              real time.
            </Text>
          </div>
          <Button
            type="primary"
            onClick={() => {
              setEditLoan(null);
              setShowLoanModal(true);
            }}
          >
            Add Loan
          </Button>
        </div>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Total Amount Issued"
              value={totalLoaned}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Active Loans"
              value={activeLoans}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Statistic
              title="Average Ticket Size"
              value={averageAmount}
              formatter={(value) => formatCurrency(value as number)}
              valueStyle={{ fontSize: 20 }}
            />
          </Col>
        </Row>

        <Space wrap>
          <Button
            onClick={() =>
              setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
            }
          >
            Sort by Date (
            {sortOrder === "ascend" ? "Oldest First" : "Newest First"})
          </Button>
          <Input.Search
            allowClear
            placeholder="Search recipient, type, or cycle"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            className="w-64"
          />
        </Space>

        <Table
          columns={columns}
          dataSource={sortedLoans}
          loading={isLoading || isFetching}
          rowKey="id"
          pagination={{ pageSize: 6, showSizeChanger: true }}
        />
      </Space>

      {/* Loan Modal */}
      {showLoanModal && (
        <GroupLoanFormModal
          visible={showLoanModal}
          onClose={() => setShowLoanModal(false)}
          groupId={groupId}
          loan={editLoan}
          refetch={refetch}
          issuedBy={groupAdminId}
        />
      )}

      {/* Payment Modal */}
      {showPaymentModal && selectedLoan && (
        <GroupPaymentFormModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          groupId={groupId}
          loan={selectedLoan}
          refetch={refetch}
          approved_by={groupAdminId}
        />
      )}
    </Card>
  );
};

export default GroupLoanHistoryTab;
