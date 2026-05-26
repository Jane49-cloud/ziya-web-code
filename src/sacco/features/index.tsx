import { saccoSlice } from "./saccoSlice";

export const {
    useGetAllSaccosQuery,
    useLazyGetAllSaccosQuery,
    useCreateSaccoMutation,
} = saccoSlice;