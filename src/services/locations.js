// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

export const locationsApi = createApi({
  reducerPath: "locationsApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Location"],
  endpoints: (builder) => ({
    getLocations: builder.query({
      query: ({ token, id }) => ({
        url: `location/${id}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Location"],
    }),
    createLocation: builder.mutation({
      query: ({ token, body }) => ({
        url: "location/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Location"],
    }),
    editLocation: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "location/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Location"],
    }),
    deleteLocation: builder.mutation({
      query: ({ token, id }) => ({
        url: "location/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Location"],
    }),
  }),
});
export const {
  useGetLocationsQuery,
  useEditLocationMutation,
  useCreateLocationMutation,
  useDeleteLocationMutation,
} = locationsApi;
