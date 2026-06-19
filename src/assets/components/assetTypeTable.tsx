import {
    Button,
    Empty,
    Space,
    Table,
    Tooltip,
    Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { FiEdit, FiEye } from "react-icons/fi";

import {
    formatDateTime,
    formatName,
    formatCurrency,
} from "../../utils";
import type { AssetTypeRecord } from "./updateAssetTypeModal";

const { Text } = Typography;

type Props = {
    data: AssetTypeRecord[];
    loading?: boolean;
    onView: (record: AssetTypeRecord) => void;
    onEdit: (record: AssetTypeRecord) => void;
};

const AssetTypeTable = ({
    data,
    loading = false,
    onView,
    onEdit,
}: Props) => {
    const columns: ColumnsType<AssetTypeRecord> = [
        {
            title: "Asset Name",
            dataIndex: "asset_name",
            key: "asset_name",
            render: (value: string) => (
                <Text strong>
                    {formatName(value) || "—"}
                </Text>
            ),
        },
        {
            title: "Quantity",
            dataIndex: "asset_quantity",
            key: "asset_quantity",
            align: "center",
            render: (value: number) =>
                Number(value ?? 0).toLocaleString(),
        },
        {
            title: "Unit Value",
            dataIndex: "asset_unit_value",
            key: "asset_unit_value",
            align: "center",
            render: (value: number) =>
                formatCurrency(value),
        },
        {
            title: "Total Value",
            key: "total_value",
            align: "center",
            render: (_, record) =>
                formatCurrency (
                    Number(record.asset_quantity ?? 0) *
                    Number(record.asset_unit_value ?? 0)
                ).toLocaleString(),
        },
        {
            title: "Date Created",
            dataIndex: "date_created",
            key: "date_created",
            render: (value?: string) =>
                formatDateTime(value) || "—",
        },
        {
            title: "Actions",
            key: "actions",
            width: 120,
            align: "center",
            render: (_, record) => (
                <Space size="small">
                    <Tooltip title="View assets">
                        <Button
                            type="text"
                            icon={<FiEye />}
                            aria-label="View asset type"
                            onClick={() => onView(record)}
                            style={{
                                color: "#1677ff",
                                cursor: "pointer",
                            }}
                        />
                    </Tooltip>

                    <Tooltip title="Edit asset type">
                        <Button
                            type="text"
                            icon={<FiEdit />}
                            aria-label="Edit asset type"
                            onClick={() => onEdit(record)}
                            style={{
                                color: "#1677ff",
                                cursor: "pointer",
                            }}
                        />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    return (
        <Table<AssetTypeRecord>
            rowKey="id"
            columns={columns}
            dataSource={data}
            loading={loading}
            pagination={false}
            scroll={{ x: 900 }}
            locale={{
                emptyText: (
                    <Empty description="No asset types available" />
                ),
            }}
        />
    );
};

export default AssetTypeTable;