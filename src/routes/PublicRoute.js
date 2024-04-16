import React from "react";
import { Route, Redirect } from "react-router-dom";

export default function PrivateRoute({ res, component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      component={(props) => {
        if (
          window.localStorage.getItem("token") != "" &&
          window.localStorage.getItem("token")
        ) {
          return <Redirect to="/solutions" />;
        } else {
          return (
            <div>
              <Component {...props} />
            </div>
          );
        }
      }}
    />
  );
}
