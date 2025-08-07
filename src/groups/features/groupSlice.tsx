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

    getGroupMembers: builder.query({
      query: (groupId: number) => ({
        url: `/groups/members/${groupId}`,
        method: "GET",
      }),
      providesTags: (_result, _error, groupId) => [
        { type: "Groups", id: groupId },
      ],
    }),

    getMyCreatedGroups: builder.query({
      query: () => ({
        url: "/groups/get/my-created",
        method: "GET",
      }),
      providesTags: [{ type: "Groups" }],
    }),
    getGroupWallet: builder.query({
      query: (id: number) => ({
        url: `/groups/wallet/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Groups", id }],
    }),

    getGroupPayments: builder.query({
      query: (groupId: number) => ({
        url: `/group-loan-payments/group/${groupId}`,
        method: "GET",
      }),
      // providesTags: (_res, _err, groupId) => [
      //   { type: "GroupLoanPayments", id: groupId },
      // ],
    }),
    getGroupLoans: builder.query({
      query: (groupId: number) => ({
        url: `/group-loans/group/${groupId}`,
        method: "GET",
      }),
      // providesTags: (_res, _err, groupId) => [
      //   { type: "GroupLoans", id: groupId },
      // ],
    }),

    getAllGroupWallets: builder.query({
      query: () => ({
        url: `/groups/wallet/all`,
        method: "GET",
      }),
      providesTags: [{ type: "Groups" }],
    }),

    updateGroupWallet: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/groups/wallet/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [{ type: "Groups", id }],
    }),
    getAllGroupActivities: builder.query({
      query: () => "/group-activities/all",
    }),
    getGroupActivitiesByUser: builder.query({
      query: (userId) => `/group-activities/user/${userId}`,
    }),
    getGroupActivitiesByGroup: builder.query({
      query: (groupId) => `/group-activities/group/${groupId}`,
    }),

    // group loans
    createGroupLoan: builder.mutation({
      query: (loanData) => ({
        url: `/group-loans/create`,
        method: "POST",
        body: loanData,
      }),
      invalidatesTags: [{ type: "GroupLoans" }],
    }),

    updateGroupLoan: builder.mutation({
      query: ({ loanId, updatedData }) => ({
        url: `/group-loans/${loanId}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: [{ type: "GroupLoans" }],
    }),

    deleteGroupLoan: builder.mutation({
      query: (loanId: number) => ({
        url: `/group-loans/${loanId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "GroupLoans" }],
    }),

    // group payments

    createGroupLoanPayment: builder.mutation({
      query: (payload: {
        group_id: number;
        loan_id: number;
        amount: number;
        customer_id: number;
        cycle: number;
        approved_by?: number | null;
      }) => ({
        url: "/group-loan-payments/create",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: [{ type: "GroupLoanPayments" }],
    }),

    updateGroupLoanPayment: builder.mutation({
      query: ({
        paymentId,
        updatedData,
      }: {
        paymentId: number;
        updatedData: {
          group_id: number;
          loan_id: number;
          amount: number;
          customer_id: number;
          cycle: number;
        };
      }) => ({
        url: `/group-loan-payments/${paymentId}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: [{ type: "GroupLoanPayments" }],
    }),

    deleteGroupLoanPayment: builder.mutation({
      query: (paymentId: number) => ({
        url: `/group-loan-payments/${paymentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "GroupLoanPayments" }],
    }),
    // group members
    addGroupMember: builder.mutation({
      query: ({ groupId, memberData }) => ({
        url: `/groups/members/${groupId}/add`,
        method: "POST",
        body: memberData,
      }),
      invalidatesTags: (_res, _err, { groupId }) => [
        { type: "GroupMembers", id: groupId },
      ],
    }),

    removeGroupMember: builder.mutation({
      query: ({ groupId, memberId }) => ({
        url: `/groups/members/${groupId}/${memberId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { groupId }) => [
        { type: "GroupMembers", id: groupId },
      ],
    }),
  }),
});
