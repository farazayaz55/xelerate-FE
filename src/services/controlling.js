// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const controllingApi = createApi({
  reducerPath: "controllingApi",
  tagTypes: ["Control"],
  refetchOnMountOrArgChange: true,
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getOperations: builder.query({
      query: ({ token, id, params }) => ({
        url: "controlling/operation/" + id + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Control"],
    }),
    getSchedules: builder.query({
      query: ({ token, id }) => ({
        url: "controlling/" + id,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Control"],
    }),
    getPending: builder.query({
      query: ({ token, id }) => ({
        url: "controlling/pendingCount/?deviceId=" + id,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Control"],
    }),
    addSchedule: builder.mutation({
      query: ({ token, body }) => ({
        url: "controlling/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Control"],
    }),
    syncSchedule: builder.mutation({
      query: ({ token, body }) => ({
        url: "controlling/syncShedules",
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Control"],
    }),
    editSchedule: builder.mutation({
      query: ({ token, name, body }) => ({
        url: "controlling/" + name,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Control"],
    }),
    cancelOperation: builder.mutation({
      query: ({ id }) => ({
        url: "controlling/operation/failOperation/" + id,
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["Control"],
    }),
    deleteSchedule: builder.mutation({
      query: ({ token, name }) => ({
        url: "controlling/" + name,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Control"],
    }),
    broadcast: builder.mutation({
      query: ({ token, body }) => ({
        url: "devices/group/createSmartGroup",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
  }),
});
export const {
  useGetSchedulesQuery,
  useEditScheduleMutation,
  useAddScheduleMutation,
  useDeleteScheduleMutation,
  useBroadcastMutation,
  useGetOperationsQuery,
  useGetPendingQuery,
  useSyncScheduleMutation,
  useCancelOperationMutation,
} = controllingApi;
