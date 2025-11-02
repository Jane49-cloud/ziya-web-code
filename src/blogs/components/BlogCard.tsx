import React, { useMemo } from "react";
import { Card, Avatar, Button, Tag, Tooltip, Popconfirm } from "antd";
import { Clock, Eye, Edit3, Share2, Trash2 } from "lucide-react";
import type { BlogBase } from "../types";
import { BlogStatusBadge } from "./BlogStatusBadge";
import { BLOG_DEFAULT_COVER, tagPalette } from "../utils";

interface BlogCardProps {
  blog: BlogBase;
  onView?: (blog: BlogBase) => void;
  onEdit?: (blog: BlogBase) => void;
  onShare?: (blog: BlogBase) => void;
  onDelete?: (blog: BlogBase) => void;
  isDeleting?: boolean;
}

const pickTagColor = (index: number): string =>
  tagPalette[index % tagPalette.length];

export const BlogCard: React.FC<BlogCardProps> = ({
  blog,
  onEdit,
  onView,
  onShare,
  onDelete,
  isDeleting,
}) => {
  const handleView = () => onView?.(blog);
  const handleEdit = () => onEdit?.(blog);
  const handleShare = () => onShare?.(blog);
  const handleDelete = () => onDelete?.(blog);

  const initials = useMemo(
    () => blog.author?.name?.[0]?.toUpperCase() ?? blog.title[0]?.toUpperCase(),
    [blog.author?.name, blog.title]
  );

  const formattedDate = useMemo(() => {
    const d = blog.publishedAt
      ? new Date(blog.publishedAt)
      : blog.updatedAt
      ? new Date(blog.updatedAt)
      : null;
    return d
      ? d.toLocaleDateString(undefined, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "Recently curated";
  }, [blog.publishedAt, blog.updatedAt]);

  return (
    <Card
      hoverable
      className="
        group relative overflow-hidden rounded-3xl border border-slate-200/60
        bg-white/95 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.55)]
        transition-all duration-300
        hover:-translate-y-1 hover:shadow-[0_36px_90px_-48px_rgba(15,23,42,0.6)]
      "
      cover={
        <div className="relative overflow-hidden rounded-t-3xl bg-slate-900">
          {/* Dark cinematic cover */}
          <div className="relative h-48">
            <img
              src={blog.coverImage || BLOG_DEFAULT_COVER}
              alt={blog.title}
              className="
                h-full w-full object-cover opacity-90
                transition-transform duration-700
                group-hover:scale-[1.05]
              "
              loading="lazy"
              draggable={false}
            />
            {/* Dark gradient overlay for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent" />
            {/* Status + read time top overlay */}
            <div className="absolute left-4 top-4 flex items-center gap-2">
              <BlogStatusBadge status={blog.status} size="small" />
              {blog.readTimeMinutes ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  <Clock size={12} />
                  {blog.readTimeMinutes} min
                </span>
              ) : null}
            </div>
          </div>
        </div>
      }
      bodyStyle={{ padding: 16 }}
    >
      <div className="flex flex-col gap-4">
        {/* Title & Excerpt */}
        <div className="space-y-2">
          <h3
            className="line-clamp-2 text-lg font-semibold leading-snug tracking-tight text-slate-900"
            title={blog.title}
          >
            {blog.title}
          </h3>

          {blog.excerpt ? (
            <p
              className="text-sm leading-relaxed text-slate-600"
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 3,
                WebkitBoxOrient: "vertical" as const,
                overflow: "hidden",
              }}
            >
              {blog.excerpt}
            </p>
          ) : null}
        </div>

        {/* Tags */}
        {blog.tags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {blog.tags.map((tag, index) => (
              <Tag
                key={`${tag}-${index}`}
                color={pickTagColor(index)}
                className="rounded-full px-2.5 py-0.5 text-[11px]"
              >
                {tag}
              </Tag>
            ))}
          </div>
        ) : null}

        {/* Footer: author + actions */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-50/90 px-3 py-2">
          {/* Author */}
          <div className="flex min-w-0 items-center gap-2">
            {blog.author?.avatarUrl ? (
              <Avatar
                size={36}
                src={blog.author.avatarUrl}
                alt={blog.author.name}
              />
            ) : (
              <Avatar size={36} className="bg-slate-900 text-white">
                {initials}
              </Avatar>
            )}
            <div className="min-w-0 leading-tight">
              <p className="truncate text-sm font-semibold text-slate-700">
                {blog.author?.name ?? "Editorial"}
              </p>
              <p className="text-xs text-slate-500">{formattedDate}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1.5">
            {onDelete ? (
              <Popconfirm
                title="Delete this blog?"
                description="This action cannot be undone."
                okText="Delete"
                okType="danger"
                okButtonProps={{ loading: Boolean(isDeleting) }}
                onConfirm={handleDelete}
                disabled={Boolean(isDeleting)}
              >
                <Tooltip title="Delete">
                  <Button
                    aria-label="Delete blog"
                    type="text"
                    icon={<Trash2 size={16} />}
                    className="text-slate-400 hover:text-red-500"
                    loading={isDeleting}
                  />
                </Tooltip>
              </Popconfirm>
            ) : null}

            {onShare ? (
              <Tooltip title="Share">
                <Button
                  aria-label="Share blog"
                  type="text"
                  icon={<Share2 size={16} />}
                  onClick={handleShare}
                  className="text-slate-500 hover:text-slate-900"
                />
              </Tooltip>
            ) : null}

            {onEdit ? (
              <Tooltip title="Edit">
                <Button
                  aria-label="Edit blog"
                  type="text"
                  icon={<Edit3 size={16} />}
                  onClick={handleEdit}
                  className="text-slate-500 hover:text-slate-900"
                />
              </Tooltip>
            ) : null}

            {onView ? (
              <Tooltip title="Read">
                <Button
                  aria-label="Read blog"
                  type="primary"
                  icon={<Eye size={16} />}
                  onClick={handleView}
                  className="
                    rounded-full bg-slate-900 px-3 text-white shadow-sm
                    hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400
                  "
                >
                  Read
                </Button>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default BlogCard;
