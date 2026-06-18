/* eslint-disable @typescript-eslint/no-explicit-any */

import { FC, useEffect, useState } from "react";
import {
    Button,
    Form,
    Input,
    Modal,
    Space,
    Table,
    Tabs,
    Tag,
    Typography,
    message,
} from "antd";
import type { TableColumnsType } from "antd";

import {
    useCreateLoanCategoryMutation,
    useLazyGetLoanCategoriesQuery,
    useUpdateLoanCategoryMutation,
} from "../features/loanCategorySlice";
import { FiEdit, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

type LoanCategory = {
    id: number;
    name: string;
    date_created?: string;
    date_updated?: string;
};

const LoanCategories: FC = () => {
    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("list");
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [selectedCategory, setSelectedCategory] =
        useState<LoanCategory | null>(null);

    const [
        fetchCategories,
        {
            data: categoriesResponse,
            isLoading,
            isFetching,
        },
    ] = useLazyGetLoanCategoriesQuery();

    const [createCategory, { isLoading: creating }] =
        useCreateLoanCategoryMutation();

    const [updateCategory, { isLoading: updating }] =
        useUpdateLoanCategoryMutation();

    const loadCategories = () => {
        fetchCategories({
            page,
            page_size: pageSize,
        });
    };

    useEffect(() => {
        loadCategories();
    }, [page, pageSize]);

    const categories: LoanCategory[] =
        categoriesResponse?.data ?? [];

    const total =
        categoriesResponse?.pagination?.total ??
        categoriesResponse?.total ??
        categories.length;

    const handleCreate = async (values: {
        name: string;
    }) => {
        try {
            await createCategory({
                name: values.name.trim(),
            }).unwrap();

            message.success("Loan category created successfully");
            createForm.resetFields();
            setActiveTab("list");
            setPage(1);

            await fetchCategories({
                page: 1,
                page_size: pageSize,
            });
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to create loan category"
            );
        }
    };

    const openEditModal = (category: LoanCategory) => {
        setSelectedCategory(category);

        editForm.setFieldsValue({
            name: category.name,
        });
    };

    const handleUpdate = async (values: {
        name: string;
    }) => {
        if (!selectedCategory) return;

        try {
            await updateCategory({
                id: selectedCategory.id,
                name: values.name.trim(),
            }).unwrap();

            message.success("Loan category updated successfully");
            setSelectedCategory(null);
            editForm.resetFields();
            loadCategories();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to update loan category"
            );
        }
    };

    const columns: TableColumnsType<LoanCategory> = [

        {
            title: "Category Name",
            dataIndex: "name",
            sorter: (a, b) =>
                a.name.localeCompare(b.name),
            render: (value: string) => (
                <Text strong className="capitalize">
                    {value}
                </Text>
            ),
        },
        {
            title: "Status",
            key: "status",
            width: 100,
            render: () => <Tag color="green">Active</Tag>,
        },
        {
            title: "Actions",
            key: "actions",
            width: 150,
            align: "right",
            render: (_, record) => (
                <Space>
                    <Button
                        type="text"
                        icon={<FiEye />}
                        onClick={() =>
                            navigate(`/loan-categories/${record.id}`)
                        }
                    >
                    </Button>

                    <Button
                        type="text"
                        icon={<FiEdit />}
                        onClick={() => openEditModal(record)}
                    >
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="mt-5">
            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                    {
                        key: "list",
                        label: "Loan Categories",
                        children: (
                            <>
                                <div className="mb-5">
                                    <Title level={4}>
                                        Loan Categories
                                    </Title>

                                    <Text type="secondary">
                                        Manage loan categories and their
                                        subcategories.
                                    </Text>
                                </div>

                                <Table<LoanCategory>
                                    rowKey="id"
                                    bordered
                                    columns={columns}
                                    dataSource={categories}
                                    loading={isLoading || isFetching}
                                    pagination={{
                                        current: page,
                                        pageSize,
                                        total,
                                        showSizeChanger: true,
                                        pageSizeOptions: [10, 20, 50],
                                        onChange: (
                                            nextPage,
                                            nextPageSize
                                        ) => {
                                            setPage(nextPage);
                                            setPageSize(nextPageSize);
                                        },
                                    }}
                                />
                            </>
                        ),
                    },
                    {
                        key: "create",
                        label: "Add Loan Category",
                        children: (
                            <Form
                                form={createForm}
                                layout="vertical"
                                onFinish={handleCreate}
                                style={{ maxWidth: 520 }}
                            >
                                <Title level={4}>
                                    Create Loan Category
                                </Title>

                                <Form.Item
                                    label="Category Name"
                                    name="name"
                                    rules={[
                                        {
                                            required: true,
                                            message:
                                                "Please enter the category name",
                                        },
                                    ]}
                                >
                                    <Input placeholder="Enter category name" />
                                </Form.Item>

                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={creating}
                                >
                                    Create Category
                                </Button>
                            </Form>
                        ),
                    },
                ]}
            />

            <Modal
                title="Update Loan Category"
                open={Boolean(selectedCategory)}
                confirmLoading={updating}
                onOk={() => editForm.submit()}
                onCancel={() => {
                    setSelectedCategory(null);
                    editForm.resetFields();
                }}
                okText="Update Category"
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Form.Item
                        label="Category Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                message:
                                    "Please enter the category name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default LoanCategories;