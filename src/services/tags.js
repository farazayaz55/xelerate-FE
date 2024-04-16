// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

export const tagsApi = createApi({
  reducerPath: "tagsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Tags"],
  endpoints: (builder) => ({
    getTags: builder.query({
      providesTags: ["Tags"],
      query: () => ({
        url: "servicecreator/tag",
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
    }),
    addTag: builder.mutation({
      invalidatesTags: ["Tags"],
      query: (body) => ({
        url: "servicecreator/tag",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
    }),
  }),
});
export const { useGetTagsQuery, useAddTagMutation } = tagsApi;
