// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

const severityList = ["CRITICAL", "MAJOR", "MINOR", "WARNING"]

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const devicesApi = createApi({
  reducerPath: "devicesApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Device", "Price"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getHealth: builder.query({
      query: ({ token, id, params }) => ({
        url: `devices/getHealth?serviceId=${id}${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getConnectivity: builder.query({
      query: ({ token, id, params }) => ({
        url: `devices/getConnectedWrtService?serviceId=${id}${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getNumOfAlarms: builder.query({
      query: ({ token, id, group }) => ({
        url: `alarms/getReadCountForAllStatus?serviceId=${id}${group ? `&groupId=${group}`:``}&severity=["CRITICAL", "MAJOR", "MINOR", "WARNING"]&status=["ACTIVE","ACKNOWLEDGED"]`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getNumOfDevices: builder.query({
      query: ({ token, id, params }) => ({
        url: `devices/getDevicesWrtService?serviceId=${id}${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getAllDevices: builder.query({
      query: ({ token, params }) => ({
        url: "devices/getAllPlatformDevices/" + params,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getAggregatedTariff: builder.query({
      query: ({ token, id, params }) => ({
        url: `tariff/aggregated/${id}${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getTariff: builder.query({
      query: ({ token, id, params }) => ({
        url: `tariff/${id}${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getPrice: builder.query({
      query: ({ token }) => ({
        url: `tariff/price`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    updatePrice: builder.mutation({
      query: ({ token, body, id }) => ({
        url: id ? `tariff/price/${id}` : "tariff/price",
        method: id ? "PUT" : "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Price"],
    }),
    getBill: builder.query({
      query: ({ token, params }) => ({
        url: `tariff/billing${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Price"],
    }),
    getBillList: builder.query({
      query: ({ token, params }) => ({
        url: `tariff/billingList${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getDevices: builder.query({
      query: ({ token, group, params }) => ({
        url: `devices/?serviceId=${group}${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Device"],
    }),
    getOneDevice: builder.query({
      query: ({ token, id, params }) => ({
        url: `devices/?internalId=${id}${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getPVChargingLevels: builder.query({
      query: ({ token, params }) => ({
        url: `devices/getChargingLevels${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getEVChargingLevels: builder.query({
      query: ({ token, params }) => ({
        url: `devices/getChargingLevelsAndAlarm${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getEsbAssetCounts: builder.query({
      query: ({ token, params }) => ({
        url: `devices/getConnectedWrtServiceESB${params}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    getDeviceCountWrtGroupAndMetaTags: builder.query({
      query: ({ token, id, group_id, body }) => {
        let url = `devices/${id}/getDeviceCountWrtGroupAndMetaTags/?tags=${JSON.stringify(
          body
        )}`;
        if (group_id) {
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
    addDevice: builder.mutation({
      query: ({ token, body }) => ({
        url: "devices/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Device"],
    }),
    editDevice: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "devices/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    editDeviceMeta: builder.mutation({
      query: ({ token, id, body }) => ({
        url: "devices/updateMeta/" + id,
        method: "PUT",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
    }),
    editDeviceRag: builder.mutation({
      query: ({ token, id, body }) => ({
        url: "devices/updateRag/" + id,
        method: "PUT",
        body: body,
        headers: {
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Device"],
    }),
    deleteDevices: builder.mutation({
      query: ({ token, id, platformCheck }) => ({
        url: "devices/" + `${id}?deletePlatform=${platformCheck}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Device"],
    }),
    importDevices: builder.mutation({
      query: ({ token, body }) => ({
        url: "devices/importDevices",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Device"],
    }),
    addNote: builder.mutation({
      query: ({ token, body }) => ({
        url: "devices/notes",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Note"],
    }),
    editNote: builder.mutation({
      query: ({ token, body, id }) => ({
        url: "devices/notes/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Note"],
    }),
    deleteNote: builder.mutation({
      query: ({ token, id }) => ({
        url: "devices/notes/" + `${id}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["Note"],
    }),
    getNotes: builder.query({
      query: ({ token, group }) => ({
        url: group ? `devices/notes/?deviceId=${group}` : `devices/notes`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["Note"],
    }),
  }),
});
export const {
  useGetHealthQuery,
  useGetOneDeviceQuery,
  useGetPVChargingLevelsQuery,
  useGetEsbAssetCountsQuery,
  useGetEVChargingLevelsQuery,
  useGetConnectivityQuery,
  useGetNumOfAlarmsQuery,
  useGetNumOfDevicesQuery,
  useGetDevicesQuery,
  useGetAllDevicesQuery,
  useAddDeviceMutation,
  useEditDeviceMutation,
  useDeleteDevicesMutation,
  useImportDevicesMutation,
  useEditDeviceMetaMutation,
  useEditDeviceRagMutation,
  useGetDeviceCountWrtGroupAndMetaTagsQuery,
  useGetNotesQuery,
  useAddNoteMutation,
  useDeleteNoteMutation,
  useEditNoteMutation,
  useGetTariffQuery,
  useGetAggregatedTariffQuery,
  useGetBillQuery,
  useGetBillListQuery,
  useGetPriceQuery,
  useUpdatePriceMutation,
} = devicesApi;

export default devicesApi;
