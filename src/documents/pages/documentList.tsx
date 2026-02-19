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

  const { data, isLoading, refetch } = useGetAllDocumentsQuery(
    {},
    {
      pollingInterval: 3000,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const [deleteDocument, { isLoading: deleting }] = useDeleteDocumentMutation();

  const documents = useMemo(() => data?.documents || [], [data]);

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
    <div className="-mt-4 pt-2">
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        {/* Header */}
        <div className="mb-6 rounded-2xl border border-slate-200/70 bg-gradient-to-r from-white via-sky-50 to-cyan-50 p-4 sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-1 text-2xl font-bold text-gray-900">Documents</h1>
              <p className="text-sm text-gray-600">
                Manage and organize your documents
              </p>
            </div>
            <Button
              type="primary"
              size="large"
              icon={<PlusOutlined />}
              onClick={() => navigate("/documents/create")}
              className="bg-primary hover:bg-hover md:self-start"
            >
              Create Document
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_220px]">
          <Search
            placeholder="Search documents..."
            prefix={<SearchOutlined />}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="large"
            allowClear
          />
          <Select
            size="large"
            value={filterAccessLevel}
            onChange={setFilterAccessLevel}
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
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs text-gray-500">
              Showing {filteredDocuments.length} of {documents.length} documents
            </div>
          </div>
        </div>

        {/* Empty */}
        {filteredDocuments.length === 0 && !isLoading ? (
          <Empty
            description="No documents found"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <>
            {/* Mobile list */}
            <div className="grid gap-3 md:hidden">
              {filteredDocuments.map((record: Document) => (
                <div
                  key={record.ID}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-slate-900">
                        {record.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {new Date(record?.date_created).toLocaleDateString()}
                      </p>
                    </div>
                    <Tag
                      color={getAccessLevelColor(record.access_level ?? "")}
                      className="capitalize"
                    >
                      {record.access_level ?? "unknown"}
                    </Tag>
                  </div>
                  <p className="mb-3 text-sm text-slate-600">
                    {stripHtml(record.content ?? "")}
                  </p>
                  <div className="mb-3 text-xs text-slate-500">
                    Author ID: {record.author_id}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => navigate(`/documents/${record.ID}`)}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => navigate(`/documents/edit/${record.ID}`)}
                    >
                      Edit
                    </Button>
                    <Popconfirm
                      title="Delete Document"
                      description="Are you sure you want to delete this document?"
                      onConfirm={() => handleDelete(record.ID)}
                      okText="Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true, loading: deleting }}
                    >
                      <Button
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                        loading={deleting}
                      >
                        Delete
                      </Button>
                    </Popconfirm>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block">
              <Table
                columns={columns}
                dataSource={filteredDocuments}
                rowKey="ID"
                loading={isLoading}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showTotal: (total) => `Total ${total} documents`,
                }}
                scroll={{ x: 1000 }}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
};
