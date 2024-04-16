// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const userApi = createApi({
  reducerPath: "userApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["User"],
  refetchOnMountOrArgChange: true,
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: ({ token, parameters }) => ({
        url: "user/" + parameters,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      providesTags: ["User"],
    }),
    getSignedUsers: builder.query({
      query: ({ token, type }) => ({
        url: `user/presignedurl?mimeType=${type}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
    }),
    createUser: builder.mutation({
      query: ({ body }) => ({
        url: "user/",
        method: "POST",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      invalidatesTags: ["User"],
    }),
    editUser: builder.mutation({
      query: ({ token, id, body }) => ({
        url: "user/" + id,
        method: "PUT",
        body: body,
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["User"],
    }),
    uploadUser: builder.mutation({
      query: ({ url, body }) => ({
        url,
        method: "PUT",
        body: body,
        onUploadProgress: (p) => {
          //this.setState({
          //fileprogress: p.loaded / p.total
          //})
        },
        // headers: {
        //   "Content-Type": "text/xml",
        // },
      }),
    }),
    uploadFileToAWS: builder.mutation({
      query: ({ token, mimeType, attachment, formData }) => ({
        url: `user/uploadContent?mimeType=${mimeType}`,
        method: "POST",
        body: formData,
        headers: {
          // "Content-Type": "multipart/form-data",
          "x-access-token": token,
        },
        // headers: {
        //   "Content-Type": "text/xml",
        // },
      }),
    }),
    deleteUser: builder.mutation({
      query: ({ token, id, platformCheck }) => ({
        url: `user/${id}/?deletePlatform=${platformCheck}`,
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
      }),
      invalidatesTags: ["User"],
    }),
    generateApiKeys: builder.mutation({
      query: ({ id, email }) => ({
        url: "user/createApiUser",
        method: "POST",
        body: { userId: id, email },
        headers: {
          "Content-Type": "application/json",
          "x-access-token": window.localStorage.getItem("token"),
        },
      }),
      // invalidatesTags: ["User"],
    }),
  }),
});
export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useEditUserMutation,
  useDeleteUserMutation,
  useUploadUserMutation,
  useUploadFileToAWSMutation,
  useGenerateApiKeysMutation,
  useGetSignedUsersQuery,
  useLazyGetSignedUsersQuery,
} = userApi;
