/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiSlice } from "../../redux/api";
import { userLoggedIn, userLoggedOut, userRegistration } from "./authSlice";

type RegistrationResponse = {
  message: string;
  Data: string;
};

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Register endpoint
    register: builder.mutation<RegistrationResponse, any>({
      query: (data) => ({
        url: "/staff/register",
        method: "POST",
        body: data,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          console.log("register res ", result);
          dispatch(
            userRegistration({
              token: result.data.Data,
            })
          );
        } catch (error: unknown) {
          console.log(error);
        }
      },
    }),

    // Activation endpoint
    activation: builder.mutation({
      query: ({ activation_token, activation_code }) => ({
        url: "/",
        method: "POST",
        body: {
          activation_token,
          activation_code,
        },
      }),
    }),
    // Login endpoint
    login: builder.mutation({
      query: (values) => ({
        url: "/staff/login",
        method: "POST",
        body: values,
      }),
      async onQueryStarted(_arg, { queryFulfilled, dispatch }) {
        try {
          const result = await queryFulfilled;
          //  Set access and refresh tokens
          dispatch(
            userLoggedIn({
              accessToken: result.data.accessToken,
              refreshToken: result.data.refreshToken,
              user: result.data.user,
            })
          );
        } catch (error: unknown) {
          console.log(error);
        }
      },
    }),

    logOut: builder.query({
      query: () => ({
        url: "",
        method: "GET",
      }),
      async onQueryStarted(_arg, { dispatch }) {
        try {
          dispatch(userLoggedOut());
        } catch (error: unknown) {
          console.log(error);
        }
      },
    }),
  }),
});

export const {
  useRegisterMutation,
  useActivationMutation,
  useLoginMutation,
  useLogOutQuery,
} = authApi;
