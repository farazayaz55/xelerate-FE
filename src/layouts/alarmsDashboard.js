//----------------CORE-----------------//
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
//----------------EXTERNAL COMPONENTS-----------------//
import Navbar from "components/Navbars/Navbar.js";
import AlarmsDashboard from "../components/Alarms Dashboard";

const useStyles = makeStyles({
  root: {
    backgroundColor: "#eeeeee",
  },
  component: {
    backgroundColor: "#eeeeee",
    position: "absolute",
    top: "64px",
    padding: "10px 10px 10px 15px",
    height: "calc(100vh - 64px)",
    width: "100%",
    overflowY: "hidden",
  },
});

export default function Manager(props) {
  const classes = useStyles();
  const metaDataValue = useSelector((state) => state.metaData);
  const switchRoutes = (
    <Switch>
      <Route path={"/alarms-dashboard/"} exact>
        <AlarmsDashboard history={props.history} />
      </Route>
      {/* {metaDataValue.services && metaDataValue.services[0] ? ( */}
        <Redirect
          to={"/alarms-dashboard/"}
          exact
        />
    </Switch>
  );


  return (
    <div className={classes.root}>
      <Navbar
        routes={[
          ...metaDataValue.appPaths,
          {
            name: "Alarms Dashboard",
            path: "",
            layout: "/alarms-dashboard",
          },
        ]}
        history={props.history}
        services={metaDataValue.services}
      />
      <div className={classes.component}>
        {switchRoutes}
      </div>
    </div>
  );
}
