//-------------CORE------------------//
import React, { useState, useEffect, useRef, Fragment } from "react";
import { Provider } from "react-redux";
import mapboxgl from "!mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import {
  CircleMode,
  DragCircleMode,
  DirectMode,
  SimpleSelectMode,
} from "mapbox-gl-draw-circle";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import ReactDOM from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSatellite,
  faDrawPolygon,
  faSitemap,
  faGlobeEurope,
  faSlash,
} from "@fortawesome/free-solid-svg-icons";
import { faMap } from "@fortawesome/free-regular-svg-icons";
import { useTranslation } from "react-i18next";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSnackbar } from "notistack";
import { useSelector, useDispatch } from "react-redux";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Link from "@mui/material/Link";
//-------------MUI------------------//
import CircularProgress from "@mui/material/CircularProgress";
import { Slide, Grid, Button } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { makeStyles } from "@mui/styles";
import Zoom from "@mui/material/Zoom";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import TextField from "@mui/material/TextField";
import OpenInNewOffIcon from "@mui/icons-material/OpenInNewOff";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import PlaceIcon from "@mui/icons-material/Place";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
//-------------MUI ICON------------------//
import WifiOutlinedIcon from "@mui/icons-material/WifiOutlined";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SpeedIcon from "@mui/icons-material/Speed";
import LensBlurIcon from "@mui/icons-material/LensBlur";
import CropFreeIcon from "@mui/icons-material/CropFree";
import PhotoIcon from "@mui/icons-material/Photo";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import MailIcon from "@mui/icons-material/Mail";

//-------------EXTERNAL------------------//
import DeleteAlert from "components/Alerts/Delete";
import connector from "./connector";
import noData from "assets/img/no-data.png";
import Popover from "components/Popover";
import Edit from "./Geofence";
import { useGetDevicesQuery } from "services/devices";
import Loader from "components/Progress";
import { setMapPage } from "rtkSlices/AssetViewSlice";
import DefaultPopup from "./Popup";
import AqPopup from "./Popup/aq";
import { store } from "app/store";
import Pin from "assets/img/location-pin.png";
import { getColor, generateBackground } from "Utilities/Color Spectrum";
var StaticMode = require("@mapbox/mapbox-gl-draw-static-mode");
import emitter from "Utilities/events";
import { style, generateDot } from "Utilities/mapbox";
import {
  useDeleteGlobalLocationMutation,
  useGetGlobalLocationsQuery,
  useEditGlobalLocationMutation,
} from "services/globalLocations";
import Group from "./Group";
import DialogTitle from "@mui/material/DialogTitle";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import { DialogContent, DialogContentText } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import SendIcon from "@mui/icons-material/Send";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import {featureCollection, feature, point} from "@turf/turf"
import ShareLocationIcon from '@mui/icons-material/ShareLocation';
import axios from "axios";
import { CloseOutlined } from "@mui/icons-material";

let flying = false;
let markers = [];

const mapStyle = {
  heat: "mapbox://styles/mapbox/dark-v10",
  street: "mapbox://styles/mapbox/streets-v11",
  light: "mapbox://styles/mapbox/light-v10",
  satellite: "mapbox://styles/mapbox/satellite-v9",
};

mapboxgl.accessToken =
  "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA";

const useStyles = makeStyles({
  button: {
    borderColor: "rgba(0, 0, 0, 0.9)",
    color: "rgba(255, 255, 255, 0.5)",
    width: "29px",
    height: "29px",
    backgroundColor: "#ffffff",
    borderColor: "rgba(0, 0, 0, 0.9)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: `rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,rgba(60, 64, 67, 0.15) 0px 1px 3px 1px`,
    "&:hover": {
      backgroundColor: "#eeeeee",
      cursor: "pointer",
    },
  },
  toggle: {
    color: "rgba(255, 255, 255, 0.5)",
    width: "40px",
    height: "29px",
    backgroundColor: "#ffffff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    boxShadow: `rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,rgba(60, 64, 67, 0.15) 0px 1px 3px 1px`,
    "&:hover": {
      backgroundColor: "#dfdfdf",
      cursor: "pointer",
    },
  },
  geofence: {
    margin: "10px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: "5px",
    padding: "5px 10px",
    width: "100%",
    cursor: "pointer",
    "&:hover": {
      filter: "contrast(90%)",
    },
  },
});

const draw = new MapboxDraw({
  styles: style,
  displayControlsDefault: false,
  controls: {},
  userProperties: true,
  keybindings: false,
  modes: {
    ...MapboxDraw.modes,
    draw_circle: CircleMode,
    drag_circle: DragCircleMode,
    direct_select: DirectMode,
    simple_select: SimpleSelectMode,
    static: StaticMode,
  },
});
let heat = false;
let datapointState = null;
let toggleState = "Connectivity";
let globalState = {
  type: "geojson",
  data: {
    type: "FeatureCollection",
    features: [],
  },
  cluster: true,
};
let tempLocArray = [];
let search = false;
let map;
let device;
let locArray = [];
let searchedTemp = [];
let firstTime = true;
let totalPages;
let coordinates;
let popupObj;
let popupType = null;

export default function Devices(props) {
  console.log({props})
  const { t } = useTranslation();
  const Popup = props.aq ? AqPopup : DefaultPopup;
  let sensors =
    props.config == "ALL"
      ? [...props.sensors, ...props.configSensors]
      : props.sensors;
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const classes = useStyles(props);
  const metaDataValue = useSelector((state) => state.metaData);
  const serviceMarker = metaDataValue.services.find((s) => s.id == props.link)
    .solutionLayout.map?.marker;
  const filtersValue = useSelector((state) => state.filterDevice);
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [openMapModel, setOpenMapModel] = useState(false);
  const [contextmenuCoordinates, setContextmenuCoordinates] = useState();
  const [userEmail, setUserEmail] = useState(null);
  const page = useSelector((state) => state.assetView.mapPage);
  const { enqueueSnackbar } = useSnackbar();
  const [disableProgress, setDisableProgress] = React.useState(false);
  const [polygon, setPolygon] = React.useState(false);
  const [groupGeo, setGroupGeo] = React.useState(false);
  const [geofencesList, setGeofencesList] = React.useState([]);
  const [checked, setChecked] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [row, setRow] = React.useState(null);
  const [nearestAsset, setNearestAsset] = useState();

  const [editGeofence, editGeofenceResult] = useEditGlobalLocationMutation();

  useEffect(() => {
    if (map) map.resize();

    return () => {
      popupType = null;
    };
  }, [props.open]);

  const [mapStyleState, setMapStyleState] = useState(
    props.layoutPermission?.mapDefault
      ? props.layoutPermission.mapDefault
      : props.layoutPermission.mapModes.indexOf("light") != -1
      ? "light"
      : "street"
  );
  const [stylesArr, setStylesArr] = useState(initializeStylesArr());
  const [heatMap, setHeatMap] = useState("");
  const [openPopup, setOpenPopup] = React.useState(false);
  const [openGroup, setOpenGroup] = React.useState(false);
  const [circle, setCircle] = useState({});
  const [type, setType] = useState("Polygon");
  const [dialogType, setDialogType] = useState("ADD");
  const [toggleView, setToggleView] = React.useState(
    props.layoutPermission?.markerDefault
      ? props.layoutPermission?.markerDefault == "Health"
        ? props.alarms
          ? props.layoutPermission?.markerDefault
          : "Connectivity"
        : props.layoutPermission?.markerDefault
      : "Connectivity"
  );
  console.log('hereeeed',props.layoutPermission?.markerDefault
    ? props.layoutPermission?.markerDefault == "Health"
      ? props.alarms
        ? props.layoutPermission?.markerDefault
        : "Connectivity"
      : props.layoutPermission?.markerDefault
    : "Connectivity")
  const [heatLoader, setheatLoader] = React.useState(false);
  const [healthLoader, sethealthLoader] = React.useState(false);
  const [datapoint, setDatapoint] = React.useState(
    props.layoutPermission?.markerDefault &&
      props.layoutPermission?.markerDefault == "Monitoring" &&
      props.dataPointThresholds &&
      props.dataPointThresholds.length
      ? props.dataPointThresholds.filter(dp=>dp.dataPoint)[0]?.dataPoint?.name
      : null
      );
  const [friendlyName, setFriendlyname] = React.useState(
    props.layoutPermission?.markerDefault &&
      props.layoutPermission?.markerDefault == "Monitoring" &&
      props.dataPointThresholds &&
      props.dataPointThresholds.length
      ? props.dataPointThresholds.filter(dp=>dp.dataPoint)[0]?.dataPoint?.friendlyName
      : null
  );
  const [connectivityLoader, setconnectivityLoader] = React.useState(false);
  const [datapointLoader, setDatapointLoader] = React.useState(false);
  const [markerLoader, setMarkerLoader] = React.useState(false);
  const [selected, setSelected] = React.useState(null);
  const [geofence, setGeofence] = React.useState({ type: "", coordinates: [] });
  const [mapLoaded, setMapLoaded] = React.useState(true);
  const [
    deleteGeofence,
    deleteGeofenceResult,
  ] = useDeleteGlobalLocationMutation();
  const [divicesWithLocation, setDivicesWithLocation] = React.useState([]);
  const [sourceCoordinates, setSourceCoordinates] = React.useState(null)
  const [destinationCoordinates, setDestinationCoordinates] = React.useState(null)
  const [waypointCoordinates, setWaypointCoordinates] = React.useState([])
  const [sourceMarker, setSourceMarker] = React.useState(null)
  const [destinationMarker, setDestinationMarker] = React.useState(null)
  const [waypointMarkers, setWaypointMarkers]  = React.useState([])
  const [openShareModal, setOpenShareModal] = React.useState(false)
  let tempMarker = null

  useEffect(() => {
    if (selected) {
      var myElement = document.getElementById(selected);
      if (myElement) {
        var topPos = myElement.offsetTop - 40;
        document.getElementById("geofence-list").scrollTop = topPos;
      }
    }
  }, [selected]);

  useEffect(() => {
    if (filtersValue.searching) {
      if (popupObj) {
        popupObj.remove();
      }
    }
  }, [filtersValue]);

  useEffect(() => {

    const uniqueDatapointsArray = [];
    const uniqueDatapointsIds = new Set();
    if (props?.dataPointThresholds) {
      props?.dataPointThresholds.forEach((item) => {
        const dataPointId = item.dataPoint?._id;

        if (!uniqueDatapointsIds.has(dataPointId)) {
          uniqueDatapointsArray.push(item);
          uniqueDatapointsIds.add(dataPointId);
        }
      });
    }

    const sensorsList = uniqueDatapointsArray.length && uniqueDatapointsArray.map((obj) => obj.dataPoint);
    console.log({sensorsList})

    const filteredSensorsList = sensorsList && sensorsList.length && sensorsList.filter((sensor) => {
      let found
      if(filtersValue.sensors){
        found = filtersValue.sensors.find((s) => s?._id == sensor?._id)
      } else {
        found = props.sensors.find((s) => s?._id == sensor?._id)
      }
      if(found){
        return true
      } else {
        return false
      }
    })

    setDatapoint(filteredSensorsList && filteredSensorsList[0] && filteredSensorsList[0].name != "" ? filteredSensorsList[0].name : "")
    setFriendlyname(filteredSensorsList && filteredSensorsList[0] && filteredSensorsList[0].friendlyName != "" ? filteredSensorsList[0].friendlyName : "")
  }, [props])

  function clickDatapoint(name, friendlyName) {
    setDatapointLoader(true);
    toggleState = "Monitoring";
    setToggleView("Monitoring");
    setDatapoint(name);
    setFriendlyname(friendlyName);
    datapointState = name;
    console.log('clickdp',name,friendlyName)
    map.setStyle(mapStyle[mapStyleState], {
      diff: true,
    });
    setTimeout(() => {
      updateStyles();
      setDatapointLoader(false);
    }, 500);
  }

  function DatapointToggle() {
    // Removing duplicate color spectroms
    const uniqueDatapointsArray = [];
    const uniqueDatapointsIds = new Set();
    if (props?.dataPointThresholds) {
      props?.dataPointThresholds.forEach((item) => {
        const dataPointId = item.dataPoint?._id;

        if (!uniqueDatapointsIds.has(dataPointId)) {
          uniqueDatapointsArray.push(item);
          uniqueDatapointsIds.add(dataPointId);
        }
      });
    }

    const sensorsList = uniqueDatapointsArray.length && uniqueDatapointsArray.map((obj) => obj.dataPoint);
    console.log({sensorsList})

    const filteredSensorsList = sensorsList.filter((sensor) => {
      let found
      if(filtersValue.sensors){
        found = filtersValue.sensors.find((s) => s?._id == sensor?._id)
      } else {
        found = props.sensors.find((s) => s?._id == sensor?._id)
      }
      if(found){
        return true
      } else {
        return false
      }
    })
    return filteredSensorsList ? (
      <MenuList role="menu" style={{ maxWidth: "200px", maxHeight: "40vh" }}>
        {filteredSensorsList.filter(s=>s).map((sensor) => {
          return (
            <MenuItem
              onClick={() => {
                if (!connectivityLoader && !healthLoader && !datapointLoader) {
                  clickDatapoint(sensor.name, sensor.friendlyName);
                }
              }}
              style={{
                backgroundColor:
                  datapoint == sensor.name
                    ? metaDataValue.branding?.primaryColor
                    : "",
                color: datapoint == sensor.name ? "white" : "",
                margin: "auto 10px",
                borderRadius: "10px",
              }}
            >
              <p
                style={{
                  width: "100%",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontSize: "13px",
                }}
              >
                {sensor.friendlyName}
              </p>
            </MenuItem>
          );
        })}
      </MenuList>
    ) : null;
  }

  function updateOld(elm, old, ind, realtimeAction) {
    if (realtimeAction == "UPDATE" && ind != -1) {
      if (elm.location) old[ind] = formatDevice(elm);
    } else if (realtimeAction == "DELETE" && ind != -1) {
      old.splice(ind, 1);
      locArray.splice(ind, 1);
    } else {
      old.push(formatDevice(elm));
      locArray.push([elm.location.longitude, elm.location.latitude]);
    }
  }

  useEffect(() => {
    if (filtersValue.search != "") search = true;
    else search = false;
  }, [filtersValue.search]);

  useEffect(() => {
    function callbackfn(payload) {
      if (map && map.getSource("geoData") && !search) {
        let old;
        let ind;
        let elm = payload.message;
        old = globalState.data.features;
        ind = old.findIndex((e) => e.id == elm.internalId);
        updateOld(elm, old, ind, payload.realtimeAction);
        globalState.data.features = old;
        map.getSource("geoData").setData(globalState.data);
      }
    }

    emitter.on("solution?devices", callbackfn);

    return () => {
      emitter.off("solution?devices", callbackfn);
    };
  }, []);

  const geofenceForm = useFormik({
    initialValues: {
      name: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required field"),
    }),
    onSubmit: async (values) => {
      let body = {};
      if (dialogType == "ADD") {
        if (type == "Polygon") {
          body = {
            name: values.name,
            devices: props.ids,
            type: geofence.type,
            coordinates: geofence.coordinates,
            serviceId: props.id,
          };
          if (filtersValue.group.id != "") body.groupId = filtersValue.group.id;
        } else if (type == "Circle") {
          body = {
            name: values.name,
            devices: props.ids,
            center: circle.features[0].properties.center,
            radius: circle.features[0].properties.radiusInKm,
            type: "Circle",
            coordinates: circle.features[0].geometry.coordinates,
            serviceId: props.id,
          };
          if (filtersValue.group.id != "") body.groupId = filtersValue.group.id;
        }
        await createGeofence({ token, body });
      } else if (dialogType == "EDIT") {
        body = {
          name: values.name,
        };
        editGeofence({ token, body, id: activeId });
      }
    },
  });

  const geofences = useGetGlobalLocationsQuery(
    {
      token,
      id: props.id,
      group: filtersValue.group.id,
    },
    { skip: mapLoaded || !props.tracking }
  );

  const devices = useGetDevicesQuery({
    token,
    group: props.id,
    params: `&withTotalPages=true&pageSize=5000&currentPage=${page}&select={"dataPointThresholds":1,"latestMeasurement":1,"location":1,"name":1,"internalId":1,"alarmSync":1,"packetFromPlatform.c8y_Availability.status":1,"associatedGroups":1}&MeasurementFilter=${
      filtersValue.measurement
    }&connected=${filtersValue.connection}&alarms=${
      filtersValue.alarms
    }&associatedGroup=${filtersValue.group.id}&metaTags=${
      filtersValue.metaTags
    }&searchFields=${JSON.stringify(filtersValue.searchFields)}&search=${
      filtersValue.search
    }&assetTypes=${filtersValue.assetTypes}`,
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (deleteGeofenceResult.isSuccess) {
      toggleDelete();
      showSnackbar(
        "Geofences",
        deleteGeofenceResult.data?.message,
        "success",
        1000
      );
    }

    if (deleteGeofenceResult.isError) {
      showSnackbar(
        "Geofences",
        deleteGeofenceResult.error.data?.message,
        "error",
        1000
      );
    }
  }, [deleteGeofenceResult]);

  useEffect(() => {
    if (editGeofenceResult.isSuccess) {
      showSnackbar(
        "Geofences",
        editGeofenceResult.data?.message,
        "success",
        1000
      );
    }
    if (editGeofenceResult.isError) {
      showSnackbar(
        "Geofences",
        editGeofenceResult.error.data?.message,
        "error",
        1000
      );
    }
  }, [editGeofenceResult]);

  useEffect(() => {
    if (geofences.isSuccess && !geofences.isFetching) {
      draw.deleteAll();
      if (geofences.data.payload.data) {
        setGeofencesList(geofences.data.payload.data);
        geofences.data.payload.data.forEach((loc) => {
          if (loc.region.type == "Polygon") {
            draw.add({
              id: loc.globalUUID,
              type: "Feature",
              properties: {
                name: loc.name,
                address: loc?.address ? loc?.address : "",
              },
              geometry: {
                type: "Polygon",
                coordinates: loc.region.coordinates,
              },
            });
          } else if (loc.region.type == "Circle") {
            draw.add({
              id: loc.globalUUID,
              type: "Feature",
              properties: {
                name: loc.name,
                address: loc?.address ? loc?.address : "",
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
    }
    if (geofences.isError) {
      showSnackbar("Geofences", geofences.error.data?.message, "error", 1000);
    }
  }, [geofences.isFetching]);

  const mapContainerRef = useRef(null);

  function updateMap(payload) {
    let coordinates = payload.bounds;
    if (map.getSource("geoData")) {
      map.getSource("geoData").setData(payload.data.data);
    }
    if (coordinates.length > 0) {
      let bounds = coordinates.reduce(function (bounds, coord) {
        return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
      map.fitBounds(bounds, { padding: 100 });
    }
  }

  function getDeviceMarker(elm) {
    let found = false;
    if (elm.associatedGroups?.length) {
      if (filtersValue.group.id) {
        if (elm.associatedGroups.find((a) => a == filtersValue.group.id)) {
          if (
            props.groups.find((g) => g._id == filtersValue.group.id)?.marker
          ) {
            found = props.groups.find((g) => g._id == filtersValue.group.id)
              .marker;
          }
        }
      } else {
        elm.associatedGroups.forEach((ag) => {
          if (
            props.groups?.find((g) => g._id == ag) &&
            props.groups.find((g) => g._id == ag).marker
          ) {
            found = props.groups.find((g) => g._id == ag).marker;
          }
        });
      }
      if (!found) {
        return serviceMarker;
      } else {
        return found;
      }
    } else {
      return serviceMarker;
    }
  }

  function formatDevice(elm) {
    console.log(getDeviceMarker(elm))
    let index = 0;
    let temp = {
      type: "Feature",
      id: elm.internalId,
      html: elm.name,
      marker: getDeviceMarker(elm),
      geometry: {
        type: "Point",
        coordinates: [elm.location.longitude, elm.location.latitude],
      },
    };
    let connection = elm.packetFromPlatform?.c8y_Availability?.status;
    let properties = {
      name: elm.name,
      CONNECTIVITY:
        connection == "AVAILABLE"
          ? "#4caf50"
          : connection == "UNAVAILABLE"
          ? "#555555"
          : "#ba75d8",
      mag: 1,
    };
    console.log('deployed')
    if (elm?.latestMeasurement) {
      sensors.forEach((elm2) => {
        let e = elm2.name;
        let id = elm2._id;
        let sensor;

        if (elm?.dataPointThresholds && elm?.dataPointThresholds.length) {
          sensor = elm?.dataPointThresholds.find((g) => g.dataPoint == id);
        }
        if (!sensor) {
          sensor = props.dataPointThresholds.find((g) => g.dataPoint?.name == e);
        }

        if (sensor) {
          properties[e] = getColor(elm.latestMeasurement[e]?.value, sensor);
        }
      });
    }

    if (
      elm?.alarmSync &&
      elm.alarmSync?.CRITICAL &&
      elm.alarmSync.CRITICAL > 0
    ) {
      properties.ALARM = "critical-dot";
    } else if (
      elm?.alarmSync &&
      elm.alarmSync?.MAJOR &&
      elm.alarmSync.MAJOR > 0
    ) {
      properties.ALARM = "major-dot";
    } else if (
      elm?.alarmSync &&
      elm.alarmSync?.MINOR &&
      elm.alarmSync.MINOR > 0
    ) {
      properties.ALARM = "minor-dot";
    } else if (
      elm?.alarmSync &&
      elm.alarmSync?.WARNING &&
      elm.alarmSync.WARNING > 0
    ) {
      properties.ALARM = "warning-dot";
    } else {
      properties.OK = true;
    }
    let marker = getDeviceMarker(elm);
    if (marker) {
      if (!markers.find((f) => f == marker)) {
        index = markers.length;
        markers.push(marker);
      } else {
        index = markers.findIndex((f) => f == marker);
      }
      properties.marker = "marker-" + index;
    } else {
      properties.marker = "default";
    }
    temp.properties = properties;
    return temp;
  }
  useEffect(() => {
    console.log("divicesWithLocation use", divicesWithLocation);
  }, [divicesWithLocation]);

  useEffect(() => {
    if (devices.isSuccess && devices.data?.payload?.data) {
      dispatch(
        setFilter({
          totalDevices: devices.data.payload?.totalDocuments
      }))
      if (firstTime) loadMap();
      if (page == 1) {
        locArray = [];
        globalState.data.features = [];
      }
      let data = devices.data.payload?.data;
      if (devices.data?.payload?.totalPages == 0) setDisableProgress(true);
      totalPages = devices.data?.payload?.totalPages;
      let array = [...globalState.data.features];
      markers = [];
      let deviceLocation = [];

      data.forEach((elm) => {
        deviceLocation.push({
          latitude: elm?.location?.latitude,
          longitude: elm?.location?.longitude,
          name: elm?.name,
        });
        if (
          elm.location.longitude <= 180 &&
          elm.location.longitude >= -180 &&
          elm.location.latitude <= 90 &&
          elm.location.latitude >= -90
        ) {
          locArray.push([elm.location.longitude, elm.location.latitude]);
          array.push(formatDevice(elm));
        } else {
          showSnackbar(
            "Asset",
            `${elm.name} have invalid location cordinates`,
            "error",
            1000
          );
        }
      });
      setDivicesWithLocation(deviceLocation);
      globalState.data.features = array;
      updateMap({ data: globalState, bounds: locArray });
      firstTime = false;
      if (totalPages != 0) setProgress(Math.round((page / totalPages) * 100));
      if (Math.round((page / totalPages) * 100) == 100) {
        setTimeout(function () {
          setDisableProgress(true);
        }, 1000);
      }
      if (page < totalPages) dispatch(setMapPage(page + 1));
    }
    if (devices.isSuccess && !devices.data?.payload?.data.length) {
      showSnackbar("Assets", "No Assets found", "error", 1000);
    }
  }, [devices.isFetching]);

  useEffect(async () => {
    if(sourceCoordinates){
      if(tempMarker){
        tempMarker.remove()
      }
      if(sourceMarker){
        sourceMarker.remove()
      }
      const newMarker = new mapboxgl.Marker({color: "#FFBF00"})
        .setLngLat(sourceCoordinates)
        .addTo(map)
        .setPopup(new mapboxgl.Popup({ closeButton : false, closeOnClick: false})
        .setHTML(`<div>Click to Remove source</div>`))
      
      const markerDiv = newMarker.getElement()
      markerDiv.addEventListener('mouseenter', () => newMarker.togglePopup());
      markerDiv.addEventListener('mouseleave', () => newMarker.togglePopup());
      markerDiv.addEventListener("click", () => {
        console.log("clicked")
        setSourceCoordinates(null)
        newMarker.remove()
        setSourceMarker(null)
      })

      setSourceMarker(newMarker)
    }

    if(destinationCoordinates){
      if(tempMarker){
        tempMarker.remove()
      }
      if(destinationMarker){
        destinationMarker.remove()
      }
      const newMarker = new mapboxgl.Marker({color: "green"})
        .setLngLat(destinationCoordinates)
        .addTo(map)
        .setPopup(new mapboxgl.Popup({ closeButton : false, closeOnClick: false, width: "100%"})
        .setHTML(`<div style={{width:"100px"}}>Click to Remove Destination</div>`))

      const markerDiv = newMarker.getElement()
      markerDiv.addEventListener('mouseenter', () => newMarker.togglePopup());
      markerDiv.addEventListener('mouseleave', () => newMarker.togglePopup());
      markerDiv.addEventListener("click", () => {
        console.log("clicked")
        setDestinationCoordinates(null)
        newMarker.remove()
      })

      setDestinationMarker(newMarker)
    }
    if(waypointCoordinates.length){
      console.log({waypointCoordinates})
      waypointCoordinates.forEach((waypoint) => {
        if(tempMarker){
          tempMarker.remove()
        }

        const found = waypointMarkers.find((coords) => coords.id == waypoint.id)
        console.log({found})
        console.log({waypointMarkers})
        console.log({waypoint})
        if(!found){
          const newMarker = new mapboxgl.Marker({color: "blue"})
          .setLngLat([waypoint.lng, waypoint.lat])
          .addTo(map)
          .setPopup(new mapboxgl.Popup({ closeButton : false, closeOnClick: false})
          .setHTML(`<div>Click to Remove Waypoint</div>`))
  
          setWaypointMarkers([...waypointMarkers, {id: waypoint.id, marker:newMarker}])
  
          const markerDiv = newMarker.getElement()
          markerDiv.addEventListener('mouseenter', () => newMarker.togglePopup());
          markerDiv.addEventListener('mouseleave', () => newMarker.togglePopup());
          markerDiv.addEventListener("click", () => {
            console.log("clicked")
            console.log({waypointCoordinates})
            let newWaypointCoordinates = waypointCoordinates.filter((coords) => coords.id !== waypoint.id)
            console.log({newWaypointCoordinates})
            setWaypointCoordinates((prev) => {
              console.log({prev})
              console.log({waypoint}) 
              return prev.filter((coords) => coords.id !== waypoint.id)
            })
          })
        }
      })
    }
    if(map && map.getSource("route") && (!sourceCoordinates || !destinationCoordinates)){
      const newTurfCollection = featureCollection([]);
      map.getSource('route').setData(newTurfCollection);
    }
    if(sourceCoordinates && destinationCoordinates){
      let waypointPoints = ";"
      if(waypointCoordinates.length){
        waypointCoordinates.forEach((waypoint) => {
          waypointPoints = waypointPoints + waypoint.lng + "," + waypoint.lat + ";"
        })
      }
      console.log({waypointPoints})
      const response = await axios.get(`https://api.mapbox.com/directions/v5/mapbox/driving/${sourceCoordinates.join(',')}${waypointPoints}${destinationCoordinates.join(',')}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`);
        console.log({response})
        let data = response.data.routes[0];// to get the coordinates between the source and destination
        let coordinates = data.geometry.coordinates;
        
        let routeGeoJSON;

        if(waypointPoints !==";"){
          routeGeoJSON = featureCollection([
            feature(data.geometry),
          ]);
        } else {
          const len = coordinates.length;
          const distributions = [1, 2];
          if (len > 12) {
              coordinates.splice(1, coordinates.length - 12);
          }
          const optimizedResponse = await axios.get(`https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordinates.join(';')}?distributions=${distributions}&overview=full&steps=true&geometries=geojson&roundtrip=false&source=first&destination=last&access_token=${mapboxgl.accessToken}`,);
          console.log({optimizedResponse})
          const newTurfCollection = featureCollection([]);
          // Update the `route` source by getting the route source
          // and setting the data equal to routeGeoJSO
          routeGeoJSON = featureCollection([
            feature(optimizedResponse.data.trips[0].geometry),
          ]);
        }

        // if the route already exists on the map, we'll reset it using setData
        if (map.getSource('route')) {
          map.getSource('route').setData(routeGeoJSON);
        } 
        else {
        // adding the layer of routeline-active to plot the result
        map.addSource('route', {
          type: 'geojson',
          data: routeGeoJSON,
        });
        map.addLayer(
          {
            id: 'routeline-active',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#0E3464',
              'line-width': ['interpolate', ['linear'], ['zoom'], 12, 3, 22, 12],
            },
          },
          'waterway-label'
        );
      }
    }
  }, [sourceCoordinates, destinationCoordinates, waypointCoordinates])

  useEffect(() => {
    console.log("Waypoint coordinates changed...", waypointCoordinates)
    waypointMarkers.forEach((marker) => {
      console.log({waypointCoordinates})
      const found = waypointCoordinates.find((coords) => coords.id == marker.id)
      console.log({found})
      if(!found){
        marker.marker.remove()
      }
    })
  }, [waypointCoordinates])

  useEffect(() => {
    if (
      props.layoutPermission?.markerDefault
        ? props.layoutPermission?.markerDefault == "Health"
          ? props.alarms
          : true
        : false
    ) {
      toggleState = props.layoutPermission?.markerDefault;
      console.log({datapointState})
      datapointState = datapointState || sensors[0].name;
    }
    connector.on("updateFilter", (payload) => {
      let sensor = props.dataPointThresholds.find(
        (g) => g.dataPoint?.name == payload
      );
      if (sensor && !heat) {
        clickDatapoint(payload, sensor.dataPoint?.friendlyName);
      }
    });
    return () => {
      dispatch(setMapPage(1));
      toggleState = "Connectivity";
      datapointState = null;
      heat = false;
      globalState = {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
        cluster: true,
        clusterMaxZoom: 14,
        clusterRadius: 10,
      };
      locArray = [];
      tempLocArray = [];
      firstTime = true;
      totalPages = null;
      search = false;
      device = "";
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, []);

  function loadMap() {
    map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: props.layoutPermission?.mapDefault
        ? mapStyle[props.layoutPermission?.mapDefault]
        : props.layoutPermission.mapModes.indexOf("light") != -1
        ? mapStyle.light
        : mapStyle.street,
      maxBounds: [
        [-180, -90],
        [180, 90],
      ],
    });
    mapinit(map);
    console.log({datapoint, friendlyName})
    if(datapoint){
      clickDatapoint(datapoint, friendlyName)
    }
  }

  function updateStyles() {
    console.log('hereeeeeeeeee map',map)
    if (!map.getSource("geoData")) {
      map.addSource("geoData", globalState);
    }

    if (heat) {
      console.log('heat trueeee')
      map.addLayer(
        {
          id: "heat",
          type: "heatmap",
          source: "geoData",
          maxzoom: 23,
          paint: {
            // Increase the heatmap weight based on frequency and property magnitude
            "heatmap-weight": [
              "interpolate",
              ["linear"],
              ["get", "mag"],
              0,
              0,
              6,
              1,
            ],
            // Increase the heatmap color weight weight by zoom level
            // heatmap-intensity is a multiplier on top of heatmap-weight
            "heatmap-intensity": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              1,
              23,
              3,
            ],
            // Color ramp for heatmap.  Domain is 0 (low) to 1 (high).
            // Begin color ramp at 0-stop with a 0-transparancy color
            // to create a blur-like effect.
            "heatmap-color": [
              "interpolate",
              ["linear"],
              ["heatmap-density"],
              0,
              "rgba(33,102,172,0)",
              0.2,
              "rgb(103,169,207)",
              0.4,
              "rgb(209,229,240)",
              0.6,
              "rgb(253,219,199)",
              0.8,
              "rgb(239,138,98)",
              1,
              "rgb(178,24,43)",
            ],
            // Adjust the heatmap radius by zoom level
            "heatmap-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              0,
              2,
              23,
              20,
            ],
            // Transition from heatmap to circle layer by zoom level
            "heatmap-opacity": 1,
          },
        },
        "waterway-label"
      );

      map.addLayer(
        {
          id: "heat-point",
          type: "circle",
          source: "geoData",
          minzoom: 20,
          paint: {
            // Size circle radius by earthquake magnitude and zoom level
            "circle-radius": [
              "interpolate",
              ["linear"],
              ["zoom"],
              7,
              ["interpolate", ["linear"], ["get", "mag"], 1, 1, 6, 4],
              16,
              ["interpolate", ["linear"], ["get", "mag"], 1, 5, 6, 50],
            ],
            // Color circle by earthquake magnitude
            "circle-color": [
              "interpolate",
              ["linear"],
              ["get", "mag"],
              1,
              "rgba(33,102,172,0)",
              2,
              "rgb(103,169,207)",
              3,
              "rgb(209,229,240)",
              4,
              "rgb(253,219,199)",
              5,
              "rgb(239,138,98)",
              6,
              "rgb(178,24,43)",
            ],
            "circle-stroke-color": "white",
            "circle-stroke-width": 2,
            // Transition from heatmap to circle layer by zoom level
            "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
          },
        },
        "waterway-label"
      );
    } else {
      if (!map.getLayer("clusters")) {
        console.log('hereeee')
        map.addLayer({
          id: "clusters",
          type: "circle",
          source: "geoData",
          filter: ["has", "point_count"],
          paint: {
            "circle-stroke-width": 2,
            "circle-stroke-opacity": 0.2,
            "circle-color": [
              "step",
              ["get", "point_count"],
              metaDataValue.branding.secondaryColor,
              100,
              metaDataValue.branding.secondaryColor,
              750,
              metaDataValue.branding.secondaryColor,
            ],
            "circle-radius": [
              "step",
              ["get", "point_count"],
              20,
              100,
              30,
              750,
              40,
            ],
          },
        });

        map.addLayer({
          id: "cluster-count",
          type: "symbol",
          source: "geoData",
          paint: {
            "text-color": "#fff",
          },
          layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12,
          },
        });
      }
      if (toggleState == "Connectivity") {
        map.addLayer(
          {
            id: "active-point",
            type: "circle",
            source: "geoData",
            filter: ["all", ["!", ["has", "point_count"]]],

            paint: {
              "circle-color": ["get", "CONNECTIVITY"],
              "circle-radius": 5,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          },
          "clusters"
        );
      } else if (toggleState == "Health") {
        map.addLayer(
          {
            id: "active-point",
            type: "circle",
            source: "geoData",
            filter: ["all", ["!", ["has", "point_count"]], ["has", "OK"]],

            paint: {
              "circle-color": "#5fb762",
              "circle-radius": 5,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          },
          "clusters"
        );

        map.addLayer(
          {
            id: "down-point",
            type: "symbol",
            source: "geoData",
            filter: [
              "all",
              ["!", ["has", "point_count"]],
              ["!", ["has", "OK"]],
            ],
            layout: {
              "icon-image": ["get", "ALARM"],
            },
          },
          "clusters"
        );
      } else if (toggleState == "Monitoring") {
        console.log('monitoring',datapointState)
        map.addLayer(
          {
            id: "active-point",
            type: "circle",
            source: "geoData",
            filter: ["all", ["!", ["has", "point_count"]]],

            paint: {
              "circle-color": ["get", datapointState],
              "circle-radius": 5,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#fff",
            },
          },
          "clusters"
        );
      } else if (toggleState == "Marker") {
        map.addLayer(
          {
            id: "marker-img",
            type: "symbol",
            source: "geoData", // reference the data source
            layout: {
              "icon-allow-overlap": true,
              "icon-image": ["get", "marker"], // reference the image
              "icon-size": 0.06,
            },
            paint: {
              "icon-color": "white",
              "icon-halo-color": "red",
              "icon-halo-width": 10,
            },
          },
          "clusters"
        );
      }
    }
  }

  function calculateDistance(coord1, coord2) {
    const R = 6371; // Earth's radius in kilometers
    const dLat = deg2rad(coord2.latitude - coord1.latitude);
    const dLon = deg2rad(coord2.longitude - coord1.longitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(coord1.latitude)) *
        Math.cos(deg2rad(coord2.latitude)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    const distance = R * c; // Distance in kilometers
    return distance;
  }
  const fineNearestLocation = () => {
    let nearestObject = null;
    let minDistance = Infinity;
    console.log("divicesWithLocation in", divicesWithLocation);
    divicesWithLocation.forEach((obj) => {
      const distance = calculateDistance(
        {
          latitude: contextmenuCoordinates?.lat,
          longitude: contextmenuCoordinates?.lng,
        },
        obj
      );
      if (distance < minDistance) {
        minDistance = distance;
        nearestObject = obj;
      }
    });
    // setNearestAsset(nearestObject);
    console.log("Nearest object:", nearestObject);
    console.log("Distance:", minDistance, "km");
    return nearestObject;
  };
  const mapinit = (map) => {
    // map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(draw);

    map.on("mousedown", () => {
      setChecked(false);
    });

    map.on("load", () => {
      if (props.tracking != "ALL") draw.changeMode("static");
    });

    map.on("style.load", function () {
      var criticalDot = generateDot("rgba(191,53,53,", "#e1241e", 80, map);
      var majorDot = generateDot("rgba(132,66,4,", "#844204", 80, map);
      var minorDot = generateDot("rgba(254,159,27,", "#fe9f1b", 80, map);
      var warningDot = generateDot("rgba(51,153,255,", "#2E3039", 80, map);

      map.on("draw.create", Creation);
      map.on("draw.update", Update);
      map.on("draw.selectionchange", Selected);
      map.on("draw.modechange", (e) => {
        if (e.mode == "simple_select") {
          setPolygon(false);
          setGroupGeo(false);
        }
      });

      map.addImage("critical-dot", criticalDot, { pixelRatio: 2 });
      map.addImage("major-dot", majorDot, { pixelRatio: 2 });
      map.addImage("minor-dot", minorDot, { pixelRatio: 2 });
      map.addImage("warning-dot", warningDot, { pixelRatio: 2 });
      // Add a right-click event listener to the map
      map.on("contextmenu", (e) => {
        // Log the coordinates to the console
        
        setContextmenuCoordinates({ lng: e.lngLat.lng, lat: e.lngLat.lat });
        if (map) {
        // Create a marker
        console.log({tempMarker})
        if(tempMarker){
          console.log("Found Temporary Marker")
          tempMarker.remove()
        }
        const marker = new mapboxgl.Marker()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map);
        console.log({marker})
        tempMarker = marker
        }
        setOpenMapModel(true);
        // fineNearestLocation();
        // dropPin({ lng: e.lngLat.lng, lat: e.lngLat.lat })
        console.log(`Right-clicked at: ${JSON.stringify(e.lngLat)}`);
      });
      markers.forEach((marker, ind) => {
        map.loadImage(marker, (error, image) => {
          if (error) throw error;
          map.addImage("marker-" + ind, image);
        });
      });
      map.loadImage(Pin, (error, image) => {
        if (error) throw error;
        map.addImage("default", image);
      });
      updateStyles();
    });

    map.on("click", "clusters", function (e) {
      var features = map.queryRenderedFeatures(e.point, {
        layers: ["clusters"],
      });
      var clusterId = features[0].properties.cluster_id;
      map
        .getSource("geoData")
        .getClusterExpansionZoom(clusterId, function (err, zoom) {
          if (err) return;

          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom,
          });
        });
    });

    map.on("moveend", function (e) {
      if (flying) {
        if (popupObj) popupObj.remove();
        popupObj = new mapboxgl.Popup({
          closeButton: false,
          closeOnMove: true,
          maxWidth: "auto",
        });
        const placeholder = document.createElement("div");
        ReactDOM.render(
          <Provider store={store}>
            <Popup
              layoutPermission={props.layoutPermission}
              sensors={sensors}
              history={props.history}
              link={props.link}
              image={props.asset.image}
              device={device}
              alarms={props.alarms}
              dataPointThresholds={props.dataPointThresholds}
              serviceId={props.id}
            />
          </Provider>,
          placeholder
        );
        popupObj.setLngLat(coordinates).setDOMContent(placeholder).addTo(map);
        flying = false;
      }
    });

    map.on("click", "down-point", function (e) {
      map.getCanvas().style.cursor = "pointer";
      coordinates = e.features[0].geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      device = e.features[0].id;
      flying = true;
      map.flyTo({
        center: coordinates,
      });
    });

    map.on("click", "active-point", function (e) {
      map.getCanvas().style.cursor = "pointer";
      coordinates = e.features[0].geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      device = e.features[0].id;
      flying = true;
      map.flyTo({
        center: coordinates,
      });
    });

    map.on("click", "marker-img", function (e) {
      map.getCanvas().style.cursor = "pointer";
      coordinates = e.features[0].geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      device = e.features[0].id;
      flying = true;
      map.flyTo({
        center: coordinates,
      });
    });

    map.on("mouseenter", "down-point", function (e) {
      map.getCanvas().style.cursor = "pointer";
      coordinates = e.features[0].geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      device = e.features[0].id;
      if (popupObj) popupObj.remove();
      popupObj = new mapboxgl.Popup({
        closeButton: false,
        closeOnMove: true,
        maxWidth: "auto",
      });
      const placeholder = document.createElement("div");
      ReactDOM.render(
        <Provider store={store}>
          <Popup
            layoutPermission={props.layoutPermission}
            sensors={sensors}
            history={props.history}
            link={props.link}
            image={props.asset.image}
            device={device}
            alarms={props.alarms}
            dataPointThresholds={props.dataPointThresholds}
            serviceId={props.id}
          />
        </Provider>,
        placeholder
      );
      popupObj.setLngLat(coordinates).setDOMContent(placeholder).addTo(map);
    });

    map.on("mouseenter", "active-point", function (e) {
      map.getCanvas().style.cursor = "pointer";
      coordinates = e.features[0].geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      device = e.features[0].id;
      if (popupObj) popupObj.remove();
      popupObj = new mapboxgl.Popup({
        closeButton: false,
        closeOnMove: true,
        maxWidth: "auto",
      });
      const placeholder = document.createElement("div");
      ReactDOM.render(
        <Provider store={store}>
          <Popup
            layoutPermission={props.layoutPermission}
            sensors={sensors}
            history={props.history}
            link={props.link}
            image={props.asset.image}
            device={device}
            alarms={props.alarms}
            dataPointThresholds={props.dataPointThresholds}
            serviceId={props.id}
          />
        </Provider>,
        placeholder
      );
      popupObj.setLngLat(coordinates).setDOMContent(placeholder).addTo(map);
    });

    map.on("mouseenter", "marker-img", function (e) {
      map.getCanvas().style.cursor = "pointer";
      coordinates = e.features[0].geometry.coordinates.slice();

      while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
      }
      device = e.features[0].id;
      if (popupObj) popupObj.remove();
      popupObj = new mapboxgl.Popup({
        closeButton: false,
        closeOnMove: true,
        maxWidth: "auto",
      });
      const placeholder = document.createElement("div");
      ReactDOM.render(
        <Provider store={store}>
          <Popup
            layoutPermission={props.layoutPermission}
            sensors={sensors}
            history={props.history}
            link={props.link}
            image={props.asset.image}
            device={device}
            alarms={props.alarms}
            dataPointThresholds={props.dataPointThresholds}
            serviceId={props.id}
          />
        </Provider>,
        placeholder
      );
      popupObj.setLngLat(coordinates).setDOMContent(placeholder).addTo(map);
    });

    map.on("mouseleave", "down-point", function (e) {
      map.getCanvas().style.cursor = "";
    });

    map.on("mouseleave", "active-point", function (e) {
      map.getCanvas().style.cursor = "";
    });

    map.on("mouseleave", "marker-img", function (e) {
      map.getCanvas().style.cursor = "";
    });

    map.on("mouseenter", "clusters", function () {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "clusters", function () {
      map.getCanvas().style.cursor = "";
    });
    setMapLoaded(false);
  };

  function Creation(e) {
    if (e.features[0].properties.isCircle) {
      setType("Circle");
      setCircle(e);
    } else {
      let coordinates = e.features[0].geometry.coordinates[0];
      let type = e.features[0].geometry.type;
      setType(type);
      setGeofence({ type: type, coordinates: [coordinates] });
    }
    setRow(null);
    console.log("====================================");
    console.log("CHK", popupType);
    console.log("====================================");
    if (popupType == "Geo") handlepopupOpen();
    else if (popupType == "Group") setOpenGroup(true);
    draw.delete(e.features[0].id);
  }

  function generateUrl(origin, destination, waypoints){
    let url = "https://www.google.com/maps/dir/?api=1"
    if(destination){
      url += `&destination={ ${destination[1]} , ${destination[0]}}`
    }
    if(origin){
      url += `&origin={ ${origin[1]} , ${origin[0]}}`
    }
    if(waypoints.length){
      console.log({waypoints})
      url += "&waypoints="
      waypoints.forEach((waypoint, index) => {
        if(index==0){
          url += `{ ${waypoint.lat} , ${waypoint.lng} }`
        } else {
          url += `|{ ${waypoint.lat} , ${waypoint.lng} }`
        }
      })
    }
    return url
  }

  async function Update(e) {
    let body = {};
    if (e.features[0].properties.isCircle) {
      body = {
        region: {
          type: "Circle",
          coordinates: e.features[0].geometry.coordinates,
        },
        center: e.features[0].properties.center,
        radius: e.features[0].properties.radiusInKm,
      };
    } else {
      body = {
        region: {
          type: "Polygon",
          coordinates: e.features[0].geometry.coordinates,
        },
      };
    }
    editGeofence({ token, body, id: e.features[0].id });
  }

  function Selected(e) {
    if (e.features[0]) {
      if (!checked) setChecked(true);
      setActiveId(e.features[0].id);
      setSelected(e.features[0].id);
    } else {
      setActiveId(null);
      setSelected(null);
    }
  }

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const handlepopupClose = () => {
    geofenceForm.resetForm();
    setOpenPopup(false);
  };

  const handlepopupOpen2 = () => {
    setOpenPopup2(true);
  };

  const handlepopupClose2 = () => {
    setOpenPopup2(false);
  };

  async function onSubmitDeletion() {
    deleteGeofence({ token, id: activeId });
  }

  function initializeStylesArr() {
    let temp = [...props.layoutPermission.mapModes];
    let heatIndex = props.layoutPermission.mapModes.indexOf("heat");
    if (heatIndex != -1) temp.splice(heatIndex, 1);
    return temp;
  }

  function handleStyleChange() {
    if (mapStyleState != "disabled") {
      let index = stylesArr.indexOf(mapStyleState) + 1;
      if (index >= stylesArr.length) index = 0;
      setMapStyleState(stylesArr[index]);
      map.setStyle(mapStyle[stylesArr[index]], { diff: true });
    }
  }

  function handleHeatMap() {
    setheatLoader(true);
    let style;
    if (heatMap == "heatMap") {
      let first =
        props.layoutPermission.mapModes.indexOf("light") != -1
          ? "light"
          : "street";
      heat = false;
      setHeatMap("");
      style = mapStyle[first];
      setMapStyleState(first);
    } else {
      heat = true;
      setHeatMap("heatMap");
      style = "mapbox://styles/mapbox/dark-v10";
      setMapStyleState("disabled");
    }

    map.setStyle(style, { diff: true });
    // if (satellite == "satellite")
    // setTimeout(() => {
    //   updateStyles();
    // }, 500);

    setTimeout(() => {
      setheatLoader(false);
    }, 500);
  }

  function generateLimit() {
    let res = { min: null, max: null };
    let sensor = props.dataPointThresholds.find(
      (e) => e.dataPoint?.name == datapoint
    );
    if (sensor && sensor?.ranges.length)
      res = {
        min: sensor.ranges[0].min,
        max: sensor.ranges[sensor.ranges.length - 1].max,
      };
    else if (sensor)
      res = {
        min: sensor.min,
        max: sensor.max,
      };
    return res;
  }

  function deleteSelected() {
    draw.delete(activeId);
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }
  const accept = () => {
    setOpenMapModel(false);
  };
  const reject = () => {
    setOpenMapModel(false);
  };

  // Function to convert degrees to radians
  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  const dropPin = () => {
    setOpenMapModel(false);

    if (map) {
      map.easeTo({
        center: [
          fineNearestLocation()?.longitude,
          fineNearestLocation()?.latitude,
        ],
        zoom: 15,
        duration: 2000,
        easing: (t) => t,
      });
    }
  };
  const googleMapLink = `https://www.google.com/maps?q=${contextmenuCoordinates?.lat},${contextmenuCoordinates?.lng}`;

  // Replace the placeholders with your actual subject and body content
  const subject = encodeURIComponent(
    `${metaDataValue.userInfo.firstName} is sharing map coordinates`
  );
  const body = `Hello, %0D%0A ${metaDataValue.userInfo.firstName} ${metaDataValue.userInfo.lastName} wants to share following map coordinates with you %0D%0ALat: ${contextmenuCoordinates?.lat}, LNG ${contextmenuCoordinates?.lng}%0D%0ALink to this coordinate in Google Maps: ${googleMapLink}%0D%0ANearest Asset: ${fineNearestLocation()?.name} %0D%0ARegards,%0D%0AXLERATE TEAM`;

  // Construct the mailto link with subject and body parameters
  const mailtoLink = `mailto:${userEmail}?subject=${subject}&body=${body}`;

  return (
    <Fragment>
      <Dialog
        open={openMapModel}
        onClose={reject}
        aria-labelledby="form-dialog-title"
        maxWidth="md"
      >
        <DialogTitle id="form-dialog-title">
          <Grid container>
            <Grid item xs={8}>
              <span>{"GPS Coordinates & Navigation"}</span>
            </Grid>
            <Grid item xs={4} style={{ textAlign: "end" }}>
              <PlaceIcon />
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
        <Divider style={{ marginTop: "0.5rem" }} />
        <div style={{marginTop: "0.5rem", marginBottom:"0.5rem"}}>
          <span style={{fontSize: "15px", fontWeight: "bold"}}>Coordinates</span>
        </div>
          <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ display: "flex" }}>
              <b style={{ marginRight: "0.5rem" }}>Lat:</b>
              {contextmenuCoordinates?.lat}
              <b style={{ marginRight: "0.5rem", marginLeft: "1rem" }}>long:</b>
              {contextmenuCoordinates?.lng}
              <div style={{ marginLeft: "2.7rem" }}>
                <ContentCopyIcon
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    showSnackbar(
                      "Copied",
                      "co-ordinates have been copied",
                      "success",
                      1000
                    );
                    navigator.clipboard.writeText(
                      `Lat: ${contextmenuCoordinates?.lat} Long: ${contextmenuCoordinates?.lng}`
                    );
                  }}
                />
              </div>
            </span>
          </span>

          <span>
            <Grid
              container
              style={{
                marginTop: "1rem",
              }}
            >
              <Grid item xs={3}>
                Nearest Asset:
              </Grid>
              <Grid
                item
                xs={8}
                style={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  maxWidth: "20rem",
                }}
              >
                {" "}
                <Link
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={dropPin}
                  style={{ cursor: "pointer" }}
                >
                  {fineNearestLocation()?.name}
                </Link>
              </Grid>
              <Grid item xs={1} style={{ textAlign: "end", cursor: "pointer" }}>
                <GpsFixedIcon onClick={dropPin} />
              </Grid>
            </Grid>
          </span>

          <span
            style={{
              display: "flex",
              marginTop: "1rem",
            }}
          >
            <Grid container>
              <Grid item xs={8}>
                <span>
                  Open in google map <span>[browser's window]</span>
                </span>
              </Grid>
              <Grid item xs={4}  style={{textAlign:"end",cursor:"pointer"}} >
              <OpenInNewOffIcon
              style={{ cursor: "pointer" }}
              onClick={() => {
                // Construct the Google Maps URL with the latitude and longitude parameters
                const mapUrl = `https://www.google.com/maps?q=${contextmenuCoordinates?.lat},${contextmenuCoordinates?.lng}`;

                // Open a new window with the Google Maps URL
                window.open(mapUrl, "_blank");
              }}
            />
              </Grid>
            </Grid>
          </span>
          <span
            style={{
              display: "flex",
              marginTop: "1rem",
            }}
          >
            <Grid container>
              <Grid item xs={10}>
              <TextField
              id="firstName"
              margin="dense"
              type="email"
              // value={props.apiKeys.publicToken}
              onChange={(e) => setUserEmail(e.target.value)}
              fullWidth
              label="Share via email"
            />
              </Grid>
              <Grid item xs={2} style={{cursor:"pointer",justifyContent:"end",display:'flex',alignItems:'center'}}>
              <IconButton
              size="small"
              height="10"
              style={{ padding: "0" }}
              disabled={!userEmail}
              onClick={(e) => {
                window.location.href = mailtoLink;
                e.preventDefault();
              }}
            >
              <MailIcon />
            </IconButton>
              </Grid>
            </Grid>


          </span>
          <Divider style={{ marginTop: "0.5rem" }} />
          <div style={{marginTop: "0.5rem", marginBottom:"0.5rem"}}>
            <span style={{fontSize: "15px", fontWeight: "bold"}}>Navigation</span>
          </div>
          <span>
            <Grid container style={{marginTop: "1rem", display: "flex", justifyContent: "space-evenly"}}>
                <Grid item>
                <Tooltip
                    title = "Select these coordinates as the source"
                    TransitionComponent={Zoom}
                    arrow
                    placement="bottom"
                  >
                    <Button sx={{borderRadius: "5px", backgroundColor: "#FFBF00", color: "white", textTransform: "none"}} variant="contained" onClick={() => {
                      setSourceCoordinates([contextmenuCoordinates?.lng, contextmenuCoordinates?.lat])
                      if(tempMarker){
                        tempMarker.remove()
                      }
                      setOpenMapModel(false)
                    }}>
                      Source
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip
                    title = "Add a waypoint at these coordinates"
                    TransitionComponent={Zoom}
                    arrow
                    placement="bottom"
                  >
                    <Button sx={{borderRadius: "5px", backgroundColor: "blue", color: "white", textTransform: "none"}} variant="contained" disabled={!sourceCoordinates || !destinationCoordinates || waypointCoordinates.length > 9} onClick={() => {
                      setWaypointCoordinates([...waypointCoordinates, {id: Math.random().toString(36).substr(2, 6), lng: contextmenuCoordinates?.lng, lat: contextmenuCoordinates?.lat}])
                      if(tempMarker){
                        tempMarker.remove()
                      } 
                      setOpenMapModel(false)
                    }}>
                      Add Waypoint
                    </Button>
                  </Tooltip>
                </Grid>
                <Grid item>
                  <Tooltip
                    title="Select these coordinates as the destination"
                    placement="bottom"
                    TransitionComponent={Zoom}
                    arrow
                  >
                    <Button sx={{borderRadius: "5px", backgroundColor: "green", color: "white", textTransform: "none"}} variant="contained" onClick={() => {
                      setDestinationCoordinates([contextmenuCoordinates?.lng, contextmenuCoordinates?.lat])
                      if(tempMarker){
                        tempMarker.remove()
                      } 
                      setOpenMapModel(false)
                    }}>
                      Destination
                    </Button>
                  </Tooltip>
                </Grid>
            </Grid>
          </span>
        </DialogContent>
      </Dialog>
      {/* <Dialog open={openMapModel} onClose={reject}>
        <DialogTitle id="alert-dialog-title">Share coordinates</DialogTitle>
        <DialogContent style={{ overflow: "hidden" }}>
          <DialogContentText id="alert-dialog-description">
            <span style={{ display: "flex", flexDirection: "column" }}>
              via Email:
              <span>
                <TextField
                  id="outlined-basic"
                  label="Outlined"
                  variant="outlined"
                />
              </span>
            </span>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={reject} color="error">
            Cancel
          </Button>
          <Button onClick={() => accept()} color="secondary">
            <span>Proceed</span>
          </Button>
        </DialogActions>
      </Dialog> */}
      <Dialog
        open={openShareModal}
        onClose={() => {setOpenShareModal(false)}}
        aria-labelledby="share-route"
        maxWidth="md"
      >
        <DialogTitle>
          <Grid container>
            <Grid item xs={8}>
              <span>{"Share Planned Route"}</span>
            </Grid>
            <Grid item xs={4} style={{ textAlign: "end" }}>
              <ShareLocationIcon />
            </Grid>
          </Grid>
        </DialogTitle>
        <DialogContent>
          <Grid container>
           <Paper
              component="form"
              sx={{ p: '2px 4px', display: 'flex', alignItems: 'center', width: "600px", backgroundColor: "lightgray" }}
            >
              <InputBase
                sx={{ ml: 1, flex: 1, textOverflow:"wrap" }}
                disabled
                multiline
                inputProps={{ 'aria-label': 'search google maps' }}
                value={generateUrl(sourceCoordinates, destinationCoordinates, waypointCoordinates)}
              />
              <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
              <IconButton color="primary" sx={{ p: '10px' }} aria-label="directions">
                <ContentCopyIcon
                  onClick={() => {
                    showSnackbar(
                      "Copied",
                      "co-ordinates have been copied",
                      "success",
                      1000
                    );
                    navigator.clipboard.writeText(
                      generateUrl(sourceCoordinates, destinationCoordinates, waypointCoordinates)
                    );
                  }} 
                />
              </IconButton>
            </Paper>
          </Grid>
          <div style={{display: "flex", justifyContent: "space-evenly", marginTop: "10px"}}>
            <Button 
              sx={{borderRadius: "5px", color: "white", textTransform: "none"}} color="primary" variant="contained"
              onClick={() => {
                // Open a new window with the Google Maps URL
                window.open(generateUrl(sourceCoordinates, destinationCoordinates, waypointCoordinates), "_blank");
              }}
            >
                Open in Browser
            </Button>
            <Button 
              sx={{borderRadius: "5px", color: "white", textTransform: "none"}} color = "secondary" variant="contained"
              onClick={(e) => {
                const urlToShare = generateUrl(sourceCoordinates, destinationCoordinates, waypointCoordinates)
                console.log({urlToShare})
                
                let emailsubject = encodeURIComponent(
                  `${metaDataValue.userInfo.firstName} is sharing planned route`
                );
                const emailbody = encodeURIComponent(`Hello, 

${metaDataValue.userInfo.firstName} ${metaDataValue.userInfo.lastName} wants to share the following route with you
Link to this route in Google Maps: 
${urlToShare}

Regards,
XLERATE TEAM`);
                let mailLink = `mailto:?subject=${emailsubject}&body=${emailbody}`
                window.location.href = mailLink;
                e.preventDefault();
              }}
            >
                Share via Email
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this geofence?"
          id={activeId}
          handleDelete={onSubmitDeletion}
          handleClose={toggleDelete}
          deleteResult={deleteGeofenceResult}
        />
      ) : null}

      {openGroup ? (
        <Group
          id={props.id}
          setOpenPopup={setOpenGroup}
          solution={props.id}
          group={filtersValue.group.id != "" ? filtersValue.group.id : null}
          type={type}
          // permission={props.controls}
          geofence={geofence}
          circle={circle}
          clear={deleteSelected}
        />
      ) : null}

      {openPopup ? (
        <Edit
          id={props.id}
          row={row}
          setOpenPopup={setOpenPopup}
          serviceId={props.id}
          group={filtersValue.group.id != "" ? filtersValue.group.id : null}
          type={type}
          permission={props.controls}
          geofence={geofence}
          circle={circle}
          clear={deleteSelected}
        />
      ) : null}

      {!devices.isLoading && !disableProgress && totalPages != 1 ? (
        <LinearProgress
          variant="determinate"
          value={progress}
          color="secondary"
        />
      ) : null}
      {!devices.isLoading ? (
        <div
          style={{
            position: "relative",
            minHeight: props.open ? "" : `${props.minHeight || 250}px`,
            height: props.open
              ? props.emDashboard
                ? "calc(100vh - 30px)"
                : "calc(100vh - 150px)"
              : `calc(100vh - ${props.height || 40}px)`,

            // height: props.open ? ( props.emDashboard ? "calc(100vh - 30px)" : "calc(100vh - 150px)") : "100%",
            borderRadius:
              !devices.isLoading && !disableProgress && totalPages != 1
                ? "0px"
                : "10px",
          }}
          ref={mapContainerRef}
        >
          {!mapLoaded ? (
            <Fragment>
              {stylesArr.length > 1 ? (
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "0",
                    zIndex: "1",
                  }}
                >
                  <Tooltip
                    title={
                      mapStyleState == "street"
                        ? "Street View"
                        : mapStyleState == "light"
                        ? "Light Mode"
                        : mapStyleState == "satellite"
                        ? "Satellite View"
                        : mapStyleState == "heat"
                        ? "Heat Map"
                        : "Disabled"
                    }
                    placement="right"
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <Avatar
                      style={{
                        backgroundColor: "white",
                        height: "50px",
                        width: "50px",
                        cursor: "pointer",
                        transition: "0.5s",
                        marginLeft: "10px",
                      }}
                      onClick={handleStyleChange}
                    >
                      <FontAwesomeIcon
                        icon={
                          mapStyleState == "street"
                            ? faGlobeEurope
                            : mapStyleState == "light"
                            ? faMap
                            : mapStyleState == "satellite"
                            ? faSatellite
                            : faSlash
                        }
                        style={{
                          color: "#333333",
                        }}
                      />
                    </Avatar>
                  </Tooltip>
                </div>
              ) : null}

              {props.layoutPermission.mapModes.indexOf("heat") != -1 ? (
                <div
                  style={{
                    position: "absolute",
                    top: stylesArr.length > 1 ? "50px" : "10px",
                    left: "0px",
                    zIndex: "1",
                  }}
                >
                  <Tooltip
                    title={
                      heatMap == "heatMap"
                        ? "Heat Map View"
                        : "Standard Map view"
                    }
                    placement="right"
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <Avatar
                      style={{
                        backgroundColor:
                          heatMap == "heatMap"
                            ? metaDataValue.branding.secondaryColor
                            : "white",
                        height: "50px",
                        width: "50px",
                        cursor: heatLoader ? "" : "pointer",
                        transition: "0.5s",
                        marginLeft: "10px",
                        marginTop: "20px",
                      }}
                      onClick={() => {
                        if (!heatLoader) handleHeatMap();
                      }}
                    >
                      {heatLoader ? (
                        <CircularProgress
                          style={{
                            color: heatMap == "heatMap" ? "white" : "#333333",
                            height: "15px",
                            width: "15px",
                          }}
                        />
                      ) : (
                        <LensBlurIcon
                          style={{
                            color: heatMap == "heatMap" ? "white" : "#333333",
                          }}
                          fontSize="large"
                        />
                      )}
                    </Avatar>
                  </Tooltip>
                </div>
              ) : null}

              <div
                style={{
                  position: "absolute",
                  display: "grid",
                  gridGap: "10px",
                  top: "110px",
                  right: "10px",
                  zIndex: "1",
                }}
              >
                <Tooltip
                  title="Create group using polygon"
                  placement="left"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <div
                    className={classes.button}
                    style={{
                      borderRadius: props.tracking ? "4px 4px 0px 0px" : "4px",
                    }}
                    onClick={() => {
                      popupType = "Group";
                      if (groupGeo) draw.changeMode("simple_select");
                      else draw.changeMode("draw_polygon");
                      setGroupGeo((prev) => !prev);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faSitemap}
                      style={{
                        color: !groupGeo
                          ? "#333333"
                          : metaDataValue.branding.secondaryColor,
                        fontSize: "16px",
                      }}
                    />
                  </div>
                </Tooltip>
                {props.tracking ? (
                  <span>
                    {props.tracking == "ALL" ? (
                      <Fragment>
                        <Tooltip
                          title="Create Geofence"
                          placement="left"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <div
                            className={classes.button}
                            style={{ borderRadius: "4px 4px 0px 0px" }}
                            onClick={() => {
                              popupType = "Geo";
                              if (polygon) draw.changeMode("simple_select");
                              else draw.changeMode("draw_polygon");
                              setPolygon((prev) => !prev);
                            }}
                          >
                            <FontAwesomeIcon
                              icon={faDrawPolygon}
                              style={{
                                color: !polygon
                                  ? "#333333"
                                  : metaDataValue.branding.secondaryColor,
                                fontSize: "16px",
                              }}
                            />
                          </div>
                        </Tooltip>
                        <Divider style={{ background: "#e4e4e4" }} />
                      </Fragment>
                    ) : null}
                    <Tooltip
                      title="Geofence List"
                      placement="left"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <div
                        className={classes.button}
                        style={{
                          borderRadius:
                            props.tracking == "ALL"
                              ? "0px 0px 4px 4px"
                              : "4px 4px 4px 4px",
                        }}
                        onClick={() => {
                          setChecked((prev) => !prev);
                        }}
                      >
                        <ListAltIcon
                          color="secondary"
                          style={{
                            color: checked
                              ? metaDataValue.branding.secondaryColor
                              : "#333333",
                            fontSize: "17px",
                          }}
                        />
                      </div>
                    </Tooltip>
                  </span>
                ) : null}

                {sourceCoordinates || destinationCoordinates || waypointCoordinates.length ? <Tooltip
                  title="Clear Route"
                  placement="left"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <div
                    className={classes.button}
                    style={{ borderRadius: "4px" }}
                    onClick={() => {
                      //Clear Source Coordinates
                      setSourceCoordinates(null)
                      if(sourceMarker){
                        sourceMarker.remove()
                        setSourceMarker(null)
                      }
                      //Clear Destination Coordinates
                      setDestinationCoordinates(null)
                      if(destinationMarker){
                        destinationMarker.remove()
                        setDestinationMarker(null)
                      }
                      //Clear Waypoint Coordinates
                      setWaypointCoordinates([])
                      if(waypointMarkers.length){
                        waypointMarkers.forEach(((waypoint) => {
                          waypoint.marker.remove()
                        }))
                        setWaypointMarkers([])
                      }
                    }}
                  >
                    <CloseOutlined
                      style={{ color: "#333333", fontSize: "17px" }}
                    />
                  </div>
                </Tooltip> : null}
                {sourceCoordinates && destinationCoordinates ? <Tooltip
                  title="Share Route"
                  placement="left"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <div
                    className={classes.button}
                    style={{ borderRadius: "4px" }}
                    onClick={() => {
                      setOpenShareModal(true)
                    }}
                  >
                    <ShareLocationIcon
                      style={{ color: "#333333", fontSize: "17px" }}
                    />
                  </div>
                </Tooltip> : null}

                <Tooltip
                  title="Re-Center"
                  placement="left"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <div
                    className={classes.button}
                    style={{ borderRadius: "4px" }}
                    onClick={() => {
                      let coordinates;
                      if (!search) coordinates = locArray;
                      else coordinates = tempLocArray;
                      if (coordinates.length > 0) {
                        let bounds = coordinates.reduce(function (
                          bounds,
                          coord
                        ) {
                          return bounds.extend(coord);
                        },
                        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
                        map.fitBounds(bounds, { padding: 100 });
                      }
                    }}
                  >
                    <CropFreeIcon
                      style={{ color: "#333333", fontSize: "17px" }}
                    />
                  </div>
                </Tooltip>
              </div>
            </Fragment>
          ) : null}
          {!heatMap ? (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "85px",
                zIndex: "1",
                display: "flex",
              }}
            >
              {props.alarms ? (
                <Tooltip
                  title="Health"
                  placement="bottom"
                  arrow
                  TransitionComponent={Zoom}
                >
                  <div
                    className={classes.toggle}
                    style={{
                      borderRadius: "5px 0 0 5px",
                      boxShadow:
                        toggleView == "Health"
                          ? "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,rgba(60, 64, 67, 0.15) 0px 1px 3px 1px,inset 0 0 5px Silver"
                          : "",
                    }}
                    onClick={() => {
                      if (
                        !healthLoader &&
                        !connectivityLoader &&
                        !datapointLoader &&
                        !markerLoader
                      ) {
                        setDatapoint(null);
                        setFriendlyname(null);
                        datapointState = null;
                        sethealthLoader(true);
                        toggleState = "Health";
                        setToggleView("Health");
                        map.setStyle(mapStyle[mapStyleState], {
                          diff: true,
                        });
                        setTimeout(() => {
                          updateStyles();
                          sethealthLoader(false);
                        }, 500);
                      }
                    }}
                  >
                    {healthLoader ? (
                      <CircularProgress
                        style={{
                          color: "#333333",
                          height: "15px",
                          width: "15px",
                        }}
                      />
                    ) : (
                      <HealthAndSafetyIcon
                        style={{
                          color:
                            toggleView == "Health"
                              ? metaDataValue.branding.secondaryColor
                              : "#333333",
                          fontSize: "17px",
                        }}
                      />
                    )}
                  </div>
                </Tooltip>
              ) : null}

              <Popover
                icon={SpeedIcon}
                target={() => (
                  <Tooltip
                    title="Color spectrum"
                    placement="bottom"
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <div
                      className={classes.toggle}
                      style={{
                        borderRadius: props.alarms ? "" : "5px 0 0 5px",
                        boxShadow:
                          toggleView == "Monitoring"
                            ? "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,rgba(60, 64, 67, 0.15) 0px 1px 3px 1px,inset 0 0 5px Silver"
                            : "",
                      }}
                    >
                      {datapointLoader ? (
                        <CircularProgress
                          style={{
                            color: "#333333",
                            height: "15px",
                            width: "15px",
                          }}
                        />
                      ) : (
                        <SpeedIcon
                          style={{
                            color:
                              toggleView == "Monitoring"
                                ? metaDataValue.branding.secondaryColor
                                : "#333333",
                            fontSize: "17px",
                          }}
                        />
                      )}
                    </div>
                  </Tooltip>
                )}
                component={DatapointToggle}
              />

              <Tooltip
                title="Connectivity"
                placement="bottom"
                arrow
                TransitionComponent={Zoom}
              >
                <div
                  className={classes.toggle}
                  style={{
                    borderRadius: "0",
                    boxShadow:
                      toggleView == "Connectivity"
                        ? "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,rgba(60, 64, 67, 0.15) 0px 1px 3px 1px,inset 0 0 5px Silver"
                        : "",
                  }}
                  onClick={() => {
                    if (
                      !connectivityLoader &&
                      !healthLoader &&
                      !datapointLoader &&
                      !markerLoader
                    ) {
                      setDatapoint(null);
                      setFriendlyname(null);
                      datapointState = null;
                      setconnectivityLoader(true);
                      toggleState = "Connectivity";
                      setToggleView("Connectivity");
                      map.setStyle(mapStyle[mapStyleState], {
                        diff: true,
                      });
                      setTimeout(() => {
                        updateStyles();
                        setconnectivityLoader(false);
                      }, 500);
                    }
                  }}
                >
                  {connectivityLoader ? (
                    <CircularProgress
                      style={{
                        color: "#333333",
                        height: "15px",
                        width: "15px",
                      }}
                    />
                  ) : (
                    <WifiOutlinedIcon
                      style={{
                        color:
                          toggleView == "Connectivity"
                            ? metaDataValue.branding.secondaryColor
                            : "#333333",
                        fontSize: "17px",
                      }}
                    />
                  )}
                </div>
              </Tooltip>

              <Tooltip
                title="Map Marker"
                placement="bottom"
                arrow
                TransitionComponent={Zoom}
              >
                <div
                  className={classes.toggle}
                  style={{
                    borderRadius: "0 5px 5px 0",
                    boxShadow:
                      toggleView == "Marker"
                        ? "rgba(60, 64, 67, 0.3) 0px 1px 2px 0px,rgba(60, 64, 67, 0.15) 0px 1px 3px 1px,inset 0 0 5px Silver"
                        : "",
                  }}
                  onClick={() => {
                    if (
                      !connectivityLoader &&
                      !healthLoader &&
                      !datapointLoader &&
                      !markerLoader
                    ) {
                      setDatapoint(null);
                      setFriendlyname(null);
                      setMarkerLoader(true);
                      datapointState = null;
                      toggleState = "Marker";
                      setToggleView("Marker");
                      map.setStyle(mapStyle[mapStyleState], {
                        diff: true,
                      });
                      setTimeout(() => {
                        updateStyles();
                        setMarkerLoader(false);
                      }, 500);
                    }
                  }}
                >
                  {markerLoader ? (
                    <CircularProgress
                      style={{
                        color: "#333333",
                        height: "15px",
                        width: "15px",
                      }}
                    />
                  ) : (
                    <PhotoIcon
                      style={{
                        color:
                          toggleView == "Marker"
                            ? metaDataValue.branding.secondaryColor
                            : "#333333",
                        fontSize: "17px",
                      }}
                    />
                  )}
                </div>
              </Tooltip>
            </div>
          ) : null}
          {datapoint && !heatMap ? (
            <div
              style={{
                position: "absolute",
                top: "10px",
                right: "255px",
                zIndex: "1",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "10px",
                  padding: "5px 10px",
                  opacity: "0.7",
                }}
              >
                <p
                  style={{
                    color: "#333333",
                    fontWeight: "bold",
                    userSelect: "none",
                  }}
                >
                  {friendlyName}
                </p>
              </div>
              {props.dataPointThresholds.find(
                (e) => e.dataPoint?.name == datapoint
              ) ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: generateBackground(
                      props.dataPointThresholds.find(
                        (e) => e.dataPoint?.name == datapoint
                      ).colorArray,
                      props.dataPointThresholds.find(
                        (e) => e.dataPoint?.name == datapoint
                      ).reverse
                    ),
                    opacity: "0.7",
                    borderRadius: "20px",
                    width: "100px",
                    height: "10px",
                  }}
                >
                  <p style={{ position: "relative", top: "15px" }}>
                    {generateLimit().min}
                  </p>
                  <p style={{ position: "relative", top: "15px" }}>
                    {generateLimit().max}
                  </p>
                </div>
              ) : null}
            </div>
          ) : null}
          <Slide direction="up" in={checked} mountOnEnter unmountOnExit>
            <div
              style={{
                position: "absolute",
                bottom: "20px",
                left: "10px",
                width: "20vw",
                background: "white",
                borderRadius: "10px",
                padding: "10px",
                zIndex: "99",
              }}
            >
              <p style={{ color: "#bdbdbd", fontWeight: "bold" }}>Geofences</p>
              <div
                id="geofence-list"
                style={{
                  // display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  // gap: "10px",
                  maxHeight: "25vh",
                  overflowY: "scroll",
                  // padding: "5px",
                  // paddingTop: overflown ? "35px" : "10px",
                }}
              >
                {geofencesList.length ? (
                  <Fragment>
                    {geofencesList.map((elm, i) => {
                      return (
                        <div
                          key={i}
                          id={elm.globalUUID}
                          className={classes.geofence}
                          style={{
                            background:
                              selected == elm.globalUUID
                                ? metaDataValue.branding.secondaryColor
                                : "#eeeeee",
                          }}
                          onClick={() => {
                            setSelected(elm.globalUUID);
                            let coordinates = elm.region.coordinates[0];
                            if (coordinates.length > 0) {
                              let bounds = coordinates.reduce(function (
                                bounds,
                                coord
                              ) {
                                return bounds.extend(coord);
                              },
                              new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]));
                              map.fitBounds(bounds, { padding: 100 });
                            }
                          }}
                        >
                          <p
                            style={{
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              fontWeight: "750",
                              color:
                                selected == elm.globalUUID ? "white" : "black",
                            }}
                          >
                            {elm.name}
                          </p>
                          {props.tracking == "ALL" ? (
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "center",
                                gap: "5px",
                              }}
                            >
                              <EditIcon
                                color="secondary"
                                style={{
                                  cursor: "pointer",
                                  height: "15px",
                                  width: "15px",
                                  color:
                                    selected == elm.globalUUID ? "white" : "",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveId(elm.globalUUID);
                                  setRow(elm);
                                  handlepopupOpen();
                                }}
                              />
                              <DeleteIcon
                                color="secondary"
                                style={{
                                  cursor: "pointer",
                                  height: "15px",
                                  width: "15px",
                                  color:
                                    selected == elm.globalUUID ? "white" : "",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDelete(elm.globalUUID);
                                }}
                              />
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </Fragment>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      marginBottom: "3vh",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <img
                        style={{ maxWidth: "30%", maxHeight: "30%" }}
                        src={noData}
                      />
                    </div>
                    <p style={{ color: "#c8c8c8" }}>No geofences found</p>
                  </div>
                )}
              </div>
            </div>
          </Slide>
        </div>
      ) : (
        <Loader />
      )}
    </Fragment>
  );
}
