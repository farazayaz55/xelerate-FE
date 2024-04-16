import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
// creates a beautiful scrollbar
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @mui/material components
import { makeStyles } from "@mui/styles";
// core components
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";

import ColorLensIcon from "@mui/icons-material/ColorLens";
import ST from "../components/Branding";

const useStyles = makeStyles({
  root: { backgroundColor: "#eeeeee" },
  component: {
    backgroundColor: "#eeeeee",
    position: "absolute",
    top: "64px",
    left: "60px",
    padding: "20px 15px 20px 15px",
    minHeight: "calc(100vh - 64px)",
    minWidth: "calc(100vw - 60px)",
  },
});

export default function Setting(props) {
  const classes = useStyles();
  const metaData = useSelector((state) => state.metaData);
  function getPermission(chk) {
    let value;
    metaData.appPaths.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  function getRoutes() {
    let newData = [];
    metaData.appPaths.forEach((elm) => {
      if (elm.layout === "/settings/") {
        let temp = { ...elm };
        temp.icon = adminRoutes[temp.name].icon;
        temp.component = adminRoutes[temp.name].component;
        newData.push(temp);
      }
    });
    return newData;
  }

  function getFirstRoute(chk) {
    let output = [];
    metaData.appPaths.forEach((elm) => {
      if (elm.layout === chk) {
        output.push(elm);
      }
    });
    return output[0].path;
  }

  const adminRoutes = {
    Branding: {
      icon: ColorLensIcon,
      component: <ST permission={getPermission("Branding")} />,
    },
  };

  const switchRoutes = (
    <Switch>
      {metaData.appPaths.map((prop, key) => {
        if (prop.layout === "/settings/") {
          return (
            <Route path={prop.layout + prop.path} key={key}>
              {adminRoutes[prop.name].component}
            </Route>
          );
        }
        return null;
      })}
      <Redirect to={`/settings/${getFirstRoute("/settings/")}`} />
    </Switch>
  );

  return (
    <div className={classes.root}>
      <Sidebar routes={getRoutes()} />
      <Navbar
        routes={[
          ...metaData.appPaths,
          ...[
            {
              name: "Solutions",
              path: "catalogue",
              layout: "/solutions/",
            },
          ],
        ]}
        services={metaData.services}
        history={props.history}
      />
      <div className={classes.component}>{switchRoutes}</div>
    </div>
  );
}
