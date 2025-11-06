import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Button,
  Card,
  Form,
  Input,
  message,
  Select,
  Space,
  Spin,
} from "antd";
import {
  useCreateBlogMutation,
  useGetBlogByIdQuery,
  useMarkBlogDraftMutation,
  usePublishBlogMutation,
  useUpdateBlogMutation,
} from "../features/blogs/blogsApi";
import type { BlogFormValues, BlogBase, BlogStatus } from "../types";
import {
  buildBlogPayload,
  defaultBlogFormValues,
  extractSingleBlog,
  normalizeBlog,
} from "../utils";
import { RichTextEditor } from "../components";
import { ArrowLeft, Save, UploadCloud } from "lucide-react";

const STATUS_OPTIONS: { label: string; value: BlogStatus }[] = [
  { label: "Draft", value: "draft" },
  { label: "Published", value: "published" },
  { label: "Archived", value: "archived" },
];

export const BlogComposerPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const [form] = Form.useForm<BlogFormValues>();

  // Fetch existing blog when editing
  const blogId = id ?? "";
  const {
    data: blogData,
    isLoading: loadingBlog,
    error: blogError,
    refetch: refetchBlog,
  } = useGetBlogByIdQuery(blogId, { skip: !isEditing });

  // Mutations
  const [createBlog, { isLoading: creating }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: updating }] = useUpdateBlogMutation();
  const [publishBlog, { isLoading: publishing }] = usePublishBlogMutation();
  const [markDraft, { isLoading: drafting }] = useMarkBlogDraftMutation();

  // Normalize incoming blog
  const resolvedBlog: BlogBase | null = useMemo(() => {
    if (!isEditing) return null;
    const normalized = extractSingleBlog(blogData, id ?? "1");
    if (normalized) return normalized;
    if (blogData && typeof blogData === "object") {
      return normalizeBlog(blogData as Record<string, unknown>, id ?? "1");
    }
    return null;
  }, [blogData, id, isEditing]);

  // Seed form with existing values
  useEffect(() => {
    if (resolvedBlog) {
      const nextValues: BlogFormValues = {
        title: resolvedBlog.title,
        excerpt: resolvedBlog.excerpt ?? "",
        tags: resolvedBlog.tags ?? [],
        status: resolvedBlog.status,
        content: resolvedBlog.content,
      };
      form.setFieldsValue(nextValues);
    }
  }, [form, resolvedBlog]);

  // SAVE ONLY (create or update). No publish here.
  const handleSubmit = async (values: BlogFormValues) => {
    const html = (values.content || "").trim();
    if (!html || html === "<p></p>") {
      message.error("Please add content before saving.");
      return;
    }

    const payload = buildBlogPayload({ ...values, content: html });

    // Preserve metadata on updates
    if (resolvedBlog) {
      if (!payload.date_created && resolvedBlog.createdAt) {
        payload.date_created = resolvedBlog.createdAt;
      }
      if (!payload.author_id && resolvedBlog.author?.id) {
        payload.author_id = resolvedBlog.author.id;
      }
    }

    try {
      if (isEditing && id) {
        await updateBlog({ id, ...payload }).unwrap();
        message.success("Blog updated successfully.");
        await refetchBlog();
        navigate(`/blogs/${id}`);
      } else {
        // Always create first; publishing is a separate action afterwards
        const response = await createBlog({
          ...payload,
          status: "draft",
        }).unwrap();
        const created = extractSingleBlog(response, "new");
        const createdId = created?.id;
        message.success("Blog created.");
        navigate(`/blogs/${createdId ?? "blogs"}`);
      }
    } catch (err) {
      console.error("Blog save failed", err);
      message.error("We couldn't save the blog. Please try again.");
    }
  };

  // PUBLISH ONLY (no saving). Requires existing blog id.
  const handlePublishOnly = async () => {
    if (!id) {
      message.warning("Create and save the blog before publishing.");
      return;
    }
    try {
      await publishBlog(id).unwrap(); // publish is its own action, no payload
      form.setFieldsValue({ status: "published" });
      message.success("Blog published.");
      await refetchBlog();
      navigate(`/blogs/${id}`);
    } catch (err) {
      console.error("Publish failed", err);
      message.error("Unable to publish right now.");
    }
  };

  // Move a published blog back to draft (no saving).
  const handleMoveToDraftOnly = async () => {
    if (!id) return;
    try {
      await markDraft(id).unwrap();
      form.setFieldsValue({ status: "draft" });
      message.success("Moved back to draft.");
      await refetchBlog();
    } catch (err) {
      console.error("Move to draft failed", err);
      message.error("Unable to move back to draft right now.");
    }
  };

  const isBusy = creating || updating || publishing || drafting;
  console.log("isBusy:", isBusy);

  if (isEditing && loadingBlog) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (isEditing && blogError) {
    return (
      <Alert
        type="error"
        message="We couldn't load this blog"
        description="Return to the list and try again."
        showIcon
      />
    );
  }

  return (
    <div className="space-y-6">
      <Button
        type="link"
        icon={<ArrowLeft size={16} />}
        onClick={() => navigate(-1)}
        className="pl-0 text-slate-500 hover:text-slate-900"
      >
        Back to blogs
      </Button>

      <Card className="rounded-3xl border border-slate-200/70 bg-white/95 shadow-[0_26px_90px_-60px_rgba(15,23,42,0.5)]">
        <Form<BlogFormValues>
          layout="vertical"
          form={form}
          initialValues={defaultBlogFormValues}
          onFinish={handleSubmit}
          className="blog-composer-form"
        >
          <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Form.Item
                label="Headline"
                name="title"
                rules={[{ required: true, message: "Please add a headline" }]}
              >
                <Input
                  size="large"
                  placeholder="Enter a captivating headline"
                />
              </Form.Item>

              <Form.Item
                label="Executive summary"
                name="excerpt"
                rules={[
                  {
                    required: true,
                    message: "Summaries help readers discover content",
                  },
                  {
                    max: 260,
                    message: "Keep the summary under 260 characters",
                  },
                ]}
              >
                <Input.TextArea
                  rows={3}
                  placeholder="Elevate the key outcome or promise in one sentence."
                  showCount
                  maxLength={260}
                />
              </Form.Item>

              <Form.Item
                label="Article body"
                name="content"
                rules={[
                  {
                    required: true,
                    message: "Please add the main article body",
                  },
                ]}
                valuePropName="value"
                className="mb-0"
              >
                <RichTextEditor placeholder="Begin with a guiding insight, then unfold the narrative…" />
              </Form.Item>
            </div>

            <div className="space-y-6">
              <Form.Item label="Tags" name="tags">
                <Select
                  size="large"
                  mode="tags"
                  placeholder="Add up to 5 tags"
                  tokenSeparators={[","]}
                  maxTagCount={5}
                />
              </Form.Item>

              {/* Status is informative; publish/draft are separate actions */}
              <Form.Item label="Status" name="status">
                <Select size="large" options={STATUS_OPTIONS} />
              </Form.Item>

              <Space direction="vertical" size="middle" className="w-full">
                {/* Save ONLY */}
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<Save size={16} />}
                  loading={creating || updating}
                  className="w-full rounded-full bg-slate-900 text-white shadow-md hover:bg-slate-800"
                >
                  {isEditing ? "Save changes" : "Create blog"}
                </Button>

                {/* Independent publish/draft buttons (only when editing an existing blog) */}
                {isEditing &&
                  (resolvedBlog?.status === "published" ? (
                    <Button
                      icon={<UploadCloud size={16} />}
                      onClick={handleMoveToDraftOnly}
                      loading={drafting}
                      className="w-full rounded-full border border-slate-300/60 bg-white/70 text-slate-700 hover:border-slate-400 hover:bg-white"
                    >
                      Move back to draft
                    </Button>
                  ) : (
                    <Button
                      icon={<UploadCloud size={16} />}
                      onClick={handlePublishOnly}
                      loading={publishing}
                      className="w-full rounded-full border border-slate-300/60 bg-white/70 text-slate-700 hover:border-slate-400 hover:bg-white"
                    >
                      Publish now
                    </Button>
                  ))}
              </Space>
            </div>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default BlogComposerPage;
