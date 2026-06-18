/* eslint-disable @typescript-eslint/no-explicit-any */

import { FC, useEffect, useState } from "react";
import {
    Button,
    Card,
    Col,
    Form,
    Input,
    Modal,
    Result,
    Row,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
    message,
} from "antd";
import type { TableColumnsType } from "antd";
import {
    FiArrowLeft,
    FiEdit,
    FiPlus,
} from "react-icons/fi";
import {
    useNavigate,
    useParams,
} from "react-router-dom";

import {
    useCreateLoanSubcategoryMutation,
    useLazyGetSingleLoanCategoryQuery,
    useUpdateLoanSubcategoryMutation,
} from "../features/loanCategorySlice";

const { Title, Text } = Typography;

type LoanSubcategory = {
    id: number;
    name: string;
    parent_category_id: number;
    date_created?: string;
    date_updated?: string;
};

const SingleLoanCategory: FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();

    const [createForm] = Form.useForm();
    const [editForm] = Form.useForm();

    const [createModalOpen, setCreateModalOpen] =
        useState(false);

    const [selectedSubcategory, setSelectedSubcategory] =
        useState<LoanSubcategory | null>(null);

    const [
        getCategory,
        {
            data: categoryResponse,
            isLoading,
            isFetching,
            isError,
        },
    ] = useLazyGetSingleLoanCategoryQuery();

    const [createSubcategory, { isLoading: creating }] =
        useCreateLoanSubcategoryMutation();

    const [updateSubcategory, { isLoading: updating }] =
        useUpdateLoanSubcategoryMutation();

    const categoryId = Number(id);

    const loadCategory = () => {
        if (!Number.isNaN(categoryId)) {
            getCategory(categoryId);
        }
    };

    useEffect(() => {
        loadCategory();
    }, [categoryId]);

    const category = categoryResponse?.data;

    const subcategories: LoanSubcategory[] =
        category?.sub_categories ?? [];

    const handleCreate = async (values: {
        name: string;
    }) => {
        try {
            await createSubcategory({
                name: values.name.trim(),
                parent_category: categoryId,
            }).unwrap();

            message.success(
                "Loan subcategory created successfully"
            );

            setCreateModalOpen(false);
            createForm.resetFields();
            loadCategory();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to create loan subcategory"
            );
        }
    };

    const openEditModal = (
        subcategory: LoanSubcategory
    ) => {
        setSelectedSubcategory(subcategory);

        editForm.setFieldsValue({
            name: subcategory.name,
        });
    };

    const handleUpdate = async (values: {
        name: string;
    }) => {
        if (!selectedSubcategory) return;

        try {
            await updateSubcategory({
                id: selectedSubcategory.id,
                name: values.name.trim(),
            }).unwrap();

            message.success(
                "Loan subcategory updated successfully"
            );

            setSelectedSubcategory(null);
            editForm.resetFields();
            loadCategory();
        } catch (error: any) {
            message.error(
                error?.data?.message ??
                "Failed to update loan subcategory"
            );
        }
    };

    const columns: TableColumnsType<LoanSubcategory> = [
        {
            title: "ID",
            dataIndex: "id",
            width: 100,
            render: (value) => <Text code>{value}</Text>,
        },
        {
            title: "Subcategory Name",
            dataIndex: "name",
            sorter: (a, b) =>
                String(a.name).localeCompare(String(b.name)),
            render: (value: string) => (
                <Text strong className="capitalize">
                    {value}
                </Text>
            ),
        },
        {
            title: "Status",
            key: "status",
            width: 130,
            render: () => <Tag color="green">Active</Tag>,
        },
        {
            title: "Actions",
            key: "actions",
            width: 130,
            align: "right",
            render: (_, record) => (
                <Button
                    type="text"
                    icon={<FiEdit />}
                    onClick={() => openEditModal(record)}
                >
                    Edit
                </Button>
            ),
        },
    ];

    if (isLoading || isFetching) {
        return (
            <Card>
                <Spin spinning>
                    <div style={{ minHeight: 300 }} />
                </Spin>
            </Card>
        );
    }

    if (
        isError ||
        !category ||
        Number.isNaN(categoryId)
    ) {
        return (
            <Card>
                <Result
                    status="404"
                    title="Category not found"
                    subTitle="The selected loan category could not be loaded."
                    extra={
                        <Space>
                            <Button
                                onClick={() =>
                                    navigate("/loan-categories")
                                }
                            >
                                Back to Categories
                            </Button>

                            <Button
                                type="primary"
                                onClick={loadCategory}
                            >
                                Try Again
                            </Button>
                        </Space>
                    }
                />
            </Card>
        );
    }

    return (
        <div className="mt-5">
            <Card>
                <Row
                    justify="space-between"
                    align="middle"
                    gutter={[16, 16]}
                    style={{ marginBottom: 24 }}
                >
                    <Col>
                        <Space direction="vertical" size={4}>
                            <Button
                                type="link"
                                icon={<FiArrowLeft />}
                                onClick={() =>
                                    navigate("/loan-categories")
                                }
                                style={{ paddingLeft: 0 }}
                            >
                                Back to Loan Categories
                            </Button>

                            <Title
                                level={3}
                                style={{ margin: 0 }}
                                className="capitalize"
                            >
                                {category.name}
                            </Title>

                            <Text type="secondary">
                                View and manage the subcategories under
                                this loan category.
                            </Text>
                        </Space>
                    </Col>

                    <Col>
                        <Button
                            type="primary"
                            icon={<FiPlus />}
                            onClick={() =>
                                setCreateModalOpen(true)
                            }
                        >
                            Add Subcategory
                        </Button>
                    </Col>
                </Row>

                <Table<LoanSubcategory>
                    rowKey="id"
                    bordered
                    columns={columns}
                    dataSource={subcategories}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        pageSizeOptions: [5, 10, 20, 50],
                    }}
                    locale={{
                        emptyText:
                            "No subcategories have been added yet.",
                    }}
                />
            </Card>

            <Modal
                title="Create Loan Subcategory"
                open={createModalOpen}
                confirmLoading={creating}
                okText="Create Subcategory"
                onOk={() => createForm.submit()}
                onCancel={() => {
                    setCreateModalOpen(false);
                    createForm.resetFields();
                }}
            >
                <Form
                    form={createForm}
                    layout="vertical"
                    onFinish={handleCreate}
                >
                    <Form.Item
                        label="Parent Category"
                    >
                        <Input
                            value={category.name}
                            disabled
                            className="capitalize"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Subcategory Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message:
                                    "Please enter the subcategory name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter subcategory name" />
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Update Loan Subcategory"
                open={Boolean(selectedSubcategory)}
                confirmLoading={updating}
                okText="Update Subcategory"
                onOk={() => editForm.submit()}
                onCancel={() => {
                    setSelectedSubcategory(null);
                    editForm.resetFields();
                }}
            >
                <Form
                    form={editForm}
                    layout="vertical"
                    onFinish={handleUpdate}
                >
                    <Form.Item
                        label="Subcategory Name"
                        name="name"
                        rules={[
                            {
                                required: true,
                                whitespace: true,
                                message:
                                    "Please enter the subcategory name",
                            },
                        ]}
                    >
                        <Input placeholder="Enter subcategory name" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default SingleLoanCategory;