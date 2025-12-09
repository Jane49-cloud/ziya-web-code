import { useParams, useNavigate } from "react-router-dom";
import { Card, Button, Tag, Spin, Empty, Space } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PrinterOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";

import DOMPurify from "dompurify";
import { useGetSingleDocumentQuery } from "../features/docSlice";

export const DocumentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetSingleDocumentQuery(id!);
  const document = data?.document;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!document) return;

    const element = document.createElement("a");
    const file = new Blob([document.content], { type: "text/html" });
    element.href = URL.createObjectURL(file);
    element.download = `${document.title}.html`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Empty description="Document not found" />
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(document.content);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="mb-6 print:hidden">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/documents")}
          className="mb-4"
        >
          Back to Documents
        </Button>
      </div>

      <Card className="shadow-lg border-slate-200">
        {/* Document Header */}
        <div className="mb-6 pb-6 border-b print:border-b-2">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                {document.title}
              </h1>

              <Space size="middle" wrap>
                <Tag
                  color={getAccessLevelColor(document.access_level)}
                  icon={<LockOutlined />}
                  className="capitalize px-3 py-1"
                >
                  {document.access_level}
                </Tag>

                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <UserOutlined />
                  Author ID: {document.author_id}
                </span>

                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <CalendarOutlined />
                  {new Date(document.date_created).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </Space>
            </div>

            {/* Actions */}
            <div className="flex gap-2 print:hidden">
              <Button
                icon={<EditOutlined />}
                onClick={() => navigate(`/documents/edit/${document.ID}`)}
                className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
              >
                Edit
              </Button>
              <Button
                icon={<PrinterOutlined />}
                onClick={handlePrint}
                className="hover:bg-purple-50 hover:text-purple-600 hover:border-purple-300"
              >
                Print
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownload}
                className="hover:bg-green-50 hover:text-green-600 hover:border-green-300"
              >
                Download
              </Button>
            </div>
          </div>

          {document.date_updated && (
            <div className="text-xs text-gray-500">
              Last updated: {new Date(document.date_updated).toLocaleString()}
            </div>
          )}
        </div>

        {/* Document Content */}
        <div
          className="prose prose-slate max-w-none 
                     prose-headings:text-gray-900
                     prose-p:text-gray-700 prose-p:leading-relaxed
                     prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-gray-900 prose-strong:font-semibold
                     prose-ul:list-disc prose-ol:list-decimal
                     prose-li:text-gray-700
                     prose-blockquote:border-l-4 prose-blockquote:border-gray-300 
                     prose-blockquote:pl-4 prose-blockquote:italic
                     prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 
                     prose-code:rounded prose-code:text-sm
                     print:prose-sm"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </Card>

      {/* Print Styles */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .ant-card, .ant-card * {
            visibility: visible;
          }
          .ant-card {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none !important;
            border: none !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
};
