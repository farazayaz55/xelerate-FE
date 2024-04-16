//----------------CORE-----------------//
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
//----------------EXTERNAL COMPONENTS-----------------//
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import FreeFormChart from "components/Freeform Analytics";
import GroupAnalytics from "components/Group Analytics";
import AddchartIcon from "@mui/icons-material/Addchart";
import InsightsIcon from "@mui/icons-material/Insights";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
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

export default function Roi(props) {
  const classes = useStyles();
  const metaDataValue = useSelector((state) => state.metaData);
  const freeFormRoutes = {
    "Self-Service Analytics": {
      icon: AddchartIcon,
      component: (
        <FreeFormChart
          permission={getPermission("Self-Service Analytics")}
          services={metaDataValue.services}
        />
      ),
    },
    "Trend Forecasting": {
      icon: InsightsIcon,
      component: (
        <FreeFormChart
          predictive
          permission={getPermission("Trend Forecasting")}
          services={metaDataValue.services}
        />
      ),
    },
    "Advanced Analytics": {
      icon: AccountTreeIcon,
      component: (
        <GroupAnalytics
          permission={getPermission("Group Analytics")}
          services={metaDataValue.services}
        />
      ),
    },
  };

  function getFirstRoute(chk) {
    let output = [];
    metaDataValue.appPaths.forEach((elm) => {
      if (elm.layout === chk) {
        output.push(elm);
      }
    });
    return output[0].path;
  }

  const switchRoutes = (
    <Switch>
      {metaDataValue.appPaths.map((prop, key) => {
        if (prop.layout === "/analytics/") {
          return (
            <Route path={prop.layout + prop.path} key={key}>
              {freeFormRoutes.hasOwnProperty(prop.name)
                ? freeFormRoutes[prop.name]?.component
                : null}
            </Route>
          );
        }
        return null;
      })}
      <Redirect to={`/analytics/${getFirstRoute("/analytics/")}`} />
    </Switch>
  );

  function getPermission(chk) {
    let value;
    metaDataValue.appPaths.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  function getRoutes() {
    let newData = [];
    metaDataValue.appPaths.forEach((elm) => {
      if (
        elm.layout === "/analytics/" &&
        freeFormRoutes.hasOwnProperty(elm.name)
      ) {
        let temp = { ...elm };
        temp.icon = freeFormRoutes[temp.name].icon;
        temp.component = freeFormRoutes[temp.name].component;
        newData.push(temp);
      }
    });
    return newData;
  }

  return (
    <div className={classes.root}>
      <Sidebar routes={getRoutes()} />
      <Navbar
        routes={[
          ...metaDataValue.appPaths,
          ...[
            {
              name: "Solutions",
              path: "catalogue",
              layout: "/solutions/",
            },
          ],
        ]}
        services={metaDataValue.services}
        history={props.history}
      />
      <div className={classes.component}>{switchRoutes}</div>
    </div>
  );
}
