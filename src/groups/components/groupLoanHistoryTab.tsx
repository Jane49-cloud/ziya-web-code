/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useGetGroupLoansQuery } from "../features";
import { Card, Table, Typography, Space, Button } from "antd";
import { useState } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
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
  const { data, isLoading, refetch } = useGetGroupLoansQuery(groupId);
  const loans = data?.loans || [];

  const [sortOrder, setSortOrder] = useState<"ascend" | "descend">("descend");
  const [showLoanModal, setShowLoanModal] = useState(false);
  const [editLoan, setEditLoan] = useState<any>(null);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<any>(null);

  const navigate = useNavigate();

  const sortedLoans = [...loans].sort((a, b) =>
    sortOrder === "ascend"
      ? new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const totalLoaned = sortedLoans.reduce((sum, loan) => {
    const amount =
      typeof loan.amount === "string" ? parseFloat(loan.amount) : loan.amount;
    return sum + (isNaN(amount) ? 0 : amount);
  }, 0);

  const columns = [
    {
      title: "Recipient",
      key: "recipient",
      render: (_: any, record: any) => (
        <Button
          type="link"
          className="p-0"
          onClick={() => navigate(`/customer/${record.recipient_id}`)}
        >
          {record.recipient_firstname} {record.recipient_lastname}
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
      dataIndex: "created_at",
      key: "created_at",
      render: (date: string) => moment(date).format("DD MMM YYYY"),
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

  return (
    <Card>
      <Space className="mb-4" direction="vertical" style={{ width: "100%" }}>
        <div className="flex justify-between items-center w-full">
          <Title level={4}>Loan History</Title>
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

        <Text>
          Total Loaned: <strong>KES {totalLoaned.toLocaleString()}</strong>
        </Text>
        <Button
          onClick={() =>
            setSortOrder(sortOrder === "ascend" ? "descend" : "ascend")
          }
        >
          Sort by Date (
          {sortOrder === "ascend" ? "Oldest First" : "Newest First"})
        </Button>
      </Space>

      <Table
        columns={columns}
        dataSource={sortedLoans}
        loading={isLoading}
        rowKey="id"
        pagination={{ pageSize: 6 }}
      />

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
