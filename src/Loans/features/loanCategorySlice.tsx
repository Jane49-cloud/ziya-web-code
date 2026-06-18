import { apiSlice } from "../../redux/api";

type PaginationQuery = {
    page?: number;
    page_size?: number;
};

type CreateLoanCategoryPayload = {
    name: string;
};

type UpdateLoanCategoryPayload = {
    id: string | number;
    name: string;
};

type CreateLoanSubcategoryPayload = {
    name: string;
    parent_category: string | number;
};

type UpdateLoanSubcategoryPayload = {
    id: string | number;
    name: string;
};

export const loanCategoriesSlice =
    apiSlice.injectEndpoints({
        endpoints: (builder) => ({
            // Get loan categories with pagination
            getLoanCategories: builder.query<
                any,
                PaginationQuery | void
            >({
                query: (params) => ({
                    url: "/group-loans/categories",
                    method: "GET",
                    params: {
                        page: params?.page ?? 1,
                        page_size: params?.page_size ?? 20,
                    },
                }),
                providesTags: [
                    {
                        type: "LoanCategories",
                        id: "LIST",
                    },
                ],
            }),

            // Get one category and its subcategories
            getSingleLoanCategory: builder.query<
                any,
                string | number
            >({
                query: (id) => ({
                    url: `/group-loans/categories/${id}`,
                    method: "GET",
                }),
                providesTags: (_result, _error, id) => [
                    {
                        type: "LoanCategories",
                        id,
                    },
                ],
            }),

            // Create a category
            createLoanCategory: builder.mutation<
                any,
                CreateLoanCategoryPayload
            >({
                query: (body) => ({
                    url: "/group-loans/categories/create",
                    method: "POST",
                    body,
                }),
                invalidatesTags: [
                    {
                        type: "LoanCategories",
                        id: "LIST",
                    },
                ],
            }),

            // Update a category
            updateLoanCategory: builder.mutation<
                any,
                UpdateLoanCategoryPayload
            >({
                query: ({ id, ...body }) => ({
                    url: `/group-loans/categories/${id}`,
                    method: "PUT",
                    body,
                }),
                invalidatesTags: (_result, _error, { id }) => [
                    {
                        type: "LoanCategories",
                        id,
                    },
                    {
                        type: "LoanCategories",
                        id: "LIST",
                    },
                ],
            }),

            // Create a subcategory
            createLoanSubcategory: builder.mutation<
                any,
                CreateLoanSubcategoryPayload
            >({
                query: (body) => ({
                    url: "/group-loans/subcategories/create",
                    method: "POST",
                    body,
                }),
                invalidatesTags: (
                    _result,
                    _error,
                    { parent_category }
                ) => [
                        {
                            type: "LoanCategories",
                            id: parent_category,
                        },
                        {
                            type: "LoanCategories",
                            id: "LIST",
                        },
                    ],
            }),

            // Update a subcategory
            updateLoanSubcategory: builder.mutation<
                any,
                UpdateLoanSubcategoryPayload
            >({
                query: ({ id, ...body }) => ({
                    url: `/group-loans/subcategories/${id}`,
                    method: "PUT",
                    body,
                }),
                invalidatesTags: [
                    {
                        type: "LoanCategories",
                        id: "LIST",
                    },
                ],
            }),
        }),
    });

export const {
    useGetLoanCategoriesQuery,
    useLazyGetLoanCategoriesQuery,

    useGetSingleLoanCategoryQuery,
    useLazyGetSingleLoanCategoryQuery,

    useCreateLoanCategoryMutation,
    useUpdateLoanCategoryMutation,
    useCreateLoanSubcategoryMutation,
    useUpdateLoanSubcategoryMutation,
} = loanCategoriesSlice;