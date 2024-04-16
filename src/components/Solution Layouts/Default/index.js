//-----------------CORE---------------//
import React, { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
//-----------------MUI---------------//
import Drawer from "@mui/material/Drawer";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
//-----------------MUI-ICON---------------//
import TimelineIcon from "@mui/icons-material/Timeline";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
//-----------------EXTERNAL---------------//
import Popup from "components/Asset View/Controlling/Scheduler/Popup";
import Connectivity from "./Connectivity";
import Health from "./Health";
import AssetCard from "./Asset Info";
import SolutionInsights from "./Solution Insights";
import Analytics from "./Trend Monitor";
import AssetViews from "./Asset Views";
import Filters from "./Asset Views/Settings";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import { useSelector, useDispatch } from "react-redux";
import Dragable from "components/Dragable";
import { getSocket } from "Utilities/socket";
import emitter from "Utilities/events";
import ProfilePopup from "./ProfilePopup";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";
import { useGetProfilesQuery } from "services/services";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import { makeStyles } from "@mui/styles";
import GetAppIcon from "@mui/icons-material/GetApp";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { Grid } from "@mui/material";

let socket;
let stopRealtime = false;

export default function ServiceDashboard(props) {
  const useStyles = makeStyles((theme) => ({
    speedDial: {
      right: '-22px',
      bottom: '30px',
      position: 'fixed',
      zIndex: theme.zIndex.speedDial,
    },
  }));
  const classes = useStyles();

  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const [openPopup, setOpenPopup] = useState(false);
  const [profiles, setProfiles] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [open, setOpen] = React.useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const service = metaDataValue.services.find((s) => s.id == props.group);
  const [videoWallEnabled, setVideoWallEnabled] = React.useState(false);
  const [openSpeedDial, setOpenSpeedDial] = React.useState(false);
  const [fullScreenModeOpen, setFullScreenModeOpen] = React.useState(false);
  const [refetchAlarms, setRefetchAlarms] = React.useState(false)


  let actions = [];

  const handleClose = () => {
    setOpenSpeedDial(false);
  };

  const handleOpen = () => {
    setOpenSpeedDial(true);
  };
  let sensors =
    getPermission("Configuration") == "ALL"
      ? [...props.sensors, ...props.configSensors]
      : props.sensors;

  let actuators =
    getPermission("Configuration") == "ALL"
      ? [...props.actuators, ...props.configActuators]
      : props.actuators;

  const profilesRes = useGetProfilesQuery(
    {
      token: window.localStorage.getItem("token"),
      param: service ? `?serviceId=${service.id}` : ``,
    },
    { skip: !service }
  );

  async function initializeSocket(topics) {
    socket = await getSocket(topics);

    socket.on("realtime", (payload) => {
      if (!stopRealtime) {
        let topic = payload.topic.substring(0, payload.topic.indexOf("__"));
        emitter.emit(`solution?${topic}`, payload.message);
      }
    });
  }

  useEffect(() => {
    if (
      filtersValue.measurement != "" ||
      filtersValue.connection != "" ||
      filtersValue.metaTags != "" ||
      filtersValue.alarms.length ||
      filtersValue.group.id != ""
    ) {
      stopRealtime = true;
    } else {
      stopRealtime = false;
    }

    return () => {
      stopRealtime = false;
    };
  }, [filtersValue]);

  useEffect(() => {
    setVideoWallEnabled(
      getPermission("Video Analytics") == "ALL" &&
      props.featureTabs.videoAnalytics
    );
  }, []);

  useEffect(() => {
    document.title = "Solution Dashboard";
    initializeSocket([
      `alarms__${props.group}`,
      `devices__${props.group}`,
      `analyticsAggregation-${sensors[0].name}__${props.group}`,
      `deviceDashboardHealth__${props.group}`,
      `deviceDashboardConnectivity__${props.group}`,
      `deviceDashboardAssetCount__${props.group}`,
    ]);
    if (service.group && service.group?.id) {
      dispatch(setFilter({ group: service.group }));
    }
  }, []);

  useEffect(() => {
    if (profilesRes.isSuccess) {
      if (
        profilesRes.data.payload.length &&
        service.tabs.find((t) => t.name == "Threshold Profiles") &&
        service.tabs.find((t) => t.name == "Threshold Profiles").permission ==
        "ALL"
      ) {
        setProfiles(true);
      }
    }
  }, [!profilesRes.isFetching]);

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const { t } = useTranslation();

  const toggleDrawer = () => {
    setDrawer(!drawer);
    dispatch(setFilter({ open: !filtersValue.open }));
  };

  function chkGroup() {
    let tab;
    let admin = metaDataValue.apps.find((m) => m.name == "Administration");
    if (admin) tab = admin.tabs.find((m) => m.name == "Group Management");
    if (tab) return true;
    else return false;
  }

  function getPermission(chk) {
    let value;
    props.tabs.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  const handleProfilePopup = () => {
    setProfilePopup(!profilePopup);
  };
  if (metaDataValue.groupPermissions[props.group] != "DISABLE") {
    actions.push({
      icon: <AccountTreeIcon />,
      name: "Groups",
      handleFn: () => {
        setOpenSpeedDial(false);
        dispatch(setFilter({ view: "2", open: true }));
        toggleDrawer();
      },
    });
  }
  if (profiles) {
    actions.push({
      icon: <DataThresholdingIcon />,
      name: "Apply Profile",
      handleFn: () => {
        setOpenSpeedDial(false);
        handleProfilePopup();
      },
    });
  }
  if (
    props?.actuators?.length > 0 &&
    getPermission("Controlling") == "ALL" &&
    actuators.length
  ) {
    actions.push({
      icon: <ToggleOnIcon />,
      name: "Execute Control",
      handleFn: () => {
        handlepopupOpen();
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
      {openPopup ? (
        <Popup
          actuators={actuators}
          setOpenPopup={setOpenPopup}
          id={props.group}
          group={filtersValue.group.id}
          global
          execute
        />
      ) : null}
      {profilePopup ? (
        <ProfilePopup
          setProfilePopup={handleProfilePopup}
          id={props.group}
          profiles={profilesRes?.data?.payload || []}
        />
      ) : null}
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
        {/* {videoWallEnabled ? (
          <Dragable
            bottom={
              props?.actuators?.length > 0 &&
              getPermission("Video Analytics") == "ALL"
                ? "240px"
                : "170px"
            }
            right={"30px"}
            name="video-wall"
          >
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
            </Tooltip>
          </Dragable>
        ) : null}
        {profiles ? (
          <Dragable
            bottom={
              props?.actuators?.length > 0 &&
              getPermission("Controlling") == "ALL" &&
              actuators.length
                ? "170px"
                : "100px"
            }
            right={"30px"}
            name="execute-control"
          >
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
          </Dragable>
        ) : null} */}
        {/* {props?.actuators?.length > 0 &&
        getPermission("Controlling") == "ALL" &&
        actuators.length ? (
          <Dragable bottom={"30px"} right={"30px"} name="execute-control">
            <Tooltip
              title="Execute Control"
              placement="top"
              arrow
              TransitionComponent={Zoom}
            >
              <Fab
                style={{ boxShadow: "none" }}
                color="secondary"
                onClick={() => {
                  handlepopupOpen();
                }}
              >
                <ToggleOnIcon />
              </Fab>
            </Tooltip>
          </Dragable>
        ) : null} */}
        {/* 
        {metaDataValue.groupPermissions[props.group] != "DISABLE" ? (
          <Dragable
            bottom={
              props?.actuators?.length > 0 &&
              getPermission("Controlling") == "ALL" &&
              actuators.length
                ? "100px"
                : "30px"
            }
            right={"30px"}
            name="service-group"
          >
            <Tooltip
              title="Groups"
              placement="top"
              arrow
              TransitionComponent={Zoom}
            >
              <Fab
                style={{ boxShadow: "none" }}
                color="secondary"
                onClick={() => {
                  dispatch(setFilter({ view: "2", open: true }));
                  toggleDrawer();
                }}
              >
                <AccountTreeIcon />
              </Fab>
            </Tooltip>
          </Dragable>
        ) : null} */}
      </span>

      <Drawer anchor={"right"} open={drawer} onClose={toggleDrawer}>
        <Filters
          sensors={sensors}
          toggleDrawer={toggleDrawer}
          id={props.group}
          history={props.history}
          serviceDashboard={true}
        />
      </Drawer>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: !fullScreenModeOpen ? "calc(100vh - 100px)" : "100%",
          overflowY: "auto",
          // padding: "0 10px",
        }}
      >
        <div
          style={{
            gap: "20px",
            marginBottom: "20px",
            width: "100%",
            display: open || fullScreenModeOpen ? "none" : "flex",
          }}
        >
          <AssetCard
            asset={props.assets[0]}
            id={props.group}
            service={service}
            toggleDrawer={toggleDrawer}
          />
          <Connectivity id={props.group} />
          {getPermission("Alarms") ? <Health id={props.group} refetch={refetchAlarms} setRefetch={setRefetchAlarms}/> : null}

          <span
            style={{
              width: "100%",
              height: "150px",
            }}
          >
            <Analytics
              title={t("Trend Monitor (last 24 hours)")}
              permission={getPermission("Configuration")}
              sensors={sensors}
              configSensors={props.configSensors}
              icon={TimelineIcon}
              dataPointThresholds={props.dataPointThresholds}
              height={240}
              id={props.group}
            />
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: "20px",
            flexDirection:
              window.localStorage.getItem("Language") == "ar"
                ? "row-reverse"
                : "row",
            width: open?"100%":'auto',
            height: open || fullScreenModeOpen ? "100%" : "calc(100% - 350px)",
          }}
        >
{    !fullScreenModeOpen &&      <AssetViews
            image={props.assets[0].image}
            sensors={sensors}
            configSensors={props.configSensors}
            group={props.group}
            asset={props.assets[0]}
            history={props.history}
            link={props.link}
            toggleDrawer={toggleDrawer}
            alarms={getPermission("Alarms")}
            tracking={getPermission("Tracking")}
            controls={getPermission("Controlling")}
            config={getPermission("Configuration")}
            dataPointThresholds={props.dataPointThresholds}
            layout={props.layout}
            actuators={actuators}
            open={open}
            setOpen={setOpen}
            minHeight={300}
            height={361}
          />}
          {getPermission("Alarms") ||
          getPermission("Rule Management") ||
          getPermission("Controlling") ? (
            <div
              style={{
                width:fullScreenModeOpen? "100%":'40%',
                direction: "ltr",
                height: fullScreenModeOpen ? "100%" : "auto",
                display: open ? "none" : "grid",
              }}
            >
              <SolutionInsights
                title={t("Solution Insights")}
                id={props.group}
                history={props.history}
                sensors={sensors}
                configSensors={props.configSensors}
                actuators={actuators}
                alarms={getPermission("Alarms")}
                rules={getPermission("Rule Management")}
                controls={getPermission("Controlling")}
                config={getPermission("Configuration")}
                fullScreenModeOpen={fullScreenModeOpen}
                setFullScreenModeOpen={setFullScreenModeOpen}
                service={service}
                setRefetch={setRefetchAlarms}
              />
            </div>
          ) : null}
        </div>
      </div>
    </Fragment>
  );
}
