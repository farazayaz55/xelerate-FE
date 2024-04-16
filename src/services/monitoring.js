import { createApi } from "@reduxjs/toolkit/query/react";
import baseQueryWithReauth from "./requestInterceptor";

export const monitoringApi = createApi({
  reducerPath: "monitoringApi",
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getReadings: builder.query({
      query: ({ id, parameter }) => ({
        url: "/monitoring/get/" + id + parameter,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
    }),
    getBoxPlot: builder.query({
      query: ({ token, parameters }) => ({
        url: `monitoring/getAggregatedBoxPlotStatistics/` + parameters,
        // +
        // "?currentPage=1&pageSize=20",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      keepUnusedDataFor: 900,
    }),
    // https://qa-backend.xelerate.solutions/api/aggregation/getAggregatedHistoricComparisonByGroupId/6432a47f753068001f702bc4?aggregation=[%22mean%22]&aggregationType=sum&dataPoint=EnergyConsumption&period=day&cost=2.5%27
    getEMAggregationForTrend: builder.query({
      query: ({ token, groupId, params }) => ({
        url:
          `aggregation/getAggregatedHistoricComparisonByGroupId/` +
          groupId +
          params,
        // +
        // "?currentPage=1&pageSize=20",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      keepUnusedDataFor: 900,
    }),
    getEMAggregationForSankey: builder.query({
      query: ({ token, groupId, params }) => ({
        url: `aggregation/getAggregatedDataForChildGroups/` + groupId + params, // + // "?currentPage=1&pageSize=20",

        method: "GET",

        headers: {
          "Content-Type": "application/json",

          "x-access-token": token,
        },
      }),

      keepUnusedDataFor: 900,
    }),
  }),
});

export const {
  useGetReadingsQuery,
  useGetBoxPlotQuery,
  useGetEMAggregationForTrendQuery,
  useGetEMAggregationForSankeyQuery,
} = monitoringApi;
