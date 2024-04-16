import React, { useEffect, Fragment, useRef } from "react";
import { useSelector } from "react-redux";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import Loader from "../../Progress";
import { useGetDevicesQuery, useGetNotesQuery } from "services/devices";
import { useCreateEventMutation } from "services/events";
import { useSnackbar } from "notistack";
import mapboxgl from "!mapbox-gl";
import { makeStyles } from "@mui/styles";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SaveIcon from "@mui/icons-material/Save";
import Attributes from "components/Custom Attributes";
import InputBase from "@mui/material/InputBase";
import EditIcon from "@mui/icons-material/Edit";
import IconButton from "@mui/material/IconButton";
import { useEditDeviceMutation } from "services/devices";
import DeleteAlert from "components/Alerts/Delete";
import Zoom from "@mui/material/Zoom";
import Fab from "@mui/material/Fab";
import CommentIcon from "@mui/icons-material/Comment";
import Drawer from "@mui/material/Drawer";
import Notes from "./Notes";
import Badge from "@mui/material/Badge";
import Dragable from "components/Dragable";
import CancelIcon from '@mui/icons-material/Cancel';

// import Badge from '@mui/material/Badge';

mapboxgl.accessToken =
  "pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA";
let marker;
let map;
let resetLoc;

export default function Info(props) {
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
  const classes = useStyles();
  let token = window.localStorage.getItem("token");
  const [notes, setNotes] = React.useState([]);
  let mapContainer = useRef(null);
  const [createEvent, createEventResult] = useCreateEventMutation();
  const metaDataValue = useSelector((state) => state.metaData);
  const [c8y_Position, setC8y_Position] = React.useState(null);
  const [notesDrawer, setNotesDrawer] = React.useState(false);
  const [tempC8y_Position, setTempC8y_Position] = React.useState(null);
  const [device, setDevice] = React.useState(null);
  const [edit, setEdit] = React.useState(false);
  const [name, setName] = React.useState("");
  const [prevDeviceName, setPrevDeviceName] = React.useState("")
  const [eventUpdate, setEventUpdate] = React.useState(false);
  const [selectedPrevAsset, setSelectedPrevAsset] = React.useState("");
  const [editing, setEditing] = React.useState(false);
  const [updateDevice, updateResult] = useEditDeviceMutation();
  let body = {};
  const devices = useGetDevicesQuery(
    {
      token,
      group: "",
      params: `&pageSize=1&currentPage=1&withTotalPages=true&internalId=${props.id}`,
    },
    { refetchOnMountOrArgChange: true }
  );
  const notesRes = useGetNotesQuery(
    {
      token,
      group: props.id,
    },
    { refetchOnMountOrArgChange: true }
  );
  const { enqueueSnackbar } = useSnackbar();

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  useEffect(() => {
    if (!devices.isFetching && mapContainer.current) {
      map = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: c8y_Position
          ? [c8y_Position.longitude, c8y_Position.latitude]
          : {
              lng: -0.118092,
              lat: 51.509865,
            },
        zoom: 10,
      });
      if (props.permission == "ALL") {
        map.on("click", (e) => {
          if (marker) {
            marker.remove();
          }
          map.flyTo({
            center: [e.lngLat.lng, e.lngLat.lat],
          });
          setEventUpdate(false);
          setTempC8y_Position({
            lng: e.lngLat.lng,
            lat: e.lngLat.lat,
          });
          setC8y_Position({ latitude: e.lngLat.lat, longitude: e.lngLat.lng });
          marker = new mapboxgl.Marker()
            .setLngLat([e.lngLat.lng, e.lngLat.lat])
            .addTo(map);
        });
      }

      if (c8y_Position) {
        marker = new mapboxgl.Marker({ draggable: false })
          .setLngLat([c8y_Position.longitude, c8y_Position.latitude])
          .addTo(map);
      }
    }
    return () => {
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [c8y_Position, mapContainer.current, devices.isFetching]);

  useEffect(() => {
    if (devices.isSuccess) {
      let tempDevice = devices.data.payload.data[0];
      if (tempDevice?.location) {
        setC8y_Position(tempDevice?.location);
        setTempC8y_Position({
          lng: tempDevice.location.longitude,
          lat: tempDevice.location.latitude,
        });
        resetLoc = tempDevice?.location;
      }
      setDevice(devices.data.payload.data[0]);
      setName(devices.data.payload.data[0]?.name);
      setPrevDeviceName(devices.data.payload.data[0]?.name)
      body = {
        name: tempDevice?.packetFromPlatform?.name,
        firmwareVersion:
          tempDevice?.packetFromPlatform?.c8y_Firmware?.version,
        serialNumber: tempDevice?.packetFromPlatform?.c8y_Hardware?.serialNumber,
        imei: tempDevice?.packetFromPlatform?.c8y_Mobile?.imei,
        serviceId: tempDevice?.serviceId,
      };
    }
    if (devices.isError) {
      showSnackbar("Devices", devices.error?.data?.message, "error", 1000);
    }
    return () => {
      if (map) {
        map.remove();
        map = null;
      }
    };
  }, [devices.isFetching]);

  useEffect(() => {
    if (!notesRes.isFetching && notesRes.isSuccess) {
      let temp = JSON.parse(JSON.stringify(notesRes.data.payload));
      temp.forEach((t) => {
        t.updatedAt =
          new Date(t.updatedAt).toLocaleDateString() +
          " " +
          new Date(t.updatedAt).toLocaleTimeString();
      });
      setNotes(temp.reverse());
    }
    if (notesRes.isError) {
      showSnackbar("Notes", notesRes.error?.data?.message, "error", 1000);
    }
  }, [notesRes.isFetching]);

  const updateEvent = async (tempCoord = undefined) => {
    let res;
    if(tempCoord){
      res = {lat: tempCoord.lat, lng: tempCoord.lng}
    }
    let eventsBody = {
      deviceId: props.id,
      c8y_Position: tempCoord ? res : tempC8y_Position,
      text: "Asset location specified",
      type: "c8y_LocationUpdate",
    };
    const updated = await createEvent({ token, body: eventsBody });
    if (updated.data?.success) {
      resetLoc = tempCoord ? {
        longitude:tempCoord.lng,
        latitude:tempCoord.lat
      } : {
        longitude: tempC8y_Position.lng,
        latitude: tempC8y_Position.lat,
      };
      setEventUpdate(true);
      showSnackbar("Events", "Location updated", "success", 1000);
    }
    if (updated.error) {
      showSnackbar("Events", "Failed", "error", 1000);
    }
  };

  const resetLatLng = () => {
    if (marker) {
      marker.remove();
    }
    if (resetLoc) {
      map.flyTo({
        center: [resetLoc.longitude, resetLoc.latitude],
      });
      setC8y_Position(resetLoc);
      setTempC8y_Position(null);
      marker = new mapboxgl.Marker()
        .setLngLat([resetLoc.longitude, resetLoc.latitude])
        .addTo(map);
    }
  };

  const updateAsset = async () => {
    body.name = name;
    let updated = await updateDevice({
      token,
      body,
      id: props.id,
    });
    if (updated.data?.success) {
      showSnackbar("Device", updated.data?.message, "success", 1000);
      setEdit(false);
      setSelectedPrevAsset("");
    } else {
      showSnackbar("Device", updated.data?.message, "error", 1000);
    }
  };

  function Status() {
    return (
      <Fragment>
        <div
          style={{
            height: "calc(100vh - 235px)",
            display: "flex",
            width: "100%",
          }}
        >
          <Card
            style={{
              width: "50%",
              height: "100%",
              overflow: "auto",
            }}
          >
            <div style={{ margin: "20px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  marginLeft: "50px",
                }}
              >
                <div
                  style={{
                    fontSize: "26px",
                    color: "#333",
                    fontWeight: "bold",
                  }}
                >
                  <InputBase
                    disabled={!edit}
                    autoFocus={edit}
                    sx={{
                      ml: 1,
                      flex: 1,
                      fontSize: "26px",
                      fontWeight: "bold",
                      "& .MuiInputBase-input": !edit
                        ? {
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }
                        : null,
                    }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ marginLeft: "-15px" }}
                  />
                </div>
                <div style={{ marginTop: "3px" }}>
                  {props.permission == "ALL" ? (
                    <IconButton
                      type="button"
                      sx={{ p: "10px" }}
                      onClick={() => {
                        if (!edit) {
                          setEdit(true);
                        } else {
                          setSelectedPrevAsset(prevDeviceName);
                        }
                      }}
                    >
                      {!edit ? (
                        <EditIcon fontSize="small" />
                      ) : (
                        <SaveIcon fontSize="small" />
                      )}
                    </IconButton>
                    
                  ) : null}
                </div>
              </div>
              <div style={{ margin: "20px 0px" }}>
                <div
                  style={{
                    display: "flex",
                    marginBottom: 10,
                    justifyContent: "space-between",
                    paddingRight: 50,
                  }}
                >
                  <div style={{width:'50%'}}>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#aeaeae",
                        marginBottom: "20px",
                        marginTop: "-5px",
                      }}
                    >
                      Device Data
                    </p>
                    <div style={{ display: "flex", fontSize: 14 }}>
                      <div style={{ marginRight: "10px", width:'35%' }}>
                        <p>
                          <strong>ID</strong>
                        </p>
                        {/* <p>
                          <strong>Name</strong>
                        </p> */}
                        <p>
                          <strong>Firmware</strong>
                        </p>
                        <p>
                          <strong>Serial Number</strong>
                        </p>
                        <p>
                          <strong>IMEI</strong>
                        </p>
                        <p>
                          <strong>IMSI</strong>
                        </p>
                        <p>
                          <strong>ICCID</strong>
                        </p>
                        <p>
                          <strong>MSISDN</strong>
                        </p>
                      </div>
                      <div style={{ width: '65%' }}>
                      <p style={{height:'21px'}}>{device?.packetFromPlatform?.id}</p>
                      <Tooltip
                      title={device?.packetFromPlatform?.c8y_Firmware?.version || "-"}
                      placement="top"
                      arrow
                    ><p style={{maxWidth:'90%',textOverflow:'ellipsis',overflow:'hidden', height:'21px'}}>{device?.packetFromPlatform?.c8y_Firmware?.version || "-"}</p></Tooltip>
                        {/* <p style={{maxWidth:'90%',textOverflow:'ellipsis',overflow:'hidden', height:'21px'}}>{device?.device?.packetFromPlatform?.name}</p> */}
                        <Tooltip
                      title={device?.packetFromPlatform?.c8y_Hardware?.serialNumber || "-"}
                      placement="top"
                      arrow
                    ><p style={{maxWidth:'90%',textOverflow:'ellipsis',overflow:'hidden', height:'21px'}}>{device?.packetFromPlatform?.c8y_Hardware?.serialNumber || "-"}</p></Tooltip>
                        <p style={{maxWidth:'90%',textOverflow:'ellipsis',overflow:'hidden', height:'21px'}}>
                          {/* {new Date(device?.updatedAt).toLocaleDateString(
                            "en-GB"
                          ) +
                            " " +
                            new Date(device?.updatedAt).toLocaleTimeString()} */}
                            {device?.packetFromPlatform?.c8y_Mobile?.imei}
                        </p>
                        <p style={{maxWidth:'90%',textOverflow:'ellipsis',overflow:'hidden', height:'21px'}}>
                          {/* {new Date(device?.updatedAt).toLocaleDateString(
                            "en-GB"
                          ) +
                            " " +
                            new Date(device?.updatedAt).toLocaleTimeString()} */}
                            {device?.packetFromPlatform?.c8y_Mobile?.imsi}
                        </p>
                        <p style={{maxWidth:'90%',textOverflow:'ellipsis',overflow:'hidden', height:'21px'}}>
                          {/* {new Date(device?.updatedAt).toLocaleDateString(
                            "en-GB"
                          ) +
                            " " +
                            new Date(device?.updatedAt).toLocaleTimeString()} */}
                            {device?.packetFromPlatform?.c8y_Mobile?.iccid}
                        </p>
                        <p style={{maxWidth:'90%',textOverflow:'ellipsis',overflow:'hidden', height:'21px'}}>
                          {/* {new Date(device?.updatedAt).toLocaleDateString(
                            "en-GB"
                          ) +
                            " " +
                            new Date(device?.updatedAt).toLocaleTimeString()} */}
                            {device?.packetFromPlatform?.c8y_Mobile?.msisdn}
                        </p>
                        
                      </div>
                    </div>
                  </div>
                  {/* <Divider style={{ marginBottom: "10px" }} /> */}
                  <div style={{ width: "50%" }}>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#aeaeae",
                        marginBottom: "20px",
                      }}
                    >
                      Availability
                    </p>
                    <div style={{ display: "flex", fontSize: 14 }}>
                      <div style={{ marginRight: "30px" }}>
                        <p
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "11rem",
                          }}
                        >
                          <strong>Status</strong>
                        </p>
                        <p
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "11rem",
                          }}
                        >
                          <strong>Last Message</strong>
                        </p>
                        <p
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "11rem",
                          }}
                        >
                          <strong>Response Interval</strong>
                        </p>
                        <p>
                          <strong>Type</strong>
                        </p>
                        <p
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "11rem",
                          }}
                        >
                          <strong>Last Updated</strong>
                        </p>
                      </div>
                      <div>
                        <Tooltip
                          title={
                            device?.packetFromPlatform?.c8y_Availability
                              ? device?.packetFromPlatform?.c8y_Availability
                                  .status
                              : "N/A"
                          }
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <p
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "11rem",
                            }}
                          >
                            {device?.packetFromPlatform?.c8y_Availability
                              ? device?.packetFromPlatform?.c8y_Availability
                                  .status
                              : "N/A"}
                          </p>
                        </Tooltip>
                        <Tooltip
                          title={
                            device?.packetFromPlatform?.c8y_Availability
                              ? new Date(
                                  device?.packetFromPlatform?.c8y_Availability.lastMessage
                                ).toLocaleDateString("en-GB") +
                                " " +
                                new Date(
                                  device?.packetFromPlatform?.c8y_Availability.lastMessage
                                ).toLocaleTimeString()
                              : "N/A"
                          }
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <p
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "11rem",
                            }}
                          >
                            {device?.packetFromPlatform?.c8y_Availability
                              ? new Date(
                                  device?.packetFromPlatform?.c8y_Availability.lastMessage
                                ).toLocaleDateString("en-GB") +
                                " " +
                                new Date(
                                  device?.packetFromPlatform?.c8y_Availability.lastMessage
                                ).toLocaleTimeString()
                              : "N/A"}
                          </p>
                        </Tooltip>
                        <Tooltip
                          title={
                            device?.packetFromPlatform?.c8y_RequiredAvailability
                              ? device?.packetFromPlatform
                                  ?.c8y_RequiredAvailability.responseInterval
                              : "N/A"
                          }
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <p
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "11rem",
                            }}
                          >
                            {device?.packetFromPlatform
                              ?.c8y_RequiredAvailability
                              ? device?.packetFromPlatform
                                  ?.c8y_RequiredAvailability.responseInterval
                              : "N/A"}
                          </p>
                        </Tooltip>
                        <Tooltip
                          title={device?.deviceType}
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <p
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "11rem",
                            }}
                          >
                            {device?.deviceType}
                          </p>
                        </Tooltip>
                        <Tooltip
                          title={
                            new Date(device?.updatedAt).toLocaleDateString(
                              "en-GB"
                            ) +
                            " " +
                            new Date(device?.updatedAt).toLocaleTimeString()
                          }
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <p
                            style={{
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "11rem",
                            }}
                          >
                            {new Date(device?.updatedAt).toLocaleDateString(
                              "en-GB"
                            ) +
                              " " +
                              new Date(device?.updatedAt).toLocaleTimeString()}
                          </p>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                  {/* <Divider style={{ marginBottom: "10px" }} /> */}
                </div>
                {device?.metaTags.length ? (
                  <div>
                    <Divider style={{ margin: "20px 0" }} />
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#aeaeae",
                        marginBottom: "20px",
                      }}
                    >
                      Custom Attributes
                    </p>

                    <div
                      style={{
                        margin: "12px 60px",
                      }}
                    >
                      {device &&
                        device?.metaTags.map((meta) => {
                          return (
                            <Attributes
                              meta={meta}
                              setDevice={setDevice}
                              id={props.id}
                              edit={props.permission == "ALL" ? true : false}
                            />
                          );
                        })}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </Card>
          <Card style={{ width: "50%", margin: "0 20px", height: "100%",overflowY:'auto' }}>
            <div style={{ margin: "0px 20px", height: "70vh" }}>
              <p
                style={{
                  fontSize: "15px",
                  color: "#aeaeae",
                  marginBottom: "20px",
                  marginTop: "5px",
                }}
              >
                Location
              </p>
              <div
                ref={mapContainer}
                style={{
                  height: "60vh",
                  borderRadius: "10px",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "100px",
                  right: "60px",
                  zIndex: "1",
                  opacity: "1",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                {tempC8y_Position &&
                (tempC8y_Position?.lat != resetLoc?.latitude ||
                  tempC8y_Position?.lng != resetLoc?.longitude) ? (
                  <Fragment>
                    <Tooltip
                      title="Update"
                      placement="left"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <div
                        style={{
                          marginBottom: "5px",
                          cursor: "pointer",
                        }}
                        className={classes.button}
                        onClick={() => {
                          if (!createEventResult.isLoading) updateEvent();
                        }}
                      >
                        {createEventResult.isLoading ? (
                          <CircularProgress
                            style={{
                              color: "#333333",
                              height: "13px",
                              width: "13px",
                            }}
                          />
                        ) : (
                          <SaveIcon
                            style={{ color: "#000000", fontSize: "17px" }}
                          />
                        )}
                      </div>
                    </Tooltip>
                    {!createEventResult.isSuccess || !eventUpdate ? (
                      <Tooltip title="Reset" placement="left" arrow>
                        <div
                          style={{
                            marginBottom: "5px",
                            cursor: "pointer",
                          }}
                          className={classes.button}
                        >
                          <RestartAltIcon
                            style={{ color: "#000000", fontSize: "17px" }}
                            onClick={resetLatLng}
                          />
                        </div>
                      </Tooltip>
                    ) : null}
                  </Fragment>
                ) : null}
              </div>
              <div
                style={{
                  display: "flex",
                  marginBottom: "10px",
                  justifyContent: "center",
                  fontSize: 13,
                  color: "grey",
                  padding: "18px 0px",
                }}
              >
                {c8y_Position ? (
                  <div style={{width:'100%'}}>
                  <div
                    style={{
                      marginRight: "10px",
                      color: "#444 !important",
                      display: "flex",
                      justifyContent:'center',
                      gap: 8,
                      width:'100%'
                    }}
                  >
                    <div>
                      <strong>Latitude </strong>
                      {/* <span> {c8y_Position?.latitude}</span> */}
                      <InputBase
                      disabled={!editing}
                        sx={{
                          border: "none",
                          borderRadius: "10px",
                          padding: "12px",
                          paddingLeft:'2px',
                          marginLeft: "1px",
                          maxWidth:'140px',
                          height: "40px",
                          fontSize:'13px',
                          "& .MuiInputBase-input":{
                            paddingLeft:'2px !important',
                            paddingBottom: '0px !important'
                          },
                        }}
                        value={tempC8y_Position?.lat}
                        onChange={(e) =>{
                          setTempC8y_Position({
                            ...tempC8y_Position,
                            lat: e.target.value,
                          })
                        }
                        }
                      />
                    </div>
                    <div>
                      <strong>Longitude </strong>
                      {/* <span> {tempC8y_Position?.longitude}</span> */}
                      <InputBase
                      disabled={!editing}
                        sx={{
                          border: "none",
                          borderRadius: "10px",
                          padding: "12px",
                          paddingLeft:'2px',
                          marginLeft: "1px",
                          maxWidth:'140px',
                          height: "40px",
                          fontSize:'13px',
                          "& .MuiInputBase-input":{
                            paddingLeft:'2px !important',
                            paddingBottom: '0px !important'
                          },
                        }}
                        value={tempC8y_Position?.lng}
                        onChange={(e) =>
                          {
                            setTempC8y_Position({
                              ...tempC8y_Position,
                              lng: e.target.value,
                            })
                          }
                        }
                      />
                    </div>
                    <div
                  className="edit-icons"
                  style={{display:'flex', gap:'5px',bottom:'15px'}}
                  >
                  <IconButton
                  
                      size="medium"
                      onClick={()=>{
                        if(!editing){
                          setEditing(true)
                        }
                        else{
                          if(tempC8y_Position.lng >= -180 && tempC8y_Position.lng <= 180 && tempC8y_Position.lat >= -90 && tempC8y_Position.lat <= 90){
                            if (!createEventResult.isLoading){
  
                              updateEvent(tempC8y_Position);
                            } 
                              setC8y_Position({longitude: tempC8y_Position.lng, latitude: tempC8y_Position.lat})
                              setEditing(false)
                          } 
                          else{
                            showSnackbar("Devices", "Invalid Coordinates", "error", 1000);
                          }
                        }
                      }}
                    >
                      {
                        editing ? 
                        <SaveIcon fontSize="small" />
                        :
                        <EditIcon fontSize="small" />
                      }
                    </IconButton>
                    {editing ? <IconButton
                    size="medium"
                    onClick={()=>{
                      setEditing(false)
                    }}>
                        <CancelIcon />
                      </IconButton> : null}
                    </div>
                  </div>

                    </div>
                ) : null}
              </div>
            </div>
          </Card>
        </div>
        {selectedPrevAsset ? (
          <DeleteAlert
            deleteModal={true}
            question={`You are about to change the friendly name of asset ${selectedPrevAsset}?`}
            platformCheck={false}
            id=""
            handleDelete={updateAsset}
            handleClose={() => setSelectedPrevAsset("")}
            deleteResult={updateResult}
          />
        ) : null}
      </Fragment>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        gap: "20px",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Fragment>{ifLoaded(devices.isFetching, Status)}</Fragment>
      {devices?.data?.payload?.data ? (
        <Fragment>
          <Dragable
            bottom={"30px"}
            right={"30px"}
            notes={true}
            name="service-drawer"
            style={{ overflow: "auto" }}
          >
            <Tooltip
              title="Asset Notes"
              placement="top"
              arrow
              TransitionComponent={Zoom}
            >
              <Badge
                color="primary"
                badgeContent={notes?.length}
                // anchorOrigin={{
                //   vertical: "top",
                //   horizontal: "left",
                // }}
                overlap="circular"
                sx={{
                  "& .MuiBadge-badge": {
                    transform: "translate(-30px,-10px)",
                    zIndex: "99999",
                  },
                }}
              >
                <Fab
                  style={{ boxShadow: "none" }}
                  color="secondary"
                  onClick={() => {
                    setNotesDrawer(true);
                  }}
                >
                  <CommentIcon />
                </Fab>
              </Badge>
            </Tooltip>
          </Dragable>
          <Drawer
            anchor={"right"}
            open={notesDrawer}
            onClose={() => {
              setNotesDrawer(false);
            }}
          >
            <Notes
              userId={metaDataValue.userInfo.userId}
              permission={props.permission}
              notes={notes}
              setNotes={setNotes}
              deviceId={props.id}
            />
          </Drawer>
        </Fragment>
      ) : null}
    </div>
  );
}
