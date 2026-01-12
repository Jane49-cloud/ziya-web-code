/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Modal, Form, Select, Spin } from "antd";
import { useGetAllUsersQuery } from "../../users/features/userSlice";
import { formatName } from "../../utils";

const { Option } = Select;

interface ChangeManagerModalProps {
  visible: boolean;
  form: any;
  onCancel: () => void;
  onSubmit: () => void;
}

const ChangeManagerModal: React.FC<ChangeManagerModalProps> = ({
  visible,
  form,
  onCancel,
  onSubmit,
}) => {
  const { data, isLoading } = useGetAllUsersQuery({});
  const staffList = data?.staffs || [];

  return (
    <Modal
      title="Change Relationship Manager"
      open={visible}
      onOk={onSubmit}
      onCancel={onCancel}
    >
      {isLoading ? (
        <div className="text-center py-10">
          <Spin size="large" />
        </div>
      ) : (
        <Form form={form} layout="vertical">
          <Form.Item
            name="managerId"
            label="Select New Manager"
            rules={[{ required: true, message: "Please select a manager" }]}
          >
            <Select
              showSearch
              placeholder="Search and select a staff member"
              optionFilterProp="label"
              filterOption={(input, option) =>
                typeof option?.label === "string" &&
                option.label.toLowerCase().includes(input.toLowerCase())
              }
            >
              {staffList.map((staff: any) => (
                <Option
                  key={staff.id}
                  value={staff.id}
                  label={formatName(
                    `${staff.firstname ?? ""} ${staff.lastname ?? ""}`
                  )}
                >
                  {formatName(
                    `${staff.firstname ?? ""} ${staff.lastname ?? ""}`
                  )}
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ChangeManagerModal;
