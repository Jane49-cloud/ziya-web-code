import { apiSlice } from "../../redux/api";

export const docApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDocument: builder.mutation({
      query: (docData) => ({
        url: "/documents/create",
        method: "POST",
        body: docData,
      }),
    }),

    getSingleDocument: builder.query({
      query: (id: number | string) => ({
        url: `/documents/get/${id}`,
        method: "GET",
      }),
    }),

    getAllDocuments: builder.query({
      query: () => ({
        url: "/documents/all",
        method: "GET",
      }),
    }),

    updateDocument: builder.mutation({
      query: (updateData) => ({
        url: `/documents/update`, // ✔ FIXED — NO extra "}"
        method: "PUT",
        body: updateData,
      }),
    }),

    deleteDocument: builder.mutation({
      query: (id: number | string) => ({
        url: `/documents/delete/${id}`,
        method: "DELETE",
      }),
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
