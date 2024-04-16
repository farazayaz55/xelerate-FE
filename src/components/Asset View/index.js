//--------------CORE--------------//
import React, { useEffect, Fragment, useState, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Icon } from "@mui/material";
import NearMeOutlinedIcon from "@mui/icons-material/NearMeOutlined";
import VideoCameraBackOutlinedIcon from "@mui/icons-material/VideoCameraBackOutlined";
//--------------MUI--------------//
import { makeStyles } from "@mui/styles";
import Skeleton from "@mui/material/Skeleton";
import { Box, Typography } from "@mui/material";
import Tooltip from "@mui/material/Tooltip";
import Divider from "@mui/material/Divider";
import DesignServicesOutlinedIcon from "@mui/icons-material/DesignServicesOutlined";
import InsertInvitationOutlinedIcon from "@mui/icons-material/InsertInvitationOutlined";
import DocumentScannerOutlinedIcon from "@mui/icons-material/DocumentScannerOutlined";
import AvTimerOutlinedIcon from "@mui/icons-material/AvTimerOutlined";
import InsertChartOutlinedIcon from "@mui/icons-material/InsertChartOutlined";
import ToggleOnOutlinedIcon from "@mui/icons-material/ToggleOnOutlined";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import KeyboardReturnOutlinedIcon from "@mui/icons-material/KeyboardReturnOutlined";
// import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
//--------------EXTERNAL--------------//
import { useGetDevicesQuery } from "services/devices";
import Monitoring from "./Monitoring";
import Chart from "./Analytics";
import Alarms from "./Alarms";
import Events from "./Events";
import Controlling from "./Controlling";
import PM from "./Rule Management";
import Tracking from "./Tracking";
import Header from "./Header";
import Video from "./Video Analytics";
import { useSnackbar } from "notistack";
import SAPDigitalTwin from "./SAP-Digital Twin";
import DigitalTwin from "./DigitalTwin";
import Configuration from "./Configuration";
import Info from "./Info";
import History from "./History";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { getSocket } from "Utilities/socket";
import { setDevice, setVideoAnalyticsDate, setVideoAnalyticsSearchText } from "rtkSlices/assetSlice";
import emitter from "Utilities/events";
import "./sidebar.css";

let socket;

export default function Service(props) {
  const device = useSelector((state) => state.asset.device);
  console.log({ device })
  useEffect(() => {
    console.log({ props })
  }, [props])
  function getPermission(chk) {
    let value;
    props.tabs.forEach((elm) => {
      if (elm.name == chk) {
        value = elm.permission;
      }
    });
    return value;
  }

  let sensors =
    getPermission("Configuration") == "ALL"
      ? [...props.sensors, ...props.configSensors]
      : props.sensors;

  let actuators =
    getPermission("Configuration") == "ALL"
      ? [...props.actuators, ...props.configActuators]
      : props.actuators;

  const useStyles = makeStyles({
    hover: {
      "&:hover": {
        backgroundColor: "#eeeeee",
      },
    },
  });
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const videoAnalyticsDate = useSelector((state) => state.asset.videoAnalyticsDate);
  const videoAnalyticsSearchText = useSelector((state) => state.asset.videoAnalyticsSearchText);
  const service = metaDataValue.services.find(s => s.id == props.group)
  let token = window.localStorage.getItem("token");
  const { id, tabId } = useParams();
  const devices = useGetDevicesQuery({
    token,
    group: "",
    params: `&pageSize=1&currentPage=1&internalId=${id}&associatedGroupsPopulate=true${service.parentChildEnabled ? '&showParent=true&showChildren=true' : ''}`,
  });

  const history = useHistory();
  const { enqueueSnackbar } = useSnackbar();
  const classes = useStyles();
  const [value, setValue] = React.useState(0);
  const [assetType, setAssetType] = React.useState(null)
  // const [overflow, setOverflow] = React.useState({
  //   value: false,
  //   top: false,
  //   bottom: false,
  // });
  const [Array, setArray] = useState([]);
  const [selectedTab, setSelectedTab] = React.useState();
  const [loader, setLoader] = useState(true);
  const [tabsList, setTabsList] = useState([]);
  const [assetName, setAssetName] = useState("");
  const { t } = useTranslation();
  const [singleDevice, setSingleDevice] = useState({})
  async function initializeSocket(topics) {
    socket = await getSocket(topics);

    socket.on("realtime", (payload) => {
      let topic = payload.topic.substring(0, payload.topic.indexOf("__"));
      if (topic == "devices" && payload.message.realtimeAction == "UPDATE") {
        let final = payload.message.message;
        delete final.associatedGroups;
        dispatch(setDevice(payload.message.message));
      } else emitter.emit(`asset?${topic}`, payload.message);
    });
  }

  useEffect(() => {
    document.title = "Asset Dashboard";
    initializeSocket([`devices__${props.group}__${id}`]);
  }, []);

  useEffect(() => {
    if (!devices.isFetching && devices.isSuccess) {
      if (devices.data.payload.data.length) {
        dispatch(setDevice(devices.data.payload.data[0]));
        setSingleDevice(devices.data.payload.data[0])
        if (devices.data.payload.data[0].platformDeviceType) {
          setAssetType(service.assetMapping.find(a => a?.assetType?._id == devices.data.payload.data[0].platformDeviceType)?.assetType)
        }
        setLoader(false);
      }
    }
    if (devices.isError) {
      showSnackbar("Devices", devices.error?.data?.message, "error", 1000);
    }
  }, [devices.isFetching]);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  const tabIcons = {
    Monitoring: AvTimerOutlinedIcon,
    History: HistoryOutlinedIcon,
    Controlling: ToggleOnOutlinedIcon,
    Tracking: NearMeOutlinedIcon,
    Alarms: NotificationsActiveOutlinedIcon,
    Events: InsertInvitationOutlinedIcon,
    Analytics: InsertChartOutlinedIcon,
    "Rule Management": DesignServicesOutlinedIcon,
    Metadata: InfoOutlinedIcon,
    "Video Analytics": VideoCameraBackOutlinedIcon,
    "Digital Twin": DocumentScannerOutlinedIcon,
    BackIcon: KeyboardReturnOutlinedIcon,
    Configuration: SettingsOutlinedIcon,
  };

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

  function Analytics() {
    return <Chart sensors={sensors} id={id} group={props.group} />;
  }

  // const handleResize = () => {
  //   const isOverflow = ref.current.scrollHeight > ref.current.clientHeight;
  //   setOverflow((old) => {
  //     return { ...old, value: isOverflow };
  //   });
  // };

  useEffect(() => {
    // window.addEventListener("resize", handleResize);
    // const isOverflow = ref.current.scrollHeight > ref.current.clientHeight;
    // setOverflow((old) => {
    //   return { ...old, value: isOverflow };
    // });
    let arr = [];
    let tabList = {};
    console.log('props.tabs', props)
    props.tabs.forEach((tab) => {
      tabList[tab.name] = tab.permission;
      switch (tab.name) {
        case "Monitoring":
          if (sensors?.length > 0) {
            arr.push(tab.name);
          }
          break;

        case "History":
          if (sensors?.length > 0) {
            arr.push(tab.name);
          }
          break;

        case "Controlling":
          if (actuators?.length > 0) {
            arr.push(tab.name);
          }
          break;

        case "Analytics":
          if (sensors?.length > 0) {
            arr.push(tab.name);
          }
          break;

        case "Tracking":
          if (props.featureTabs.location) {
            arr.push(tab.name);
          }
          break;

        case "Rule Management":
          if (props.featureTabs.maintenance) {
            arr.push(tab.name);
          }
          break;

        case "Video Analytics":
          if (props.featureTabs.videoAnalytics) {
            arr.push(tab.name);
          }
          break;

        case "Digital Twin":
          if (
            props.featureTabs.digitalTwin.value &&
            (sensors?.length > 0 || actuators?.length > 0)
          ) {
            arr.push(tab.name);
          }
          break;

        case "Configuration":
          if (props?.configSensors || props?.configActuators) {
            arr.push(tab.name);
          }
          break;

        default:
          arr.push(tab.name);
          break;
      }
    });

    /* SORT THIS TABS ARRAY */
    // arr.push("Asset Info");
    setValue(parseInt(tabId) || 0);
    setSelectedTab(arr[parseInt(tabId) || 0]);
    setTabsList(tabList);
    setArray(arr);
    return () => {
      // window.removeEventListener("resize");
      // Socket().off('getreading')
    };
  }, []);

  useEffect(() => {
    return () => {
      dispatch(setVideoAnalyticsDate(new Date()));
      dispatch(setVideoAnalyticsSearchText(""));
    };
  }, [dispatch]);


  setTimeout(function () {
    window.dispatchEvent(new CustomEvent("resize"));
  }, 200);

  const Componenets = {
    Configuration: (
      <Configuration
        id={id}
        group={props.group}
        sensors={props.configSensors}
        actuators={props.configActuators}
        dataPointThresholds={
          metaDataValue.services.find((e) => e.id == props.group)
            ?.dataPointThresholds
        }
        permission={tabsList.Configuration}
      />
    ),
    Monitoring: (
      <Monitoring
        id={id}
        group={props.group}
        sensors={sensors.filter((e) => !(e.config))}
        dataPointThresholds={
          metaDataValue.services.find((e) => e.id == props.group)
            ?.dataPointThresholds
        }
        device={singleDevice}
        permission={tabsList.Monitoring}
        config={false}
      />
    ),
    Controlling: (
      <Controlling
        actuators={actuators.filter((e) => e.config != true)}
        id={id}
        serviceId={props.group}
        permission={tabsList.Controlling}
        service={props.group}
        device={singleDevice}
        config={false}
      />
    ),
    Alarms: (
      <Alarms
        mode={"device"}
        id={id}
        permission={tabsList.Alarms}
        serviceId={props.group}
        sensors={sensors}
      />
    ),
    Events: <Events id={id} serviceId={props.group} />,
    Analytics: <Analytics />,
    Tracking: (
      <Tracking
        sensors={sensors}
        id={id}
        permission={tabsList.Tracking}
        serviceId={props.group}
      />
    ),
    "Rule Management": (
      <PM
        fields={sensors}
        actuators={actuators}
        id={id}
        serviceId={props.group}
        permission={tabsList["Rule Management"]}
      />
    ),
    Metadata: (
      <Info
        asset={props.asset}
        assetName={assetName}
        id={id}
        group={props.group}
        permission={tabsList["Metadata"]}
        setAssetName={setAssetName}
      />
    ),
    History: <History sensors={sensors} id={id} device={devices?.data?.payload?.data[0]} service={props.group} />,
    "Video Analytics": <Video id={id} serviceId={props.group} videoAnalyticsDate={videoAnalyticsDate} videoAnalyticsSearchText={videoAnalyticsSearchText} />,
    "Digital Twin":
      props.dashboardView == 1 || (assetType && assetType.aqdt && (!device || !device.digitalTwinSvg)) ? (
        <SAPDigitalTwin
          actuators={actuators}
          sensors={sensors}
          serviceId={props.group}
          id={id}
          url={props.featureTabs.digitalTwin.svg}
          dataPointThresholds={
            metaDataValue.services.find((e) => e.id == props.group)
              ?.dataPointThresholds
          }
        />
      ) : (
        <DigitalTwin
          actuators={actuators}
          sensors={sensors}
          serviceId={props.group}
          id={id}
          url={props.featureTabs.digitalTwin.svg}
          dataPointThresholds={
            metaDataValue.services.find((e) => e.id == props.group)
              ?.dataPointThresholds
          }
          history={history}
          tabs={Array}
        />
      ),
  };

  function handleChangeTab(elm, i) {
    setSelectedTab(elm);
    setValue(i);
    history.push(`/solutions/${props.group}/${id}/${i}`);
  }

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current.scrollIntoView();
  };

  useEffect(() => {
    scrollToBottom();
  }, [value]);

  function handleShadow() {
    var content = document.querySelector(".content"),
      wrapper = document.querySelector(".wrapper"),
      shadowTop = document.querySelector(".shadow--top"),
      shadowBottom = document.querySelector(".shadow--bottom"),
      contentScrollHeight = content.scrollHeight - wrapper.offsetHeight;
    if (content.scrollHeight == wrapper.offsetHeight) {
      shadowTop.style.opacity = 0;
      shadowBottom.style.opacity = 0;
    } else {
      var currentScroll = content.scrollTop / contentScrollHeight;
      shadowTop.style.opacity = currentScroll;
      shadowBottom.style.opacity = 1 - currentScroll;
    }
  }

  useEffect(() => {
    document.querySelector(".content").addEventListener("scroll", handleShadow);
    window.addEventListener("resize", handleShadow);

    return () => {
      if (document.querySelector(".content")) {
        document
          .querySelector(".content")
          .removeEventListener("scroll", handleShadow);
      }
      window.removeEventListener("resize", handleShadow);
    };
  }, []);

  return (
    <Fragment>
      <div ref={messagesEndRef} />
      <div
        style={{
          backgroundColor: "white",
          width: "70px",
          position: "fixed",
          top: "80px",
          left: "20px",
          boxShadow: "0px 0px 8px rgba(46, 48, 57, 0.15)",
          borderRadius: "10px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            height: "calc(100vh - 100px)",
            overflow: "hidden",
            fontSize: "30px",
          }}
        >
          <div
            style={{
              height: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              cursor: "pointer",
            }}
            onClick={() => {
              history.push(`/solutions/${props.group}`);
            }}
          >
            <Icon component={tabIcons.BackIcon} />
          </div>
          <Divider />
          <div className="wrapper">
            <div className="content">
              <div className="shadow shadow--top"></div>
              <div className="shadow shadow--bottom"></div>
              {Array.map((elm, i) =>
                tabIcons[elm] ? (
                  <Fragment>
                    <Tooltip
                      title={elm == "Metadata" ? "Asset Info" : elm}
                      arrow
                      placement="right"
                    >
                      <div
                        key={elm}
                        id={elm}
                        style={{
                          margin: "7px 0",
                          backgroundColor:
                            selectedTab == elm
                              ? metaDataValue.branding.secondaryColor
                              : "white",
                          borderRadius: "8px",
                          height: "50px",
                          cursor: "pointer",
                          transition: "0.3s",
                        }}
                        className={classes.hover}
                        onClick={() => {
                          handleChangeTab(elm, i);
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Icon
                            sx={{
                              transition: "0.3s",
                              color: selectedTab == elm ? "white" : "",
                            }}
                            component={tabIcons[elm]}
                          />
                        </div>
                      </div>
                    </Tooltip>
                  </Fragment>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
      {loader ? (
        <div style={{ marginLeft: "150px" }}>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              margin: "25px 0",
            }}
          >
            <Skeleton variant="circular" width={60} height={60} />
            <Skeleton
              variant="rounded"
              sx={{ width: "25vw", height: "60px" }}
            />
          </span>
          <Skeleton
            variant="rounded"
            sx={{ width: "100%", height: "calc(100vh - 300px)" }}
          />
        </div>
      ) : (
        <Fragment>
          {Array.map((elm, i) => {
            return (
              <TabPanel value={value} index={i} key={i}>
                <div style={{ paddingLeft: "100px", marginTop: "-14px" }}>
                  <Header
                    group={props.group}
                    assetName={assetName}
                    id={id}
                    i={i}
                    layoutPermission={props.layout.map}
                  />
                  <div style={{ position: "relative", top: "35px", height: '72vh', overflow: elm == 'Controlling' ? 'auto' : 'hidden' }}>
                    {Componenets[elm]}
                  </div>
                </div>
              </TabPanel>
            );
          })}
        </Fragment>
      )
      }
    </Fragment >
  );
}
