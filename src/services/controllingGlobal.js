// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const globalControllingApi = createApi({
  reducerPath: "globalControllingApi",
  tagTypes: ["Control", "Sync"],
  refetchOnMountOrArgChange: true,
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getPendingGlobal: builder.query({
      query: ({ token, params }) => ({
        url: "controlling/global/pendingCount/" + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Sync"],
    }),
    getSchedulesGlobal: builder.query({
      query: ({ token, params }) => ({
        url: "controlling/global" + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      // providesTags: ["Control"],
    }),
    addScheduleGlobal: builder.mutation({
      query: ({ token, body }) => ({
        url: "controlling/global/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      // invalidatesTags: ["Control"],
    }),
    syncScheduleGlobal: builder.mutation({
      query: ({ token, body }) => ({
        url: "controlling/global/syncShedules",
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      // invalidatesTags: ["Control"],
    }),
    editScheduleGlobal: builder.mutation({
      query: ({ token, name, body }) => ({
        url: "controlling/global/" + name,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Sync"],
    }),
    deleteScheduleGlobal: builder.mutation({
      query: ({ token, id }) => ({
        url: "controlling/global/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      // invalidatesTags: ["Control"],
    }),
    broadcastGlobal: builder.mutation({
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
  useGetSchedulesGlobalQuery,
  useEditScheduleGlobalMutation,
  useAddScheduleGlobalMutation,
  useDeleteScheduleGlobalMutation,
  useBroadcastGlobalMutation,
  useGetPendingGlobalQuery,
  useSyncScheduleGlobalMutation,
} = globalControllingApi;
