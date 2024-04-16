// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

export const globalLocationsApi = createApi({
  reducerPath: "globalLocationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["GlobalLocation"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getGlobalLocations: builder.query({
      query: ({ token, id, group }) => ({
        url: `location/global?serviceId=${id}&groupId=${group}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["GlobalLocation"],
    }),
    createGlobalLocation: builder.mutation({
      query: ({ token, body }) => ({
        url: "location/global/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["GlobalLocation"],
    }),
    editGlobalLocation: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "location/global/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["GlobalLocation"],
    }),
    deleteGlobalLocation: builder.mutation({
      query: ({ token, id }) => ({
        url: "location/global/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["GlobalLocation"],
    }),
  }),
});
export const {
  useGetGlobalLocationsQuery,
  useEditGlobalLocationMutation,
  useCreateGlobalLocationMutation,
  useDeleteGlobalLocationMutation,
} = globalLocationsApi;
