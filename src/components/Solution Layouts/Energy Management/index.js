//-----------------CORE---------------//
import React, { useState, Fragment, useEffect } from "react";
import Header from "./Header";
import AlarmsDashboard from "components/Alarms Dashboard";
import Dashboard from "./Dashboard";
import Dragable from "components/Dragable";
import Fab from "@mui/material/Fab";
// import InsightsIcon from "@mui/icons-material/Insights";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import Insights from "./Insights";
import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import Drawer from "@mui/material/Drawer";
import Tooltip from "@mui/material/Tooltip";
import { Zoom } from "@mui/material";
import DataThresholdingIcon from "@mui/icons-material/DataThresholding";
import Filters from "components/Solution Layouts/Default/Asset Views/Settings";
import AssetViews from "components/Solution Layouts/Default/Asset Views";
import ProfilePopup from "../Default/ProfilePopup";
import Rules from "../ESB/Solution Insights/Rules";
import Controls from "../ESB/Solution Insights/Controls";
import { useGetProfilesQuery } from "services/services";
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import SpeedDialAction from "@mui/material/SpeedDialAction";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

import { makeStyles } from "@mui/styles";
let tempMinutes = 2;

export default function ServiceDashboard(props) {
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



  /**
   * order of tabs is
   * 0 is for Actuator
   * 1 is for Roles if Actuator Exist else 0
   * 2 is for Alarms if Actuator exist and it won't be displayed if Permissions are not allowed
   * 3 is for asset views if both alarms and Actuators exist, if one exist it will be 2 , if None exist it will be 1
   * 4 is for Dashboard if both exist, if one exist it will be 3 , if none exist it will be 2
   */
  const [tab, setTab] = useState(props.actuators.length && 
    metaDataValue.apps.some((app)=>app.name=="Alarms Management")  ? 4 :props.actuators.length ||
    metaDataValue.apps.some((app)=>app.name=="Alarms Management")  ? 3: 2);
  const service = useSelector((state) =>
    state.metaData?.services.find((s) => s.id == props.group)
  );
  console.log({ service })
  const [cutoff, setCutoff] = React.useState(true);
  const [divideByPara, setDivideByPara] = React.useState('none');
  const [unit, setUnit] = useState(service.unit || "kWh");
  const [globalEnergy, setGlobalEnergy] = useState({ energy: 0, cost: 0 });
  const [cost, setCost] = useState(service.cost || "1.5");
  const [target, setTarget] = useState(
    service.target || { 1: "", 7: "", 30: "" }
  );
  const [refetch, setRefetch] = useState(false);
  const [minutes, setMinutes] = useState(tempMinutes);
  const [lastRefreshed, setLastRefreshed] = useState(new Date().getMinutes());
  const [intervalRef, setIntervalRef] = useState(null);
  const [openInsights, setOpenInsights] = useState(false);
  const [days, setDays] = useState(1);
  const [startDate, setStartDate] = useState(new Date(new Date().setHours(0, 0, 0, 0)))
  const [endDate, setEndDate] = useState(new Date())
  const [profilePopup, setProfilePopup] = useState(false)
  const [profiles, setProfiles] = useState(false)
  const [drawer, setDrawer] = useState(false);
  const filtersValue = useSelector((state) => state.filterDevice);
  let expanded = [...filtersValue.expanded];
  const groupFilter = (expanded)
  const [open, setOpen] = React.useState(true);
  const [videoWallEnabled, setVideoWallEnabled] = React.useState(false);


  const profilesRes = useGetProfilesQuery({
    token: window.localStorage.getItem("token"),
    param: service ? `?serviceId=${service.id}` : ``,
  }, { skip: !service });

  const toggleDrawer = () => {
    setDrawer(!drawer);
    dispatch(setFilter({ open: !filtersValue.open }));
  };

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
    setProfilePopup(!profilePopup)
  }

  useEffect(() => {
    if (profilesRes.isSuccess) {
      if (profilesRes.data.payload.length && service.tabs.find(t => t.name == "Threshold Profiles") && service.tabs.find(t => t.name == "Threshold Profiles").permission == "ALL") {
        setProfiles(true)
      }
    }
  }, [!profilesRes.isFetching])

  useEffect(() => {
    setVideoWallEnabled(getPermission("Video Analytics") == "ALL" && props.featureTabs.videoAnalytics);
  }, []);

  useEffect(() => {
    const timerRef = setInterval(() => {
      setRefetch(true);
      setLastRefreshed(new Date().getMinutes());
    }, 120000);
    const lastTimer = setInterval(() => {
      // let result = (new Date().getMinutes() - tempLastRefreshed) ? new Date().getMinutes() - tempLastRefreshed : 2
      // // let result = (new Date().getMinutes() - lastRefreshed) > 2 ? ((new Date().getMinutes() - tempLastRefreshed) || 2) : ((new Date().getMinutes() - lastRefreshed) || 2);
      // // if(result <= 0){
      // //   result = 1;
      // // }
      // if(tempLastRefreshed == 59){
      //   result = 1;
      // }
      // console.log({tempLastRefreshed})
      tempMinutes = tempMinutes - 1 ? tempMinutes - 1 : 2;
      setMinutes(tempMinutes);
    }, 60000);
    setIntervalRef(timerRef);
    if (service.group && service.group?.id) {
      dispatch(setFilter({ group: service.group }));
    }
    return () => {
      tempMinutes = 2;
      clearInterval(intervalRef);
      setRefetch(false);
    };
  }, []);
  actions.push({
    icon: <AccountTreeIcon />,
    name: "Groups",
    handleFn: () => {
      setOpenSpeedDial(false);
      dispatch(setFilter({ view: "2", open: true, expanded: groupFilter, expandedTreeView: ["0:All assets"] }));
      toggleDrawer();
    },
  });
  actions.push({
    icon: <EnergySavingsLeafIcon />,
    name: "Sustainability Insights",
    handleFn: () => {
      setOpenSpeedDial(false);
      setOpenInsights(true);
    },
  });
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
    <Fragment >
      {profilePopup ? (
        <ProfilePopup
          setProfilePopup={handleProfilePopup}
          profiles={profilesRes?.data?.payload || []}
          id={props.group}
        />
      ) : null}
      <Header
        setTab={setTab}
        setUnit={setUnit}
        unit={unit}
        days={days}
        setDays={setDays}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        tab={tab}
        lastRefreshed={lastRefreshed}
        minutes={minutes}
        cutoff={cutoff}
        setCutoff={setCutoff}
        divideByPara={divideByPara}
        setDivideByPara={setDivideByPara}
        service={service}
        actuators={props.actuators}
      />
      {tab == (props.actuators.length && metaDataValue.apps.some((app)=>app.name=="Alarms Management") ? 4 :props.actuators.length || metaDataValue.apps.some((app)=>app.name=="Alarms Management")? 3:2) ? 
      (
        <Dashboard
          unit={unit}
          sensors={props.sensors}
          configSensors={props.configSensors}
          permission={getPermission("Configuration")}
          days={days}
          startDate={startDate}
          endDate={endDate}
          serviceId={props.group}
          cost={cost}
          setCost={setCost}
          target={target}
          setTarget={setTarget}
          setGlobalEnergy={setGlobalEnergy}
          globalEnergy={globalEnergy}
          history={props.history}
          refetch={refetch}
          setRefetch={setRefetch}
          cutoff={cutoff}
          divideByPara={divideByPara}
          setDivideByPara={setDivideByPara}
        />
      ) : tab == (props.actuators.length ? 1 : 0) ? (

        <Rules
          id={props.group}
          fields={props.sensors}
          permission={getPermission("Rule Management")}
          controls={getPermission("Controlling")}
          em={true}
        />
      ) : tab == (props.actuators.length ? 2 : 1) && metaDataValue.apps.some((app)=>app.name=="Alarms Management")  ? (
        <AlarmsDashboard serviceId={props.group} />
      ) : tab == (props.actuators.length  && metaDataValue.apps.some((app)=>app.name=="Alarms Management") ? 3 : ( props.actuators.length || metaDataValue.apps.some((app)=>app.name=="Alarms Management") ? 2 : 1)) ? (
        <AssetViews
          image={props.assets[0].image}
          sensors={props.sensors}
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
          emDashboard={true}
        />
      ) : (
        props.actuators.length ? <Controls
          id={props.group}
          actuators={props.actuators}
          history={props.history}
          group={filtersValue.group.id}
        /> : null
      )}
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
        style={{ marginRight: '10px' }}
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
          <Dragable bottom={profiles ? "210px": "150px"} 
            right={"30px"} 
            name="video-wall">
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
            </Dragable> : null
        } */}
      {/* {
        profiles ? 
        <Dragable bottom={"90px"} right={"30px"} name="apply-template">
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
           : null
      } */}
      {/* <Dragable 
        bottom={profiles ? "150px": "90px"} 
        right={"30px"} 
        name="add-role"
      >
        <Tooltip title="Sustainability Insights" placement="top" arrow>
          <Fab
            style={{ boxShadow: "none" }}
            color="secondary"
            onClick={() => setOpenInsights(true)}
          >
            <EnergySavingsLeafIcon />
          </Fab>
        </Tooltip>
      </Dragable> */}
      {/* <Dragable bottom={"30px"} right={"30px"} name="service-group">
        <Tooltip title="Groups" placement="top" arrow>
          <Fab
            style={{ boxShadow: "none" }}
            color="secondary"
            onClick={() => {
              dispatch(setFilter({ view: "2", open: true, expanded: groupFilter, expandedTreeView: ["0:All assets"] }));
              toggleDrawer();
            }}
          >
            <AccountTreeIcon />
          </Fab>
        </Tooltip>
      </Dragable> */}
      <Insights
        open={openInsights}
        setOpen={setOpenInsights}
        days={days}
        unit={unit}
        globalEnergy={globalEnergy}
      />
      <Drawer anchor={"right"} open={drawer} onClose={toggleDrawer}>
        <Filters
          sensors={props.sensors}
          toggleDrawer={toggleDrawer}
          id={props.group}
          history={props.history}
          tab={tab}
          serviceDashboard={true}
        />
      </Drawer>
      {/* <Insights open={openInsights} setOpen={setOpenInsights} days={days} unit={unit} /> */}
    </Fragment>
  );
}
