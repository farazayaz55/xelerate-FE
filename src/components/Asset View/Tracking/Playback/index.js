import React, { useRef, useEffect, useState, Fragment } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import Button from "@mui/material/Button";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import hexRgb from "hex-rgb";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Tooltip from "@mui/material/Tooltip";
import Loader from "components/Progress";
import Fab from "@mui/material/Fab";
import { useSelector } from "react-redux";
import { useGetEventsQuery } from "services/events";
import CircularProgress from "@mui/material/CircularProgress";
import { useSnackbar } from "notistack";
import { makeStyles } from "@mui/styles";
import Drawer from "@mui/material/Drawer";
import EventNoteIcon from "@mui/icons-material/EventNote";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import Datapoint from "./Datapoints";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActiveOutlined";

import {
  CircleMode,
  DragCircleMode,
  DirectMode,
  SimpleSelectMode,
} from "mapbox-gl-draw-circle";
import Slider from "@mui/material/Slider";
import "./playback.css";
import axios from "axios";
import keys from "Keys";
import NearMeIcon from "@mui/icons-material/NearMe";
import {
  AutoSizer,
  List,
  CellMeasurerCache,
  CellMeasurer,
} from "react-virtualized";
import { generateDot } from "Utilities/mapbox";
import Dragable from "components/Dragable";
import { useGetAlarmsQuery } from "services/alarms";
import FmdBadIcon from '@mui/icons-material/FmdBad';
import { NotificationsActiveOutlined } from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { tooltipClasses } from "@mui/material/Tooltip";
import { Typography } from "antd";
import { Zoom } from "@mui/material";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: "100%",
    fontSize: theme.typography.pxToRem(16),
    border: '1px solid #dadde9',
  },
    [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: "#f5f5f9"
  }
}));

var StaticMode = require("@mapbox/mapbox-gl-draw-static-mode");

mapboxgl.accessToken =
  "pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA";
var eventsList;
let zoomLevel = 25;
let speedObject = {
  "1x": 1000,
  "2x": 750,
  "4x": 250,
  "8x": 125,
  "16x": 65,
};
let cache = [];
let stop = false;
let speedConst = "1x";
let pauseIndex = 0;
let totalDocs = 0;
let chk = true;
let Locations;
let tempPause = false;
let maxPage = 0;
let currentEvent;
let eventNo = 0;
let hoverEvent = false;
let hovertimeout;
let popupPause = false;
let startingPointEvent = 0;
export default function App(props) {
  const useStyles = makeStyles({
    button: {
      borderColor: "rgba(0, 0, 0, 0.9)",
      color: "rgba(255, 255, 255, 0.5)",
      width: "29px",
      height: "29px",
      backgroundColor: "#ffffff",
      borderColor: "rgba(0, 0, 0, 0.9)",
      borderRadius: "4px 4px 4px 4px",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      boxShadow:
        "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px, rgba(60, 64, 67, 0.15) 0px 1px 3px 1px",
      "&:hover": {
        backgroundColor: "#eeeeee",
        cursor: "pointer",
      },
    },
  });
  const geofenceList = useSelector((state) => state.asset.geofence);
  const classes = useStyles();
  const eventCache = React.useRef(
    new CellMeasurerCache({
      fixedWidth: true,
      defaultHeight: 100,
    })
  );
  const listInnerRef = useRef();
  let token = window.localStorage.getItem("token");
  const device = useSelector((state) => state.asset.device);
  let liveLoc = [[device.location.longitude, device.location.latitude]];
  const [sensorLoader, setSensorLoader] = useState(false);
  const [allDatapoints, setAllDatapoints] = useState({});
  const metaDataValue = useSelector((state) => state.metaData);
  const playbackDatapoints = useSelector((state) => state.playbackDatapoints);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [noData, setNoData] = useState(false);
  const [hovered, setHovered] = useState("");
  const [fullScreen, setFullScreen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState([]);
  const [datapoints, setDatapoints] = useState("");
  // const [hoveredTime, setHoveredTime] = useState('')
  const [openPopup, setOpenPopup] = React.useState(false);
  const [pause, setPause] = React.useState(true);
  const [maxEvent, setMaxEvent] = React.useState(20);
  const [speed, setSpeed] = React.useState(1);
  const [restart, setRestart] = useState(false);
  const [progress, setProgress] = useState(0);
  const [startTime, setStartTime] = React.useState(
    new Date(new Date().setDate(new Date().getDate() - 1))
  );
  const [eventDrawer, setEventDrawer] = useState(false);
  const [dateError, setDateError] = useState("");
  const [drag, setDrag] = React.useState(false);
  const [loader, setLoader] = React.useState(false);
  const [endTime, setEndTime] = React.useState(new Date());
  const [dateFrom, setDateFrom] = React.useState("");
  const [dateTo, setDateTo] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [events, setEvents] = React.useState([]);
  const [scrollToIndex, setScrollToIndex] = React.useState(0);
  const [playbackTime, setPlaybackTime] = React.useState("");
  const [zoom, setZoom] = useState(25);
  const [alarmsList, setAlarmsList] = useState([]);
  const [eventsWithMarkers, setEventsWithMarkers] = useState([]);
  const sensors = device.esbMetaData && device.esbMetaData.datapoints && device.esbMetaData.datapoints.length ? props.sensors.filter(s=>device.esbMetaData.datapoints.includes(s.name)) : props.sensors;
  const [alarmsCount, setAlarmsCount] = useState(0)
  const playbackEvents = useGetEventsQuery(
    {
      token,
      params: `?select={"c8y_Position":1,"time":1,"_id":1}&pageSize=1000&currentPage=${page}&withTotalPages=true&dateFrom=${dateFrom}&dateTo=${dateTo}&source=${props.id}&reverse=true`,
    },
    { skip: !dateFrom }
  );
  const [markers, setMarkers] = useState([])

  let color = metaDataValue.branding.secondaryColor;
  let rgb = hexRgb(metaDataValue.branding.secondaryColor);

  const formatDate = (date) => {
    const d = new Date(date);
    if(!Number.isNaN(d.getTime())){
      return d.toISOString()
    } else {
      return d
    }
  }

  const alarms = useGetAlarmsQuery({
    token,
    params: `?pageSize=1000&currentPage=1&withTotalPages=true&dateFrom=${formatDate(dateFrom)}&dateTo=${formatDate(dateTo)}&source=${props.id}&ruleId=${props?.rule?._id}&reverse=true`,
  }, 
  { skip: (!props?.rule?._id)}
  )

   function isJsonString(str) {
    let out;
    try {
      out = JSON.parse(str);
    } catch (e) {
      return str;
    }
    return out;
  }

  function gnerateDescription(text) {
    if (typeof text == "object")
      return (
        <Fragment>
          <span>
            <p>
              <b style={{ color: "grey" }}>Reason: </b>
            </p>
            <p>
              {text.reason ||
                (text?.sensorFriendlyName
                  ? `${text.sensorFriendlyName} (value: ${text.reading}) - `
                  : "") +
                  (` is ${text.condition} ` +
                    (text?.threshold ? `- ${text.threshold}` : ""))}
            </p>
          </span>
          <span>
            <span
              style={{
                display: "flex",
                gap: "5px",
              }}
            >
              {text.sendEmail || (text?.actions && text.actions?.length) ? (
                <p>
                  <b style={{ color: "grey" }}>Actions: </b>
                </p>
              ) : null}
              {text.sendEmail ? (
                <Tooltip
                  title={
                    <span>
                      <p>Email(s) sent to</p>
                      {text.emails.map((e) => (
                        <p>○ {e}</p>
                      ))}
                    </span>
                  }
                  placement="top"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <ForwardToInboxIcon
                    style={{ height: "17px", width: "17px" }}
                  />
                </Tooltip>
              ) : null}
            </span>

            {text?.actions && text.actions?.length ? (
              <Fragment>
                {text.actions.length == 1 ? (
                  <p>
                    Actuation triggered:{" "}
                    {text.actuatorNames &&
                      text.actuatorNames[text.actions[0]?.actuatorId]}{" "}
                    → {text.actions[0]?.commandLabel}
                  </p>
                ) : (
                  <Tooltip
                    title={
                      <span>
                        {text.actions.map((e) => (
                          <p>
                            {text.actuatorNames &&
                              text.actuatorNames[e.actuatorId]}{" "}
                            → {e.commandLabel}
                          </p>
                        ))}
                      </span>
                    }
                    placement="top"
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <p style={{ cursor: "pointer" }}>
                      Multiple Actuation(s) triggered
                    </p>
                  </Tooltip>
                )}
              </Fragment>
            ) : null}
          </span>
        </Fragment>
      );
    else return text;
  }

  useEffect(() => {
    if (alarms.isFetching) {
      setEventsWithMarkers([])
      props.setLoading(true)
    }
    if (!alarms.isFetching && !events.length){
      props.setLoading(false)
    }
    if(alarms.isSuccess) {
      props.setLoading(false)
      markers.forEach((marker) => {
        marker.marker.remove()
      })
      let newMarkers = []
      setEventsWithMarkers([])
      if(alarms?.data?.payload?.data?.length > 0){
        alarms?.data?.payload?.data.forEach((alarm) => {
          if(alarm.locations.length > 0) {
            alarm.locations.forEach((loc) => {
              const newMarker = new mapboxgl.Marker({
                color: alarm.severity === "CRITICAL" ? "#e8413e" : alarm.severity === "MAJOR" ? "#844204" : alarm.severity === "MINOR" ? "#fb9107" : "#288deb",
              }).setLngLat([loc.lng, loc.lat])
              .setPopup(new mapboxgl.Popup({ closeButton : false, closeOnClick: false})
              .setHTML(`<div>${new Date(loc.timeStamp).toLocaleDateString("en-GB")} ${new Date(loc.timeStamp).toLocaleTimeString()}</div>`))
              newMarkers.push({timestamp: loc.timeStamp, marker: newMarker, alarm, id: Math.round((Math.pow(36, 25 + 1) - Math.random() * Math.pow(36, 25))).toString(36).slice(1)})
            })
          }
        })
      }
      setMarkers(newMarkers)
      if(!newMarkers.length) {
        props.setLoading(false)
      }
    }
  }, [alarms.isSuccess, alarms.isFetching])

  useEffect(() => {
    fillEventsWithMarkers()
  }, [markers, events])

  useEffect(() => {
    if(markers.length ){
      let count = 0
      markers.forEach((marker) => {
        if(new Date(marker.timestamp) <= new Date(playbackTime)){
          marker.marker.addTo(map.current)
          const markerDiv = marker.marker.getElement()
          markerDiv.addEventListener('mouseenter', () => marker.marker.togglePopup());
          markerDiv.addEventListener('mouseleave', () => marker.marker.togglePopup());
          markerDiv.addEventListener("click", () => {              
              toggleDrawer(true)
              handlePause(false);
              if(eventsWithMarkers.length){
                eventsWithMarkers.forEach((event, i) => {
                  if(event?.marker){
                    if(event.marker.id === marker.id){
                      setScrollToIndex(i)
                    }
                  }
                })
              }
          })
          count ++

          map.current.on("click", (e) => {
            const target = e.originalEvent.target;
            const markerWasClicked = markerDiv.contains(target);

            if (markerWasClicked) {
              marker.marker.togglePopup();
            }
          })
        } else {
          marker.marker.remove()
        }
      })
      setAlarmsCount(count)
    }
  }, [playbackTime])

  const fillEventsWithMarkers = () => {
    let newEventsWithMarkers = Array.from(events)
    let eventsLength = events.length
      markers.forEach((marker) => {
        for(let i=0; i<events.length; i++){
          if(new Date(marker.timestamp) <= new Date(events[i].time)){
            if(new Date(marker.timestamp).toLocaleDateString("en-GB") == new Date(events[i].time).toLocaleDateString("en-GB") && new Date(marker.timestamp).toLocaleTimeString() == new Date(events[i].time).toLocaleTimeString()){
              newEventsWithMarkers[i + newEventsWithMarkers.length- eventsLength] = {...events[i], marker}
              return  
            } else {
              const newEntry = {
                _id: marker.id,
                c8y_Position: {
                  lng: marker.marker.getLngLat().lng,
                  lat: marker.marker.getLngLat().lat
                }, 
                time: marker.timestamp,
                marker
              }
              newEventsWithMarkers = [
                ...newEventsWithMarkers.slice(0, i),
                newEntry,
                ...newEventsWithMarkers.slice(i)
              ]
              return
            }
            // if(new Date(marker.timestamp) < new Date(newEventsWithMarkers[i].time)){
            //   newEventsWithMarkers[i-1] = {...newEventsWithMarkers[i-1], marker}
            //   return
            // }
          }
        }
      })
      console.log({newEventsWithMarkers})
      const filtered = newEventsWithMarkers.filter((event) => event?.marker && event)
      console.log({filtered})
      setEventsWithMarkers(newEventsWithMarkers)
    }

  // useEffect(() => {
  //   if(playbackEvents.isSuccess) {
  //     if(events.length !== playbackEvents?.data?.payload.totalDocuments ){
  //       props.setLoading(true)
  //     }
  //   }

  //   if (markers.length && props.loading) {
  //     const newEventsWithMarkers = fillEventsWithMarkers()

  //     setEventsWithMarkers((prevState) => {
  //       if(JSON.stringify(newEventsWithMarkers) == JSON.stringify(prevState)){
  //         props.setLoading(false)
  //         return prevState
  //       } else {
  //         return newEventsWithMarkers
  //       }
  //     })
  //   }

  //   //   const foundEvents = eventsWithMarkers.filter((event) => event?.marker)
  //   //   if(foundEvents.length === markers.length){
  //   //     props.setLoading(false)
  //   //   } else {
  //   //     fillEventsWithMarkers()
  //   //   }
  //   // }
  // }, [markers, events, eventsWithMarkers])

  useEffect(() => {
    if(playbackEvents.isFetching && props.rule) {
      props.setLoading(true)
    }
    if(playbackEvents?.data?.payload?.totalDocuments === events.length){
      props.setLoading(false)
    } 
  }, [events, playbackEvents.isFetching, playbackEvents.isSuccess])

  function _onScrollToRowChange(val) {
    let tempScrollToIndex = Math.min(events.length - 1, parseInt(val, 10));

    if (isNaN(scrollToIndex)) {
      tempScrollToIndex = undefined;
    }

    setScrollToIndex(parseInt(tempScrollToIndex) + 5);
  }

  const { enqueueSnackbar } = useSnackbar();

  const handleChange = (newValue) => {
    setStartTime(newValue);
  };

  const handleChange2 = (newValue) => {
    setEndTime(newValue);
  };

  useEffect(() => {
    if (props.open) {
      setOpenPopup(true);
      popupPause = pause;
      if (cache.length) {
        handlePause(false);
      }
    }
  }, [props]);

  useEffect(() => {
    props.setPlaybackTime({
      start: new Date(new Date().setDate(new Date().getDate() - 1)),
      end: new Date(),
    });
    Locations = [...liveLoc];
    return () => {
      cache = [];
      stop = false;
      speedConst = "1x";
      pauseIndex = 0;
      totalDocs = 0;
      chk = true;
    };
  }, []);

  const handlepopupOpen = () => {
    if (!loader) {
      setOpenPopup(true);
    }
  };

  const handlepopupClose = () => {
    if (cache.length) {
      handlePause(!popupPause);
    }
    props.setOpen(false);
    setOpenPopup(false);
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  const progressChange = (value) => {
    if (document.getElementsByClassName("hover-progress")[0]) {
      document.getElementsByClassName("hover-progress")[0].style.display =
        "none";
    }
    setProgress(value);
    eventNo = Math.floor((totalDocs * value) / 100);
    _onScrollToRowChange(eventNo);
    maxPage = eventNo / 1000;
    // handlePause()
    stop = true;
    setPause(true);
    setLoader(true);
    toggleLoading(true);
    setTimeout(() => {
      if (cache.length < eventNo) {
        setDrag(true);
        // toggleLoading(true)
        // setLoader(true)
      } else {
        setTimeout(() => {
          toggleLoading(false);
          setLoader(false);
          pauseIndex = eventNo;
          updateMap(pauseIndex);
          stop = false;
          startSending(pauseIndex);
          setPause(false);
        }, 1200);
      }
    }, 500);
  };

  function delay(n) {
    return new Promise(function (resolve) {
      setTimeout(() => {
        resolve();
      }, n);
    });
  }

  async function startSending(index) {
    for (let i = index; i < cache.length; i++) {
      receivePlayback({ payload: cache[i], index: i });
      if (((i + 1) / totalDocs) * 100 < 100 && i == cache.length - 1)
        setRestart(true);
      setProgress(((i + 1) / totalDocs) * 100);
      setPlaybackTime(cache[i].time);
      currentEvent = cache[i];
      await delay(speedObject[speedConst]);
      if (stop) {
        pauseIndex = i + 1;
        break;
      }
    }
  }

  // function LinearProgressWithLabel(props) {
  //   return (
  //     <Box sx={{ display: "flex", alignItems: "center" }}>
  //       <Box sx={{ minWidth: "200px", margin: "3px" }}>
  //         <p style={{ color: "grey", fontSize: "14px" }}>
  //           {`${new Date(playbackTime).toLocaleDateString('en-GB')}  ${new Date(
  //             playbackTime
  //           ).toLocaleTimeString()} - (${Math.round(props.value)}%)`}
  //         </p>
  //       </Box>
  //       <Box sx={{ width: "100%" }}>
  //         <LinearProgress
  //           variant="determinate"
  //           {...props}
  //           style={{ height: "13px", borderRadius: "20px" }}
  //         />
  //       </Box>
  //     </Box>
  //   );
  // }

  function chkError() {
    var one_day = 1000 * 60 * 60 * 24;
    var startDate = new Date(startTime);
    var endDate = new Date(endTime);
    var diff = Math.ceil((endDate.getTime() - startDate.getTime()) / one_day);
    if (diff > 7) {
      setDateError("Please select date range within 7 days.");
      return;
    } else {
      setDateError("");
    }
  }

  const resetMarkers = () => {
    props.resetRule()
    setEventsWithMarkers([])
    markers.forEach((marker) => {
      marker.marker.remove()
    })
    setMarkers([])
    props.setLoading(false)
  }

  async function startPlayback() {
    // connector.emit("start");
    if(alarms.isSuccess){
      resetMarkers()
    }
    setEvents([])
    chkError();
    setPause(false);
    setDateError("");
    let time1 = new Date(startTime.setSeconds(0)).toISOString();
    let time2 = new Date(endTime.setSeconds(0)).toISOString();
    props.setPlaybackTime({
      start: new Date(time1),
      end: new Date(time2),
    });
    cache = [];
    stop = true;
    pauseIndex = 0;
    chk = true;
    setDateTo(time2);
    setDateFrom(time1);
    setLoader(true);
    toggleLoading(true);
    setPage(1);
    handlepopupClose();
  }

  useEffect(() => {
    let totalPages;
    if (!playbackEvents.isFetching && playbackEvents.isSuccess) {
      if (!hoverEvent && document.getElementById("trackbar")) {
        var elem = document.createElement("div");
        elem.style.cssText = "display:none";
        elem.classList.add("hover-progress");
        document.getElementById("trackbar").appendChild(elem);
        document
          .getElementById("trackbar")
          .addEventListener("mousemove", (e) => {
            if (cache.length) {
              let hoverElement = document.getElementsByClassName(
                "hover-progress"
              )[0];
              let currentEvent = Math.floor(
                (e.offsetX * 100) /
                  document.getElementById("trackbar").offsetWidth
              );
              let time = Math.floor((totalDocs * currentEvent) / 100);
              if (e.path && !e.path[0].className.includes("thumb")) {
                if (hovertimeout) {
                  clearTimeout(hovertimeout);
                }
                hoverElement.style.display = "block";
                hoverElement.style.position = "absolute";
                hoverElement.style.top = "-25px";
                hoverElement.style.width = "85px";
                hoverElement.style.left = `calc(${e.offsetX}px - 42.5px)`;
                hoverElement.innerHTML = "Loading ...";
                if (cache.length > time) {
                  let tempTime = cache[time]?.time;
                  if (!isNaN(new Date(tempTime))) {
                    // setHoveredTime(cache[time]?.time);
                    hoverElement.innerHTML =
                      new Date(tempTime).toLocaleDateString("en-GB") +
                      " " +
                      new Date(tempTime).toLocaleTimeString();
                    hoverElement.style.width = "125px";
                    hoverElement.style.left = `calc(${e.offsetX}px - 62.5px)`;
                  } else {
                    hoverElement.style.display = "none";
                  }
                } else {
                  hovertimeout = setTimeout(async () => {
                    setHovered(time);
                    const headers = {
                      "Content-Type": "application/json",
                      "x-access-token": token,
                    };
                    axios
                      .get(
                        `${keys.baseUrl}/events/get/?select={"time":1,"_id":1}&pageSize=1&currentPage=${time}&dateFrom=${dateFrom}&dateTo=${dateTo}&source=${props.id}&reverse=true`,
                        { headers }
                      )
                      .then((response) => {
                        let respTime = response.data.payload.data[0].time;
                        hoverElement.innerHTML =
                          new Date(respTime).toLocaleDateString("en-GB") +
                          " " +
                          new Date(respTime).toLocaleTimeString();
                        hoverElement.style.width = "125px";
                        hoverElement.style.left = `calc(${e.offsetX}px - 62.5px)`;
                      });
                  }, 2000);
                }
              } else {
                props.setLoading(false)
                document.getElementsByClassName(
                  "hover-progress"
                )[0].style.display = "none";
              }
            }
          });
        document
          .getElementById("trackbar")
          .addEventListener("mouseleave", (e) => {
            document.getElementsByClassName("hover-progress")[0].style.display =
              "none";
          });
      }
      hoverEvent = true;
      // hovered = '';
      setHovered("");
      totalPages = playbackEvents.data.payload.totalPages;
      let newCache = [];
      let oldIndex = cache.length - 1;
      totalDocs = playbackEvents.data.payload.totalDocuments;
      newCache = [...cache, ...playbackEvents.data.payload.data];
      setEvents([...events, ...playbackEvents.data.payload.data]);
      fillEventsWithMarkers()
      if (newCache.length < 1) {
        setNoData(true);
        showSnackbar("Playback", "No location data found", "info", 1000);
        setPause(true);
      } else {
        setNoData(false);
      }
      cache = newCache;
      if (drag && page >= maxPage) {
        updateMap();
        setLoader(false);
        stop = false;
        setPause(false);
        startSending(eventNo);
        setDrag(false);
        toggleLoading(false);
      }
      if (chk) {
        chk = false;
        stop = false;
        setLoader(false);
        toggleLoading(false);
        startSending(0);
      }
      if (restart) {
        startSending(oldIndex);
        setRestart(false);
      }
      if (page != totalPages && totalPages != 0) {
        setPage(page + 1);
      }
    }
    return () => {
      hoverEvent = false;
    };
  }, [playbackEvents.isFetching]);

  const draw = new MapboxDraw({
    styles: [
      {
        id: "gl-draw-polygon-fill-inactive",
        type: "fill",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Polygon"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "fill-color": "#3bb2d0",
          "fill-outline-color": "#3bb2d0",
          "fill-opacity": 0.1,
        },
      },
      {
        id: "gl-draw-polygon-fill-active",
        type: "fill",
        filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
        paint: {
          "fill-color": "#fbb03b",
          "fill-outline-color": "#fbb03b",
          "fill-opacity": 0.1,
        },
      },
      {
        id: "gl-draw-polygon-midpoint",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
        paint: {
          "circle-radius": 3,
          "circle-color": "#fbb03b",
        },
      },
      {
        id: "gl-draw-polygon-stroke-inactive",
        type: "line",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Polygon"],
          ["!=", "mode", "static"],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#3bb2d0",
          "line-width": 2,
        },
      },
      {
        id: "gl-draw-polygon-stroke-active",
        type: "line",
        filter: ["all", ["==", "active", "true"], ["==", "$type", "Polygon"]],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#fbb03b",
          "line-dasharray": [0.2, 2],
          "line-width": 2,
        },
      },
      {
        id: "gl-draw-line-inactive",
        type: "line",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "LineString"],
          ["!=", "mode", "static"],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#3bb2d0",
          "line-width": 2,
        },
      },
      {
        id: "gl-draw-line-active",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["==", "active", "true"],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#fbb03b",
          "line-dasharray": [0.2, 2],
          "line-width": 2,
        },
      },
      {
        id: "gl-draw-polygon-and-line-vertex-stroke-inactive",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 5,
          "circle-color": "#fff",
        },
      },
      {
        id: "gl-draw-polygon-and-line-vertex-inactive",
        type: "circle",
        filter: [
          "all",
          ["==", "meta", "vertex"],
          ["==", "$type", "Point"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 3,
          "circle-color": "#fbb03b",
        },
      },
      {
        id: "gl-draw-point-point-stroke-inactive",
        type: "circle",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 5,
          "circle-opacity": 1,
          "circle-color": "#fff",
        },
      },
      {
        id: "gl-draw-point-inactive",
        type: "circle",
        filter: [
          "all",
          ["==", "active", "false"],
          ["==", "$type", "Point"],
          ["==", "meta", "feature"],
          ["!=", "mode", "static"],
        ],
        paint: {
          "circle-radius": 3,
          "circle-color": "#3bb2d0",
        },
      },
      {
        id: "gl-draw-point-stroke-active",
        type: "circle",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["==", "active", "true"],
          ["!=", "meta", "midpoint"],
        ],
        paint: {
          "circle-radius": 7,
          "circle-color": "#fff",
        },
      },
      {
        id: "gl-draw-point-active",
        type: "circle",
        filter: [
          "all",
          ["==", "$type", "Point"],
          ["!=", "meta", "midpoint"],
          ["==", "active", "true"],
        ],
        paint: {
          "circle-radius": 5,
          "circle-color": "#fbb03b",
        },
      },
      {
        id: "gl-draw-polygon-fill-static",
        type: "fill",
        filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
        paint: {
          "fill-color": "#3bb2d0",
          "fill-outline-color": "#3bb2d0",
          "fill-opacity": 0.1,
        },
      },
      {
        id: "gl-draw-polygon-stroke-static",
        type: "line",
        filter: ["all", ["==", "mode", "static"], ["==", "$type", "Polygon"]],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#3bb2d0",
          "line-width": 2,
        },
      },
      {
        id: "gl-draw-line-static",
        type: "line",
        filter: [
          "all",
          ["==", "mode", "static"],
          ["==", "$type", "LineString"],
        ],
        layout: {
          "line-cap": "round",
          "line-join": "round",
        },
        paint: {
          "line-color": "#3bb2d0",
          "line-width": 2,
        },
      },
      {
        id: "gl-draw-point-static",
        type: "circle",
        filter: ["all", ["==", "mode", "static"], ["==", "$type", "Point"]],
        paint: {
          "circle-radius": 5,
          "circle-color": "#3bb2d0",
        },
      },
      {
        id: "gl-draw-polygon-color-picker",
        type: "fill",
        filter: ["all", ["==", "$type", "Polygon"], ["has", "user_portColor"]],
        paint: {
          "fill-color": ["get", "user_portColor"],
          "fill-outline-color": ["get", "user_portColor"],
          "fill-opacity": 0.5,
        },
      },
      {
        id: "gl-draw-line-color-picker",
        type: "line",
        filter: [
          "all",
          ["==", "$type", "LineString"],
          ["has", "user_portColor"],
        ],
        paint: {
          "line-color": ["get", "user_portColor"],
          "line-width": 2,
        },
      },
      {
        id: "gl-draw-point-color-picker",
        type: "circle",
        filter: ["all", ["==", "$type", "Point"], ["has", "user_portColor"]],
        paint: {
          "circle-radius": 3,
          "circle-color": ["get", "user_portColor"],
        },
      },
    ],
    displayControlsDefault: false,
    userProperties: true,
    modes: {
      ...MapboxDraw.modes,
      draw_circle: CircleMode,
      drag_circle: DragCircleMode,
      direct_select: DirectMode,
      simple_select: SimpleSelectMode,
      static: StaticMode,
    },
  });

  // useEffect(() => {
  //   return () => {
  //     connector.removeAllListeners();
  //   };
  // }, []);

  const onScroll = () => {
    if (listInnerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = listInnerRef.current;
      if (scrollTop + clientHeight === scrollHeight) {
        setMaxEvent(events.slice(startingPointEvent, maxEvent).length + 20);
      }
    }
  };

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: liveLoc.length > 0 ? liveLoc[liveLoc.length - 1] : [1, 1],
      zoom: zoom,
    });

    return () => {
      stop = true;
      cache = [];
      Locations = [];
      map.current.remove();
      // setPause(false);
    };
  }, []);

  function receivePlayback(payload) {
    {
      if (payload.payload?.c8y_Position) {
        let elm = payload.payload.c8y_Position;
        let loc = [elm.lng, elm.lat];
        if (
          elm.lng <= 180 &&
          elm.lng >= -180 &&
          elm.lat <= 90 &&
          elm.lat >= -90
        ) {
          if (payload.index == 0) Locations = [];
          Locations.push(loc);
          if (map.current.getSource("final"))
            map.current.getSource("final").setData({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  properties: {
                    id: elm.internalId,
                  },
                  geometry: {
                    type: "Point",
                    coordinates: loc,
                  },
                },
              ],
            });

          if (map.current.getSource("line"))
            map.current.getSource("line").setData({
              type: "FeatureCollection",
              features: [
                {
                  type: "Feature",
                  geometry: {
                    type: "LineString",
                    coordinates: Locations,
                  },
                },
              ],
            });
        } else {
          showSnackbar("Location", `Invalid co-ordinates`, "error", 1000);
        }
        if (!inBounds(loc, map.current.getBounds())) {
          zoomLevel = zoomLevel - 1;
          map.current.flyTo({
            center: loc,
            zoom: zoomLevel,
          });
        }
      }
    }
  }

  function addGeofences(geofence) {
    draw.deleteAll();

    geofence.forEach((loc) => {
      if (loc.region.type == "Polygon") {
        draw.add({
          id: loc._id,
          type: "Feature",
          properties: {
            name: loc.name,
            address: loc.address,
            global: loc?.global,
            color: loc?.global
              ? metaDataValue.branding.secondaryColor
              : "#636564",
          },
          geometry: {
            type: "Polygon",
            coordinates: loc.region.coordinates,
          },
        });
      } else if (loc.region.type == "Circle") {
        draw.add({
          id: loc._id,
          type: "Feature",
          properties: {
            name: loc.name,
            address: loc.address,
            global: loc?.global,
            color: loc?.global
              ? metaDataValue.branding.secondaryColor
              : "#636564",
            isCircle: true,
            center: loc.center,
            radiusInKm: loc.radius,
          },
          geometry: {
            type: "Polygon",
            coordinates: loc.region.coordinates,
          },
        });
      }
    });
  }

  function updateMap(len = undefined) {
    let finalLoc;
    let loc = [];
    let elm;
    for (let i = 0; len ? i < len + 1 : i < cache.length; i++) {
      elm = cache[i]?.c8y_Position;
      if (elm) {
        loc.push([elm.lng, elm.lat]);
        if (len ? i == len : i == cache.length - 1) {
          finalLoc = [elm.lng, elm.lat];
        }
      }
    }
    Locations = loc;
    if (map.current.getSource("final"))
      map.current.getSource("final").setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            // properties: {
            //   id: elm.internalId,
            // },
            geometry: {
              type: "Point",
              coordinates: finalLoc,
            },
          },
        ],
      });

    if (map.current.getSource("line"))
      map.current.getSource("line").setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: Locations,
            },
          },
        ],
      });
    if (!inBounds(finalLoc, map.current.getBounds())) {
      zoomLevel = zoomLevel - 1;
      map.current.flyTo({
        center: finalLoc,
        zoom: zoomLevel,
      });
    }
  }

  useEffect(() => {
    if (!map.current) return; //
    map.current.addControl(new mapboxgl.FullscreenControl());
    map.current.addControl(new mapboxgl.NavigationControl());
    map.current.addControl(draw);

    // connector.on("start", () => {
    //   setPause(false);
    // });

    // connector.on("cancel", () => {
    //   setPause(true);
    // });

    map.current.on("resize", (e) => {
      if (document.getElementById("duration")) {
        document.getElementById(
          "duration"
        ).style.display = !document.getElementById("duration").style.display
          ? "none"
          : "";
      }
    });

    map.current.on("zoomend", (e) => {
      zoomLevel = map.current.getZoom();
    });

    map.current.on("load", function () {
      if (props.permission != "ALL") draw.changeMode("static");

      addGeofences(geofenceList);
    });

    var geojson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: liveLoc[liveLoc.length - 1],
          },
        },
      ],
    };

    var geojson2 = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: liveLoc[liveLoc.length - 1], // icon position [lng, lat]
          },
        },
      ],
    };

    map.current.on("load", function () {
      map.current.addImage(
        "pulsing-dot",
        generateDot(
          `rgba(${rgb.red},${rgb.green},${rgb.blue},`,
          color,
          80,
          map.current
        ),
        { pixelRatio: 2 }
      );
      map.current.addSource("line", {
        type: "geojson",
        data: geojson,
      });

      map.current.addSource("final", {
        type: "geojson",
        data: geojson2,
      });

      map.current.addLayer({
        id: "pulsing-dot",
        type: "symbol",
        source: "final",
        layout: {
          "icon-image": "pulsing-dot",
        },
      });

      map.current.addLayer(
        {
          id: "line-animation",
          type: "line",
          source: "line",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": metaDataValue.branding.secondaryColor,
            "line-width": 5,
            "line-opacity": 0.5,
          },
        },
        "pulsing-dot"
      );
    });
  }, []);

  function inBounds(point, bounds) {
    var lng = (point[0] - bounds._ne.lng) * (point[0] - bounds._sw.lng) < 0;
    var lat = (point[1] - bounds._ne.lat) * (point[1] - bounds._sw.lat) < 0;
    return lng && lat;
  }

  function handlePause(tempPause = undefined) {
    if (!loader) {
      if (cache.length < 1) {
        startPlayback();
      } else {
        if (tempPause != undefined ? tempPause == false : pause == false) {
          stop = true;
        } else {
          stop = false;
          startSending(pauseIndex);
        }
        setPause(tempPause != undefined ? !tempPause : !pause);
      }
    }
  }

  function toggleLoading(load) {
    props.setEventLoading(load);
    document.getElementsByTagName("canvas")[0].style.opacity = load
      ? "0.3"
      : "1";
    document.getElementsByClassName(
      "mapboxgl-ctrl-top-right"
    )[0].style.opacity = load ? "0.3" : "1";
    document.getElementsByClassName(
      "mapboxgl-ctrl-fullscreen"
    )[0].disabled = load;
    document.getElementsByClassName("mapboxgl-ctrl-zoom-in")[0].disabled = load;
    document.getElementsByClassName(
      "mapboxgl-ctrl-zoom-out"
    )[0].disabled = load;
    document.getElementsByClassName("mapboxgl-ctrl-compass")[0].disabled = load;
  }

  function handleRestart() {
    if (!loader) {
      stop = true;
      setLoader(true);
      toggleLoading(true);
      setTimeout(() => {
        stop = false;
        setLoader(false);
        toggleLoading(false);
        setPause(false);
        startSending(0);
      }, 1000);
    }
  }

  function handleSpeed() {
    if (!loader) {
      let spd;
      if (speed < 16) {
        spd = speed * 2;
        setSpeed(speed * 2);
      } else {
        spd = 1;
        setSpeed(1);
      }
      speedConst = `${spd}x`;
    }
  }

  // function calculatePosition(time) {
  //   const totalDateTimeRange = new Date(dateTo).getTime() - new Date(dateFrom).getTime();
  //   const dateTimeElapsed = new Date(time).getTime() - new Date(dateFrom).getTime();
  //   console.log({totalDateTimeRange, dateTimeElapsed})
  //   const percentage = (dateTimeElapsed / totalDateTimeRange);

  //   console.log(percentage)

  //   return percentage
  // }

  // const showTooltip = (e, e2) =>{
  //   setClicked(false)
  //   document.getElementById("events-list").addEventListener("click", (e) => {
  //     if (window.location.pathname.includes(props.id)) {
  //       if (e.target.id != `event-${selectedEventElem}`) {
  //         if(document.getElementById(`event-${selectedEventElem}`) && document.getElementById(`event-${selectedEventElem}`).style.display == 'block'){
  //           setClicked(true)
  //           document.getElementById(`event-${selectedEventElem}`).style.display = 'none';
  //         }
  //       }
  //     }
  //   });
  //   if(document.getElementById(`event-${selectedEvent?._id}`)){
  //     document.getElementById(`event-${selectedEvent?._id}`).style.display = 'none';
  //   }
  //   document.getElementById(`event-${e._id}`).style.display = 'block';
  //   setSensorLoader(getAllSensors)
  //   setselectedEvent(e)
  //   selectedEventElem = e._id;
  // }

  function selectEvent(e) {
    // if (!playbackDatapoints[e._id]) {
    //   setSensorLoader(true);
    // } else {
    //   setSensorLoader(false);
    // }
    let temp = Array.from(selectedEvent)
    if (temp.find((t) => t._id == e._id)) {
      temp.splice(temp.findIndex((t) => t._id == e._id));
    } else {
      setSensorLoader(true);
      temp.push(e);
    }
    setSelectedEvent(selectedEvent.length ? temp : [e]);
  }

  function toggleDrawer(toggle) {
    setEventDrawer(toggle);
  }

  function setRef(ref) {
    eventsList = ref;
  }

  const list = () => (
    <div
      id="events-list"
      className="events"
      onScroll={onScroll}
      ref={listInnerRef}
    >
      {events.length ? <h2 className="heading1">Playback Events</h2> : null}
      <div className="events-body">
        {events.length ? (
          <div>
            {/* <List id="journey-logs"> */}
            {/* {!events
                .slice(startingPointEvent, maxEvent)
                .find((e) => e._id == currentEvent._id) ? (
                <div
                  style={{
                    fontSize: "14px",
                    color: "#999",
                    textAlign: "center",
                    marginTop: "30px",
                  }}
                >
                  Loading Events ...
                </div>
              ) : ( */}
            <div style={{ width: "100%", height: "100vh", position: "relative" }}>
              <AutoSizer>
                {({ width, height }) => ( 
                  <List
                    id="all-events"
                    rowCount={eventsWithMarkers.length ? eventsWithMarkers.length : eventsWithMarkers.length}
                    width={width}
                    height={height}
                    ref={setRef}
                    rowHeight={eventCache.current.rowHeight}
                    deferredMeasurementCache={eventCache.current}
                    scrollToIndex={scrollToIndex}
                    rowRenderer={({ key, index, style, parent }) => {
                      const event = eventsWithMarkers.length ? eventsWithMarkers[index] : events[index];
                      return (
                        <CellMeasurer
                          key={key}
                          cache={eventCache.current}
                          parent={parent}
                          columnIndex={0}
                          rowIndex={index}
                        >
                          <div
                            id={`event-${event._id}`}
                            key={key}
                            style={style}
                          >
                            <div
                              // expanded={
                              //   selectedEvent.length &&
                              //   selectedEvent.find((s) => s._id == event._id)
                              // }
                              expanded={true}
                              style={{
                                // background:
                                //   index == events.length - 1
                                //     ? "rgb(235, 235, 235)"
                                //     : "white",
                                borderRadius: "10px",
                                margin: "3px 0px 3px 0px",
                                padding: "0px 20px",
                                // boxShadow: currentEvent._id == event._id ? '0px 0px 4px 2px lightgray' : 'none',
                                backgroundColor:
                                  currentEvent._id == event._id
                                    ? "rgb(235,235,235)"
                                    : "white",
                                border:
                                  eventsWithMarkers[index]?.marker ? "1.5px solid red" : currentEvent._id == event._id
                                    ? "1px solid rgb(175,175,175)"
                                    : "1px solid #dedede",
                              }}
                              // onChange={() => {
                              //   selectEvent(
                              //     selectedEvent
                              //       ? selectedEvent[selectedEvent.length - 1]._id ==
                              //         event._id
                              //         ? ""
                              //         : event
                              //       : event
                              //   );
                              // }}
                            >
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  position: "relative",
                                  width: "100%",
                                  justifyContent: "flex-start",
                                }}
                              >
                                {/* <EventIcon sx={{ color: "grey" }} /> */}
                                <IconButton
                                  size="small"
                                  onClick={() => {
                                    // progressChange(((index + 1) / totalDocs) * 100)
                                    // receivePlayback({
                                    //   payload: event,
                                    //   index: index,
                                    // });
                                    let value = ((index + 1) / totalDocs) * 100;
                                    eventNo = Math.floor(
                                      (totalDocs * value) / 100
                                    );
                                    updateMap(eventNo);
                                    startSending(eventNo);
                                    if (
                                      ((index + 1) / totalDocs) * 100 < 100 &&
                                      index == cache.length - 1
                                    )
                                      setRestart(true);
                                    setProgress(
                                      ((index + 1) / totalDocs) * 100
                                    );
                                    setPlaybackTime(event.time);
                                    currentEvent = event;
                                  }}
                                  sx={{ marginLeft: "-10px" }}
                                >
                                  <NearMeIcon
                                    sx={{
                                      position: "relative",
                                      top: "2px",
                                      fontSize: "1rem",
                                    }}
                                  />
                                </IconButton>
                                <div
                                  style={{
                                    textAlign: "initial",
                                    marginLeft: "20px",
                                    width: "40%",
                                  }}
                                >
                                  <p
                                    style={{
                                      fontSize: "14px",
                                      color:
                                        currentEvent._id == event._id
                                          ? "#666"
                                          : "#333",
                                      display: "flex",
                                      marginLeft: "-8px",
                                      fontWeight:
                                        currentEvent._id == event._id
                                          ? "bold"
                                          : "normal",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    <div style={{ marginTop: 4 }}>
                                      <span>{`( ${(event?.c8y_Position?.lat)?.toFixed(
                                        6
                                      )} , ${(event?.c8y_Position?.lng)?.toFixed(
                                        6
                                      )} )`}</span>
                                    </div>
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "13px",
                                      color:
                                        currentEvent._id == event._id
                                          ? "#777"
                                          : "#555",
                                      fontWeight:
                                        currentEvent._id == event._id
                                          ? "bold"
                                          : "normal",
                                    }}
                                  >{`${new Date(event.time).toLocaleDateString(
                                    "en-GB"
                                  )} ${new Date(
                                    event.time
                                  ).toLocaleTimeString()}`}</p>
                                </div>
                                <Divider
                                  orientation="vertical"
                                  variant="middle"
                                  flexItem
                                  sx={{
                                    borderColor: "rgba(0, 0, 0, 0.06)",
                                    height: "50px",
                                  }}
                                />
                                <div
                                  style={{
                                    // display:
                                    //   (!sensorLoader &&
                                    //     selectedEvent &&
                                    //     selectedEvent.find(
                                    //       (s) => s._id == event._id
                                    //     )) ||
                                    //   (selectedEvent &&
                                    //     selectedEvent
                                    //       .slice(startingPointEvent, selectedEvent.length - 1)
                                    //       .find((s) => s._id == event._id))
                                    //     ? "block"
                                    //     : "none",
                                    paddingTop: 10,
                                    // maxHeight: '100px',
                                    overflow: "hidden",
                                    paddingBottom: "10px",
                                    margin: "0px 10px",
                                    width: "70%",
                                  }}
                                  className="dynamic-scroll"
                                >
                                  <Datapoint
                                    name={sensors[0].name}
                                    sensors={sensors}
                                    length={sensors.length}
                                    setLoader={setSensorLoader}
                                    loader={sensorLoader}
                                    id={props.id}
                                    event={event}
                                    selectedEvent={selectedEvent}
                                    previousDatapoints={
                                      playbackDatapoints[event._id] &&
                                      !sensorLoader
                                        ? playbackDatapoints[event._id]
                                        : null
                                    }
                                  />
                                </div>
                                {!selectedEvent.find(
                                  (s) => s._id == event._id
                                ) ? (
                                  <div>
                                    <IconButton
                                      size="small"
                                      sx={{
                                        position: "absolute",
                                        right: "-15px",
                                        top: "0px",
                                      }}
                                      onClick={() => {
                                        if (!sensorLoader) {
                                          selectEvent(event);
                                        }
                                      }}
                                    >
                                      <RestartAltIcon fontSize="inherit" />
                                    </IconButton>
                                  </div>
                                ) : null}
                                {(eventsWithMarkers.length && eventsWithMarkers[index]?.marker) ? (
                                  <HtmlTooltip
                                    title={
                                      <Fragment>
                                        <div style={{padding: "5px"}}>
                                          <div style={{display: "flex", alignItems: "flex-end", gap: "10px"}}>
                                            <Typography style={{fontSize: "18px", fontWeight: "bold"}}>Alarm Generated</Typography>
                                            <Typography style={{color: eventsWithMarkers[index].marker.alarm.severity === "CRITICAL" ? "#e8413e" : eventsWithMarkers[index].marker.alarm.severity === "MAJOR" ? "#844204" : eventsWithMarkers[index].marker.alarm.severity === "MINOR" ? "#fb9107" : "#288deb"}}>{eventsWithMarkers[index].marker.alarm.severity}</Typography>
                                          </div>
                                          <Typography style={{marginTop: "10px", marginBottom: "10px"}}>{`${new Date(eventsWithMarkers[index].marker.timestamp).toLocaleDateString("en-GB")} ${new Date(eventsWithMarkers[index].marker.timestamp).toLocaleTimeString()}`}</Typography>
                                          <Typography style={{fontWeight: "bold", marginTop:"5px"}}>Description:</Typography>
                                          <Typography>{gnerateDescription(isJsonString(eventsWithMarkers[index].marker.alarm.text))}</Typography>
                                        </div>
                                      </Fragment>
                                    }
                                    placement="left"
                                    transitionComponent={Zoom}
                                  >
                                    <IconButton size="small" style={{position: "absolute", bottom: "0px", right: "-15px"}}>
                                      <NotificationsActiveOutlined 
                                        color="error"
                                        fontSize="inherit"
                                      />
                                    </IconButton>
                                  </HtmlTooltip>
                                ) : null}
                              </div>
                              {/* </AccordionSummary> */}
                            </div>
                          </div>
                        </CellMeasurer>
                      );
                    }}
                  />
                )}
              </AutoSizer>
            </div>
            {/* </List> */}
          </div>
        ) : (
          <div className="no-data">
            <img style={{ maxWidth: "70%", maxHeight: "70%" }} src={noData} />
            <h1 className="heading2">No Events Found</h1>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div>
      <form>
        <Dialog
          open={openPopup}
          onClose={handlepopupClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Playback</DialogTitle>
          <DialogContent>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DateTimePicker
                maxDate={new Date(endTime)}
                label="Start Time"
                inputFormat="dd/MM/yyyy h:mm:ss aaa"
                value={startTime}
                onChange={(e) => {
                  chkError();
                  handleChange(e);
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="dense" />
                )}
              />
              <DateTimePicker
                maxDate={new Date().setDate(new Date(startTime).getDate() + 6)}
                inputFormat="dd/MM/yyyy h:mm:ss aaa"
                label="End Time"
                value={endTime}
                onChange={(e) => {
                  chkError();
                  handleChange2(e);
                }}
                renderInput={(params) => (
                  <TextField {...params} fullWidth margin="dense" />
                )}
              />
            </LocalizationProvider>
            {dateError ? (
              <p style={{ color: "red", fontSize: "12px" }}>{dateError}</p>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                stop = false;
                // if (pauseIndex != 0) {
                //   console.log('sending ...')
                //   startSending(pauseIndex)
                // }
                setPause(false);
                handlepopupClose();
              }}
              color="primary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={startPlayback}
              disabled={
                (endTime != "Invalid Date" && startTime != "Invalid Date"
                  ? dateTo == new Date(endTime.setSeconds(0)).toISOString() &&
                    dateFrom == new Date(startTime.setSeconds(0)).toISOString()
                  : true) || dateError
              }
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </form>
      {playbackEvents.data && playbackEvents.data.payload?.data?.length ? (
        <Box sx={{ width: "100%" }}>
          {/* <LinearProgressWithLabel value={progress} /> */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Box
              sx={{ minWidth: Math.round(progress) < 100 ? "220px" : "240px" }}
            >
              <p style={{ color: "grey", fontSize: "14px", marginTop: "-8px" }}>
                {`${new Date(playbackTime).toLocaleDateString(
                  "en-GB"
                )}  ${new Date(
                  playbackTime
                ).toLocaleTimeString()} - (${Math.round(progress)}%)`}
              </p>
            </Box>
            <Box sx={{ width: "100%", position: "relative" }}>
              {(markers.length) ? eventsWithMarkers.map((event, index) => {
                if(event?.marker) {   
                  return (
                    <HtmlTooltip
                      title={
                        <Fragment>
                          <div style={{padding: "5px"}}>
                            <div style={{display: "flex", alignItems: "flex-end", gap: "10px"}}>
                              <Typography style={{fontSize: "18px", fontWeight: "bold"}}>Alarm Generated</Typography>
                              <Typography style={{color: event.marker.alarm.severity === "CRITICAL" ? "#e8413e" : event.marker.alarm.severity === "MAJOR" ? "#844204" : event.marker.alarm.severity === "MINOR" ? "#fb9107" : "#288deb"}}>{event.marker.alarm.severity}</Typography>
                            </div>
                            <Typography style={{marginTop: "10px", marginBottom: "10px"}}>{`${new Date(event.marker.timestamp).toLocaleDateString("en-GB")} ${new Date(event.marker.timestamp).toLocaleTimeString()}`}</Typography>
                            <Typography style={{fontWeight: "bold", marginTop:"5px"}}>Description:</Typography>
                            <Typography>{gnerateDescription(isJsonString(event.marker.alarm.text))}</Typography>
                          </div>
                        </Fragment>
                      }
                      placement="top"
                      transitionComponent={Zoom}
                    >
                      <div style={{
                          position: "absolute", 
                          left: `calc(100% * ${index/playbackEvents?.data?.payload.totalDocuments})`, 
                          top: "13px",
                          zIndex: "100",
                          display: "flex",
                          cursor: "pointer"
                        }}
                      >
                        <div style={{
                          height: "12px",
                          width: "1px",
                          backgroundColor: "black"
                        }}>
                        </div>
                        <div style={{
                            height: "12px", 
                            width: "2px",    
                            backgroundColor: "red", 
                          }}>
                        </div>
                        <div style={{
                          height: "12px",
                          width: "1px",
                          backgroundColor: "black"
                        }}>
                        </div>
                      </div>
                    </HtmlTooltip>
                )
              }
              }) : null}
              <Slider
                id="trackbar"
                sx={{ height: "12px" }}
                disabled={loader}
                onChangeCommitted={(e, v) => {
                  progressChange(v);
                }}
                value={progress}
              />
            </Box>
          </Box>
        </Box>
      ) : null}
      <div
        ref={mapContainer}
        style={{
          height: "calc(100vh - 250px)",
          borderRadius: "10px",
        }}
      >
        {loader ? <span className="loader"></span> : null}
        <div
          style={{
            position: "absolute",
            top: "143px",
            right: "10px",
            zIndex: "1",
            opacity: loader ? "0.3" : "1",
          }}
        >
          <Tooltip title="Restart" placement="left" arrow>
            <div
              style={{
                marginBottom: "5px",
                cursor: loader ? "auto" : "pointer",
              }}
              className={classes.button}
              onClick={handleRestart}
            >
              <RestartAltIcon style={{ color: "#000000", fontSize: "17px" }} />
            </div>
          </Tooltip>
          <Tooltip
            title={loader ? "" : pause ? "Play" : "Pause"}
            placement="left"
            arrow
          >
            <div
              className={classes.button}
              style={{
                marginBottom: "5px",
                cursor: loader ? "auto" : "pointer",
              }}
              onClick={() => {
                if (noData) {
                  showSnackbar(
                    "Playback",
                    "No location data found",
                    "info",
                    1000
                  );
                } else {
                  handlePause();
                }
              }}
            >
              {loader ? (
                <CircularProgress
                  style={{ color: "#333333", height: "13px", width: "13px" }}
                />
              ) : (
                <Fragment>
                  {pause ? (
                    <PlayArrowIcon
                      style={{ color: "#000000", fontSize: "17px" }}
                    />
                  ) : (
                    <PauseIcon style={{ color: "#000000", fontSize: "17px" }} />
                  )}
                </Fragment>
              )}
            </div>
          </Tooltip>
          <Tooltip title="Speed" placement="left" arrow>
            <div
              className={classes.button}
              onClick={handleSpeed}
              style={{
                marginBottom: "5px",
                cursor: loader ? "auto" : "pointer",
              }}
            >
              <p
                style={{
                  color: "#000000",
                  fontSize: "12px",

                  userSelect: "none",
                }}
              >
                <strong>x{speed}</strong>
              </p>
            </div>
          </Tooltip>
          {/* <Tooltip title="Set Duration" placement="left" arrow>
            <div
              id="duration"
              className={classes.button}
              style={{ cursor: loader ? "auto" : "pointer" }}
              onClick={() => {
                stop = true;
                setPause(true);
                handlepopupOpen();
              }}
            >
              <AvTimerIcon style={{ color: "#000000", fontSize: "17px" }} />
            </div>
          </Tooltip> */}
        </div>
      </div>
      {markers.length ? (
        <div key={"left"}>
          <Dragable left={"160px"} top={"300px"} name="alarm-count">
              <Fab
                style={{boxShadow: "none", width: "80px", height: "35px", borderRadius: "25px"}}
                id="fab"
                color="secondary"
                aria-label="alarm-count"
              >
                <div style={{display: "flex", alignItems: "center", fontSize: "14px", textTransform: "none", gap: "5px"}}>
                  <span style={{fontWeight: "bold"}}>{`${alarmsCount} / ${markers.length}`}</span>
                  <NotificationsActiveIcon sx={{fontSize: "18px"}}/>
                </div>
              </Fab>
          </Dragable>
        </div>
      ) : null}
      {cache.length ? (
        <div key={"right"}>
          <Dragable bottom={"30px"} right={"30px"} name="support">
            <Tooltip
              title={loader ? "Events loading" : "Events List"}
              placement="bottom"
              arrow
            >
              <Fab
                style={{ boxShadow: "none" }}
                id="fab"
                color="secondary"
                aria-label="add"
                disabled={loader}
                className="btn-search"
                onClick={() => {
                  setTimeout(() => {
                    let myElement = document.getElementById(
                      `event-${currentEvent._id}`
                    );
                    toggleDrawer(true);
                    tempPause = pause;
                    handlePause(false);
                  }, 100);
                }}
              >
                <EventNoteIcon />
              </Fab>
            </Tooltip>
          </Dragable>
          <Drawer
            id="drawer"
            anchor={"right"}
            open={eventDrawer}
            onClose={() => {
              toggleDrawer(false);
              handlePause(!tempPause);
            }}
            style={{ width: "20% !important" }}
          >
            {list()}
          </Drawer>
        </div>
      ) : null}
    </div>
  );
}
