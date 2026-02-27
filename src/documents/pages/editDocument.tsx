/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { Button, Input, Select, Form, message, Spin, Empty, Alert } from "antd";
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
  } = useGetSingleDocumentQuery(id!, {
    refetchOnFocus: false,
    refetchOnReconnect: false,
  });
  const [updateDocument, { isLoading: updating }] = useUpdateDocumentMutation();
  const [isDirty, setIsDirty] = useState(false);
  const [autoSaveState, setAutoSaveState] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");
  const [lastAutoSaveAt, setLastAutoSaveAt] = useState<Date | null>(null);
  const [hasConflict, setHasConflict] = useState(false);
  const hasInitializedRef = useRef(false);
  const isAutoSavingRef = useRef(false);
  const lastSavedContentRef = useRef<string>("");
  const lastSavedMetaRef = useRef<{ title: string; access_level: string }>({
    title: "",
    access_level: "",
  });
  const lastRemoteUpdatedAtRef = useRef<string>("");

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
  const watchedTitle = Form.useWatch("title", form);
  const watchedAccess = Form.useWatch("access_level", form);

  // Populate editor + form when document loads
  useEffect(() => {
    if (!document || !editor) return;
    const remoteUpdatedAt = document.updated_at ?? document.date_created ?? "";
    const hasRemoteChanged =
      Boolean(remoteUpdatedAt) &&
      remoteUpdatedAt !== lastRemoteUpdatedAtRef.current;

    if (hasInitializedRef.current) {
      if (hasRemoteChanged) {
        setHasConflict(true);
        lastRemoteUpdatedAtRef.current = remoteUpdatedAt;
      }
      return;
    }

    editor.commands.setContent(document.content || "");
    form.setFieldsValue({
      title: document.title,
      access_level: document.access_level,
    });
    lastSavedContentRef.current = document.content || "";
    lastSavedMetaRef.current = {
      title: document.title || "",
      access_level: document.access_level || "",
    };
    lastRemoteUpdatedAtRef.current = remoteUpdatedAt;
    setIsDirty(false);
    setHasConflict(false);
    setAutoSaveState("saved");
    setLastAutoSaveAt(
      document.updated_at ? new Date(document.updated_at) : null,
    );
    hasInitializedRef.current = true;
  }, [document, editor, form]);

  useEffect(() => {
    if (!editor) return;
    const handleUpdate = () => setIsDirty(true);
    editor.on("update", handleUpdate);
    return () => {
      editor.off("update", handleUpdate);
    };
  }, [editor]);

  useEffect(() => {
    if (watchedTitle || watchedAccess) {
      setIsDirty(true);
    }
  }, [watchedTitle, watchedAccess]);

  const buildPayload = () => {
    if (!editor || !document) return null;
    const content = editor.getHTML();
    return {
      id: Number(id),
      author_id: document.author_id,
      title: watchedTitle ?? document.title ?? "",
      content,
      access_level: watchedAccess ?? document.access_level ?? "",
    };
  };

  const performSave = async (mode: "auto" | "manual") => {
    if (!document) return false;
    const payload = buildPayload();
    if (!payload) return false;

    if (!payload.title || !payload.access_level) {
      if (mode === "manual") {
        message.error("Please fill in title and access level");
      }
      return false;
    }

    if (!payload.content || payload.content === "<p></p>") {
      if (mode === "manual") {
        message.error("Please add content to your document");
      }
      return false;
    }

    const hasContentChange = payload.content !== lastSavedContentRef.current;
    const hasMetaChange =
      payload.title !== lastSavedMetaRef.current.title ||
      payload.access_level !== lastSavedMetaRef.current.access_level;

    if (!hasContentChange && !hasMetaChange) {
      setIsDirty(false);
      return false;
    }

    try {
      if (mode === "auto") {
        setAutoSaveState("saving");
        isAutoSavingRef.current = true;
      }
      await updateDocument(payload).unwrap();
      lastSavedContentRef.current = payload.content;
      lastSavedMetaRef.current = {
        title: payload.title,
        access_level: payload.access_level,
      };
      setIsDirty(false);
      setAutoSaveState("saved");
      setLastAutoSaveAt(new Date());
      return true;
    } catch (error: any) {
      if (mode === "manual") {
        message.error(error?.data?.error || "Failed to update document");
      } else {
        setAutoSaveState("error");
      }
      return false;
    } finally {
      if (mode === "auto") {
        isAutoSavingRef.current = false;
      }
    }
  };

  useEffect(() => {
    if (!isDirty) return;
    if (!editor || !document) return;
    if (!watchedTitle || !watchedAccess) return;
    if (updating || isAutoSavingRef.current) return;
    if (hasConflict) return;

    const handle = window.setTimeout(() => {
      void performSave("auto");
    }, 1500);

    return () => {
      window.clearTimeout(handle);
    };
  }, [
    isDirty,
    watchedTitle,
    watchedAccess,
    updating,
    editor,
    document,
    hasConflict,
  ]);

  const handleSubmit = async () => {
    try {
      const saved = await performSave("manual");
      if (saved) {
        message.success("Document updated successfully!");
        navigate(`/documents/${id}`);
      }
    } catch {
      // performSave handles errors
    }
  };

  const autosaveLabel = (() => {
    if (isDirty && autoSaveState !== "saving") return "Unsaved changes";
    if (autoSaveState === "saving") return "Saving...";
    if (autoSaveState === "error") return "Auto-save failed. Will retry.";
    if (autoSaveState === "saved") {
      return `Saved ${
        lastAutoSaveAt ? lastAutoSaveAt.toLocaleTimeString() : "just now"
      }`;
    }
    return "All changes saved";
  })();
  const isSaving = updating || autoSaveState === "saving";
  const hasUnsavedChanges = isDirty || autoSaveState === "error";
  const saveButtonLabel = isSaving
    ? "Saving..."
    : hasUnsavedChanges
      ? "Save now"
      : "Saved";

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
    <div className="-mt-4 min-h-screen ">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="min-h-screen flex flex-col"
      >
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-30 mb-2 border-b border-slate-200 bg-white/95 backdrop-blur">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
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

              <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
                <div className="hidden items-center gap-2 text-xs text-slate-500 sm:flex">
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                    Auto-save on
                  </span>
                  <span>{autosaveLabel}</span>
                </div>
                <Form.Item
                  name="access_level"
                  className="mb-0 w-full sm:w-40"
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
                  className="hidden rounded-full sm:inline-flex"
                  onClick={() => message.info("Sharing controls coming soon")}
                >
                  Share
                </Button>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={isSaving}
                  disabled={!hasUnsavedChanges && !isSaving}
                  className="rounded-full bg-primary hover:bg-hover disabled:bg-slate-300 disabled:text-slate-600"
                >
                  {saveButtonLabel}
                </Button>
              </div>
            </div>
            <div className="border-t border-slate-200 bg-white px-4 py-2">
              <EditorToolbar editor={editor} />
            </div>
          </header>

          <div className="flex-1 pb-8 sm:pb-10 bg-white">
            <div className="mx-auto w-full">
              <div className="bg-white shadow-[0_28px_70px_rgba(15,23,42,0.08)]">
                {hasConflict && (
                  <div className="border-b border-slate-200 bg-amber-50/50 px-3 py-3 sm:px-4">
                    <Alert
                      type="warning"
                      showIcon
                      message="This document was updated elsewhere."
                      description="You can reload the latest version or keep editing your current copy."
                      action={
                        <div className="flex gap-2">
                          <Button
                            size="small"
                            onClick={() => {
                              if (!document || !editor) return;
                              editor.commands.setContent(
                                document.content || "",
                              );
                              form.setFieldsValue({
                                title: document.title,
                                access_level: document.access_level,
                              });
                              lastSavedContentRef.current =
                                document.content || "";
                              lastSavedMetaRef.current = {
                                title: document.title || "",
                                access_level: document.access_level || "",
                              };
                              lastRemoteUpdatedAtRef.current =
                                document.updated_at ??
                                document.date_created ??
                                "";
                              setIsDirty(false);
                              setHasConflict(false);
                              setAutoSaveState("saved");
                              setLastAutoSaveAt(
                                document.updated_at
                                  ? new Date(document.updated_at)
                                  : null,
                              );
                            }}
                          >
                            Reload latest
                          </Button>
                          <Button
                            size="small"
                            type="text"
                            onClick={() => setHasConflict(false)}
                          >
                            Keep editing
                          </Button>
                        </div>
                      }
                    />
                  </div>
                )}
                <div className="doc-page w-full">
                  <div className="px-4 pt-8 pb-6">
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
              <div className="hidden items-center gap-2 text-xs text-slate-500 md:flex">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
                  Auto-save on
                </span>
                <span>{autosaveLabel}</span>
              </div>
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
                loading={isSaving}
                disabled={!hasUnsavedChanges && !isSaving}
                className="bg-primary hover:bg-hover disabled:bg-slate-300 disabled:text-slate-600"
              >
                {saveButtonLabel}
              </Button>
            </div>
          </div>
        </footer>
      </Form>
    </div>
  );
};
