// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const servicesApi = createApi({
  reducerPath: "servicesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Service", "Asset", "Sensor", "Actuator"],
  endpoints: (builder) => ({
    getServices: builder.query({
      query: ({ token, param }) => ({
        url: "servicecreator/getServices" + param,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Service"],
    }),
    deleteService: builder.mutation({
      query: ({ token, id }) => ({
        url: "servicecreator/deleteService/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Service"],
    }),
    deleteMeta: builder.mutation({
      query: ({ token, id }) => ({
        url: "servicecreator/meta/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    editService: builder.mutation({
      query: ({ token, id, body }) => ({
        url: "servicecreator/editService/" + id,
        method: "PUT",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Service"],
    }),
    editMeta: builder.mutation({
      query: ({ token, id, body }) => ({
        url: "servicecreator/meta/" + id,
        method: "PUT",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
    }),
    createService: builder.mutation({
      query: ({ token, body }) => ({
        url: "servicecreator/createService",
        method: "POST",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
    }),
    createAsset: builder.mutation({
      query: ({ token, body }) => ({
        url: "servicecreator/asset",
        method: "POST",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Asset"],
    }),
    createSensor: builder.mutation({
      query: ({ token, body }) => ({
        url: "servicecreator/sensor",
        method: "POST",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Sensor"],
    }),
    deleteSensor: builder.mutation({
      query: ({ token, id }) => ({
        url: "servicecreator/sensor/" + id,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Sensor"],
    }),
    createActuator: builder.mutation({
      query: ({ token, body }) => ({
        url: "servicecreator/actuator",
        method: "POST",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Actuator"],
    }),
    createMeta: builder.mutation({
      query: ({ token, body }) => ({
        url: "servicecreator/meta/",
        method: "POST",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
    }),
    getActuators: builder.query({
      query: (token) => ({
        url: "servicecreator/actuator",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Actuator"],
    }),
    getMetaTags: builder.query({
      query: (token) => ({
        url: "servicecreator/meta",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getSensors: builder.query({
      query: (token) => ({
        url: "servicecreator/sensor",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Sensor"],
    }),
    getAssets: builder.query({
      query: (token) => ({
        url: "servicecreator/asset",
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Asset"],
    }),
    getProfiles: builder.query({
      query: ({ token, param }) => ({
        url: "servicecreator/profile" + param,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getProfile: builder.query({
      query: ({ token, id }) => ({
        url: "servicecreator/profile/" + id,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    addProfile: builder.mutation({
      query: ({ token, body }) => ({
        url: "servicecreator/profile",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    applyProfile: builder.mutation({
      query: ({ token, body }) => ({
        url: "servicecreator/applyProfile",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    editProfile: builder.mutation({
      query: ({ token, id, body }) => ({
        url: "servicecreator/profile/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    deleteProfile: builder.mutation({
      query: ({ token, id }) => ({
        url: "servicecreator/profile/" + id,
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
  useGetServicesQuery,
  useGetMetaTagsQuery,
  useGetActuatorsQuery,
  useGetSensorsQuery,
  useGetAssetsQuery,
  useDeleteServiceMutation,
  useCreateServiceMutation,
  useCreateActuatorMutation,
  useCreateSensorMutation,
  useDeleteSensorMutation,
  useCreateAssetMutation,
  useCreateMetaMutation,
  useEditMetaMutation,
  useEditServiceMutation,
  useDeleteMetaMutation,
  useGetProfilesQuery,
  useGetProfileQuery,
  useAddProfileMutation,
  useEditProfileMutation,
  useDeleteProfileMutation,
  useApplyProfileMutation
} = servicesApi;
