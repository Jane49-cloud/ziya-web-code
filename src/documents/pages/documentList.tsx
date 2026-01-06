/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import {
  Card,
  Input,
  Select,
  Button,
  Table,
  Tag,
  Space,
  Popconfirm,
  message,
  Empty,
} from "antd";
import {
  PlusOutlined,
  SearchOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { Document } from "../types/document";

import DOMPurify from "dompurify";
import {
  useGetAllDocumentsQuery,
  useDeleteDocumentMutation,
} from "../features/docSlice";

const { Search } = Input;
const { Option } = Select;

export const DocumentsList: React.FC = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterAccessLevel, setFilterAccessLevel] = useState<string>("all");

  const { data, isLoading, refetch } = useGetAllDocumentsQuery({});
  const [deleteDocument, { isLoading: deleting }] = useDeleteDocumentMutation();

  const documents = useMemo(() => data?.documents || [], [data]);
  console.log("Documents:", documents);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc: any) => {
      const matchesSearch =
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.content.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter =
        filterAccessLevel === "all" || doc.access_level === filterAccessLevel;

      return matchesSearch && matchesFilter;
    });
  }, [documents, searchQuery, filterAccessLevel]);

  const handleDelete = async (id: number) => {
    try {
      await deleteDocument(id).unwrap();
      message.success("Document deleted successfully");
      refetch();
    } catch (error: any) {
      message.error(error?.data?.error || "Failed to delete document");
    }
  };

  const getAccessLevelColor = (level: string) => {
    const colors: Record<string, string> = {
      public: "green",
      staff: "blue",
      management: "orange",
      admin: "red",
    };
    return colors[level] || "default";
  };

  const stripHtml = (html: string) => {
    const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: [] });
    return clean.substring(0, 100) + (clean.length > 100 ? "..." : "");
  };

  const columns = [
    {
      title: "Title",
      dataIndex: "title",
      key: "title",
      width: "30%",
      render: (text: string, record: Document) => (
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileTextOutlined className="text-primary text-lg" />
          </div>
          <div>
            <div className="font-semibold text-gray-900">{text}</div>
            <div className="text-xs text-gray-500 mt-1">
              {new Date(record?.date_created).toLocaleDateString()}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Preview",
      dataIndex: "content",
      key: "content",
      width: "35%",
      render: (content: string) => (
        <div className="text-sm text-gray-600 line-clamp-2">
          {stripHtml(content)}
        </div>
      ),
    },
    {
      title: "Access Level",
      dataIndex: "access_level",
      key: "access_level",
      width: "15%",
      render: (level: string) => (
        <Tag color={getAccessLevelColor(level)} className="capitalize">
          {level}
        </Tag>
      ),
    },
    {
      title: "Author",
      dataIndex: "author_id",
      key: "author_id",
      width: "10%",
      render: (id: number) => (
        <span className="text-sm text-gray-700">ID: {id}</span>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: "10%",
      render: (_: any, record: Document) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EyeOutlined />}
            onClick={() => navigate(`/documents/${record.ID}`)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          />
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => navigate(`/documents/edit/${record.ID}`)}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          />
          <Popconfirm
            title="Delete Document"
            description="Are you sure you want to delete this document?"
            onConfirm={() => handleDelete(record.ID)}
            okText="Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true, loading: deleting }}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
              loading={deleting}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="py-6 px-4">
      <Card className="shadow-sm border-slate-200">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Documents</h1>
            <p className="text-sm text-gray-600">
              Manage and organize your documents
            </p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={() => navigate("/documents/create")}
            className="bg-primary hover:bg-hover"
          >
            Create Document
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <Search
            placeholder="Search documents..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="large"
            className="md:w-96"
            allowClear
          />
          <Select
            size="large"
            value={filterAccessLevel}
            onChange={setFilterAccessLevel}
            className="md:w-48"
          >
            <Option value="all">All Access Levels</Option>
            <Option value="public">Public</Option>
            <Option value="staff">Staff</Option>
            <Option value="management">Management</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </div>

        {/* Stats */}
        <div className="mb-6">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-4">
            <div className="text-xs text-gray-500 mt-2">
              Showing {filteredDocuments.length} of {documents.length} documents
            </div>
          </div>
        </div>

        {/* Table */}
        {filteredDocuments.length === 0 && !isLoading ? (
          <Empty
            description="No documents found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={filteredDocuments}
            rowKey="id"
            loading={isLoading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} documents`,
            }}
            scroll={{ x: 1000 }}
          />
        )}
      </Card>
    </div>
  );
};
