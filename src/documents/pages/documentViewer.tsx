import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Tag, Spin, Empty, message } from "antd";
import {
  ArrowLeftOutlined,
  EditOutlined,
  PrinterOutlined,
  DownloadOutlined,
  CalendarOutlined,
  UserOutlined,
  LockOutlined,
} from "@ant-design/icons";
import { FileText, Share2 } from "lucide-react";
import DOMPurify from "dompurify";
import { useGetSingleDocumentQuery } from "../features/docSlice";

export const DocumentViewer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useGetSingleDocumentQuery(id!, {
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const doc = data?.document; // renamed from "document" to avoid confusion
  const sanitizedContent = useMemo(
    () => (doc?.content ? DOMPurify.sanitize(doc.content) : ""),
    [doc?.content],
  );

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

  const createdAt = doc ? new Date(doc.date_created) : null;

  return (
    <div className="mt-4 min-h-screen print:bg-white">
      <div className="pointer-events-none absolute inset-0 hidden bg-[radial-gradient(circle_at_top,_rgba(50,197,244,0.08),_transparent_60%)] lg:block" />
      <main className="relative z-10 pb-10 sm:pb-12 ">
        <section className="mx-auto w-full  overflow-hidden bg-white shadow-[0_30px_80px_rgba(15,23,42,0.08)]">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
            <div className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Button
                icon={<ArrowLeftOutlined />}
                className="rounded-full"
                onClick={() => navigate("/documents")}
              >
                Documents
              </Button>

              <div className="flex min-w-0 flex-1 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <FileText size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="truncate text-lg font-semibold text-slate-900">
                    {doc.title}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <UserOutlined /> Author #{doc.author_id}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarOutlined />
                      {createdAt?.toLocaleDateString() || "--"}
                    </span>
                    <Tag
                      color={getAccessLevelColor(doc.access_level)}
                      icon={<LockOutlined />}
                      className="capitalize"
                    >
                      {doc.access_level}
                    </Tag>
                  </div>
                </div>
              </div>

              <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
                <Button
                  icon={<Share2 size={16} />}
                  className="rounded-full"
                  onClick={() => message.info("Sharing controls coming soon")}
                >
                  Share
                </Button>
                <Button
                  icon={<EditOutlined />}
                  onClick={() => navigate(`/documents/edit/${doc.ID}`)}
                >
                  Edit
                </Button>
                <Button icon={<PrinterOutlined />} onClick={handlePrint}>
                  Print
                </Button>
                <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                  Download
                </Button>
              </div>
            </div>
          </header>
          <article className="doc-printable doc-page w-full">
            <div className="doc-render px-10 py-6 text-[15px] leading-relaxed text-slate-700">
              <div
                className="prose prose-slate max-w-none"
                dangerouslySetInnerHTML={{ __html: sanitizedContent }}
              />
            </div>
          </article>
        </section>
      </main>

      <style>{`
        @media print {
          body {
            background: #ffffff !important;
          }
          body * {
            visibility: hidden;
          }
          .doc-printable, .doc-printable * {
            visibility: visible;
          }
          .doc-printable {
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
