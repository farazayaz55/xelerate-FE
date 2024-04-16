import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
//----------------MUI ICONS-----------------//
import Settings from "@mui/icons-material/Settings";
import WebIcon from "@mui/icons-material/Web";
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
//----------------EXTERNAL COMPONENTS-----------------//
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import SC from "components/ServiceCreator";
import SM from "components/Service Management";
import ThresholdProfiles from "components/ThresholdProfilesManagement";

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

export default function Manager(props) {
  const classes = useStyles();
  const metaDataValue = useSelector((state) => state.metaData);

  useEffect(() => {
    console.log("metaDataValue", metaDataValue)
  }, []);

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
      if (elm.layout === "/solutionManagement/") {
        let temp = { ...elm };
        temp.icon = adminRoutes[temp.name].icon;
        temp.component = adminRoutes[temp.name].component;
        newData.push(temp);
      }
    });
    return newData;
  }

  const adminRoutes = {
    "Solution Creator": {
      icon: WebIcon,
      component: (
        <SC
          permission={getPermission("Solution Creator")}
          history={props.history}
        />
      ),
    },
    "Solution Settings": {
      icon: Settings,
      // component: <ThresholdProfiles />,
      component: <SM permission={getPermission("Solution Settings")} />,
    },
    "Thresholds Management": {
      icon: DataThresholdingIcon,
      component: <ThresholdProfiles permission={getPermission("Thresholds Management")} />,
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
        if (prop.layout === "/solutionManagement/") {
          return (
            <Route path={prop.layout + prop.path} key={key}>
              {adminRoutes[prop.name].component}
            </Route>
          );
        }
        return null;
      })}
      <Redirect
        to={`/solutionManagement/${getFirstRoute("/solutionManagement/")}`}
      />
    </Switch>
  );

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
        title = { props.location.pathname.slice(props.location.pathname.lastIndexOf("/")) == "/thresholdsManagement" ? "Thresholds Profile Management" : null }
      />
      <div className={classes.component}>{switchRoutes}</div>
    </div>
  );
}
