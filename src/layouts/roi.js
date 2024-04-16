//----------------CORE-----------------//
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
//----------------EXTERNAL COMPONENTS-----------------//
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import ROI from "components/ROI";
import CalculateIcon from "@mui/icons-material/Calculate";

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
  const roiRoutes = {
    Calculator: {
      icon: CalculateIcon,
      component: <ROI permission={getPermission("Calculator")} />,
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
        if (prop.layout === "/roiCalculator/") {
          return (
            <Route path={prop.layout + prop.path} key={key}>
              {roiRoutes[prop.name].component}
            </Route>
          );
        }
        return null;
      })}
      <Redirect to={`/roiCalculator/${getFirstRoute("/roiCalculator/")}`} />
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
      if (elm.layout === "/roiCalculator/") {
        let temp = { ...elm };
        temp.icon = roiRoutes[temp.name].icon;
        temp.component = roiRoutes[temp.name].component;
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
