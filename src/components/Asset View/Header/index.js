import React, { Fragment, useEffect } from "react";
import { useSelector } from "react-redux";
import Skeleton from "@mui/material/Skeleton";
import Keys from "Keys";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useGetDevicesByGroupsQuery } from "services/groups";
import { useGetDevicesQuery } from "services/devices";
import Chip from "@mui/material/Chip";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import Divider from "@mui/material/Divider";
import ListItemButton from "@mui/material/ListItemButton";
import { useHistory } from "react-router-dom";
import Inverter from "assets/img/esb.png";
import EVCharger from "assets/img/evcharger.png";
import Other from "assets/img/others-asset.png";

export default function Header(props) {
  const device = useSelector((state) => state.asset.device);
  console.log({device})
  let token = window.localStorage.getItem("token");
  const history = useHistory();
  const metaDataValue = useSelector((state) => state.metaData);
  const [showAssets, setShowAssets] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [width, setWidth] = React.useState("400px");
  const [selectedGroup, setSelectedGroup] = React.useState(
    device?.associatedGroups[0]?._id || ""
  );
  const devices = useGetDevicesByGroupsQuery(
    {
      token,
      id: selectedGroup,
      params: "?currentPage=1&pageSize=100",
    },
    {
      skip: !selectedGroup,
    }
  );
  const otherDevices = useGetDevicesQuery(
    {
      token,
      group: props.group,
      params: "",
    },
    { skip: selectedGroup }
  );

  useEffect(()=>{
    if(!otherDevices.isFetching && otherDevices.isSuccess){
      console.log({otherDevices})
    }
  },[otherDevices.isFetching])

  useEffect(() => {
    console.log({props})
  }, [props])

  useEffect(() => {
    const myTimeout = setTimeout(() => {
      if (document.getElementById("current-asset"))
        setWidth(document.getElementById("current-asset").clientWidth - 10);
    }, 1000);

    document.getElementById("current-asset").addEventListener("click", (e) => {
      if (
        !(
          (e?.path && e?.path[0]?.classList.contains("MuiChip-label")) ||
          (e?.path && e?.path[0]?.classList.contains("MuiButtonBase-root"))
        )
      ) {
        setAnchorEl(e.currentTarget);
        setShowAssets(!showAssets);
      }
    });

    return () => {
      clearTimeout(myTimeout);
    };
  }, []);

  function getIdentifier() {
    let meta = device?.metaTags.find(
      (e) => e.metaId == props.layoutPermission.identifier
    );
    if (meta) return `(${meta.key}: ${meta.value})`;
    else return false;
  }

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          justifyContent: "start",
          alignItems: "center",
          width: "calc(100vw - 200px)",
          // position: "fixed",
          position: "sticky",
          top:"0%",
          zIndex:'100',
          // backgroundColor:"white"
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <img
            src={
              !device?.esbDeviceType ? metaDataValue.services.find((x) => x.id === props.group).assets.find((asset) => asset.id == device.platformDeviceType)
                ?.image :
                device.esbDeviceType == "EVCharger" ? EVCharger :
                device.esbDeviceType == "Inverter" ? Inverter :
                Other
            }
            style={{
              maxHeight: "100px",
              maxWidth: "212px",
            }}
          ></img>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              gap: "5px",
              height: "100px",
              minWidth: "400px",
              marginLeft: "20px",
              borderRadius: "8px",
              padding: "10px",
              cursor: "pointer",
              backgroundColor: device?.packetFromPlatform?.c8y_Availability
                ? device?.packetFromPlatform.c8y_Availability.status ==
                  "AVAILABLE"
                  ? "rgb(76, 175, 80, 0.1)"
                  : device?.packetFromPlatform.c8y_Availability.status ==
                    "UNAVAILABLE"
                  ? "rgb(85, 85, 85,0.1)"
                  : "rgb(85, 85, 85, 0.1)"
                : "rgb(85, 85, 85, 0.1)",

              color: "black",
            }}
            id="current-asset"
          >
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <Skeleton
                variant="circular"
                width={8}
                height={8}
                style={{
                  position: "relative",
                  left: "4px",
                  backgroundColor: device?.packetFromPlatform?.c8y_Availability
                    ? device?.packetFromPlatform.c8y_Availability.status ==
                      "AVAILABLE"
                      ? "#4caf50"
                      : device?.packetFromPlatform.c8y_Availability.status ==
                        "UNAVAILABLE"
                      ? "#555555"
                      : "#555555"
                    : "#555555",
                }}
              />
              <p
                style={{
                  fontWeight: "bold",
                  flex: 1,
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  overflow: "hidden",
                }}
              >
                {device?.name}
                <span
                  style={{
                    fontSize: "13px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    marginLeft: "8px",
                    fontWeight: "500",
                  }}
                >
                  {props.layoutPermission.columns.indexOf("deviceInfo") != -1
                    ? `(${props.id})`
                    : getIdentifier()}
                </span>
              </p>
              <KeyboardArrowDownIcon
                aria-describedby="assets"
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  document.getElementById("current-target")?.click();
                }}
              />
            </div>

            <p
              style={{
                color: "black",
                fontSize: "13px",
                fontWeight: "500",
                marginLeft: "27px",
                paddingBottom: "2px",
              }}
            >
              {props.layoutPermission.columns.indexOf("deviceInfo") != -1
                ? getIdentifier()
                : null}
            </p>

            {device?.associatedGroups.length ? (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  marginLeft: "27px",
                }}
              >
                <AccountTreeIcon
                  style={{
                    color: "#666",
                    fontSize: "18px",
                    marginTop: "2px",
                    marginRight: "10px",
                  }}
                />
                {/* {device?.associatedGroups?.slice(0, 3).map((a, i) => { */}
                {/* return ( */}
                <Chip
                  // onClick={() => setSelectedGroup(device?.associatedGroups[0]._id)}
                  // clickable
                  label={device?.associatedGroups[0].name}
                  style={{
                    backgroundColor:
                      device?.associatedGroups[0]._id == selectedGroup
                        ? metaDataValue.branding.secondaryColor
                        : "lightgrey",
                    color:
                      device?.associatedGroups[0]._id == selectedGroup
                        ? "white"
                        : "#666",
                    borderRadius: "6px",
                    height: "25px",
                  }}
                />
                {/* ); */}

                {/* {device?.associatedGroups.length > 3 ? (
                <div style={{ marginTop: "7px", color: "grey" }}> ... </div>
              ) : null} */}
              </div>
            ) : null}
            <Popover
              id="assets"
              anchorEl={anchorEl}
              icon={KeyboardArrowDownIcon}
              open={showAssets}
              onClose={() => setShowAssets(false)}
              name="assets"
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              style={{ maxHeight: "500px", maxWidth: "100%" }}
            >
              <List
                sx={{
                  width: width,
                  bgcolor: "background.paper",
                }}
                component="nav"
                aria-label="main mailbox folders"
              >
                {selectedGroup ? (
                  devices?.data?.payload?.devices?.filter(
                    (d) => d.internalId != props.id
                  )?.length ? (
                    devices?.data?.payload?.devices
                      ?.filter((d) => d.internalId != props.id)
                      .map((device, ind) => {
                        return (
                          <Fragment>
                            <ListItemButton
                              style={{ padding: 0 }}
                              onClick={() => {
                                history.push(
                                  `/solutions/${props.group}/${device.internalId}/${props.i}`
                                );
                              }}
                            >
                              <ListItem>
                                <ListItemText
                                  primary={device.name}
                                  secondary={device.internalId}
                                />
                              </ListItem>
                            </ListItemButton>
                            {devices?.data?.payload?.devices?.filter(
                              (d) => d.internalId != props.id
                            ).length -
                              1 !=
                            ind ? (
                              <Divider
                                style={{
                                  marginLeft: "20px",
                                  marginRight: "20px",
                                }}
                              />
                            ) : null}
                          </Fragment>
                        );
                      })
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        margin: "30px",
                        color: "lightgrey",
                      }}
                    >
                      No Assets in selected group level
                    </div>
                  )
                ) : otherDevices?.data?.payload?.data?.filter(
                    (d) =>
                      d.internalId != props.id && !d.associatedGroups.length
                  )?.length ? (
                  otherDevices?.data?.payload?.data
                    ?.filter(
                      (d) =>
                        d.internalId != props.id && !d.associatedGroups.length
                    )
                    .map((device, ind) => {
                      return (
                        <Fragment>
                          <ListItemButton
                            style={{ padding: 0 }}
                            onClick={() => {
                              history.push(
                                `/solutions/${props.group}/${device.internalId}/${props.i}`
                              );
                            }}
                          >
                            <ListItem>
                              <ListItemText
                                primary={device.name}
                                secondary={device.internalId}
                              />
                            </ListItem>
                          </ListItemButton>
                          {otherDevices?.data?.payload?.data?.filter(
                            (d) =>
                              d.internalId != props.id &&
                              !d.associatedGroups.length
                          ).length -
                            1 !=
                          ind ? (
                            <Divider
                              style={{
                                marginLeft: "20px",
                                marginRight: "20px",
                              }}
                            />
                          ) : null}
                        </Fragment>
                      );
                    })
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      margin: "30px",
                      color: "lightgrey",
                    }}
                  >
                    No Assets in selected group level
                  </div>
                )}
              </List>
            </Popover>
          </div>
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#666",
            width: "100%",
            textAlign: "right",
          }}
        >
          Last Updated : {new Date().toLocaleDateString("en-GB")}{" "}
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </Fragment>
  );
}
