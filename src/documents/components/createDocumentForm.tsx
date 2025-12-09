/* eslint-disable @typescript-eslint/no-explicit-any */

import { Card, Button, Input, Select, Form, message } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useCreateDocumentMutation } from "../features/docSlice";
import { EditorToolbar } from "./editorToolbar";
import { getUser } from "../../utils";

const { Option } = Select;

export const CreateDocumentForm: React.FC = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [createDocument, { isLoading }] = useCreateDocumentMutation();

  const user = getUser(); // FIX: must call the function
  const authorId = Number(user?.id); // ensure number

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Image,
      Link.configure({ openOnClick: false }),
      Placeholder.configure({ placeholder: "Start writing your document..." }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-xl focus:outline-none min-h-[400px] p-6",
      },
    },
  });

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
    <div className="max-w-6xl mx-auto py-6 px-4">
      <Card className="shadow-sm border-slate-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Create New Document
          </h1>
          <p className="text-sm text-gray-600">
            Fill in the details to create a new document
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Form.Item
              label="Title"
              name="title"
              rules={[
                { required: true, message: "Please enter document title" },
              ]}
            >
              <Input
                placeholder="Enter document title"
                size="large"
                className="rounded-lg"
              />
            </Form.Item>

            <Form.Item
              label="Access Level"
              name="access_level"
              initialValue="staff"
              rules={[
                { required: true, message: "Please select access level" },
              ]}
            >
              <Select size="large" className="rounded-lg">
                <Option value="public">Public</Option>
                <Option value="staff">Staff</Option>
                <Option value="management">Management</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>
          </div>

          {/* AUTHOR ID REMOVED */}

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content <span className="text-red-500">*</span>
            </label>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <EditorToolbar editor={editor} />
              <div className="bg-white">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-4 border-t">
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
        </Form>
      </Card>
    </div>
  );
};
