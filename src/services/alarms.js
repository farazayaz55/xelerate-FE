// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const alarmsApi = createApi({
  reducerPath: "alarmsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Alarm"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getAlarms: builder.query({
      query: ({ token, params }) => ({
        url: "alarms/get/" + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Alarm"],
    }),
    updateAlarm: builder.mutation({
      query: ({ token, id, status }) => ({
        url: `alarms/changeStatus/${id}/`,
        method: "PUT",
        body: { status: status },
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    batchUpdateAlarm: builder.mutation({
      query: ({ token, alarmId, status }) => ({
        url: `alarms/clearInternalAlarms?alarmIdArray=${alarmId}`,
        method: "PUT",
        body: { status: status },
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Alarm"],
    }),
    getAlarmsCount: builder.query({
      query: ({ token, status, severity, serviceId, groupId }) => ({
        url: `alarms/getCount?status=${status}&severity=${severity}&serviceId=${serviceId}${
          groupId ? `&groupId=${groupId}` : ""
        }`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getAlarmsCountForEsb: builder.query({
      query: ({ token, params }) => ({
        url: `alarms/getCountForEsb${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getReport: builder.query({
      query: ({ token, params }) => ({
        url: "alarms/reports" + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Report"],
    }),
    addReport: builder.mutation({
      query: ({ token, body, edit }) => ({
        url: edit ? `alarms/reports/${edit}` : "alarms/reports",
        method: edit ? "PUT" : "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Report"],
    }),
    deleteReport: builder.mutation({
      query: ({ token, body, id }) => ({
        url: `alarms/reports/${id}`,
        method: "DELETE",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Report"],
    }),
  }),
});
export const {
  useGetAlarmsCountQuery,
  useGetAlarmsQuery,
  useGetAlarmsCountForEsbQuery,
  useUpdateAlarmMutation,
  useBatchUpdateAlarmMutation,
  useGetReportQuery,
  useAddReportMutation,
  useDeleteReportMutation,
} = alarmsApi;
