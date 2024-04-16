import React, { Fragment, useState, useEffect } from "react";

import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import RouterIcon from "@mui/icons-material/Router";
import Loader from "components/Progress";
import { useGetDevicesQuery } from "services/devices";

export default function Devices(props) {
  let token = window.localStorage.getItem("token");
  const [loader, setLoader] = useState(true);
  const [open, setOpen] = React.useState(false);
  const [devices, setDevices] = React.useState([]);
  const [selectedIndex, setSelectedIndex] = React.useState(null);
  const solutionDevices = useGetDevicesQuery({
    token,
    group: props.solution,
    params: "",
  });
  function ifLoaded(state, component) {
    if (state) return <Loader top={"50px"} />;
    else return component;
  }

  const handleListItemClick = (event, index) => {
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  async function fetchDevices() {
    var temp = [];
    // await props.getDevices(props.solution, "");
    if (solutionDevices.isSuccess && solutionDevices.data?.payload) {
      solutionDevices.data?.payload.data.forEach((elm) => {
        temp.push({ name: elm.name, id: elm.internalId });
      });
      setDevices(temp);
      setLoader(false);
    } else if (
      !solutionDevices.data?.success &&
      solutionDevices.data?.message != ""
    ) {
      showSnackbar("Devices", solutionDevices.data?.message, "error", 1000);
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function ListComp() {
    return (
      <Fragment>
        <List component="nav">
          <Divider />
          {devices.map((elm, i) => {
            return (
              <Fragment>
                <ListItemButton
                  onClick={(event) => {
                    props.setChange(false);
                    // props.setDeviceName(elm.name);
                    // props.setDevice(elm.id);
                    props.handleListItemClick(event, elm, props.index);
                    setTimeout(() => {
                      handleClose();
                    }, 100);
                  }}
                  style={{
                    backgroundColor:
                      selectedIndex === elm.name ? "#3399ff" : "white",
                    margin: "5px",
                  }}
                >
                  <ListItemIcon>
                    <RouterIcon
                      style={{
                        color: selectedIndex === elm.name ? "white" : "",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${elm.name} (${elm.id})`}
                    style={{
                      color: selectedIndex === elm.name ? "white" : "",
                    }}
                  />
                </ListItemButton>
                <Divider />
              </Fragment>
            );
          })}
        </List>
      </Fragment>
    );
  }

  function updateLoader() {
    setLoader(true);
  }

  return (
    <Fragment>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Device</DialogTitle>
        <DialogContent
          style={{ textAlign: "center", minWidth: "200px", minHeight: "200px" }}
        >
          {ifLoaded(loader, <ListComp />)}
        </DialogContent>
      </Dialog>
      <div
        style={{
          width: "100%",
          height: "56px",
          border:
            props.solution != ""
              ? `solid 1px ${metaDataValue.branding.primaryColor}`
              : `solid 1px #b0bcbb`,
          borderRadius: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: props.solution != "" ? "pointer" : "",
          margin: "5px",
        }}
        onClick={() => {
          if (props.solution != "") {
            updateLoader();
            fetchDevices();
            handleClickOpen();
          }
        }}
      >
        <p
          style={{
            color: "#5c6261",
            fontSize: "16px",
            color:
              props.solution != ""
                ? metaDataValue.branding.primaryColor
                : "grey",
            userSelect: "none",
          }}
        >
          <b>
            {!props.solution
              ? "Select a solution"
              : !props.deviceName
              ? "Select a device"
              : props.deviceName}
          </b>
        </p>
      </div>
    </Fragment>
  );
}
