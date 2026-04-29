import { Button, Popconfirm, Space, Table, Tag } from "antd";
import type { TablePaginationConfig } from "antd/es/table";
import type { Cycle } from "../types";
import { getCycleKey } from "../utils";

const { Column } = Table;

interface CycleTableProps {
  cycles: Cycle[];
  isLoading: boolean;
  onEdit: (cycle: Cycle) => void;
  onDelete: (cycle: Cycle) => void;
  pagination?: false | TablePaginationConfig;
}

const CycleTable = ({
  cycles,
  isLoading,
  onEdit,
  onDelete,
  pagination,
}: CycleTableProps) => (
  <Table
    dataSource={cycles}
    loading={isLoading}
    rowKey={(record, index) => getCycleKey(record, index)}
    pagination={pagination}
    scroll={{ x: 600 }}
    bordered
  >
    <Column title="Title" dataIndex="title" key="title" />

    <Column
      title="Cycle"
      dataIndex="cycle_number"
      key="cycle_number"
      render={(value: number | undefined) =>
        value ? <Tag color="blue">{value}</Tag> : "N/A"
      }
    />

    <Column title="Created By" dataIndex="creator_name" key="creator_name" />

    <Column title="Updated By" dataIndex="updater_name" key="updater_name" />

    <Column
      title="Actions"
      key="actions"
      render={(_value: unknown, record: Cycle) => (
        <Space size="middle">
          <Button type="link" onClick={() => onEdit(record)}>
            Edit
          </Button>

          <Popconfirm
            title="Delete this cycle?"
            onConfirm={() => onDelete(record)}
            okText="Delete"
            cancelText="Cancel"
          >
            <Button type="link" danger>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      )}
    />
  </Table>
);

export default CycleTable;