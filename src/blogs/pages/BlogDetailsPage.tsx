import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Button, Skeleton, Tag } from "antd";
import DOMPurify from "dompurify";
import { ArrowLeft, Edit3, Share2 } from "lucide-react";
import {
  useGetBlogByIdQuery,
  useGetAllBlogsQuery,
} from "../features/blogs/blogsApi";
import {
  BLOG_DEFAULT_COVER,
  extractSingleBlog,
  normalizeBlogs,
  tagPalette,
} from "../utils";
import { BlogStatusBadge } from "../components";

export const BlogDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: singleData,
    isLoading,
    error,
  } = useGetBlogByIdQuery(id!, {
    skip: !id,
  });

  const { data: collectionData } = useGetAllBlogsQuery(undefined, {
    skip: Boolean(isLoading || error || !id),
  });

  const blog = useMemo(() => {
    const extracted = extractSingleBlog(singleData, id ?? "target");
    if (extracted) return extracted;
    const fallbackCollection = normalizeBlogs(collectionData);
    return fallbackCollection.find((entry) => entry.id === id);
  }, [singleData, collectionData, id]);

  const sanitizedHtml = useMemo(() => {
    if (!blog) return "";
    return DOMPurify.sanitize(blog.content ?? "<p></p>");
  }, [blog]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton active paragraph={{ rows: 4 }} />
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <Alert
        type="error"
        message="We couldn't find that story"
        description="It may have been unpublished or removed."
        showIcon
        action={
          <Button onClick={() => navigate("/blogs")}>Back to blogs</Button>
        }
      />
    );
  }

  const shareUrl = `${window.location.origin}/blogs/${blog.slug ?? blog.id}`;
  const heroCover = blog.coverImage || blog.heroImage || BLOG_DEFAULT_COVER;

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (err) {
      console.warn("Share fallback", err);
    }
  };

  return (
    <article className="blog-detail space-y-8">
      <div className="flex items-center justify-between">
        <Button
          type="text"
          icon={<ArrowLeft size={18} />}
          onClick={() => navigate(-1)}
          className="text-slate-500 hover:text-slate-900"
        >
          Back
        </Button>
        <div className="flex items-center gap-2">
          <Button
            icon={<Share2 size={16} />}
            onClick={handleShare}
            className="rounded-full border border-slate-300/60 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900"
          >
            Share
          </Button>
          <Button
            type="primary"
            icon={<Edit3 size={16} />}
            onClick={() => navigate(`/blogs/${blog.id}/edit`)}
            className="rounded-full bg-slate-900 px-4 text-white hover:bg-slate-800"
          >
            Edit
          </Button>
        </div>
      </div>

      <header className="blog-detail__hero overflow-hidden rounded-[32px] border border-slate-200/40 bg-gradient-to-br from-[#0f172a] via-[#152038] to-[#1d2f4a] text-white shadow-[0_36px_120px_-60px_rgba(7,14,32,0.85)]">
        <div className="relative grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6 px-10 py-12">
            <BlogStatusBadge status={blog.status} />
            <h1 className="text-4xl font-semibold leading-tight tracking-tight lg:text-5xl">
              {blog.title}
            </h1>
            <p className="max-w-2xl text-base leading-relaxed text-white/80">
              {blog.excerpt}
            </p>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="flex flex-col">
                <span className="font-semibold text-white">
                  {blog.author?.name ?? "Editorial"}
                </span>
                <span>
                  {blog.publishedAt
                    ? new Date(blog.publishedAt).toLocaleString()
                    : blog.createdAt
                    ? new Date(blog.createdAt).toLocaleString()
                    : "Freshly published"}
                </span>
              </div>
              {blog.readTimeMinutes ? (
                <span>{blog.readTimeMinutes} min read</span>
              ) : null}
              <span>
                {blog.status === "published"
                  ? "Live for readers"
                  : blog.status === "draft"
                  ? "Draft workspace"
                  : "Archived reference"}
              </span>
            </div>
            {blog.tags.length ? (
              <div className="flex flex-wrap gap-2">
                {blog.tags.map((tag, index) => (
                  <Tag
                    key={tag}
                    color={tagPalette[index % tagPalette.length]}
                    className="rounded-full px-3 py-1"
                  >
                    {tag}
                  </Tag>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative hidden h-full overflow-hidden rounded-l-[32px] lg:block">
            <img
              src={heroCover}
              alt={blog.title}
              className="h-full w-full object-contain bg-slate-900/40 p-8"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/70 via-transparent to-transparent" />
          </div>
        </div>
      </header>

      <section
        className="blog-detail__body rounded-[32px] border border-slate-200/60 bg-white/95 p-8 shadow-[0_26px_90px_-60px_rgba(15,23,42,0.5)]"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </article>
  );
};

export default BlogDetailsPage;
