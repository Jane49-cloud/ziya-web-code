import React, { useMemo, useState } from "react";
import { Alert, message, Spin } from "antd";
import { useNavigate } from "react-router-dom";
import {
  useGetAllBlogsQuery,
  useGetDraftBlogsQuery,
  useDeleteBlogMutation,
} from "../features/blogs/blogsApi";
import type { BlogBase } from "../types";
import { normalizeBlogs } from "../utils";
import { getUser } from "../../utils";
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
  const currentUser = useMemo(() => getUser(), []);
  const currentUserId = currentUser?.id ? String(currentUser.id) : undefined;
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    data: publishedData,
    isLoading: loadingPublished,
    isFetching: fetchingPublished,
    error,
    refetch: refetchPublished,
  } = useGetAllBlogsQuery();

  const {
    data: draftsData,
    isLoading: loadingDrafts,
    isFetching: fetchingDrafts,
    refetch: refetchDrafts,
  } = useGetDraftBlogsQuery(undefined, {
    skip: !currentUserId,
  });

  const [deleteBlog] = useDeleteBlogMutation();

  const publishedBlogs = useMemo(() => normalizeBlogs(publishedData), [publishedData]);

  const draftBlogs = useMemo(() => normalizeBlogs(draftsData), [draftsData]);

  const blogs = useMemo(() => {
    if (!draftBlogs.length) return publishedBlogs;
    const merged = new Map<string, BlogBase>();
    publishedBlogs.forEach((blog) => {
      merged.set(blog.id, blog);
    });
    draftBlogs.forEach((blog) => {
      merged.set(blog.id, blog);
    });
    return Array.from(merged.values());
  }, [draftBlogs, publishedBlogs]);

  const summary = useMemo(
    () => ({
      total: publishedBlogs.length + draftBlogs.length,
      published: publishedBlogs.length,
      drafts: draftBlogs.length,
    }),
    [publishedBlogs.length, draftBlogs.length]
  );

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

  const handleDelete = async (blog: BlogBase) => {
    try {
      setDeletingId(blog.id);
      await deleteBlog(blog.id).unwrap();
      message.success("Blog deleted.");
      await refetchPublished();
      if (currentUserId) {
        await refetchDrafts();
      }
    } catch (err) {
      console.error("Delete blog failed", err);
      message.error("Unable to delete this blog right now.");
    } finally {
      setDeletingId(null);
    }
  };

  const isLoading = loadingPublished || (loadingDrafts && Boolean(currentUserId));
  const isFetching = fetchingPublished || fetchingDrafts;
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
              onDelete={handleDelete}
              isDeleting={deletingId === blog.id}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

export default BlogsListPage;
