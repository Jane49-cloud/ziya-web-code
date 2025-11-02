import React from "react";
import { Card, Avatar, Button, Tag, Tooltip } from "antd";
import { Clock, Eye, Edit3, Share2 } from "lucide-react";
import type { BlogBase } from "../types";
import { BlogStatusBadge } from "./BlogStatusBadge";
import { BLOG_DEFAULT_COVER, tagPalette } from "../utils";

interface BlogCardProps {
  blog: BlogBase;
  onView?: (blog: BlogBase) => void;
  onEdit?: (blog: BlogBase) => void;
  onShare?: (blog: BlogBase) => void;
}

const pickTagColor = (index: number): string => tagPalette[index % tagPalette.length];

export const BlogCard: React.FC<BlogCardProps> = ({ blog, onEdit, onView, onShare }) => {
  const handleView = () => {
    if (onView) onView(blog);
  };

  const handleEdit = () => {
    if (onEdit) onEdit(blog);
  };

  const handleShare = () => {
    if (onShare) onShare(blog);
  };

  return (
    <Card
      hoverable
      className="blog-card relative overflow-hidden rounded-3xl border border-slate-200/50 bg-white/95 shadow-[0_28px_70px_-48px_rgba(15,23,42,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_36px_90px_-48px_rgba(15,23,42,0.6)]"
      cover={
        <div className="relative h-48 overflow-hidden rounded-t-3xl bg-slate-900">
          <img
            src={blog.coverImage || BLOG_DEFAULT_COVER}
            alt={blog.title}
            className="h-full w-full object-contain p-6 opacity-90 transition-transform duration-700 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent" />
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <BlogStatusBadge status={blog.status} size="small" />
          {blog.readTimeMinutes ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500">
              <Clock size={14} />
              {blog.readTimeMinutes} min read
            </span>
          ) : null}
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold tracking-tight text-slate-900">
            {blog.title}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-600">
            {blog.excerpt}
          </p>
        </div>

        {blog.tags.length ? (
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <Tag key={tag} color={pickTagColor(index)} className="rounded-full px-3 py-1 text-xs">
                {tag}
              </Tag>
            ))}
          </div>
        ) : null}

        <div className="flex items-center justify-between rounded-2xl bg-slate-50/90 px-3 py-2">
          <div className="flex items-center gap-2">
            {blog.author?.avatarUrl ? (
              <Avatar size={36} src={blog.author.avatarUrl} alt={blog.author.name} />
            ) : (
              <Avatar size={36} className="bg-slate-900 text-white">
                {blog.author?.name?.[0]?.toUpperCase() ?? blog.title[0].toUpperCase()}
              </Avatar>
            )}
            <div className="leading-tight">
              <p className="text-sm font-semibold text-slate-700">
                {blog.author?.name ?? "Editorial"}
              </p>
              <p className="text-xs text-slate-500">
                {blog.publishedAt
                  ? new Date(blog.publishedAt).toLocaleDateString()
                  : blog.updatedAt
                  ? new Date(blog.updatedAt).toLocaleDateString()
                  : "Recently curated"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onShare ? (
              <Tooltip title="Share">
                <Button
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
                  type="primary"
                  icon={<Eye size={16} />}
                  onClick={handleView}
                  className="rounded-full bg-slate-900 px-3 text-white shadow-sm hover:bg-slate-700"
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
