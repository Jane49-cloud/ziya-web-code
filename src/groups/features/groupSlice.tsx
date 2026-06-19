import { apiSlice } from "../../redux/api";

type GroupPaginationArgs = {
  page?: number;
  page_size?: number;
};

// type GroupsResponse = {
//   data?: any[];
//   groups?: any[];
//   page?: number;
//   page_size?: number;
//   message?: string;
// };

type GroupsResponse = {
  data?: any[] | {
    groups?: any[];
    data?: any[];
    results?: any[];
    rows?: any[];
  };
  groups?: any[];
  results?: any[];
  rows?: any[];
  page?: number;
  page_size?: number;
  total?: number;
  count?: number;
  message?: string;
};

type GroupLoansQuery =
  | number
  | {
    groupId: number;
    page?: number;
    page_size?: number;
  };

  type GetGroupAssetsPayload = {
    groupId: string | number;
};

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


    getAllGroups: builder.query<GroupsResponse, GroupPaginationArgs | void>({
      query: (args) => {
        const { page = 1, page_size = 20 } = args ?? {};

        return {
          url: "/groups/get/all",
          method: "GET",
          params: {
            page,
            page_size,
          },
        };
      },
      providesTags: [{ type: "Groups" }],
    }),


    getGroupById: builder.query({
      query: (id: number) => ({
        url: `/groups/get/single/detail/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Groups", id }],
    }),

    // searchGroups: builder.query({
    //   query: ({ field, value }) => ({
    //     url: `/groups/search?field=${field}&value=${value}`,
    //     method: "GET",
    //   }),
    //   providesTags: [{ type: "Groups" }],
    // }),

    // search groups
    searchGroups: builder.query<any[], { q: string }>({
      query: ({ q }) => ({
        url: "/groups/search",
        method: "GET",
        params: {
          q: q.trim() || "all",
        },
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;

        const rows =
          response?.groups ??
          response?.data ??
          response?.results ??
          [];

        return Array.isArray(rows) ? rows : [];
      },
      providesTags: [{ type: "Groups", id: "SEARCH" }],
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




    getGroupMembers: builder.query<any, GroupLoansQuery>({
      query: (arg) => {
        const groupId = typeof arg === "number" ? arg : arg.groupId;

        return {
          url: `/groups/members/${groupId}`,
          method: "GET",
          params:
            typeof arg === "number"
              ? undefined
              : {
                page: arg.page ?? 1,
                page_size: arg.page_size ?? 20,
              },
        };
      },
      providesTags: (_result, _error, arg) => {
        const groupId = typeof arg === "number" ? arg : arg.groupId;

        return [{ type: "GroupMembers", id: groupId }];
      },
    }),

    // search grp members 
    searchGroupMembers: builder.query<
      any[],
      { groupId: string | number; q: string }
    >({
      query: ({ groupId, q }) => ({
        url: `/groups/members/${groupId}/search`,
        method: "GET",
        params: {
          q: q.trim() || "all",
        },
      }),
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;

        const rows =
          response?.members ??
          response?.data?.members ??
          response?.data ??
          response?.results ??
          [];

        return Array.isArray(rows) ? rows : [];
      },
      providesTags: (_result, _error, arg) => [
        { type: "GroupMembers", id: `SEARCH-${arg.groupId}` },
      ],
    }),


    getMyCreatedGroups: builder.query<GroupsResponse, GroupPaginationArgs | void>({
      query: (args) => {
        const { page = 1, page_size = 20 } = args ?? {};

        return {
          url: "/groups/get/my-created",
          method: "GET",
          params: {
            page,
            page_size,
          },
        };
      },
      providesTags: [{ type: "Groups" }],
    }),

    getMyManagedGroups: builder.query<GroupsResponse, GroupPaginationArgs | void>({
      query: (args) => {
        const { page = 1, page_size = 20 } = args ?? {};

        return {
          url: "/groups/get/my-managed",
          method: "GET",
          params: {
            page,
            page_size,
          },
        };
      },
      providesTags: [{ type: "Groups" }],
    }),



    // getMyCreatedGroups: builder.query({
    //   query: () => ({
    //     url: "/groups/get/my-created",
    //     method: "GET",
    //   }),
    //   providesTags: [{ type: "Groups" }],
    // }),

    // getMyManagedGroups: builder.query({
    //   query: () => ({
    //     url: "/groups/get/my-managed",
    //     method: "GET",
    //   }),
    //   providesTags: [{ type: "Groups" }],
    // }),

    getGroupWallet: builder.query({
      query: (id: number) => ({
        url: `/group-wallets/group/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Groups", id }],
    }),

    getGroupPayments: builder.query<any, GroupLoansQuery>({
      query: (arg) => {
        const groupId = typeof arg === "number" ? arg : arg.groupId;

        return {
          url: `/group-loan-payments/group/${groupId}`,
          method: "GET",
          params:
            typeof arg === "number"
              ? undefined
              : {
                page: arg.page ?? 1,
                page_size: arg.page_size ?? 20,
              },
        };
      },
      providesTags: (_res, _err, arg) => {
        const groupId = typeof arg === "number" ? arg : arg.groupId;

        return [{ type: "GroupLoanPayments", id: groupId }];
      },
    }),

    getGroupLoans: builder.query<any, GroupLoansQuery>({
      query: (arg) => {
        const groupId = typeof arg === "number" ? arg : arg.groupId;

        return {
          url: `/group-loans/group/${groupId}`,
          method: "GET",
          params:
            typeof arg === "number"
              ? undefined
              : {
                page: arg.page ?? 1,
                page_size: arg.page_size ?? 20,
              },
        };
      },
      providesTags: (_res, _err, arg) => {
        const groupId = typeof arg === "number" ? arg : arg.groupId;

        return [{ type: "GroupLoans", id: groupId }];

      },
    }),

    getAllGroupWallets: builder.query({
      query: () => ({
        url: `/group-wallets/all`,
        method: "GET",
      }),
      providesTags: [{ type: "Groups" }],
    }),

    updateGroupWalleti: builder.mutation({
      query: ({
        id,
        amount,
        op,
      }: {
        id: number;
        amount: number;
        op: "inc" | "dec";
      }) => ({
        url: `/groups/wallet/${id}?op=${op}`,
        method: "PUT",
        body: { amount },
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

    getGroupAdminActivity: builder.query({
      query: (groupId: number) => ({
        url: `/groups/admin/activity/${groupId}`,
        method: "GET",
      }),
      providesTags: (_res, _err, groupId) => [{ type: "Groups", id: groupId }],
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
        date_paid?: string;
      }) => ({
        url: "/group-loan-payments/create",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: (_res, _err, payload) => [
        { type: "GroupLoanPayments", id: payload.group_id },
        { type: "GroupLoans", id: payload.group_id },
      ],
    }),

    updateGroupLoanPayment: builder.mutation({
      query: ({
        paymentId,
        updatedData,
      }: {
        paymentId: number;
        updatedData: {
          amount: number;
          cycle: number;
          approved_by: number | null;
          date_paid?: string;
        };
      }) => ({
        url: `/group-loan-payments/${paymentId}`,
        method: "PUT",
        body: updatedData,
      }),
      invalidatesTags: [{ type: "GroupLoanPayments" }, { type: "GroupLoans" }],
    }),

    deleteGroupLoanPayment: builder.mutation({
      query: (paymentId: number) => ({
        url: `/group-loan-payments/${paymentId}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "GroupLoanPayments" }, { type: "GroupLoans" }],
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

    //search
    // search group loan payments
    searchGroupLoanPayments: builder.query<
      any[],
      { groupId: string | number; q: string }
    >({
      query: ({ groupId, q }) => ({
        url: "/group-loan-payments/search",
        method: "GET",
        params: {
          q: q || "all",
          g: groupId,
        },
      }),
      transformResponse: (response: any) => response?.payments ?? [],

      providesTags: (_result, _error, arg) => [
        { type: "GroupLoanPayments", id: `SEARCH-${arg.groupId}` },
      ],
    }),

    //single group partner
    getGroupAssets: builder.query< any, GetGroupAssetsPayload >({
        query: ({ groupId }) => ({
            url: `/company-wallets/assets/group/${groupId}`,
            method: "GET",
        }),
        providesTags: (
            _result,
            _error,
            { groupId },
        ) => [
            {
                type: "LoanAssets",
                id: `GROUP-${groupId}`,
            },
        ],
    }),


  }),
});
