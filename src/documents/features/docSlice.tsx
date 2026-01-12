import { apiSlice } from "../../redux/api";

const resolveDocumentId = (entry: Record<string, unknown> | undefined) => {
  if (!entry) return undefined;
  const candidates = [
    entry.ID,
    entry.id,
    entry.document_id,
    entry.slug,
  ];
  const found = candidates.find(
    (candidate) => typeof candidate === "string" || typeof candidate === "number"
  );
  return found !== undefined ? String(found) : undefined;
};

export const docApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDocument: builder.mutation({
      query: (docData) => ({
        url: "/documents/create",
        method: "POST",
        body: docData,
      }),
      invalidatesTags: [{ type: "Documents", id: "LIST" }],
    }),

    getSingleDocument: builder.query({
      query: (id: number | string) => ({
        url: `/documents/get/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id: number | string) => [
        { type: "Documents", id: String(id) },
      ],
    }),

    getAllDocuments: builder.query({
      query: () => ({
        url: "/documents/all",
        method: "GET",
      }),
      providesTags: (result) => {
        const collection = Array.isArray(result?.documents)
          ? result.documents
          : [];
        const tags = collection
          .map((entry: Record<string, unknown>, index: number) => {
            return resolveDocumentId(entry) ?? `DOCUMENT-${index}`;
          })
          .map((id: string) => ({ type: "Documents" as const, id }));
        return [...tags, { type: "Documents" as const, id: "LIST" }];
      },
    }),

    updateDocument: builder.mutation({
      query: (updateData) => ({
        url: `/documents/update`,
        method: "PUT",
        body: updateData,
      }),
      invalidatesTags: (_result, _error, body) => {
        const targetId = resolveDocumentId(body);
        return targetId
          ? [
              { type: "Documents", id: targetId },
              { type: "Documents", id: "LIST" },
            ]
          : [{ type: "Documents", id: "LIST" }];
      },
    }),

    deleteDocument: builder.mutation({
      query: (id: number | string) => ({
        url: `/documents/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, id: number | string) => [
        { type: "Documents", id: String(id) },
        { type: "Documents", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useCreateDocumentMutation,
  useGetSingleDocumentQuery,
  useGetAllDocumentsQuery,
  useUpdateDocumentMutation,
  useDeleteDocumentMutation,
} = docApi;
