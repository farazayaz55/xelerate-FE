// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints


export const supportApi = createApi({
  reducerPath: "supportApi",
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    createSupportTicket: builder.mutation({
      query: ({token, formData}) => ({
        url: "support",
        method: "POST",
        body: formData,
        headers: {
            // "Content-Type": "application/json",
            "x-access-token": token,
        },
      }),
    }),
  }),
});
export const { useCreateSupportTicketMutation } = supportApi;
