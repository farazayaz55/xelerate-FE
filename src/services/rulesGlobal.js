// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const globalRulesApi = createApi({
  reducerPath: "globalRulesApi",
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  //   tagTypes: ["GlobalRule"],
  endpoints: (builder) => ({
    getRulesGlobal: builder.query({
      query: ({ token, params }) => ({
        url: "rules/global/" + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      //   providesTags: ["GlobalRule"],
    }),
    createRuleGlobal: builder.mutation({
      query: ({ token, body }) => ({
        url: "rules/global/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      //   invalidatesTags: ["GlobalRule"],
    }),
    editRuleGlobal: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "rules/global/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      //   invalidatesTags: ["GlobalRule"],
    }),
    deleteRuleGlobal: builder.mutation({
      query: ({ token, id }) => ({
        url: "rules/global/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      //   invalidatesTags: ["GlobalRule"],
    }),
  }),
});
export const {
  useGetRulesGlobalQuery,
  useCreateRuleGlobalMutation,
  useEditRuleGlobalMutation,
  useDeleteRuleGlobalMutation,
} = globalRulesApi;
