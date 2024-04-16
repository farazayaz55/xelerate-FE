// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

export const simulationApi = createApi({
  reducerPath: "simulationApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["SimulationList"],
  endpoints: (builder) => ({
    addRemoveSimulation: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "simulator/addOrRemoveDevices/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["SimulationList"],
    }),
    getSimulationsDevice: builder.query({
      query: ({ token, id }) => ({
        url: `simulator/${id}/`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["SimulationList"],
    }),
    getSimulations: builder.query({
      query: ({ token, parameters }) => ({
        url: "simulator/" + parameters,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    createSimulation: builder.mutation({
      query: ({ token, body }) => ({
        url: "simulator/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    editSimulation: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "simulator/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    deleteSimulation: builder.mutation({
      query: ({ token, id }) => ({
        url: "simulator/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
  }),
});
export const {
  useAddRemoveSimulationMutation,
  useGetSimulationsDeviceQuery,
  useGetSimulationsQuery,
  useCreateSimulationMutation,
  useEditSimulationMutation,
  useDeleteSimulationMutation,
} = simulationApi;
