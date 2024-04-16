// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

export const rolesApi = createApi({
  reducerPath: "rolesApi",
  tagTypes: ["Roles"],
  refetchOnMountOrArgChange: true,
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getSpecificRole: builder.query({
      query: (role) => ({
        url: `roles/${role}?services=true`,
        headers: {
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
    }),
    getRoles: builder.query({
      query: (token) => ({
        url: "roles/",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Roles"],
    }),
    createRole: builder.mutation({
      query: ({ token, body }) => ({
        url: "roles/",
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body,
      }),
      invalidatesTags: ["Roles"],
    }),
    editRole: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "roles/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Roles"],
    }),
    updateServices: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "roles/updateServices/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      })
    }),
    changeRole: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "changerole/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    deleteRole: builder.mutation({
      query: ({ token, id }) => ({
        url: "roles/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Roles"],
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetSpecificRoleQuery,
  useGetRolesQuery,
  useCreateRoleMutation,
  useEditRoleMutation,
  useUpdateServicesMutation,
  useDeleteRoleMutation,
  useChangeRoleMutation,
} = rolesApi;
