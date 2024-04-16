// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

export const brandingApi = createApi({
  reducerPath: "brandingApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Branding", "Templates", "Font"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getBranding: builder.query({
      query: ({ user, id }) => ({
        url: `settings/${user}?userId=${id}`,
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      providesTags: ["Branding"],
    }),
    uploadBranding: builder.mutation({
      query: ({ body, type, user }) => ({
        url: type == "PUT" ? "settings/" + user : "settings/",
        method: type,
        body: body,
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["Branding"],
    }),
    deleteBranding: builder.mutation({
      query: ({ user }) => ({
        url: "settings/" + user,
        method: "DELETE",
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["Branding"],
    }),
    createFont: builder.mutation({
      query: ({ body }) => ({
        url: "settings/font",
        method: "POST",
        body: body,
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["Font"],
    }),
    getFonts: builder.query({
      query: () => ({
        url: `settings/font`,
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      providesTags: ["Font"],
    }),
    getTemplates: builder.query({
      query: () => ({
        url: `settings/branding`,
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      providesTags: ["Templates"],
    }),
    createTemplate: builder.mutation({
      query: ({ body, id }) => ({
        url: id ? `settings/branding/${id}` : "settings/branding",
        method: id ? "PUT" : "POST",
        body: body,
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["Templates"],
    }),
    deleteTemplate: builder.mutation({
      query: ({ id }) => ({
        url: `settings/branding/${id}`,
        method: "DELETE",
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["Templates"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetBrandingQuery,
  useUploadBrandingMutation,
  useDeleteBrandingMutation,
  useGetFontsQuery,
  useGetTemplatesQuery,
  useCreateFontMutation,
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
} = brandingApi;
