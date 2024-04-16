// Need to use the React-specific entry point to import createApi
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import keys from "Keys";
import baseQueryWithReauth from "./requestInterceptor";

// Define a service using a base URL and expected endpoints


export const simulatorApi = createApi({
    reducerPath: "simulatorApi",
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        startSimulator: builder.mutation({
            query: ({token, body}) => ({
                url: "mockup/startrealtime",
                method: "POST",
                body: body,
                headers: {
                    "Content-Type": "application/json",
                    "x-access-token": token,
                },
            }),
        })
    }),
});
export const { 
    useStartSimulatorMutation,
} = simulatorApi;
