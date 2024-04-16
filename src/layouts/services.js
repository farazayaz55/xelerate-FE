//----------------CORE-----------------//
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
//----------------EXTERNAL COMPONENTS-----------------//
import Navbar from "components/Navbars/Navbar.js";
import Device from "components/Asset View";
import Default from "components/Solution Layouts/Default";
import ESB from "components/Solution Layouts/ESB/AggregatorCCDashboard";
import AirQuality from "components/Solution Layouts/Air Quality Monitoring";
import EnergyManagement from "components/Solution Layouts/Energy Management";
import Catalogue from "components/Catalogue";
import KPI from "components/Solution Layouts/Air Quality Monitoring/KPI";
import VideoWall from "components/Solution Layouts/Air Quality Monitoring/Video Wall";

const useStyles = makeStyles({
  root: {
    backgroundColor: "#eeeeee",
  },
  component: {
    backgroundColor: "#eeeeee",
    position: "absolute",
    top: "64px",
    padding: "23px 10px 20px 15px",
    height: "calc(100vh - 64px)",
    width: "100%",
    overflowX: "hidden",
    overflowY: "hidden",
  },


  kpiComponent: {
    backgroundColor: "white",
    position: "absolute",
    top: "0px",
    padding: "10px 10px 20px 15px",
    height: "100%",
    width: "100%",
    overflowY: "auto",
  },
  videoWallComponent: {
    backgroundColor: "white",
    position: "absolute",
    top: "56px",
    padding: "10px 10px 20px 15px",
    height: "calc(100vh - 66px)",
    width: "100%",
    // overflowY: "auto",
  },
});

const Dashboards = {
  0: Default,
  1: AirQuality,
  2: ESB,
  3: EnergyManagement,
};

export default function Manager(props) {
  console.log("props in services: ", props);
  const classes = useStyles();
  console.log(props, window.location)
  const metaDataValue = useSelector((state) => state.metaData);
  const switchRoutes = (
    <Switch>
      <Route path={"/solutions/catalogue"} exact>
        <Catalogue services={metaDataValue.services} history={props.history} />
      </Route>
      {metaDataValue.services?.map((prop, key) => {
        if (prop.layout === "/solutions/") {
          let Comp = prop?.solutionLayout?.dashboardView
            ? Dashboards[prop.solutionLayout.dashboardView]
            : Default;
          return (
            <Route path={prop.layout + prop.path} exact>
              <Comp
                assets={prop.assets}
                sensors={prop.sensors}
                actuators={prop.actuators}
                configSensors={prop.configSensors}
                configActuators={prop.configActuators}
                dashboardView={prop.solutionLayout.dashboardView}
                group={prop.id}
                link={prop.path}
                history={props.history}
                tabs={prop.tabs}
                dataPointThresholds={prop.dataPointThresholds}
                layout={prop.solutionLayout}
                featureTabs={prop.featureTabs}
              />
            </Route>
          );
        }
        return null;
      })}
      {metaDataValue.services && metaDataValue.services[0] ? (
        <Redirect
          from="/solutions/"
          to={
            metaDataValue.services.length == 1
              ? `/solutions/${metaDataValue.services[0].id}`
              : "/solutions/catalogue"
          }
          exact
        />
      ) : null}
    </Switch>
  );
  metaDataValue;
  const deviceRoutes = (
    <Switch>
      {metaDataValue.services?.map((prop, key) => {
        if (prop.layout === "/solutions/") {
          return (
            <Route path={prop.layout + prop.path + "/:id/:tabId"}>
              <Device
                asset={prop.asset}
                sensors={prop.sensors}
                actuators={prop.actuators}
                configSensors={prop.configSensors}
                configActuators={prop.configActuators}
                dashboardView={prop.solutionLayout.dashboardView}
                tracking={prop.tracking}
                pm={prop.pm}
                tabs={prop.tabs}
                featureTabs={prop.featureTabs}
                group={prop.id}
                layout={prop.solutionLayout}
              />
            </Route>
          );
        }
        return null;
      })}
    </Switch>
  );
  const kpiRoute = (
    <Switch>
      {metaDataValue.services?.map((prop, key) => {
        if (prop.layout === "/solutions/") {
          return (
            <Route path={prop.layout + prop.path + "/kpi"}>
              <KPI
                sensors={prop.sensors}
                service={prop.id}
                history={props.history}
                layout={true}
              />
            </Route>
          );
        }
        return null;
      })}
    </Switch>
  );

  const videoWallRoute = (
    <Switch>
      {metaDataValue.services?.map((prop, key) => {
        if (prop.layout === "/solutions/") {
          return (
            <Route path={prop.layout + prop.path + "/video_wall"}>
              <VideoWall
                sensors={prop.sensors}
                service={prop.id}
                history={props.history}
                layout={true}
              />
            </Route>
          );
        }
        return null;
      })}
    </Switch>
  );

  return (
    <div className={classes.root}>
      {!window.location.pathname.includes('/kpi') ? <Navbar
        routes={[
          ...metaDataValue.services,
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
        // layout={props.solutionLayout}
      /> : null}
      <div id='services-class' className={window.location.pathname.includes('/kpi') ? classes.kpiComponent : window.location.pathname.includes('/video_wall') ? classes.videoWallComponent : classes.component} >
        {switchRoutes}
        {deviceRoutes}
        {kpiRoute}
        {videoWallRoute}
      </div>
    </div>
  );
}
