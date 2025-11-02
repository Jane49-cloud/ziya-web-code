import React, { useMemo, useState } from "react";
import { Alert, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import { useGetAllBlogsQuery } from "../features/blogs/blogsApi";
import type { BlogBase } from "../types";
import { normalizeBlogs, summarizeBlogs } from "../utils";
import {
  BlogCard,
  BlogEmptyState,
  BlogFilters,
  BlogHero,
  BlogSkeleton,
} from "../components";

export const BlogsListPage: React.FC = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState<"all" | BlogBase["status"]>("all");
  const [search, setSearch] = useState("");

  const { data, isLoading, isFetching, error } = useGetAllBlogsQuery();

  const blogs = useMemo(() => normalizeBlogs(data), [data]);
  const summary = useMemo(() => summarizeBlogs(blogs), [blogs]);

  const filteredBlogs = useMemo(() => {
    return blogs.filter((blog) => {
      const matchesStatus = status === "all" ? true : blog.status === status;
      const needle = search.trim().toLowerCase();
      if (!needle) return matchesStatus;
      const haystack = [
        blog.title,
        blog.excerpt,
        blog.author?.name,
        blog.tags.join(" "),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return matchesStatus && haystack.includes(needle);
    });
  }, [blogs, search, status]);

  const handleCreate = () => navigate("/blogs/create");
  const handleView = (blog: BlogBase) => navigate(`/blogs/${blog.id}`);
  const handleEdit = (blog: BlogBase) => navigate(`/blogs/${blog.id}/edit`);

  const handleShare = async (blog: BlogBase) => {
    const url = `${window.location.origin}/blogs/${blog.slug ?? blog.id}`;
    try {
      await navigator.clipboard.writeText(url);
      message.success("Blog link copied to clipboard");
    } catch (err) {
      console.warn("Clipboard copy failed", err);
      message.info(`Share this link: ${url}`);
    }
  };

  const showEmpty = !isLoading && !isFetching && filteredBlogs.length === 0;

  return (
    <div className="space-y-8">
      <BlogHero summary={summary} onCreate={handleCreate} />

      <BlogFilters
        status={status}
        onStatusChange={setStatus}
        search={search}
        onSearchChange={setSearch}
      />

      {error ? (
        <Alert
          type="error"
          message="Unable to load blogs"
          description="Please refresh or try again shortly."
          showIcon
        />
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <BlogSkeleton key={index} />
          ))}
        </div>
      ) : null}

      {isFetching && !isLoading ? <Spin className="block" /> : null}

      {showEmpty ? <BlogEmptyState onCreate={handleCreate} /> : null}

      {!isLoading && filteredBlogs.length ? (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredBlogs.map((blog) => (
            <BlogCard
              key={blog.id}
              blog={blog}
              onView={handleView}
              onEdit={handleEdit}
              onShare={handleShare}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default BlogsListPage;
