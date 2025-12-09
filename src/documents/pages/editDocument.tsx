/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from "react";
import { Card, Button, Input, Select, Form, message, Spin } from "antd";
import { SaveOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorToolbar } from "../components/editorToolbar";
import {
  useGetSingleDocumentQuery,
  useUpdateDocumentMutation,
} from "../features/docSlice";

const { Option } = Select;

export const EditDocumentForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const { data, isLoading: fetchingData } = useGetSingleDocumentQuery(id!);
  const [updateDocument, { isLoading: updating }] = useUpdateDocumentMutation();

  const document = data?.document;

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

  useEffect(() => {
    if (document && editor) {
      editor.commands.setContent(document.content);
      form.setFieldsValue({
        title: document.title,
        access_level: document.access_level,
        author_id: document.author_id,
      });
    }
  }, [document, editor, form]);

  const handleSubmit = async (values: any) => {
    if (!editor) return;

    const content = editor.getHTML();

    if (!content || content === "<p></p>") {
      message.error("Please add content to your document");
      return;
    }

    try {
      const payload = {
        id: Number(id),
        author_id: values.author_id,
        title: values.title,
        content: content,
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
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-6 px-4">
      <div className="mb-6">
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(`/documents/${id}`)}
          className="mb-4"
        >
          Back to Document
        </Button>
      </div>

      <Card className="shadow-sm border-slate-200">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Edit Document
          </h1>
          <p className="text-sm text-gray-600">Update the document details</p>
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
              rules={[
                { required: true, message: "Please select access level" },
              ]}
            >
              <Select
                size="large"
                placeholder="Select access level"
                className="rounded-lg"
              >
                <Option value="public">Public</Option>
                <Option value="staff">Staff</Option>
                <Option value="management">Management</Option>
                <Option value="admin">Admin</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            label="Author ID"
            name="author_id"
            rules={[{ required: true, message: "Please enter author ID" }]}
          >
            <Input
              type="number"
              placeholder="Enter author ID"
              size="large"
              className="rounded-lg"
            />
          </Form.Item>

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
        </Form>
      </Card>
    </div>
  );
};
