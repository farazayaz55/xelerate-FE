// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints.

export const eventsApi = createApi({
  reducerPath: "eventsApi",
  baseQuery: baseQueryWithReauth,
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getEvents: builder.query({
      query: ({ token, params }) => ({
        url: `events/get/${params}`,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    createEvent: builder.mutation({
      query: ({ token, body }) => ({
        url: "events/",
        method: "POST",
        headers: {
          "x-access-token": token,
        },
        body,
      }),
    }),
    snapoToRoad: builder.query({
      query: ({ locations }) => ({
        url: `https://api.mapbox.com/matching/v5/mapbox/driving/${locations}?access_token=pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA`,
      }),
    }),
    routeMapBox: builder.query({
      query: ({ locations }) => ({
        url: `https://api.mapbox.com/directions/v5/mapbox/driving/${locations}?alternatives=false&geometries=geojson&steps=true&access_token=pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA`,
      }),
    }),
  }),
});

// Export hooks for usage in functional components, which are
// auto-generated based on the defined endpoints
export const {
  useGetEventsQuery,
  useCreateEventMutation,
  useSnapoToRoadQuery,
  useRouteMapBoxQuery,
} = eventsApi;
export default eventsApi;
