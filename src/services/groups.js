import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "./requestInterceptor";

export const groupsApi = createApi({
  reducerPath: "groupsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Groups", "Devices", "SingleGroup"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getDevicesByGroups: builder.query({
      query: ({ token, params, id }) => ({
        url: `devices/group/getDevices/${id}/` + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Devices"],
    }),
    getDevices: builder.query({
      query: ({ token, params, id }) => ({
        url: `devices/group/getDevices/${id}/` + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Devices"],
    }),
    getDevicesList: builder.query({
      query: ({ token, params, id }) => ({
        url: `devices/group/deviceList/${id}/` + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Devices"],
    }),
    getGroups: builder.query({
      query: ({ token, refetch, params }) => ({
        url: "devices/group/" + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        refetchOnMountOrArgChange: refetch,
      }),
      providesTags: ["Groups"],
    }),
    getOneGroup: builder.query({
      query: ({ token, params }) => ({
        url: "devices/group/" + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["SingleGroup"],
    }),
    deleteGroup: builder.mutation({
      query: ({ token, id }) => ({
        url: "devices/group/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    addGroup: builder.mutation({
      query: ({ token, body }) => ({
        url: "devices/group/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["SingleGroup", "Groups"],
    }),
    addGeoGroup: builder.mutation({
      query: ({ token, body }) => ({
        url: "devices/group/geoGroup",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    editGroup: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "devices/group/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["SingleGroup", "Devices", "Groups"],
    }),
    updateGroup: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "devices/group/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["SingleGroup", "Devices"],
    }),
  }),
});
export const {
  useGetGroupsQuery,
  useGetOneGroupQuery,
  useDeleteGroupMutation,
  useAddGroupMutation,
  useEditGroupMutation,
  useGetDevicesQuery,
  useGetDevicesListQuery,
  useUpdateGroupMutation,
  useGetDevicesByGroupsQuery,
  useAddGeoGroupMutation,
} = groupsApi;
export default groupsApi;
