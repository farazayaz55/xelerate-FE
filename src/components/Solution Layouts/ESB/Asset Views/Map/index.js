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
//-------------MUI------------------//
import CircularProgress from "@mui/material/CircularProgress";
import Slide from "@mui/material/Slide";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import { makeStyles } from "@mui/styles";
import Zoom from "@mui/material/Zoom";
import LinearProgress from "@mui/material/LinearProgress";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
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
  const page = useSelector((state) => state.assetView.mapPage);
  const { enqueueSnackbar } = useSnackbar();
  const [disableProgress, setDisableProgress] = React.useState(false);
  const [polygon, setPolygon] = React.useState(false);
  const [groupGeo, setGroupGeo] = React.useState(false);
  const [geofencesList, setGeofencesList] = React.useState([]);
  const [checked, setChecked] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [row, setRow] = React.useState(null);

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
  const [heatLoader, setheatLoader] = React.useState(false);
  const [healthLoader, sethealthLoader] = React.useState(false);
  const [datapoint, setDatapoint] = React.useState(
    props.layoutPermission?.markerDefault &&
      props.layoutPermission?.markerDefault == "Monitoring"
      ? sensors[0].name
      : null
  );
  const [friendlyName, setFriendlyname] = React.useState(
    props.layoutPermission?.markerDefault &&
      props.layoutPermission?.markerDefault == "Monitoring"
      ? sensors[0].friendlyName
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

  function clickDatapoint(name, friendlyName) {
    setDatapointLoader(true);
    toggleState = "Monitoring";
    setToggleView("Monitoring");
    setDatapoint(name);
    setFriendlyname(friendlyName);
    datapointState = name;

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
        const dataPointId = item.datapoint?._id;

        if (!uniqueDatapointsIds.has(dataPointId)) {
          uniqueDatapointsArray.push(item);
          uniqueDatapointsIds.add(dataPointId);
        }
      });
    }
    const sesorsList =
      uniqueDatapointsArray.length &&
      uniqueDatapointsArray.map((obj) => obj.dataPoint);

    return sesorsList ? (
      <MenuList role="menu" style={{ maxWidth: "200px", maxHeight: "40vh" }}>
        {sesorsList.map((sensor) => {
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
    }`,
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
    if (devices.isSuccess && devices.data?.payload?.data) {
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

      data.forEach((elm) => {
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

  useEffect(() => {
    if (
      props.layoutPermission?.markerDefault
        ? props.layoutPermission?.markerDefault == "Health"
          ? props.alarms
          : true
        : false
    ) {
      toggleState = props.layoutPermission?.markerDefault;
      datapointState = sensors[0].name;
    }
    connector.on("updateFilter", (payload) => {
      let sensor = props.dataPointThresholds.find(
        (g) => g.dataPoint?.name == payload
      );
      if (sensor && !heat) {
        clickDatapoint(payload, sensor.datapoint?.friendlyName);
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
  }

  function updateStyles() {
    if (!map.getSource("geoData")) {
      map.addSource("geoData", globalState);
    }

    if (heat) {
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

  async function mapinit(map) {
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
  }

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

  return (
    <Fragment>
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
