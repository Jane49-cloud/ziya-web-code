import { apiSlice } from "../../redux/api";

type PaginationQuery = {
  page?: number;
  page_size?: number;
};

type MoveAssetToPartnerPayload = {
  asset_id: string | number;
  partner_id: string | number;
};

type ConfirmMoveAssetToPartnerPayload = {
  transaction_id: string;
  token: string;
  partner_id: string | number;
};

type MoveAssetToGroupPayload = {
  asset_id: string | number;
  group_id: string | number;
};

type ConfirmMoveAssetToGroupPayload = {
  transaction_id: string;
  token: string;
  group_id: string | number;
};

export const companyAssetSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCompanyAssets: builder.query<any, PaginationQuery | void>({
      query: (params) => ({
        url: "/company-wallets/assets/all",
        method: "GET",
        params: {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 10,
        },
      }),
      providesTags: [
        {
          type: "CompanyAssets",
          id: "LIST",
        },
      ],
    }),

    initiateMoveAssetToPartner: builder.mutation<any, MoveAssetToPartnerPayload>({
      query: (body) => ({
        url: "/company-wallets/assets/move-to-partner",
        method: "POST",
        body,
      }),
    }),

    confirmMoveAssetToPartner: builder.mutation<any, ConfirmMoveAssetToPartnerPayload>({
      query: ({ transaction_id, token }) => ({
        url: "/company-wallets/assets/confirm/move-to-partner",
        method: "POST",
        body: {
          transaction_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: (_result, _error, { partner_id }) => [
        {
          type: "CompanyAssets",
          id: "LIST",
        },
        {
          type: "LoanAssets",
          id: `PARTNER-${partner_id}`,
        },
      ],
    }),

    //asset to group

    initiateMoveAssetToGroup: builder.mutation<any, MoveAssetToGroupPayload>({
      query: (body) => ({
        url: "/company-wallets/assets/move-to-group",
        method: "POST",
        body,
      }),
    }),

    confirmMoveAssetToGroup: builder.mutation<any, ConfirmMoveAssetToGroupPayload>({
      query: ({ transaction_id, token }) => ({
        url: "/company-wallets/assets/confirm/move-to-group",
        method: "POST",
        body: {
          transaction_id,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
      invalidatesTags: (_result, _error, { group_id }) => [
        {
          type: "CompanyAssets",
          id: "LIST",
        },
        {
          type: "LoanAssets",
          id: `GROUP-${group_id}`,
        },
      ],
    }),


  }),
});

export const {
  useGetCompanyAssetsQuery,
  useLazyGetCompanyAssetsQuery,

  useInitiateMoveAssetToPartnerMutation,
  useConfirmMoveAssetToPartnerMutation,

  useInitiateMoveAssetToGroupMutation,
  useConfirmMoveAssetToGroupMutation,
} = companyAssetSlice;