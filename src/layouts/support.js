//----------------CORE-----------------//
import React, { useEffect } from "react";
import { Switch, Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
//----------------EXTERNAL COMPONENTS-----------------//
import Navbar from "components/Navbars/Navbar.js";
import Sidebar from "components/Sidebar/Sidebar.js";
import Support from "components/Support";
import EmailIcon from "@mui/icons-material/Email";

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

export default function SupportComp(props) {
  const classes = useStyles();
  const metaDataValue = useSelector((state) => state.metaData);
  const [metaData, setmetaData] = React.useState([
    {
      name: "Support Ticket",
      layout: "/support/",
      path: "supportTicket",
    },
  ]);

  const freeFormRoutes = {
    "Support Ticket": {
      icon: EmailIcon,
      component: <Support history={props.history} />,
    },
  };

  const switchRoutes = (
    <Switch>
      {metaData.map((prop, key) => {
        if (prop.layout === "/support/") {
          return (
            <Route path={prop.layout + prop.path} key={key}>
              {freeFormRoutes[prop.name].component}
            </Route>
          );
        }
        return null;
      })}
      <Redirect to={`/support/${metaData[0].path}`} />
    </Switch>
  );

  function getRoutes() {
    let newData = [];
    metaData.forEach((elm) => {
      let temp = { ...elm };
      temp.icon = freeFormRoutes[temp.name].icon;
      temp.component = freeFormRoutes[temp.name].component;
      newData.push(temp);
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
              name: "Support",
              path: "supportTicket",
              layout: "/support/",
              permission: "ALL"
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
