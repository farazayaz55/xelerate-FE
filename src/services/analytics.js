// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const analyticsApi = createApi({
  reducerPath: "analyticsApi",
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: ({ token, id, dataPoint, parameters }) => ({
        url: `aggregation/${id}?parameter=${dataPoint}${parameters}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getEnumerationAnalytics: builder.query({
      query: ({ token, id, dataPoint, parameters }) => ({
        url: `monitoring/getDataWrtService/${id}?dataPoint=${dataPoint}${parameters}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getServiceAnalytics: builder.query({
      query: ({ token, id, dataPoint, parameters }) => ({
        url: `aggregation/getAggregated/${id}?dataPoint=${dataPoint}${parameters}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getGroupAnalytics: builder.query({
      query: ({ token, parameters }) => ({
        url: `aggregation/aggregatedGroups/` + parameters,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      keepUnusedDataFor: 900,
    }),
    getGroupInfo: builder.query({
      query: ({ token, id, parameters }) => ({
        url: `aggregation/${id}/getAggregatedDatabyGroupId/` + parameters,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      keepUnusedDataFor: 900,
    }),
    getGroupChildAnalytics: builder.query({
      query: ({ token, parameters }) => ({
        url: `aggregation/aggregatedGroupsWithChildren/` + parameters,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      keepUnusedDataFor: 900,
    }),
    getAggregatedDatabyGroupId: builder.query({
      query: ({ token, id, group_id, params }) => {
        let url = `/aggregation/${id}/getAggregatedDatabyGroupId/${params}`;
        if (parseInt(group_id)) {
          url += "&groupId=" + group_id;
        }

        return {
          url: url,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        };
      },
    }),
    getAggregatedDeviceDatabyGroupId: builder.query({
      query: ({ token, id, group_id, params }) => {
        let url = `/aggregation/getAggregatedDeviceDatabyGroupId/${id}/${params}`;
        if (parseInt(group_id)) {
          url += "&groupId=" + group_id;
        }

        return {
          url: url,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
        };
      },
    }),
  }),
});
export const {
  useGetAnalyticsQuery,
  useGetEnumerationAnalyticsQuery,
  useGetServiceAnalyticsQuery,
  useGetGroupAnalyticsQuery,
  useGetGroupChildAnalyticsQuery,
  useGetGroupInfoQuery,
  useGetAggregatedDatabyGroupIdQuery,
  useGetAggregatedDeviceDatabyGroupIdQuery,
} = analyticsApi;
