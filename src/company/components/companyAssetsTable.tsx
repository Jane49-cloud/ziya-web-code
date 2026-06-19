import {
  Button,
  Dropdown,
  Empty,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  FiMoreVertical,
  FiUsers,
  FiUserCheck,
} from "react-icons/fi";

import {
  formatCurrency,
  formatDateTime,
  formatName,
} from "../../utils";

const { Text } = Typography;

export type CompanyAsset = {
  id: number;
  asset_type: number;
  asset_type_name?: string;
  identifier_type?: string;
  unique_id?: string;
  current_location?: string;
  device_value?: number;
  owner_type?: string;
  owner_id?: number;
  date_created?: string;
  date_updated?: string;
};

type Props = {
  data: CompanyAsset[];
  loading?: boolean;
  onMoveToPartner: (asset: CompanyAsset) => void;
  onMoveToGroup: (asset: CompanyAsset) => void;
};

const CompanyAssetsTable = ({
  data,
  loading = false,
  onMoveToPartner,
  onMoveToGroup,
}: Props) => {
  const columns: ColumnsType<CompanyAsset> = [
    {
      title: "Asset Type",
      dataIndex: "asset_type_name",
      key: "asset_type_name",
      render: (value?: string) => (
        <Text strong>{formatName(value) || "—"}</Text>
      ),
    },
    {
      title: "Identifier Type",
      dataIndex: "identifier_type",
      key: "identifier_type",
      render: (value?: string) =>
        formatName(value) || "—",
    },
    {
      title: "Unique ID",
      dataIndex: "unique_id",
      key: "unique_id",
      render: (value?: string) =>
        value ? <Text code>{value}</Text> : "—",
    },
    {
      title: "Current Location",
      dataIndex: "current_location",
      key: "current_location",
      render: (value?: string) =>
        formatName(value) || "—",
    },
    {
      title: "Asset Value",
      dataIndex: "device_value",
      key: "device_value",
      align: "right",
      render: (value?: number) =>
        formatCurrency(value),
    },
    {
      title: "Date Created",
      dataIndex: "date_created",
      key: "date_created",
      render: (value?: string) =>
        formatDateTime(value),
    },
    {
      title: "Actions",
      key: "actions",
      align: "center",
      fixed: "right",
      width: 90,
      render: (_, record) => (
        <Dropdown
          trigger={["click"]}
          overlayClassName="asset-actions-dropdown"
          menu={{
            items: [
              {
                key: "partner",
                label: "Move to Partner",
                icon: <FiUserCheck />,
              },
              {
                key: "group",
                label: "Move to Group",
                icon: <FiUsers />,
              },
            ],
            onClick: ({ key }) => {
              if (key === "partner") {
                onMoveToPartner(record);
              }

              if (key === "group") {
                onMoveToGroup(record);
              }
            },
          }}
        >
          <Button
            type="text"
            aria-label="Asset actions"
            icon={<FiMoreVertical size={18} />}
            className="cursor-pointer hover:!bg-blue-50 hover:!text-blue-600"
          />
        </Dropdown>
      ),
    },
  ];

  return (
    <Table<CompanyAsset>
      rowKey="id"
      columns={columns}
      dataSource={data}
      loading={loading}
      pagination={false}
      scroll={{ x: 1000 }}
      locale={{
        emptyText: (
          <Empty description="No company assets available" />
        ),
      }}
    />
  );
};

export default CompanyAssetsTable;