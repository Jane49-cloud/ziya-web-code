import { FC, useState } from "react";
import { Table, Tag, Button, Card, Space, Tooltip, Input, message } from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import type { ColumnsType } from "antd/es/table";
import { formatDate, customAvatar } from "../../utils";

const { Search } = Input;

export interface GroupLoan {
  id: number;
  amount: string;
  balance: string;
  group_id: number;
  group_name: string;
  recipient_id: number;
  recipient_firstname: string;
  recipient_lastname: string;
  date_issued: string;
  cycle?: number;
}

interface Props {
  data: GroupLoan[];
  isLoading: boolean;
}

const LoanTable: FC<Props> = ({ data = [], isLoading }) => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");

  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    const fullName = `${item.recipient_firstname} ${item.recipient_lastname}`;
    return (
      item.id.toString().includes(search) ||
      item.group_name?.toLowerCase().includes(search) ||
      fullName.toLowerCase().includes(search) ||
      item.amount?.toString().includes(search) ||
      item.balance?.toString().includes(search) ||
      formatDate(item.date_issued)?.toLowerCase().includes(search)
    );
  });

  const totalAmount = filteredData.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );
  const totalBalance = filteredData.reduce(
    (sum, item) => sum + Number(item.balance || 0),
    0
  );

  const handleExportCSV = () => {
    const headers = [
      "Loan ID",
      "Group",
      "Recipient",
      "Loan Amount",
      "Balance",
      "Status",
      "Cycle",
      "Issued On",
    ];

    const rows = filteredData.map((item) => {
      const recipient = `${item.recipient_firstname} ${item.recipient_lastname}`;
      const status =
        Number(item.amount) === Number(item.balance) ? "Paid" : "Active";
      return [
        `#${item.id.toString().padStart(4, "0")}`,
        item.group_name,
        recipient,
        item.amount,
        item.balance,
        status,
        item.cycle ?? "N/A",
        formatDate(item.date_issued),
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `group-loan-payments-${Date.now()}.csv`);
  };

  const handleView = (loan: GroupLoan) => {
    localStorage.setItem("selectedLoan", JSON.stringify(loan));
    navigate(`/loans/${loan.id}`);
  };

  const handleDelete = (loan: GroupLoan) => {
    // Replace with actual delete logic or modal
    message.warning(`Loan #${loan.id} deleted (mock action)`);
  };

  const columns: ColumnsType<GroupLoan> = [
    {
      title: "Loan ID",
      dataIndex: "id",
      key: "id",
      render: (id) => <span>#{id.toString().padStart(4, "0")}</span>,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Date Issued",
      dataIndex: "date_issued",
      key: "date_issued",
      render: (date) => <span>{formatDate(date)}</span>,
      sorter: (a, b) =>
        new Date(a.date_issued).getTime() - new Date(b.date_issued).getTime(),
    },
    {
      title: "Recipient",
      key: "recipient",
      render: (_, record) => {
        const fullName = `${record.recipient_firstname} ${record.recipient_lastname}`;
        return (
          <div
            className="flex items-center gap-2 cursor-pointer "
            onClick={() => navigate(`/customer/${record.recipient_id}`)}
          >
            {customAvatar(fullName)}
            <span className="capitalize font-semibold hover:underline">
              {fullName}
            </span>
          </div>
        );
      },
    },
    {
      title: "Group",
      key: "group",
      render: (_, record) => (
        <div className="space-y-1">
          <div className="font-medium text-gray-800 line-clamp-1">
            {record.group_name}
          </div>
          <div className="text-xs text-gray-500">ID: {record.group_id}</div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      render: (_, record) => {
        const isPaid = Number(record.balance) === Number(record.amount);
        return (
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium ${
              isPaid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isPaid ? "Paid" : "Active"}
          </span>
        );
      },
    },
    {
      title: "Cycle",
      dataIndex: "cycle",
      key: "cycle",
      render: (cycle) =>
        cycle ? (
          <Tag color="purple" className="text-xs px-2">
            Cycle {cycle}
          </Tag>
        ) : (
          <span className="text-gray-400 text-xs">N/A</span>
        ),
    },
    {
      title: "Loan Amount",
      dataIndex: "amount",
      key: "amount",
      align: "right",
      render: (amount) => (
        <span className="text-green-700 font-semibold">
          KSH {Number(amount).toLocaleString()}
        </span>
      ),
      sorter: (a, b) => Number(a.amount) - Number(b.amount),
    },
    {
      title: "Balance",
      dataIndex: "balance",
      key: "balance",
      align: "right",
      render: (balance) => (
        <span className="text-blue-600 font-medium">
          KSH {Number(balance).toLocaleString()}
        </span>
      ),
      sorter: (a, b) => Number(a.balance) - Number(b.balance),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button
              icon={<EyeOutlined />}
              onClick={() => handleView(record)}
              type="link"
            />
          </Tooltip>
          <div className="hidden">
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
              onClick={() => handleDelete(record)}
            />
          </div>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold">Loans Issued</span>
          <div className="flex items-center gap-4">
            <Search
              placeholder="Search group, recipient, amount..."
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              className="w-64"
            />
            <Button
              icon={<DownloadOutlined />}
              type="default"
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
          </div>
        </div>
      }
    >
      <Table
        columns={columns}
        dataSource={filteredData}
        loading={isLoading}
        rowKey="id"
        size="middle"
        bordered
        scroll={{ x: "max-content" }}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        rowClassName="hover:bg-gray-50 transition-colors"
        summary={() => (
          <Table.Summary fixed>
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={6}>
                <strong>Totals</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={6} align="right">
                <strong className="text-green-700">
                  KSH {totalAmount.toLocaleString()}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={7} align="right">
                <strong className="text-blue-600">
                  KSH {totalBalance.toLocaleString()}
                </strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={8} />
            </Table.Summary.Row>
          </Table.Summary>
        )}
      />
    </Card>
  );
};

export default LoanTable;
