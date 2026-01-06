/* eslint-disable @typescript-eslint/no-explicit-any */

import { Button, Input, Select, Form, message } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import { useCreateDocumentMutation } from "../features/docSlice";
import { EditorToolbar } from "./editorToolbar";
import { getUser } from "../../utils";
import { buildDocumentEditorExtensions } from "./editorExtensions";
import { useEditorStats } from "../hooks/useEditorStats";
import { FileText, Share2 } from "lucide-react";

const { Option } = Select;

export const CreateDocumentForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [createDocument, { isLoading }] = useCreateDocumentMutation();

  const user = getUser(); // FIX: must call the function
  const authorId = Number(user?.id); // ensure number

  const editor = useEditor({
    extensions: buildDocumentEditorExtensions("Start writing your document..."),
    content: "",
    editorProps: {
      attributes: {
        class:
          "doc-editor prose prose-slate max-w-none focus:outline-none min-h-[900px]",
      },
    },
  });
  const stats = useEditorStats(editor);

  const handleSubmit = async (values: any) => {
    if (!editor) return;

    const content = editor.getHTML();

    if (!content || content === "<p></p>") {
      message.error("Please add content to your document");
      return;
    }

    try {
      const payload = {
        author_id: authorId, // FIXED: directly from logged-in user
        title: values.title,
        content: content,
        access_level: values.access_level,
        date_created: new Date().toISOString(),
      };

      await createDocument(payload).unwrap();
      message.success("Document created successfully!");
      navigate("/documents");
    } catch (error: any) {
      message.error(error?.data?.error || "Failed to create document");
    }
  };

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
            <div className="max-w-5xl mx-auto flex items-center gap-4 px-4 py-3">
              <Button
                icon={<ArrowLeftOutlined />}
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
                    Draft · Changes save when you submit
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Form.Item
                  name="access_level"
                  className="mb-0 w-40"
                  initialValue="staff"
                  rules={[
                    { required: true, message: "Please select access level" },
                  ]}
                >
                  <Select
                    size="large"
                    popupClassName="rounded-lg"
                    className="rounded-full"
                  >
                    <Option value="public">Public</Option>
                    <Option value="staff">Staff</Option>
                    <Option value="management">Management</Option>
                    <Option value="admin">Admin</Option>
                  </Select>
                </Form.Item>

                <Button
                  icon={<Share2 size={16} />}
                  type="default"
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
                  loading={isLoading}
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
                <div className="rounded-full border border-slate-200 bg-whites px-3 py-2 shadow-sm mt-2">
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
                onClick={() => navigate("/documents")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={isLoading}
                className="bg-primary hover:bg-hover"
              >
                Create Document
              </Button>
            </div>
          </div>
        </footer>
      </Form>
    </div>
  );
};
