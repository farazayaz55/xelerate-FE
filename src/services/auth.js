// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";

export const signinApi = createApi({
  reducerPath: "signinApi",
  baseQuery: fetchBaseQuery({ baseUrl: keys.baseUrl }),
  endpoints: (builder) => ({
    signin: builder.mutation({
      query: (body) => ({
        url: "signin",
        method: "POST",
        body: body,
        withCredentials: true,
        credentials: "include",
      }),
      transformResponse: (response) => {
        if (response.success) {
          if (response.payload[0].twoFactorAuthVerification === "Verified") {
            window.localStorage.setItem("token", response.payload[0].token);
            window.localStorage.setItem("user", response.payload[0].userId);
          }
        }
        return response;
      },
    }),
    forgotPassword: builder.mutation({
      query: (body) => ({
        url: "forgotPassword",
        method: "POST",
        body: body,
      }),
    }),
    resetPassword: builder.mutation({
      query: ({ body, token }) => ({
        url: `resetPassword/${token}`,
        method: "POST",
        body: body,
      }),
    }),
    logout: builder.query({
      query: () => ({
        url: "/logout",
        method: "GET",
        withCredentials: true,
        credentials: "include",
      }),
    }),
    validateToken: builder.query({
      query: (token) => ({
        url: "validateToken/" + token,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
  }),
});
// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useSigninMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useValidateTokenQuery,
  useLazyLogoutQuery,
} = signinApi;
