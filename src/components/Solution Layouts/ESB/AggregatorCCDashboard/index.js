//--------------CORE--------------//
import {
  faToggleOn,
  faBell,
  faMapSigns,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useEffect, useRef, useState } from "react";
import Popup from "components/Asset View/Controlling/Scheduler/Popup";
import ProfilePopup from "../../Default/ProfilePopup";

//--------------MUI--------------//
import { Box, Fab, Typography } from "@mui/material";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Tooltip from "@mui/material/Tooltip";
import { makeStyles } from "@mui/styles";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import Zoom from "@mui/material/Zoom";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import HandymanIcon from "@mui/icons-material/Handyman";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";

//--------------EXTERNAL--------------//
import AlarmsDashboard from "components/Alarms Dashboard";
import { useDispatch, useSelector } from "react-redux";
import Rules from "../Solution Insights/Rules";
import Controls from "../Solution Insights/Controls";
import AggregatorControlCenter from "../AggregatorControlCenter";
import AggregatorMapView from "../AggregatorMapView";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import Filters from "../Asset Views/Settings";
import AggregatorAlarms from "../AggregatorAlarms";
import { useTranslation } from "react-i18next";
import { useRouteMatch } from "react-router-dom";
import { useGetProfilesQuery } from "services/services";
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import { useGetNumOfDevicesQuery, useGetConnectivityQuery, useGetDevicesQuery } from "services/devices";
import { getSocket } from "Utilities/socket";
import emitter from "Utilities/events";

import "app/style.css";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography component={"span"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function Service(props) {
  console.log({ props });
  const dispatch = useDispatch();
  const useStyles = makeStyles((theme) => ({
    speedDial: {
      position: "absolute",
      bottom: "30px",
      right: "-33px",
      zIndex: theme.zIndex.speedDial,
    },
  }));
  const classes = useStyles();
  const [openSpeedDial, setOpenSpeedDial] = React.useState(false);

  let actions = [];

  const handleClose = () => {
    setOpenSpeedDial(false);
  };

  const handleOpen = () => {
    setOpenSpeedDial(true);
  };

  const metaDataValue = useSelector((state) => state.metaData);
  const [openPopup, setOpenPopup] = useState(false);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [videoWallEnabled, setVideoWallEnabled] = React.useState(false);
  const [Array, setArray] = useState(
    props.actuators.length
      ? [
          "Aggregator Control Centre",
          "Map View",
          "Alarms Dashboard",
          "Rules",
          "Automations",
        ]
      : ["Aggregator Control Centre", "Map View", "Alarms Dashboard", "Rules"]
  );
  const [profilePopup, setProfilePopup] = useState(false);
  const [profiles, setProfiles] = useState(false);
  const [selectedTab, setSelectedTab] = React.useState(Array[0]);
  // const [rightPaneOpen, setRightPaneOpen] = useState(filtersValue.rightPaneOpen)
  const [value, setValue] = React.useState(0);
  const [tabsList, setTabsList] = useState([]);
  const { t } = useTranslation();

  const { url } = useRouteMatch();
  let id = url.substring(url.lastIndexOf("/") + 1);

  const profilesRes = useGetProfilesQuery(
    {
      token: window.localStorage.getItem("token"),
      param: props.group ? `?serviceId=${props.group}` : ``,
    },
    { skip: !props.group }
  );

  // const devicesRes = useGetNumOfDevicesQuery({
  //   token: window.localStorage.getItem("token"),
  //   id: props.group,
  //   group: filtersValue.group.id,
  //   assetTypes: filtersValue.assetTypes
  // });

  const devicesRes = useGetDevicesQuery(
    {
      token: window.localStorage.getItem("token"),
      group: props.group,
      params: `&MeasurementFilter=${filtersValue.measurement}&connected=${
        filtersValue.connection
      }&alarms=${filtersValue.alarms}&associatedGroup=${
        filtersValue.group.id
      }&metaTags=${filtersValue.metaTags}&assetTypes=${filtersValue.assetTypes}`,
    });

  const devicesRes2 = useGetConnectivityQuery({
    token: window.localStorage.getItem("token"),
    id: props.group,
    group: filtersValue.group.id,
    assetTypes: filtersValue.assetTypes
  });

  function callbackfn(payload) {
    dispatch(
      setFilter({
        noOfDevices: payload.message.noOfDevices,
        devicesCount: payload.message.devicesCount,
        totalDevices: payload.message.noOfDevices
      })
    );
  }

  function callbackfn2(payload) {
    dispatch(
      setFilter({
        connectedDevices: payload?.connected ? payload?.connected : 0,
      })
    );
  }

  useEffect(() => {
    emitter.on("solution?deviceDashboardAssetCount", callbackfn);
    emitter.on("solution?deviceDashboardConnectivity", callbackfn2);
    return () => {
      emitter.off("solution?deviceDashboardAssetCount", callbackfn);
      emitter.off("solution?deviceDashboardConnectivity", callbackfn2);
    };
  }, []);

  useEffect(() => {
    if (devicesRes.isSuccess)
      dispatch(
        setFilter({
          totalDevices: devicesRes.data.payload?.data?.length 
        })
      );
  }, [devicesRes.isFetching]);

  useEffect(() => {
    if (devicesRes2.isSuccess) {
      dispatch(
        setFilter({
          connectedDevices: devicesRes2?.data?.payload?.connected ? devicesRes2?.data?.payload?.connected : 0,
        })
      );
    }
  }, [devicesRes2.isFetching]);


  const tabIcons = {
    "Aggregator Control Centre": faToggleOn,
    "Map View": faMapSigns,
    "Alarms Dashboard": faBell,
  };

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const handleProfilePopup = () => {
    setProfilePopup(!profilePopup);
  };

  // const toggleRightPane = () => {
  // dispatch(setFilter({ rightPaneOpen: !filtersValue.rightPaneOpen }));
  //     // setRightPaneOpen(!rightPaneOpen)
  // };

  function getPermission(chk) {
    let value;
    props.tabs.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  setTimeout(function () {
    window.dispatchEvent(new CustomEvent("resize"));
  }, 200);

  useEffect(() => {
    setVideoWallEnabled(getPermission("Video Analytics") == "ALL" && props.featureTabs.videoAnalytics);
  }, []);

  useEffect(() => {
    if (profilesRes.isSuccess) {
      if (
        profilesRes.data.payload.length &&
        props.tabs.find((t) => t.name == "Threshold Profiles") &&
        props.tabs.find((t) => t.name == "Threshold Profiles").permission ==
          "ALL"
      ) {
        setProfiles(true);
      }
    }
  }, [!profilesRes.isFetching]);

  const Components = props.actuators.length
    ? {
        "Aggregator Control Centre": <AggregatorControlCenter {...props} />,
        "Map View": <AggregatorMapView {...props} />,
        // "Alarms Dashboard": <AggregatorAlarms {...props} />,
        "Alarms Dashboard": <AlarmsDashboard serviceId={props.group} />,
        Rules: (
          <Rules
            id={props.group}
            fields={props.sensors}
            permission={getPermission("Rule Management")}
            controls={getPermission("Controlling")}
          />
        ),
        Automations: (
          <Controls
            id={props.group}
            actuators={props.actuators}
            history={props.history}
          />
        ),
      }
    : {
        "Aggregator Control Centre": <AggregatorControlCenter {...props} />,
        "Map View": <AggregatorMapView {...props} />,
        // "Alarms Dashboard": <AggregatorAlarms {...props} />,
        "Alarms Dashboard": <AlarmsDashboard serviceId={props.group} />,
        Rules: (
          <Rules
            id={props.group}
            fields={props.sensors}
            permission={getPermission("Rule Management")}
            controls={getPermission("Controlling")}
          />
        ),
      };

  function handleChangeTab(elm, i) {
    setSelectedTab(elm);
    setValue(i);
  }

  // function searchNodeParentChain(treeObj, id) {

  //     for (const elm of Object.keys(treeObj)) {

  //       if (treeObj[elm].id === id) {

  //         if (treeObj[elm].type === "device") {
  //           return {
  //             resultType: "DEVICE",
  //             result: treeObj[elm],
  //             parentChain: treeObj[elm].parentNodeIdsChain
  //           }
  //         }
  //         treeObj[elm].parentNodeIdsChain
  //         return treeObj[elm].parentNodeIdsChain
  //       }
  //       if (Object.keys(treeObj[elm].childGroups)?.length > 0) {

  //         const result = searchNodeParentChain(treeObj[elm].childGroups, id)
  //         if (result) {
  //           return result
  //         }
  //         else {
  //           continue
  //         }
  //       }
  //       else {
  //         continue
  //       }

  //     }

  //     return null

  //   }

  function handleClick(event, key) {
    // event.preventDefault();
    console.info("You clicked a breadcrumb.:", key);
    dispatch(setFilter(key == "0:All assets" ? {selectedNode: key, selectedNodeChain: [key], group: {name: 'All assets', id: ''}, expandedTreeView: [key], expanded: [key], selected: key.split(':')[1]} : { selectedNode: key }));
  }

  // const handleSelect = (event, nodeIds) => {

  //     setSelected(nodeIds);
  //     let tempArr = nodeIds.split(":");

  //     const nodeParentChain = searchNodeParentChain(filtersValue.globalTree, tempArr[0])

  //     if (nodeParentChain && nodeParentChain.resultType === "DEVICE") {
  //         props.history.push(`/solutions/${props.link}/${nodeParentChain.result.internalId}`);

  //         nodeIds !== "0:All assets" ?
  //             dispatch(setFilter({ selectedNodeChain: [...(nodeParentChain.parentChain), nodeIds] })) : dispatch(setFilter({ selectedNodeChain: [nodeIds] }))
  //         setSelectedId(tempArr[0]);
  //     }
  //     else if (nodeParentChain?.length >= 0) {
  //         nodeIds !== "0:All assets" ?
  //             dispatch(setFilter({ selectedNodeChain: [...nodeParentChain, nodeIds] })) : dispatch(setFilter({ selectedNodeChain: [nodeIds] }))
  //         setSelectedId(tempArr[0]);
  //         /* TEMPORARY CHANGE */
  //         // props.setGroup({
  //         //   id: tempArr[0] == "0" ? "" : tempArr[0],
  //         //   name: tempArr[1],
  //         // });
  //         if (groupIds.indexOf(tempArr[0]) == -1) {
  //             /* TEMPORARY CHANGE */
  //             // setGroup(tempArr[0]);
  //             setSkip(false);
  //         }

  //     }
  // };

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView();
  };

  // const breadcrumbs = [
  //     <Link underline="hover"
  //         key="1"
  //         color="inherit"
  //         href="/"
  //         onClick={handleClick}
  //     >
  //         Ireland
  //     </Link>,
  //     <Link
  //         underline="hover"
  //         key="2"
  //         color="inherit"
  //         href="/material-ui/getting-started/installation/"
  //         onClick={handleClick}
  //     >
  //         South
  //     </Link>,
  //     <Typography key="3" color="text.primary">
  //         Limerick
  //     </Typography>,
  // ];

  useEffect(() => {
    scrollToBottom();
  }, [value]);

  useEffect(() => {
    document.title = "Solution Dashboard";
  }, []);
  if (metaDataValue.groupPermissions[props.group] != "DISABLE") {
    actions.push({
      icon: <AccountTreeIcon />,
      name: "Groups",
      handleFn: () => {
        setOpenSpeedDial(false);
        dispatch(setFilter({ view: "2" }));
        // setRightPaneOpen(!rightPaneOpen)
        dispatch(
          setFilter({ rightPaneOpen: !filtersValue.rightPaneOpen })
        );

      },
    });
  }
  if (props?.actuators?.length > 0 &&
    getPermission("Controlling") == "ALL") {
    actions.push({
      icon: <ToggleOnIcon />,
      name: "Execute Control",
      handleFn: () => {
        setOpenSpeedDial(false);
        handlepopupOpen();

      },
    });
  }
  if (videoWallEnabled) {
    actions.push({
      icon: <DataThresholdingIcon />,
      name: "Apply Profile",
      handleFn: () => {
        setOpenSpeedDial(false);
        handleProfilePopup();
      },
    });
  }
  if (videoWallEnabled) {
    actions.push({
      icon: <VideoLibraryIcon />,
      name: "Video Wall",
      handleFn: () => {
        setOpenSpeedDial(false);
        props.history.push(`/solutions/${props.group}/video_wall`);
      },
    });
  }

  return (
    <Fragment>
      {/* permission check start */}
      {openPopup ? (
        <Popup
          execute
          actuators={props.actuators}
          setOpenPopup={setOpenPopup}
          id={props.group}
          global
        />
      ) : null}
      {profilePopup ? (
        <ProfilePopup
          setProfilePopup={handleProfilePopup}
          profiles={profilesRes?.data?.payload || []}
          id={props.group}
        />
      ) : null}
      {/* permission check end */}

      <span
        style={{
          display: "grid",
          gridGap: "10px",
          position: "fixed",
          bottom: "10px",
          right: "10px",
          zIndex: "100",
        }}
      >
              <SpeedDial
          ariaLabel="SpeedDial example"
          className={classes.speedDial}
          icon={<ArrowBackIosIcon />}
          FabProps={{
            color: "secondary",
          }}
          onClose={handleClose}
          onOpen={handleOpen}
          open={openSpeedDial}
          direction="left"
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              id={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={action.handleFn}
            />
          ))}
        </SpeedDial>
        {/* {
          videoWallEnabled ? 
            <Tooltip
                title="Video Wall"
                placement="top"
                arrow
                TransitionComponent={Zoom}
              >
              <Fab
                color="secondary"
                onClick={() => {
                  props.history.push(`/solutions/${props.group}/video_wall`);
                }}
              >
                <VideoLibraryIcon />
              </Fab>
            </Tooltip> : null
        } */}
        {/* {profiles ? (
          <Tooltip
            title="Apply Profile"
            placement="top"
            arrow
            TransitionComponent={Zoom}
          >
            <Fab
              style={{ boxShadow: "none" }}
              color="secondary"
              onClick={() => {
                handleProfilePopup();
              }}
            >
              <DataThresholdingIcon />
            </Fab>
          </Tooltip>
        ) : null} */}
        {/* permission check start */}
        {/* {props?.actuators?.length > 0 &&
        getPermission("Controlling") == "ALL" ? (
          <Tooltip
            title="Execute Control"
            placement="top"
            arrow
            TransitionComponent={Zoom}
          >
            <Fab
              color="secondary"
              onClick={() => {
                handlepopupOpen();
              }}
            >
              <ToggleOnIcon />
            </Fab>
          </Tooltip>
        ) : null} */}
        {/* permission check end */}

        {/* permission check metaData */}
        {/* {metaDataValue.groupPermissions[props.group] != "DISABLE" ? (
          <Tooltip
            title="Groups"
            placement="top"
            arrow
            TransitionComponent={Zoom}
          >
            <Fab
              color="secondary"
              onClick={() => {
                dispatch(setFilter({ view: "2" }));
                // setRightPaneOpen(!rightPaneOpen)
                dispatch(
                  setFilter({ rightPaneOpen: !filtersValue.rightPaneOpen })
                );
              }}
            >
              <AccountTreeIcon />
            </Fab>
          </Tooltip>
        ) : null} */}
      </span>

      <div ref={messagesEndRef} />
      {/* <div
        style={{
          // display:'none',
          backgroundColor: "white",
          height: "100%",
          width: "60px",
          position: "fixed",
          top: "60px",
          left: "0",
          boxShadow:
            "rgba(0, 0, 0, 0.3) 0px 19px 38px, rgba(0, 0, 0, 0.22) 0px 15px 12px",
          textAlign: "center",
        }}
      >
        {Array.map((elm, i) => (
          <Fragment>
            <Tooltip title={elm} arrow placement="right">
              <div
                style={{
                  margin: "3px",
                  borderLeft:
                    selectedTab == elm
                      ? `3px solid ${metaDataValue.branding.primaryColor}`
                      : "",
                  height: "60px",
                  cursor: "pointer",
                }}
                className={classes.hover}
                onClick={() => {
                  handleChangeTab(elm, i);
                }}
              >
                <FontAwesomeIcon
                  icon={tabIcons[elm]}
                  style={{
                    width: "22px",
                    height: "22px",
                    color:
                      selectedTab == elm
                        ? metaDataValue.branding.primaryColor
                        : "#6d6d6d",
                    marginTop: "20px",
                    marginBottom: "15px",
                  }}
                />
              </div>
            </Tooltip>
            <Divider />
          </Fragment>
        ))}
      </div> */}
      <div
        className={
          // filtersValue.rightPaneOpen ?
          filtersValue.rightPaneOpen
            ? "dashboardLeftWrap"
            : "dashboardLeftWrapExpand"
        }
      >
        <div className="pageTabsWrap">
          <ul>
            {props.actuators.length ? (
              <li
                onClick={() => {
                  handleChangeTab(Array[4], 4);
                }}
                className={selectedTab == Array[4] ? "active" : ""}
              >
                <ToggleOnIcon
                  style={{
                    width: "20px",
                    height: "20px",
                    color: " #6d6d6d",
                  }}
                />
                Automations
              </li>
            ) : null}
            {metaDataValue.apps.some(
              (app) => app.name == "Alarms Management"
            ) ? (
              <li
                onClick={() => {
                  handleChangeTab(Array[2], 2);
                }}
                className={selectedTab == Array[2] ? "active" : ""}
              >
                <FontAwesomeIcon
                  icon={faBell}
                  style={{
                    width: "20px",
                    height: "20px",
                    color: " #6d6d6d",
                  }}
                />
                Alarm
              </li>
            ) : null}
            <li
              onClick={() => {
                handleChangeTab(Array[3], 3);
              }}
              className={selectedTab == Array[3] ? "active" : ""}
            >
              <HandymanIcon
                style={{
                  width: "20px",
                  height: "20px",
                  color: " #6d6d6d",
                }}
              />
              Rules
            </li>
            <li
              onClick={() => {
                handleChangeTab(Array[1], 1);
              }}
              className={selectedTab == Array[1] ? "active" : ""}
            >
              <FontAwesomeIcon
                icon={faMapSigns}
                style={{
                  width: "22px",
                  height: "22px",
                  color: "#6d6d6d",
                }}
              />
              Assets
            </li>
            <li
              onClick={() => {
                handleChangeTab(Array[0], 0);
              }}
              className={selectedTab == Array[0] ? "active" : ""}
            >
              <FontAwesomeIcon
                icon={faToggleOn}
                style={{
                  width: "22px",
                  height: "22px",
                  color: "#6d6d6d",
                }}
              />
              Control Center
            </li>
          </ul>
        </div>
        {/* <div className="breadcrumbs">
                    <ul>
                        <li>Ireland 
                            <FontAwesomeIcon
                                icon={faAngleRight}
                                style={{
                                    width: "22px",
                                    height: "22px",
                                    color:"#6d6d6d",
                                    marginRight:'10px',
                                    marginLeft:'10px',
                                    cursor:'pointer'
                                }}
                            /></li>
                        <li>Ireland 
                            <FontAwesomeIcon
                                icon={faAngleRight}
                                style={{
                                    width: "22px",
                                    height: "22px",
                                    color:"#6d6d6d",
                                    marginRight:'10px',
                                    marginLeft:'10px',
                                    cursor:'pointer'
                                }}
                            /></li>
                        <li>Ireland 
                        <FontAwesomeIcon
                            icon={faAngleRight}
                            style={{
                                width: "22px",
                                height: "22px",
                                color:"#6d6d6d",
                                marginRight:'10px',
                                marginLeft:'10px',
                                cursor:'pointer'
                            }}/>
                            </li>
                    </ul>
                </div> */}
        <div className="breadcrumbs" style={{display:'flex', gap:'10px'}}>
          
            <AccountTreeIcon style={{color: 'rgba(0, 0, 0, 0.6)'}} />
            {!filtersValue.selectedNodeChain.includes("0:All assets") ? (
              <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
                <Link
                  underline="hover"
                  key={"0:All assets"}
                  color="inherit"
                  href="/"
                  onClick={(e) => {
                    e.preventDefault();
                    handleClick(e, "0:All assets");
                  }}
                   style={{color: 'rgba(0, 0, 0, 0.6)'}}
                >
                  All assets
                </Link>
                <NavigateNextIcon fontSize="small" style={{color: 'rgba(0, 0, 0, 0.6)'}} />
                </div>
              ) : null}
              <Breadcrumbs
            separator={<NavigateNextIcon fontSize="small" />}
            aria-label="breadcrumb"
          >
            {filtersValue.selectedNodeChain.map((chainItem, i) => {
              
              if (i !== filtersValue.selectedNodeChain.length - 1) {
                if (i === 0) {
                  return (
                    <Fragment>
                      {/* <Fragment>
                        <Link
                          underline="hover"
                          key={"0:All assets"}
                          color="inherit"
                          href="/"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick(e, "0:All assets");
                          }}
                        >
                          <AccountTreeIcon />
                        </Link>
                      </Fragment> */}

                      <Fragment>
                        <Link
                          underline="hover"
                          key={chainItem}
                          color="inherit"
                          href="/"
                          onClick={(e) => {
                            e.preventDefault();
                            handleClick(e, chainItem);
                          }}
                        >
                          {` ${chainItem.split(":")[1]}`}
                        </Link>
                      </Fragment>
                    </Fragment>
                  );
                } else {
                  return (
                    <Fragment>
                      <Link
                        underline="hover"
                        key={chainItem}
                        color="inherit"
                        href="/"
                        onClick={(e) => {
                          e.preventDefault();
                          handleClick(e, chainItem);
                        }}
                      >
                        {` ${chainItem.split(":")[1]}`}
                      </Link>
                    </Fragment>
                  );
                }
              } else {
                return (
                  <Fragment>
                    {/* {chainItem == "0:All assets" || i == 0 ? (
                      <AccountTreeIcon />
                    ) : null} */}
                    {/* {chainItem !== "0:All assets" && i == 0 ?
                                                <NavigateNextIcon fontSize="small" />
                                                : null} */}
                    {/* <Typography key={chainItem} color="text.primary">
                                                {` ${chainItem.split(":")[1]}`}
                                            </Typography> */}
                    <Link
                      underline="hover"
                      key={chainItem}
                      color="inherit"
                      href="/"
                      onClick={(e) => {
                        e.preventDefault();
                        handleClick(e, chainItem);
                      }}
                    >
                      {` ${chainItem.split(":")[1]}`}
                    </Link>
                  </Fragment>
                );
              }
            })}
          </Breadcrumbs>
        </div>
        <div className="DashboardTabsWrap">
          <Fragment>
            {Array.map((elm, i) => {
              return (
                <TabPanel value={value} index={i} key={i}>
                  <div>{Components[elm]}</div>
                </TabPanel>
              );
            })}
          </Fragment>
        </div>
      </div>
      <div
        className={
          filtersValue.rightPaneOpen
            ? "dashboardRightSideWrap"
            : "dashboardRightSideWrapCollapsed"
        }
      >
        <Filters
          sensors={props.sensors}
          id={props.group}
          history={props.history}
          link={props.link}
          serviceDashboard={true}
        />
      </div>
    </Fragment>
  );
}
