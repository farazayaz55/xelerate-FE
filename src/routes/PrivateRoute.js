import React from "react";
import { Route, Redirect } from "react-router-dom";
import Loader from "assets/img/sideLogo.png";
import Keys from "Keys";

export default function PrivateRoute({ res, component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      component={(props) => {
        if (
          window.localStorage.getItem("token") != "" &&
          window.localStorage.getItem("token")
        ) {
          return (
            <div>
              {rest.loader ? (
                <div
                  style={{
                    height: "100vh",
                    width: "100vw",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "#eeeeee",
                  }}
                >
                  <span
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <img src={Keys?.logo ? Keys.logo : Loader}></img>
                    {/* <p>Getting things ready ...</p> */}
                  </span>
                </div>
              ) : (
                <Component {...props} />
              )}
            </div>
          );
        } else {
          return <Redirect to="/auth/login" />;
        }
      }}
    />
  );
}
