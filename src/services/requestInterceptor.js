import keys from "Keys";
import { Mutex } from "async-mutex";
import { fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Define a service using a base URL and expected endpoints

const baseQuery = fetchBaseQuery({
  baseUrl: keys.baseUrl,
});
export default async function baseQueryWithReauth(args, api, extraOptions) {
  const mutex = new Mutex();
  await mutex.waitForUnlock();

  let result = await baseQuery(args, api, extraOptions);
  if (
    result.error &&
    (result.error.status === 403 || result.error.status === 401)
  ) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await baseQuery(
          {
            url: "/getToken",
            method: "GET",
            mode: "cors",
            credentials: "include",
          },
          api,
          extraOptions
        );
        if (refreshResult.data) {
          window.localStorage.setItem(
            "token",
            refreshResult.data.payload.token
          );
          result = await baseQuery(
            {
              url: args.url,
              headers: {
                ...args.headers,
                "x-access-token": refreshResult.data.payload.token,
              },
            },
            api,
            extraOptions
          );
        } else {
          window.localStorage.removeItem("metaData");
          window.localStorage.removeItem("token");
          window.localStorage.removeItem("user");
          setTimeout(function () {
            window.location.reload();
          }, 1000);
        }
      } finally {
        // release must be called once the mutex should be released again.
        release();
      }
    } else {
      // wait until the mutex is available without locking it
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }
  return result;
}
