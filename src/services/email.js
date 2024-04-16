// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

export const emailApi = createApi({
  reducerPath: "emailApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    email: builder.mutation({
      query: ({ token, body }) => ({
        url: "email/",
        method: "POST",
        headers: {
          "x-access-token": token,
        },
        body,
      }),
    }),
  }),
});
export const { useEmailMutation } = emailApi;
