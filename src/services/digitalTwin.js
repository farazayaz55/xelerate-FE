// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
// import keys from "Keys";

// Define a service using a base URL and expected endpoints

// const baseQuery = fetchBaseQuery({ baseUrl: keys.baseUrl });

export const digitalTwinApi = createApi({
  reducerPath: "digitalTwinApi",
  baseQuery: fetchBaseQuery({ baseUrl: '' }),
  endpoints: (builder) => ({
    getDigitalTwin: builder.query({
      query: ({url}) => ({
        url,
        headers: {
            "Content-Type": "text/xml"
        },
      }),
    })
  }),
});
export const { useGetDigitalTwinQuery } = digitalTwinApi;
