//-------------CORE------------------//
import React, { useRef, useEffect, useState, Fragment } from "react";
import mapboxgl from "!mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { useSelector } from "react-redux";
import {
  CircleMode,
  DragCircleMode,
  DirectMode,
  SimpleSelectMode,
} from "mapbox-gl-draw-circle";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDrawPolygon } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
import hexRgb from "hex-rgb";
//-------------MUI------------------//
import Divider from "@mui/material/Divider";
import Slide from "@mui/material/Slide";
import { makeStyles } from "@mui/styles";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
//-------------MUI ICON------------------//
import MyLocationIcon from "@mui/icons-material/MyLocation";
import ListAltIcon from "@mui/icons-material/ListAlt";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
//-------------EXTERNAL------------------//
import DeleteAlert from "components/Alerts/Delete";
import Edit from "components/Solution Layouts/Default/Asset Views/Map/Geofence";
import noData from "assets/img/no-data.png";
import { style, generateDot } from "Utilities/mapbox";
import { getSocket } from "Utilities/socket";
import {
  useEditLocationMutation,
  useDeleteLocationMutation,
} from "services/locations";
var StaticMode = require("@mapbox/mapbox-gl-draw-static-mode");

mapboxgl.accessToken =
  "pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA";

let zoomLevel = 25;
let map;

const draw = new MapboxDraw({
  displayControlsDefault: false,
  styles: style,
  controls: {},
  keybindings: false,
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
    filter: {
      position: "absolute",
      top: "10px",
      left: "10px",
      zIndex: "99",
    },
  },
  geofence: {
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

export default function Map(props) {
  let token = window.localStorage.getItem("token");
  const classes = useStyles(props);
  const geofenceList = useSelector((state) => state.asset.geofence);
  const device = useSelector((state) => state.asset.device);
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const mapContainer = useRef(null);
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [polygon, setPolygon] = React.useState(false);
  const [checked, setChecked] = React.useState(false);
  const [updateLocation, updateLocationResult] = useEditLocationMutation();
  const [deleteLocation, deleteLocationResult] = useDeleteLocationMutation();
  const [mapLoaded, setMapLoaded] = React.useState(true);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [row, setRow] = React.useState(null);
  const [circle, setCircle] = useState({});
  const [type, setType] = useState("Polygon");
  const [selected, setSelected] = React.useState(null);
  const [Locations, setLocations] = React.useState([
    [device.location.longitude, device.location.latitude],
  ]);
  const [geofence, setGeofence] = React.useState({ type: "", coordinates: [] });
  const [first, setFirst] = React.useState(true);

  let color = metaDataValue.branding.secondaryColor;
  let rgb = hexRgb(metaDataValue.branding.secondaryColor);

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  useEffect(() => {
    if (selected) {
      var myElement = document.getElementById(selected);
      if (myElement) {
        var topPos = myElement.offsetTop - 40;
        document.getElementById(`geofence-list-${props.id}`).scrollTop = topPos;
      }
    }
  }, [selected]);

  useEffect(() => {
    if (selected) {
      var myElement = document.getElementById(selected);
      if (myElement) {
        var topPos = myElement.offsetTop - 40;
        document.getElementById(`geofence-list-${props.id}`).scrollTop = topPos;
      }
    }
  }, [selected]);

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

  async function initializeSocket(topics) {
    await getSocket(topics);
  }

  useEffect(() => {
    if (
      device?.location &&
      map &&
      map.getSource("final") &&
      map.getSource("line")
    ) {
      let loc = [device.location.longitude, device.location.latitude];
      let temp = [...Locations];
      temp.push(loc);
      setLocations(temp);
      map.getSource("final")?.setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              id: device.internalId,
            },
            geometry: {
              type: "Point",
              coordinates: loc,
            },
          },
        ],
      });
      map.getSource("line").setData({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: temp,
            },
          },
        ],
      });
      if (!inBounds(loc, map.getBounds()))
        map.flyTo({
          center: loc,
          zoom: zoomLevel,
        });
    }
  }, [device]);

  useEffect(() => {
    initializeSocket([`devices__${props.serviceId}__${props.id}`]);
  }, []);

  useEffect(() => {
    if (updateLocationResult.isSuccess) {
      showSnackbar(
        "Geofences",
        updateLocationResult.data?.message,
        "success",
        1000
      );
      handlepopupClose();
    }
    if (updateLocationResult.isError) {
      showSnackbar(
        "Geofences",
        updateLocationResult.error.data?.message,
        "error",
        1000
      );
      handlepopupClose();
    }
  }, [updateLocationResult]);

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
    handlepopupOpen();
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
    updateLocation({ token, body, id: e.features[0].id });
  }

  function Selected(e) {
    if (e.features[0]) {
      if (props.permission != "ALL" || e.features[0].properties.global) {
        draw.changeMode("static");
        draw.changeMode("simple_select");
      }
      if (!checked) setChecked(true);
      setActiveId(e.features[0].id);
      setSelected(e.features[0].id);
    } else {
      setActiveId(null);
      setSelected(null);
    }
  }

  useEffect(() => {
    map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: Locations.length > 0 ? Locations[Locations.length - 1] : [1, 1],
      zoom: Locations.length > 0 ? 25 : 1,
    });
    // map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(new mapboxgl.NavigationControl());
    map.addControl(draw);

    map.on("mousedown", () => {
      setChecked(false);
    });
    map.on("zoomend", (e) => {
      zoomLevel = map.getZoom();
    });
    map.on("draw.create", Creation);
    map.on("draw.update", Update);
    map.on("draw.selectionchange", Selected);
    map.on("draw.modechange", (e) => {
      if (e.mode == "simple_select") setPolygon(false);
    });

    var geojson = {
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
    };

    var geojson2 = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: Locations[Locations.length - 1], // icon position [lng, lat]
          },
        },
      ],
    };

    map.on("load", function () {
      if (props.permission != "ALL") draw.changeMode("static");
      map.addImage(
        "pulsing-dot",
        generateDot(
          `rgba(${rgb.red},${rgb.green},${rgb.blue},`,
          color,
          80,
          map
        ),
        {
          pixelRatio: 2,
        }
      );
      map.addSource("line", {
        type: "geojson",
        data: geojson,
      });

      map.addSource("final", {
        type: "geojson",
        data: geojson2,
      });

      map.addLayer({
        id: "pulsing-dot",
        type: "symbol",
        source: "final",
        layout: {
          "icon-image": "pulsing-dot",
        },
      });

      map.addLayer(
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

    setMapLoaded(false);

    return () => {
      map.remove();
      map = null;
    };
  }, []);

  useEffect(() => {
    addGeofences(geofenceList);
  }, [geofenceList]);

  function inBounds(point, bounds) {
    var lng = (point[0] - bounds._ne.lng) * (point[0] - bounds._sw.lng) < 0;
    var lat = (point[1] - bounds._ne.lat) * (point[1] - bounds._sw.lat) < 0;
    return lng && lat;
  }

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const handlepopupClose = () => {
    setOpenPopup(false);
  };

  async function onSubmitDeletion() {
    let deleted = await deleteLocation({ token, id: activeId });
    if (deleted?.data?.success) {
      showSnackbar("Tracking", deleted.data?.message, "success");
      toggleDelete();
    } else {
      showSnackbar("Tracking", deleted.error?.data?.message, "error");
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function deleteSelected() {
    draw.delete(activeId);
  }

  return (
    <div>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this geofence?"
          id={activeId}
          handleDelete={onSubmitDeletion}
          handleClose={toggleDelete}
          deleteResult={deleteLocationResult}
        />
      ) : null}

      {openPopup ? (
        <Edit
          main
          id={props.id}
          row={row}
          setOpenPopup={setOpenPopup}
          type={type}
          permission={props.permission}
          geofence={geofence}
          circle={circle}
          serviceId={props.serviceId}
        />
      ) : null}
      <div
        ref={mapContainer}
        style={{
          height: "calc(100vh - 259px)",
          borderRadius: "10px",
        }}
      >
        {!mapLoaded ? (
          <Fragment>
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
              {props.permission ? (
                <span>
                  {props.permission == "ALL" ? (
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
                      style={{ borderRadius: "0px 0px 4px 4px" }}
                      onClick={() => {
                        setChecked((prev) => !prev);
                      }}
                    >
                      <ListAltIcon
                        color="secondary"
                        style={{
                          color: checked ? "" : "#333333",
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
                    map.flyTo({
                      center: Locations[Locations.length - 1],
                    });
                  }}
                >
                  <MyLocationIcon
                    style={{ color: "#333333", fontSize: "17px" }}
                  />
                </div>
              </Tooltip>
            </div>
            <Slide direction="up" in={checked} mountOnEnter unmountOnExit>
              <div
                style={{
                  position: "absolute",
                  bottom: "10px",
                  right: "10px",
                  width: "20vw",
                  background: "white",
                  borderRadius: "10px",
                  padding: "10px",
                }}
              >
                <p
                  style={{
                    color: "#bdbdbd",
                    fontWeight: "750",
                  }}
                >
                  Geofences
                </p>
                <div
                  id={`geofence-list-${props.id}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    maxHeight: "25vh",
                    overflowY: "scroll",
                  }}
                >
                  {geofenceList.length ? (
                    <Fragment>
                      {geofenceList.map((elm, i) => (
                        <div
                          key={i}
                          id={elm._id}
                          className={classes.geofence}
                          style={{
                            background:
                              selected == elm._id
                                ? metaDataValue.branding.secondaryColor
                                : "#eeeeee",
                          }}
                          onClick={() => {
                            setSelected(elm._id);
                            let coordinates = elm.geometry.coordinates[0];
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
                              fontSize: "13px",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              fontWeight: "750",
                              color: selected == elm._id ? "white" : "black",
                            }}
                          >
                            {elm.name}
                            {elm.global ? " (Global)" : ""}
                          </p>
                          {props.permission == "ALL" && !elm.global ? (
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
                                  color: selected == elm._id ? "white" : "",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveId(elm._id);
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
                                  color: selected == elm._id ? "white" : "",
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleDelete(elm._id);
                                }}
                              />
                            </div>
                          ) : null}
                        </div>
                      ))}
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
          </Fragment>
        ) : null}
      </div>
    </div>
  );
}
