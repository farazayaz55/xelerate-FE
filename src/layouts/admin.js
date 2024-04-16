//----------------CORE-----------------//
import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
//----------------MUI ICONS-----------------//
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import RouterIcon from "@mui/icons-material/Router";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
//----------------EXTERNAL COMPONENTS-----------------//
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import RM from "components/Admin/roleManagement";
import UM from "components/Admin/userManagement";
import DM from "components/Admin/deviceManagement";
import GM from "components/Admin/groupManagement";
import Bill from "components/Admin/billing";

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
      if (elm.layout === "/administration/") {
        let temp = { ...elm };
        temp.icon = adminRoutes[temp.name].icon;
        temp.component = adminRoutes[temp.name].component;
        newData.push(temp);
      }
    });
    return newData;
  }

  const adminRoutes = {
    "Device Management": {
      icon: RouterIcon,
      component: <DM permission={getPermission("Device Management")} />,
    },
    "User Management": {
      icon: GroupIcon,
      component: <UM permission={getPermission("User Management")} />,
    },
    "Role Management": {
      icon: AssignmentIndIcon,
      component: <RM permission={getPermission("Role Management")} />,
    },

    "Group Management": {
      icon: AccountTreeIcon,
      component: <GM permission={getPermission("Role Management")} />,
    },

    Billing: {
      icon: MonetizationOnIcon,
      component: <Bill permission={getPermission("Billing")} />,
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
        if (prop.layout === "/administration/") {
          return (
            <Route path={prop.layout + prop.path} key={key}>
              {adminRoutes[prop.name].component}
            </Route>
          );
        }
        return null;
      })}
      <Redirect to={`/administration/${getFirstRoute("/administration/")}`} />
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
      />
      <div className={classes.component}>{switchRoutes}</div>
    </div>
  );
}
