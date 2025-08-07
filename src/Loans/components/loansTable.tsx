import { FC, useState, useMemo } from "react";
import {
  Table,
  Tag,
  Button,
  Card,
  Space,
  Tooltip,
  Input,
  message,
  Select,
  DatePicker,
  Progress,
  Badge,
} from "antd";
import {
  EyeOutlined,
  DeleteOutlined,
  DownloadOutlined,
  FilterOutlined,
  ClearOutlined,
  UserOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { saveAs } from "file-saver";
import type { ColumnsType } from "antd/es/table";
import { formatDate, customAvatar } from "../../utils";
import dayjs from "dayjs";

const { Search } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;

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
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<
    [dayjs.Dayjs | null, dayjs.Dayjs | null] | null
  >(null);
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced filtering logic
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const search = searchText.toLowerCase();
      const fullName = `${item.recipient_firstname} ${item.recipient_lastname}`;
      const isPaid = Number(item.balance) === 0;

      // Text search
      const matchesSearch =
        !searchText ||
        item.id.toString().includes(search) ||
        item.group_name?.toLowerCase().includes(search) ||
        fullName.toLowerCase().includes(search) ||
        item.amount?.toString().includes(search) ||
        item.balance?.toString().includes(search) ||
        formatDate(item.date_issued)?.toLowerCase().includes(search);

      // Status filter
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "paid" && isPaid) ||
        (statusFilter === "active" && !isPaid) ||
        (statusFilter === "overdue" && !isPaid); // You can add overdue logic here

      // Date range filter
      const matchesDateRange =
        !dateRange ||
        (dayjs(item.date_issued).isAfter(dayjs(dateRange[0])) &&
          dayjs(item.date_issued).isBefore(dayjs(dateRange[1])));

      return matchesSearch && matchesStatus && matchesDateRange;
    });
  }, [data, searchText, statusFilter, dateRange]);

  // Enhanced statistics

  const handleExportCSV = () => {
    const headers = [
      "Loan ID",
      "Date Issued",
      "Recipient",
      "Group",
      "Loan Amount",
      "Amount Repaid",
      "Balance",
      "Status",
      "Cycle",
      "Repayment Rate",
    ];

    const rows = filteredData.map((item) => {
      const recipient = `${item.recipient_firstname} ${item.recipient_lastname}`;
      const isPaid = Number(item.balance) === 0;
      const repaid = Number(item.amount) - Number(item.balance);
      const repaymentRate =
        Number(item.amount) > 0
          ? ((repaid / Number(item.amount)) * 100).toFixed(1) + "%"
          : "0%";

      return [
        `#${item.id.toString().padStart(4, "0")}`,
        formatDate(item.date_issued),
        recipient,
        item.group_name,
        Number(item.amount).toLocaleString(),
        repaid.toLocaleString(),
        Number(item.balance).toLocaleString(),
        isPaid ? "Fully Paid" : "Active",
        item.cycle ?? "N/A",
        repaymentRate,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `group-loans-${dayjs().format("YYYY-MM-DD")}.csv`);
    message.success("CSV exported successfully!");
  };

  const clearFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setDateRange(null);
    message.info("Filters cleared");
  };

  const handleView = (loan: GroupLoan) => {
    localStorage.setItem("selectedLoan", JSON.stringify(loan));
    navigate(`/loans/${loan.id}`);
  };

  const handleDelete = (loan: GroupLoan) => {
    message.warning(
      `Delete functionality for Loan #${loan.id} would be implemented here`
    );
  };

  const columns: ColumnsType<GroupLoan> = [
    {
      title: "Loan ID",
      dataIndex: "id",
      key: "id",
      width: 80,
      render: (id) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-xs font-bold text-blue-600">
              #{id.toString().slice(-2)}
            </span>
          </div>
        </div>
      ),
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "Date Issued",
      dataIndex: "date_issued",
      key: "date_issued",
      width: 100,
      render: (date) => (
        <div className="flex items-center gap-2">
          <CalendarOutlined className="text-gray-400" />
          <div>
            <div className="font-medium">{dayjs(date).format("MMM DD")}</div>
            <div className="text-xs text-gray-500">
              {dayjs(date).format("YYYY")}
            </div>
          </div>
        </div>
      ),
      sorter: (a, b) =>
        new Date(a.date_issued).getTime() - new Date(b.date_issued).getTime(),
    },
    {
      title: "Recipient",
      key: "recipient",
      // width: 150,
      render: (_, record) => {
        const fullName = `${record.recipient_firstname} ${record.recipient_lastname}`;
        return (
          <div
            className="flex items-center gap-3 cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors"
            onClick={() => navigate(`/customer/${record.recipient_id}`)}
          >
            <div className="relative">{customAvatar(fullName)}</div>
            <div>
              <div className="font-semibold text-gray-800 hover:text-blue-600 transition-colors">
                {fullName}
              </div>
              <div className="text-xs text-gray-500">
                ID: {record.recipient_id}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      title: "Group",
      key: "group",
      // width: 100,
      render: (_, record) => (
        <div className="flex items-center gap-2">
          <div>
            <div
              className="font-medium text-gray-800 truncate max-w-32"
              title={record.group_name}
            >
              {record.group_name}
            </div>
            <div className="text-xs text-gray-500">
              Group ID: {record.group_id}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Status & Progress",
      key: "status",
      // width: 150,
      render: (_, record) => {
        const totalAmount = Number(record.amount);
        const balance = Number(record.balance);
        const repaid = totalAmount - balance;
        const progressPercent =
          totalAmount > 0 ? (repaid / totalAmount) * 100 : 0;
        const isPaid = balance === 0;

        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge
                status={isPaid ? "success" : "processing"}
                text={
                  <span
                    className={`text-xs font-medium ${
                      isPaid ? "text-green-700" : "text-blue-700"
                    }`}
                  >
                    {isPaid ? "Fully Paid" : "Active"}
                  </span>
                }
              />
              {record.cycle && <Tag color="purple">Cycle {record.cycle}</Tag>}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-500">Repayment</span>
                <span className="text-xs font-medium">
                  {progressPercent.toFixed(0)}%
                </span>
              </div>
              <Progress
                percent={progressPercent}
                size="small"
                strokeColor={isPaid ? "#52c41a" : "#1890ff"}
                showInfo={false}
              />
            </div>
          </div>
        );
      },
    },
    {
      title: "Financial Details",
      key: "financial",
      // width: 110,
      render: (_, record) => {
        const totalAmount = Number(record.amount);
        const balance = Number(record.balance);
        const repaid = totalAmount - balance;

        return (
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Loan:</span>
              <span className="font-semibold text-blue-600">
                KES {totalAmount.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Repaid:</span>
              <span className="font-medium text-green-600">
                KES {repaid.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">Balance:</span>
              <span
                className={`font-medium ${
                  balance > 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                KES {balance.toLocaleString()}
              </span>
            </div>
          </div>
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      // width: 50,
      // fixed: "right",
      render: (_, record) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              type="primary"
              ghost
              onClick={() => handleView(record)}
              className="hover:scale-105 transition-transform"
            />
          </Tooltip>
          {/* Hide delete button for now */}
          <div className="hidden">
            <Tooltip title="Delete Loan">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
                ghost
                onClick={() => handleDelete(record)}
              />
            </Tooltip>
          </div>
        </Space>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Enhanced Statistics Cards */}

      {/* Main Table Card */}
      <Card
        className="shadow-lg"
        title={
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-gray-800">
                Loans Management
              </span>
              <Badge
                count={filteredData.length}
                style={{ backgroundColor: "#52c41a" }}
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap my-2">
              <Search
                placeholder="Search loans, recipients, groups..."
                allowClear
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-64"
                prefix={<UserOutlined className="text-gray-400" />}
              />

              <Button
                icon={<FilterOutlined />}
                onClick={() => setShowFilters(!showFilters)}
                type={showFilters ? "primary" : "default"}
                ghost={showFilters}
              >
                Filters
              </Button>

              <Button
                icon={<DownloadOutlined />}
                type="default"
                onClick={handleExportCSV}
                className="bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
              >
                Export CSV
              </Button>
            </div>
          </div>
        }
        extra={
          showFilters && (
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={setStatusFilter}
                className="w-32"
              >
                <Option value="all">All Status</Option>
                <Option value="active">Active</Option>
                <Option value="paid">Paid</Option>
                <Option value="overdue">Overdue</Option>
              </Select>

              <RangePicker
                placeholder={["Start Date", "End Date"]}
                value={dateRange}
                onChange={setDateRange}
                className="w-64"
              />

              <Button
                icon={<ClearOutlined />}
                onClick={clearFilters}
                type="text"
                size="small"
              >
                Clear
              </Button>
            </div>
          )
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          loading={isLoading}
          rowKey="id"
          size="small"
          // scroll={{ x: 1200 }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} loans`,
          }}
          className="loan-table"
          rowClassName="hover:bg-blue-50 transition-colors duration-200"
          bordered
          scroll={{ x: true }}
        />
      </Card>
    </div>
  );
};

export default LoanTable;
