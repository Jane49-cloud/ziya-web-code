/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo } from "react";
import {
  Drawer,
  Empty,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";

import { useLazyGetGroupAssetsQuery } from "../features/index";

import {
  formatCurrency,
  formatDateTime,
  formatName,
} from "../../utils";

const { Text } = Typography;

type GroupAsset = {
  id: number;
  asset_type?: number;
  asset_type_name?: string;
  asset_name?: string;
  identifier_type?: string;
  unique_id?: string;
  device_value?: number;
  owner_type?: string;
  owner_id?: number;
  owner_name?: string;
  asset_issued?: boolean;
  date_created?: string;
  date_updated?: string;
};

type GroupAssetsDrawerProps = {
  open: boolean;
  groupId?: number | string | null;
  groupName?: string;
  onClose: () => void;
};

const extractAssets = (response: any): GroupAsset[] => {
  const rows =
    response?.data ??
    response?.assets ??
    response?.rows ??
    response?.results ??
    [];

  return Array.isArray(rows) ? rows : [];
};

const GroupAssetsDrawer = ({
  open,
  groupId,
  groupName,
  onClose,
}: GroupAssetsDrawerProps) => {
  const [
    getGroupAssets,
    {
      data,
      isLoading,
      isFetching,
    },
  ] = useLazyGetGroupAssetsQuery();

  useEffect(() => {
    if (!open || !groupId) return;

    const loadAssets = async () => {
      try {
        await getGroupAssets(groupId).unwrap();
      } catch (err: any) {
        message.error(
          err?.data?.error ||
          err?.data?.message ||
          "Failed to load group assets",
        );
      }
    };

    void loadAssets();
  }, [open, groupId, getGroupAssets]);

  const assets = useMemo(() => {
    return extractAssets(data);
  }, [data]);

  const columns: ColumnsType<GroupAsset> = [
    {
      title: "Asset Name",
      dataIndex: "asset_name",
      key: "asset_name",
      render: (value?: string) => formatName(value) || "—",
    },
    {
      title: "Asset Type",
      dataIndex: "asset_type_name",
      key: "asset_type_name",
      render: (value?: string, record?: GroupAsset) =>
        formatName(value) ||
        (record?.asset_type ? `Type ${record.asset_type}` : "—"),
    },
    {
      title: "Identifier Type",
      dataIndex: "identifier_type",
      key: "identifier_type",
      render: (value?: string) => formatName(value) || "—",
    },
    {
      title: "Unique ID",
      dataIndex: "unique_id",
      key: "unique_id",
      render: (value?: string) => (
        <Text code>{value || "—"}</Text>
      ),
    },
    {
      title: "Value",
      dataIndex: "device_value",
      key: "device_value",
      align: "right",
      render: (value?: number) => formatCurrency(value),
    },
    {
      title: "Issued",
      dataIndex: "asset_issued",
      key: "asset_issued",
      render: (value?: boolean) => (
        <Tag color={value ? "green" : "default"}>
          {value ? "Issued" : "Not Issued"}
        </Tag>
      ),
    },
    {
      title: "Date Created",
      dataIndex: "date_created",
      key: "date_created",
      render: (value?: string) => formatDateTime(value) || "—",
    },
  ];

  return (
    <Drawer
      title="Group Assets"
      open={open}
      onClose={onClose}
      width={900}
      destroyOnClose
    >
      <div style={{ marginBottom: 16 }}>
        <Text type="secondary">
          Viewing assets for{" "}
          <Text strong>{groupName || `Group ID ${groupId}`}</Text>
        </Text>
      </div>

      <Table<GroupAsset>
        rowKey={(record) => String(record.id)}
        columns={columns}
        dataSource={assets}
        loading={isLoading || isFetching}
        pagination={false}
        scroll={{ x: 950 }}
        locale={{
          emptyText: (
            <Empty description="No group assets available" />
          ),
        }}
      />
    </Drawer>
  );
};

export default GroupAssetsDrawer;