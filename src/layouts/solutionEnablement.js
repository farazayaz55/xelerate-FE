import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @mui/material components
// core components
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";

// import styles from "assets/jss/material-dashboard-react/layouts/adminStyle.js";
// import bgImage from "assets/img/admin-cover.jpg";
import Logo from "../assets/img/x.png";
import ImportExportIcon from "@mui/icons-material/ImportExport";
import MG from "../components/Migration/migration";

// const useStyles = makeStyles(styles);

export default function Manager(props) {
  // const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [openStyle, setOpenStyle] = React.useState(`calc(100% - ${55}px)`);
  const [metaData, setmetaData] = React.useState(
    JSON.parse(window.localStorage.getItem("metaData")).serviceEnablement
  );
  const [services, setServices] = React.useState(
    JSON.parse(window.localStorage.getItem("metaData"))
      ? JSON.parse(window.localStorage.getItem("metaData")).services
      : []
  );

  function getRoutes() {
    let newData = [];
    metaData.forEach((elm) => {
      let temp = { ...elm };
      temp.icon = adminRoutes[temp.name].icon;
      temp.component = adminRoutes[temp.name].component;
      newData.push(temp);
    });
    return newData;
  }

  const adminRoutes = {
    "Solution Enablement": {
      icon: ImportExportIcon,
      component: (
        <MG
          permission={getPermission("Solution Enablement")}
          history={props.history}
        />
      ),
    },
  };

  const switchRoutes = (
    <Switch>
      {metaData.map((prop, key) => {
        if (prop.layout === "/solutionEnablement/") {
          return (
            <Route path={prop.layout + prop.path} key={key}>
              {adminRoutes[prop.name].component}
            </Route>
          );
        }
        return null;
      })}
      <Redirect to={`/solutionEnablement/${metaData[0].path}`} />
    </Switch>
  );

  function getPermission(chk) {
    let value;
    metaData.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  const handleDrawer = () => {
    // setOpen(!open);
  };

  var drawerStyle = { width: openStyle };

  useEffect(() => {
    if (open) {
      setOpenStyle(`calc(100% - ${55}px)`);
    } else {
      setOpenStyle("100%");
    }
  }, [open]);

  return (
    <div
    // className={classes.wrapper}
    >
      <Sidebar
        routes={getRoutes()}
        logo={
          JSON.parse(window.localStorage.getItem("metaData"))?.branding?.logo
            ? `data:image/jpeg;base64, ${
                JSON.parse(window.localStorage.getItem("metaData"))?.branding
                  ?.logo
              }`
            : Logo
        }
        // image={bgImage}
        open={open}
        color={"primary"}
      />
      <Navbar
        routes={getRoutes()}
        handleDrawer={handleDrawer}
        services={services}
      />
      <div
        // className={classes.mainPanel}
        style={drawerStyle}
      >
        <div
        // className={classes.content}
        >
          <div
          // className={classes.container}
          >
            {switchRoutes}
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    </div>
  );
}
