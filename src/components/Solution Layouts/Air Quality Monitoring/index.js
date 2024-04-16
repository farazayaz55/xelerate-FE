//-----------------CORE---------------//
import React, { useState, Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
//-----------------MUI---------------//
import Drawer from "@mui/material/Drawer";
import Tooltip from "@mui/material/Tooltip";
import Fab from "@mui/material/Fab";
import Zoom from "@mui/material/Zoom";
//-----------------MUI ICON---------------//
import TimelineIcon from "@mui/icons-material/Timeline";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
//-----------------EXTERNAL---------------//
import Popup from "components/Asset View/Controlling/Scheduler/Popup";
import KPI from "./KPI";
import VideoWall from "./Video Wall";

import Connectivity from "./Connectivity";
import Health from "./Health";
import AssetCard from "./Asset Info";
import SolutionInsights from "./Solution Insights";
import Analytics from "../Default/Trend Monitor";
import AssetViews from "../Default/Asset Views";
import GroupInfo from "./Group Info";
import Filters from "../Default/Asset Views/Settings";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import { useSelector, useDispatch } from "react-redux";
import { getSocket } from "Utilities/socket";
import emitter from "Utilities/events";
import ProfilePopup from "../Default/ProfilePopup";
import Dragable from "components/Dragable";
import { useGetProfilesQuery } from "services/services";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import KpiIcon from "../../../assets/icons/kpiicon.png";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import { makeStyles } from "@mui/styles";

let socket;

export default function ServiceDashboard(props) {
  const dispatch = useDispatch();

  const [openSpeedDial, setOpenSpeedDial] = React.useState(false);

  let actions = [];

  const handleClose = () => {
    setOpenSpeedDial(false);
  };

  const handleOpen = () => {
    setOpenSpeedDial(true);
  };

  const kpiData = localStorage.getItem("kpiData")
    ? JSON.parse(localStorage.getItem("kpiData"))
    : [];

  const ind = kpiData.findIndex((k) => k.serviceId == props.group);
  const metaDataValue = useSelector((state) => state.metaData);
  console.log({ props });
  console.log({ metaDataValue });
  const [openPopup, setOpenPopup] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [open, setOpen] = React.useState(false);
  const [fullScreenModeOpen, setFullScreenModeOpen] = React.useState(false);
  const [profilePopup, setProfilePopup] = useState(false);
  const [profiles, setProfiles] = useState(false);
  const service = metaDataValue.services.find((s) => s.id == props.group);
  const [videoWallEnabled, setVideoWallEnabled] = React.useState(false);
  const [refectAlarms, setRefetchAlarms] = React.useState(false)

  const useStyles = makeStyles((theme) => ({
    speedDial: {
      position: "absolute",
      bottom: "30px",
      right: "-33px",
      zIndex: theme.zIndex.speedDial,
    },
  }));
  const classes = useStyles();

  function chkGroup() {
    let permission = metaDataValue.services
      .find((s) => s.id == props.group)
      .tabs.find((tab) => tab.name == "Video Analytics")?.permission;
    return permission || "DISABLE";
  }

  const profilesRes = useGetProfilesQuery(
    {
      token: window.localStorage.getItem("token"),
      param: service ? `?serviceId=${service.id}` : ``,
    },
    { skip: !service }
  );
  const [kpiPopup, setKpiPopup] = React.useState(false);
  let sensors =
    getPermission("Configuration") == "ALL"
      ? [...props.sensors, ...props.configSensors]
      : props.sensors;
  console.log("sensors coming: ", sensors);
  let actuators =
    getPermission("Configuration") == "ALL"
      ? [...props.actuators, ...props.configActuators]
      : props.actuators;

  useEffect(() => {
    setVideoWallEnabled(
      getPermission("Video Analytics") == "ALL" &&
      props.featureTabs.videoAnalytics
    );
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
  actions.push({
    icon: <img src={KpiIcon} style={{ width: "30px", height: "30px" }} />,
    name: "KPIs",
    handleFn: () => {
      setOpenSpeedDial(false);
      props.history.push(`/solutions/${props.group}/kpi`);
    },
  });

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

  if (
    props?.actuators?.length > 0 &&
    getPermission("Controlling") == "ALL" &&
    actuators.length
  ) {
    actions.push({
      icon: <ToggleOnIcon />,
      name: "Execute Control",
      handleFn: () => {
        setOpenSpeedDial(false);
        handlepopupOpen();
      },
    });
  }


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

  async function initializeSocket(topics) {
    socket = await getSocket(topics);

    socket.on("realtime", (payload) => {
      let topic = payload.topic.substring(0, payload.topic.indexOf("__"));
      console.log("test -----------: topic: ", topic);
      console.log("test -----------: payload.message: ", payload.message);
      emitter.emit(`solution?${topic}`, payload.message);
    });
  }
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
    if (ind == -1 || !kpiData[ind].serviceDashboard) {
      if (service.group && service.group?.id) {
        dispatch(setFilter({ group: service.group }));
        changeKpiFilters(service.group);
      } else {
        dispatch(setFilter({ group: { name: "All assets", id: "" } }));
        changeKpiFilters({ name: "All assets", id: "" });
      }
    }
    return () => {
      const tempKpiData = [...kpiData];
      if (tempKpiData[ind]?.serviceDashboard !== undefined) {
        tempKpiData[ind].serviceDashboard = false;
      }
      localStorage.setItem("kpiData", JSON.stringify(tempKpiData));
    };
  }, []);

  function changeKpiFilters(group = undefined, filter = undefined) {
    const ind = kpiData.findIndex((k) => k.serviceId == props.group);
    if (ind != -1) {
      const tempKpiData = [...kpiData];
      tempKpiData[ind] = {
        ...tempKpiData[ind],
        filter: group ? { ...filtersValue, group } : filter,
      };
      localStorage.setItem("kpiData", JSON.stringify(tempKpiData));
    }
  }

  useEffect(() => {
    changeKpiFilters(null, filtersValue);
  }, [JSON.stringify(filtersValue)]);

  const handleProfilePopup = () => {
    setProfilePopup(!profilePopup);
  };

  const handleOpenKPIPopup = () => {
    setKpiPopup(!kpiPopup);
  };

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
          profiles={profilesRes?.data?.payload || []}
          id={props.group}
        />
      ) : null}
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
        {/* {videoWallEnabled ? (
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
        ) : null} */}

        {/* <Tooltip title="KPIs" placement="top" arrow TransitionComponent={Zoom}>
          <Fab
            color="secondary"
            onClick={() => {
              props.history.push(`/solutions/${props.group}/kpi`);
            }}
          >
            <img src={KpiIcon} style={{ width: "30px", height: "30px" }} />
          </Fab>
        </Tooltip> */}
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
        {/* {props?.actuators?.length > 0 &&
        getPermission("Controlling") == "ALL" &&
        actuators.length ? (
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
                dispatch(setFilter({ view: "2", open: true }));
                toggleDrawer();
              }}
            >
              <AccountTreeIcon />
            </Fab>
          </Tooltip>
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
        }}
      >
        <span
          style={{
            display: "flex",
            gap: "20px",
            marginBottom: "20px",
            width: "100%",
            display: open || fullScreenModeOpen ? "none" : "inherit",
          }}
        >
          <AssetCard
            asset={props.assets[0]}
            id={props.group}
            service={service}
            toggleDrawer={toggleDrawer}
          />

          {getPermission("Alarms") ? <Health id={props.group} refetch={refectAlarms} setRefetch={setRefetchAlarms} /> : null}
          <Connectivity id={props.group} />
          <span
            style={{
              width: "100%",
              height: "170px",
            }}
          >
            <Analytics
              title={t("Trend Monitor (last 24 hours)")}
              sensors={sensors}
              configSensors={props.configSensors}
              icon={TimelineIcon}
              dataPointThresholds={props.dataPointThresholds}
              id={props.group}
              height={240}
              permission={getPermission("Configuration")}
              aq={true}
            />
          </span>
        </span>
        <span
          style={{
            display: !open ? "flex" : "",
            gap: "20px",
            flexDirection:
              window.localStorage.getItem("Language") == "ar"
                ? "row-reverse"
                : "row",
            width: "100%",
            height: open || fullScreenModeOpen ? "100%" : "calc(100% - 350px)",
          }}
        >
          <span
            style={{
              display: fullScreenModeOpen ? "none" : "flex",
              gap: "20px",
              flexDirection:
                window.localStorage.getItem("Language") == "ar"
                  ? "row-reverse"
                  : "row",
              width: open ? "100%" : "calc(100% - 900px)",
              minWidth: open ? "100%" : "900px",
              height:
                open || fullScreenModeOpen ? "100%" : "calc(100% - 350px)",
            }}
          >
            <AssetViews
              image={props.assets[0]?.image}
              sensors={sensors}
              group={props.group}
              asset={props.assets[0]}
              history={props.history}
              link={props.link}
              toggleDrawer={toggleDrawer}
              alarms={getPermission("Alarms")}
              tracking={getPermission("Tracking")}
              dataPointThresholds={props.dataPointThresholds}
              layout={props.layout}
              open={open}
              setOpen={setOpen}
              minHeight={450}
              height={370}
              aq
            />
          </span>
          <span
            style={{
              height: !fullScreenModeOpen ? "calc(100vh - 370px)" : "100%",
              minWidth: "550px",
              width: "100%",
              minWidth: "500px",
            }}
          >
            <span
              style={{
                display: open || fullScreenModeOpen ? "none" : "grid",
              }}
            >
              <GroupInfo
                service={props.group}
                toggleDrawer={toggleDrawer}
                sensors={sensors}
                dataPointThresholds={props.dataPointThresholds}
              />
            </span>
            {getPermission("Alarms") ||
              getPermission("Rule Management") ||
              getPermission("Controlling") ? (
              <span
                style={{
                  display: open ? "none" : "grid",
                  height: fullScreenModeOpen ? "100%" : "auto",
                }}
              >
                <SolutionInsights
                  title={t("Solution Insights")}
                  id={props.group}
                  history={props.history}
                  sensors={sensors}
                  actuators={actuators}
                  alarms={getPermission("Alarms")}
                  rules={getPermission("Rule Management")}
                  controls={getPermission("Controlling")}
                  fullScreenModeOpen={fullScreenModeOpen}
                  setFullScreenModeOpen={setFullScreenModeOpen}
                  service={service}
                  setRefetch={setRefetchAlarms}
                />
              </span>
            ) : null}
          </span>
        </span>
      </div>
    </Fragment>
  );
}
