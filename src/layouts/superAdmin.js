import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
// creates a beautiful scrollbar
import PerfectScrollbar from "perfect-scrollbar";
import "perfect-scrollbar/css/perfect-scrollbar.css";
// @mui/material components
import { makeStyles } from "@mui/styles";
// core components
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
// import styles from "assets/jss/material-dashboard-react/layouts/adminStyle.js";
import Catalogue from "../components/Licenses";
import Form from "../components/Licenses/form";

let ps;

// const useStyles = makeStyles(styles);

export default function Manager(props) {
  // const classes = useStyles();
  const mainPanel = React.createRef();
  const [open, setOpen] = React.useState(true);
  const [openStyle, setOpenStyle] = React.useState(`calc(100% - ${55}px)`);
  const [metaData, setmetaData] = React.useState(
    JSON.parse(window.localStorage.getItem("metaData"))
      ? JSON.parse(window.localStorage.getItem("metaData")).services
      : []
  );
  const [apps, setApps] = React.useState(
    JSON.parse(window.localStorage.getItem("metaData"))
      ? JSON.parse(window.localStorage.getItem("metaData")).apps
      : []
  );

  const licenseRoutes = (
    <Switch>
      <Route path={"/superAdmin"} exact>
        <Catalogue
          routes={[
            {
              name: "license 1",
              path: "license1",
            },
            {
              name: "license 2",
              path: "license2",
            },
            {
              name: "license 3",
              path: "license3",
            },
            {
              name: "license 4",
              path: "license4",
            },
            {
              name: "license 5",
              path: "license5",
            },
          ]}
          history={props.history}
        />
      </Route>
      <Route path="/superAdmin/:license">
        <Form />
      </Route>
    </Switch>
  );

  const handleDrawer = () => {
    setOpen(!open);
  };

  var drawerStyle = { width: "100%" };

  useEffect(() => {
    if (navigator.platform.indexOf("Win") > -1) {
      let ps = new PerfectScrollbar(mainPanel.current, {
        suppressScrollX: true,
        suppressScrollY: false,
      });
      document.body.style.overflow = "hidden";
    }
    if (open) {
      // setTimeout(() => {
      setOpenStyle(`calc(100% - ${55}px)`);
      // }, 30);
    } else {
      // setTimeout(() => {
      setOpenStyle("100%");
      // }, 1300);
    }
  }, [open]);

  return (
    <div
    // className={classes.wrapper}
    >
      {/* <Sidebar
        routes={metaData}
        logo={
          JSON.parse(window.localStorage.getItem("metaData"))?.branding?.logo
            ? `data:image/jpeg;base64, ${
                JSON.parse(window.localStorage.getItem("metaData"))?.branding
                  ?.logo
              }`
            : Logo
        }
        image={bgImage}
        open={open}
        color={"primary"}
        history={props.history}
      /> */}
      <Navbar
        routes={metaData}
        services={metaData}
        handleDrawer={handleDrawer}
        history={props.history}
        logo={true}
      />
      <div
        // className={classes.mainPanel}
        style={drawerStyle}
        ref={mainPanel}
      >
        <div
        // className={classes.content}
        >
          <div
          // className={classes.container}
          >
            {licenseRoutes}
          </div>
        </div>
        {/* <Footer /> */}
      </div>
    </div>
  );
}
