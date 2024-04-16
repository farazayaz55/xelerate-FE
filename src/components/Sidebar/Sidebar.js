//----------------CORE-----------------//
import React, { Fragment } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
//----------------MUI-----------------//
import { makeStyles } from "@mui/styles";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import Zoom from "@mui/material/Zoom";

const useStyles = makeStyles({
  hover: {
    "&:hover": {
      backgroundColor: "#eeeeee",
    },
  },
});

function getPath() {
  let temp = window.location.href;
  let path = temp.substring(temp.lastIndexOf("/") + 1);
  return path;
}

export default function Sidebar(props) {
  const classes = useStyles();
  const metaDataValue = useSelector((state) => state.metaData);
  const [selected, setSelected] = React.useState(getPath());

  var links = (
    <List>
      {props.routes.map((prop, key) => {
        return (
          <Fragment>
            <Tooltip
              title={prop.name}
              placement="right"
              arrow
              TransitionComponent={Zoom}
            >
              <Link to={prop.layout + prop.path} key={key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    margin: "3px",
                    borderLeft:
                      selected == prop.path
                        ? `3px solid ${metaDataValue.branding.primaryColor}`
                        : "",
                    height: "54px",
                    maxWidth: "60",
                    cursor: "pointer",
                  }}
                  className={classes.hover}
                  onClick={() => {
                    setSelected(prop.path);
                  }}
                >
                  <prop.icon
                    style={{
                      color:
                        selected == prop.path
                          ? metaDataValue.branding.primaryColor
                          : "#555555",
                      width: "25px",
                      height: "25px",
                    }}
                  />
                </div>
              </Link>
            </Tooltip>
            <Divider />
          </Fragment>
        );
      })}
    </List>
  );

  return (
    <div>
      <Drawer anchor={"left"} variant="permanent" open={props.open}>
        <div
          style={{
            marginTop: "59px",
            width: "60px",
            zIndex: "-140000000 !important",
          }}
        >
          {links}
        </div>
      </Drawer>
    </div>
  );
}
