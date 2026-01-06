/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Button, Input, Select, Form, message, Spin, Empty } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import { EditorToolbar } from "../components/editorToolbar";
import {
  useGetSingleDocumentQuery,
  useUpdateDocumentMutation,
} from "../features/docSlice";
import { buildDocumentEditorExtensions } from "../components/editorExtensions";
import { useEditorStats } from "../hooks/useEditorStats";
import { FileText, Share2 } from "lucide-react";

const { Option } = Select;

export const EditDocumentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const {
    data,
    isLoading: fetchingData,
    error,
  } = useGetSingleDocumentQuery(id!);
  const [updateDocument, { isLoading: updating }] = useUpdateDocumentMutation();

  const document = data?.document;
  const lastUpdated = document?.updated_at ?? document?.date_created ?? null;

  const editor = useEditor({
    extensions: buildDocumentEditorExtensions("Start editing your document..."),
    content: "",
    editorProps: {
      attributes: {
        class:
          "doc-editor prose prose-slate max-w-none focus:outline-none min-h-[900px]",
      },
    },
  });
  const stats = useEditorStats(editor);

  // Populate editor + form when document loads
  useEffect(() => {
    if (document && editor) {
      editor.commands.setContent(document.content || "");
      form.setFieldsValue({
        title: document.title,
        access_level: document.access_level,
      });
    }
  }, [document, editor, form]);

  const handleSubmit = async (values: any) => {
    if (!editor || !document) return;

    const content = editor.getHTML();

    if (!content || content === "<p></p>") {
      message.error("Please add content to your document");
      return;
    }

    try {
      const payload = {
        id: Number(id),
        // keep the original author id; not edited via the form
        author_id: document.author_id,
        title: values.title,
        content,
        access_level: values.access_level,
      };

      await updateDocument(payload).unwrap();

      message.success("Document updated successfully!");
      navigate(`/documents/${id}`);
    } catch (error: any) {
      message.error(error?.data?.error || "Failed to update document");
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Spin size="large" />
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-slate-50">
        <Empty description="Document not found" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="min-h-screen flex flex-col"
      >
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="max-w-5xl mx-auto flex items-center gap-3 px-4 py-3">
              <Button
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(`/documents/${id}`)}
              />
              <Button
                className="rounded-full"
                onClick={() => navigate("/documents")}
              >
                Documents
              </Button>
              <div className="flex items-center gap-3 flex-1">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/15 text-primary">
                  <FileText size={22} />
                </div>
                <div className="flex-1">
                  <Form.Item
                    name="title"
                    className="mb-0"
                    rules={[
                      {
                        required: true,
                        message: "Please enter document title",
                      },
                    ]}
                  >
                    <Input
                      placeholder="Untitled document"
                      variant="borderless"
                      size="large"
                      className="text-lg font-semibold text-slate-900"
                    />
                  </Form.Item>
                  <p className="text-xs text-slate-500">
                    {lastUpdated
                      ? `Last updated ${new Date(lastUpdated).toLocaleString()}`
                      : "Unsaved changes"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Form.Item
                  name="access_level"
                  className="mb-0 w-40"
                  rules={[
                    { required: true, message: "Please select access level" },
                  ]}
                >
                  <Select size="large" className="rounded-full">
                    <Option value="public">Public</Option>
                    <Option value="staff">Staff</Option>
                    <Option value="management">Management</Option>
                    <Option value="admin">Admin</Option>
                  </Select>
                </Form.Item>

                <Button
                  icon={<Share2 size={16} />}
                  className="rounded-full"
                  onClick={() => message.info("Sharing controls coming soon")}
                >
                  Share
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={updating}
                  className="rounded-full bg-primary hover:bg-hover"
                >
                  Submit
                </Button>
              </div>
            </div>
          </header>

          <div className="flex-1">
            <div className="max-w-5xl mx-auto px-4">
              <div className="sticky top-[84px] z-20">
                <div className="rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm">
                  <EditorToolbar editor={editor} />
                </div>
              </div>

              <div className="py-8 flex justify-center">
                <div className="doc-page w-full rounded-[32px] bg-white shadow-2xl shadow-slate-200/60 ring-1 ring-slate-100">
                  <div className="px-12 py-12">
                    <EditorContent editor={editor} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <footer className="border-t border-slate-200 bg-white/95">
          <div className="max-w-5xl mx-auto flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span>
                <span className="font-semibold text-slate-900">
                  {stats.words}
                </span>{" "}
                words
              </span>
              <span>
                <span className="font-semibold text-slate-900">
                  {stats.characters}
                </span>{" "}
                characters
              </span>
              <span>≈ {stats.readingTime || 0} min read</span>
            </div>

            <div className="flex gap-3 justify-end">
              <Button
                size="large"
                onClick={() => navigate(`/documents/${id}`)}
                disabled={updating}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updating}
                className="bg-primary hover:bg-hover"
              >
                Update Document
              </Button>
            </div>
          </div>
        </footer>
      </Form>
    </div>
  );
};
