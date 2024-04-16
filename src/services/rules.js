// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const rulesApi = createApi({
  reducerPath: "rulesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Rule"],
  endpoints: (builder) => ({
    getRules: builder.query({
      query: ({ token, id }) => ({
        url: "rules/" + id,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Rule"],
    }),
    createRule: builder.mutation({
      query: ({ token, body }) => ({
        url: "rules/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Rule"],
    }),
    editRule: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "rules/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Rule"],
    }),
    deleteRule: builder.mutation({
      query: ({ token, id }) => ({
        url: "rules/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Rule"],
    }),
  }),
});
export const {
  useGetRulesQuery,
  useCreateRuleMutation,
  useEditRuleMutation,
  useDeleteRuleMutation,
} = rulesApi;
