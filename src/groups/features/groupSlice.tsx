import { apiSlice } from "../../redux/api";

export const GroupSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createGroup: builder.mutation({
      query: (groupData) => ({
        url: "/groups/create",
        method: "POST",
        body: groupData,
      }),
      invalidatesTags: [{ type: "Groups" }],
    }),

    getAllGroups: builder.query({
      query: () => ({
        url: "/groups/get/all",
        method: "GET",
      }),
      providesTags: [{ type: "Groups" }],
    }),

    getGroupById: builder.query({
      query: (id: number) => ({
        url: `/groups/get/single/detail/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Groups", id }],
    }),

    searchGroups: builder.query({
      query: ({ field, value }) => ({
        url: `/groups/search?field=${field}&value=${value}`,
        method: "GET",
      }),
      providesTags: [{ type: "Groups" }],
    }),

    updateGroup: builder.mutation({
      query: ({ id, updatedData }) => ({
        url: `/groups/update/${id}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Groups" },
        { type: "Groups", id },
      ],
    }),

    deleteGroup: builder.mutation({
      query: (id: number) => ({
        url: `/groups/delete/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Groups" }],
    }),

    changeRelationshipManager: builder.mutation({
      query: ({ id, managerId }) => ({
        url: `/groups/change/${id}/relationship-manager`,
        method: "PUT",
        body: { managerId },
      }),
      invalidatesTags: [{ type: "Groups" }],
    }),

    updateGroupMemberCount: builder.mutation({
      query: ({ id, increment }) => ({
        url: `/groups/update/count/${id}/member-count`,
        method: "PUT",
        body: { increment },
      }),
      invalidatesTags: [{ type: "Groups" }],
    }),

    getMyManagedGroups: builder.query({
      query: () => ({
        url: "/groups/get/my-managed",
        method: "GET",
      }),
      providesTags: [{ type: "Groups" }],
    }),

    // ✅ Get groups created by logged-in staff
    getMyCreatedGroups: builder.query({
      query: () => ({
        url: "/groups/get/my-created",
        method: "GET",
      }),
      providesTags: [{ type: "Groups" }],
    }),
  }),
});

// Export hooks in a separate file to enable Fast Refresh
