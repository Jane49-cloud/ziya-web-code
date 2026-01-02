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
  const doc = data?.document; // renamed from "document" to avoid confusion

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    if (!doc) return;

    // use window.document explicitly to avoid shadowing
    const a = window.document.createElement("a");
    const file = new Blob([doc.content], { type: "text/html" });
    a.href = URL.createObjectURL(file);
    a.download = `${doc.title}.html`;
    window.document.body.appendChild(a);
    a.click();
    window.document.body.removeChild(a);
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
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Empty description="Document not found" />
      </div>
    );
  }

  const sanitizedContent = DOMPurify.sanitize(doc.content);

  return (
    <div className=" min-h-screen ">
      <div className="">
        {/* Header */}
        <div className="mb-4 print:hidden flex items-center justify-between">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate("/documents")}
          >
            Back to Documents
          </Button>
        </div>

        <Card className="shadow-sm border-none">
          {/* Document Header */}
          <div className="mb-6 pb-5 border-b border-slate-100 print:border-b-2">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-3">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  {doc.title}
                </h1>

                <Space size="middle" wrap>
                  <Tag
                    color={getAccessLevelColor(doc.access_level)}
                    icon={<LockOutlined />}
                    className="capitalize px-3 py-1"
                  >
                    {doc.access_level}
                  </Tag>

                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <UserOutlined />
                    Author ID: {doc.author_id}
                  </span>

                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <CalendarOutlined />
                    {new Date(doc.date_created).toLocaleDateString("en-US", {
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
                  onClick={() => navigate(`/documents/edit/${doc.ID}`)}
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

            {doc.date_updated && (
              <div className="text-xs text-gray-500">
                Last updated: {new Date(doc.date_updated).toLocaleString()}
              </div>
            )}
          </div>

          {/* Document Content */}
          <div
            className="
              prose prose-slate max-w-none
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
              print:prose-sm
            "
            dangerouslySetInnerHTML={{ __html: sanitizedContent }}
          />
        </Card>

        {/* Print Styles */}
        <style>{`
          @media print {
            body {
              background: #ffffff !important;
            }
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
    </div>
  );
};
