import { apiSlice } from "../../../redux/api";
import type { BlogCollectionResponse, BlogPayload } from "../../types";

type Identifier = string | number;

const resolveId = (blog: Record<string, unknown>): string | undefined => {
  const candidate =
    (blog.id as Identifier | undefined) ??
    (blog.blog_id as Identifier | undefined) ??
    (blog._id as Identifier | undefined) ??
    (blog.uuid as Identifier | undefined) ??
    (blog.slug as Identifier | undefined);
  return candidate !== undefined ? String(candidate) : undefined;
};

const extractCollection = (payload: unknown): unknown[] => {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (typeof payload === "object") {
    const record = payload as Record<string, unknown>;
    const keys = ["data", "blogs", "items", "results", "records", "list"];
    for (const key of keys) {
      const candidate = record[key];
      if (Array.isArray(candidate)) return candidate;
    }
  }
  return [];
};

export const blogsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAllBlogs: builder.query<BlogCollectionResponse, void>({
      query: () => ({
        url: "/blogs/all",
        method: "GET",
      }),
      providesTags: (result) => {
        const rawList = extractCollection(result);
        const tags = rawList
          .map((entry) => resolveId((entry as Record<string, unknown>) ?? {}))
          .filter((id): id is string => Boolean(id))
          .map((id) => ({ type: "Blogs" as const, id }));
        return [...tags, { type: "Blogs" as const, id: "LIST" }];
      },
    }),
    getDraftBlogs: builder.query<BlogCollectionResponse, void>({
      query: () => ({
        url: "/blogs/drafts",
        method: "GET",
      }),
      providesTags: () => [{ type: "Blogs", id: "LIST" }],
    }),
    getBlogById: builder.query<unknown, string | number>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [
        { type: "Blogs", id: String(id) },
      ],
    }),
    createBlog: builder.mutation<unknown, BlogPayload>({
      query: (newBlog) => ({
        url: "/blogs/create",
        method: "POST",
        body: newBlog,
      }),
      invalidatesTags: [{ type: "Blogs", id: "LIST" }],
    }),
    updateBlog: builder.mutation<
      unknown,
      { id: string | number } & Partial<BlogPayload>
    >({
      query: ({ id, ...blogData }) => ({
        url: `/blogs/update/${id}`,
        method: "PUT",
        body: blogData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Blogs", id: String(id) },
        { type: "Blogs", id: "LIST" },
      ],
    }),
    publishBlog: builder.mutation<unknown, string | number>({
      query: (id) => ({
        url: `/blogs/${id}/publish`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Blogs", id: String(id) },
        { type: "Blogs", id: "LIST" },
      ],
    }),
    markBlogDraft: builder.mutation<unknown, string | number>({
      query: (id) => ({
        url: `/blogs/draft/${id}`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Blogs", id: String(id) },
        { type: "Blogs", id: "LIST" },
      ],
    }),
    deleteBlog: builder.mutation<unknown, string | number>({
      query: (id) => ({
        url: `/blogs/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Blogs", id: String(id) },
        { type: "Blogs", id: "LIST" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetAllBlogsQuery,
  useGetDraftBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  usePublishBlogMutation,
  useMarkBlogDraftMutation,
  useDeleteBlogMutation,
} = blogsApi;
