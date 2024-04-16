//-----------CORE------------//
import React, { Fragment, useEffect, useState, useRef } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useSelector, useDispatch } from "react-redux";
import { useSnackbar } from "notistack";
import mapboxgl from "!mapbox-gl";
//------------MUI------------//
import { makeStyles } from "@mui/styles";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Dialog from "@mui/material/Dialog";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import DialogTitle from "@mui/material/DialogTitle";
import SettingsInputHdmiIcon from "@mui/icons-material/SettingsInputHdmi";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import ListItemText from "@mui/material/ListItemText";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
//-----------EXTERNAL COMPS---------//
import Loader from "components/Progress";
import noData from "assets/img/no-data.png";
import {
  useGetAllDevicesQuery,
  useImportDevicesMutation,
  useAddDeviceMutation,
  useEditDeviceMutation,
} from "services/devices";
import { useGetEventsQuery, useCreateEventMutation } from "services/events";
import eventsApi from "services/events";
import devicesApi from "services/devices";

mapboxgl.accessToken =
  "pk.eyJ1IjoiaW52aXhpYmxlZGV2IiwiYSI6ImNraXNvbGYwYjBtYWQyd3Njd2lkeTRsNnMifQ.M-WA639AR9Rcf52HgCa8UA";

const useStyles = makeStyles((theme) => ({
  speedDial: {
    position: "fixed",
    bottom: "30px",
    right: "30px",
    zIndex: 20,
  },
}));
// let c8y_Position = {
//   lng:-0.118092,
//   lat:51.509865
// }
let tempPreviousDevices;
let platformPageClone = 1;
let marker;

export default function AddDevices(props) {
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  let deviceEdit = props.deviceEdit;
  const metaData = useSelector((state) => state.metaData?.services);
  const idMap = useSelector((state) => state.metaData?.idMap);
  const deviceForm = useFormik({
    initialValues: {
      name: deviceEdit ? deviceEdit.name : "",
      firmware: deviceEdit ? deviceEdit.firmware : "",
      serialNumber: deviceEdit ? deviceEdit.serialNumber : "",
      imei: deviceEdit ? deviceEdit.imei : "",
      service: deviceEdit ? deviceEdit.dashboard : "",
      lat: deviceEdit ? deviceEdit.lat : "",
      lng: deviceEdit ? deviceEdit.lng : "",
      platformDeviceType: deviceEdit ? deviceEdit.platformDeviceType : "",
      imsi: deviceEdit ? deviceEdit.imsi : "",
      iccid: deviceEdit ? deviceEdit.iccid : "",
      msisdn: deviceEdit ? deviceEdit.msisdn : "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Required field"),
      firmware: Yup.string(),
      serialNumber: Yup.string(),
      imei: Yup.string(),
      imsi: Yup.string(),
      iccid: Yup.string(),
      msisdn: Yup.string(), 
      lat: Yup.string(),
      lng: Yup.string(),
      service: Yup.string().required("Required field"),
    }),
    onSubmit: async (values) => {
      onSubmitAdd(values);
    },
  });
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const [page, setPage] = React.useState(1);
  const [c8y_Position, setC8y_Position] = React.useState({
    lng: -0.118092,
    lat: 51.509865,
  });
  const [selectedSolution, setSelectedSolution] = useState(
    deviceEdit
      ? metaData.find((s) => s.id == idMap[deviceEdit.dashboard])
      : null
  );
  const [validLat, setValidLat] = React.useState(true);
  const [validLng, setValidLng] = React.useState(true);
  const [maxPage, setMaxPage] = React.useState(1);
  const [notFound, setNotFound] = useState(false);
  const [selectedImport, setSelectedImport] = React.useState([]);
  const [serviceImport, setServiceImport] = React.useState("");
  const [selectedAssetType, setSelectedAssetType] = React.useState("")
  const [devices, setDevices] = React.useState([]);
  const [checked, setChecked] = React.useState([]);
  const [loader, setLoader] = React.useState(true);
  const [totalPages, setTotalPages] = React.useState(1);
  const [platformPage, setPlatformPage] = React.useState(1);
  const [importDevices, importResult] = useImportDevicesMutation();
  const [addDevices, addResult] = useAddDeviceMutation();
  const [updateDevice, updateResult] = useEditDeviceMutation();
  const [createEvent, createEventResult] = useCreateEventMutation();

  const [previousDevices, setPreviousDevices] = React.useState("");
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    return () => {
      dispatch(eventsApi.util.resetApiState());
      tempPreviousDevices = null;
    };
  }, []);

  useEffect(() => {
    if (mapContainer.current && c8y_Position.lng) {
      if (map.current) return; // initialize map only once
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: [c8y_Position.lng, c8y_Position.lat],
        zoom: 10,
      });
      map.current.addControl(new mapboxgl.NavigationControl());
      map.current.on("click", (e) => {
        if (marker) {
          marker.remove();
        }
        map.current.flyTo({
          center: [e.lngLat.lng, e.lngLat.lat],
        });
        setC8y_Position({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
        });
        setValidLat(true);
        setValidLng(true);
        deviceForm.setFieldValue("lat", e.lngLat.lat);
        deviceForm.setFieldValue("lng", e.lngLat.lng);
        marker = new mapboxgl.Marker()
          .setLngLat([e.lngLat.lng, e.lngLat.lat])
          .addTo(map.current);
      });
      return () => {
        // connector.emit("DC");
        map.current.remove();
      };
    }
  }, [mapContainer.current]);

  useEffect(() => {
    if (!props.deviceEdit) {
      deviceForm.setFieldValue("name", "");
      deviceForm.setFieldValue("firmware", "");
      deviceForm.setFieldValue("serialNumber", "");
      deviceForm.setFieldValue("imei", "");
      deviceForm.setFieldValue("service", "");
      deviceForm.setFieldValue("lng", "");
      deviceForm.setFieldValue("lat", "");
      deviceForm.setFieldValue("iccid", "")
      deviceForm.setFieldValue("imsi", "")
      deviceForm.setFieldValue("msisdn", "")
    }
  }, [props.deviceEdit]);
  const allDevices = useGetAllDevicesQuery({
    token,
    params: `?totalSize=5&platPage=${platformPage}&previousDevices=${previousDevices}`,
  });
  const events = useGetEventsQuery(
    {
      token,
      params: `?pageSize=1&currentPage=1&type=c8y_LocationUpdate&source=${props.deviceEdit.html}`,
    },
    { skip: !props.deviceEdit }
  );
  const [filterFn, setFilterFn] = React.useState({
    fn: (items) => {
      return items;
    },
  });

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  const handlePageNext = () => {
    if (page + 1 > maxPage) {
      setPlatformPage(platformPageClone);
      if (tempPreviousDevices) setPreviousDevices(tempPreviousDevices);
      else setPreviousDevices("");
    }
    // platformPageClone = platformPageClone;
    if (page * 5 == devices.length) {
      setLoader(true);
      setMaxPage(page + 1);
    }
    setPage(page + 1);
  };
  const handlePagePrevious = () => {
    // setPlatformPage(platformPage - 1);
    // platformPageClone = platformPageClone-1;
    setPage(page - 1);
  };

  function handleServiceImport(e) {
    if (e.target.value != "") {
      // setErrors({
      //   ...errors,
      //   msgServiceImport: "",
      //   errorServiceImport: false,
      // });
    }
    setServiceImport(e.target.value);
  }

  function handleAssetTypeSelect(e) {
    setSelectedAssetType(e.target.value)
  }

  function back(page) {
    let disabled;
    if (page != 1) disabled = false;
    else disabled = true;
    return (
      <IconButton
        size="medium"
        onClick={handlePagePrevious}
        disabled={disabled}
      >
        <NavigateBeforeIcon fontSize="inherit" />
      </IconButton>
    );
  }

  function next(page) {
    let disabled;
    if (
      platformPageClone == totalPages &&
      filterFn.fn(devices).slice((page - 1) * 5, (page - 1) * 5 + 5).length < 5
    ) {
      disabled = true;
    } else {
      disabled = false;
    }
    return (
      <IconButton size="medium" onClick={handlePageNext} disabled={disabled}>
        <NavigateNextIcon fontSize="inherit" />
      </IconButton>
    );
  }

  function arrayUnique(array) {
    var a = array.concat();
    for (var i = 0; i < a.length; ++i) {
      for (var j = i + 1; j < a.length; ++j) {
        if (a[i] === a[j]) a.splice(j--, 1);
      }
    }
    return a;
  }

  function itemGenerator(array, x = 0, temp = [], end = false) {
    var a = array.concat();
    if (a.length == 1) return a[0];
    for (var i = 1; i < a.length; ++i) {
      if (end) {
        temp = arrayUnique(temp.concat(a[x]));
        i = a.length;
      } else {
        temp = arrayUnique(temp.concat(arrayUnique(a[x].concat(a[x + 1]))));
      }
      x += 2;
      if (x >= a.length - 1) {
        if (a.length % 2 == 0) {
          i = a.length;
        } else {
          end = true;
        }
      }
    }
    return temp;
  }

  const handleSearch = (e) => {
    let target = e.target;
    setFilterFn({
      fn: (items) => {
        if (target.value == "") return items;
        else {
          var temp = [];
          ["name", "internalId"].forEach((elm) => {
            temp.push(
              items.filter((x) => {
                if (x[elm]) return x[elm].toLowerCase().includes(target.value);
                else return false;
              })
            );
          });
          return itemGenerator(temp);
        }
      },
    });
  };

  async function fetchAllDevices(pageNo) {
    if (
      allDevices.isSuccess &&
      (devices[page == 1 ? page * 5 - 1 : (page - 1) * 5 - 1] !=
        allDevices.data.payload.finalPacket[4] ||
        (page == 1 && allDevices.data.payload.finalPacket[0])) &&
      !allDevices.isFetching
    ) {
      if (allDevices.data.payload?.previousDevices)
        tempPreviousDevices = allDevices.data.payload.previousDevices;
      let tempDevices = JSON.parse(JSON.stringify(devices));
      allDevices.data.payload.finalPacket.forEach((d) => {
        if (!tempDevices.find((dev) => dev.id == d.id)) {
          tempDevices.push(d);
        }
      });
      setDevices(tempDevices);
      setTotalPages(allDevices.data.payload.totalPages);
      // setPlatformPage(allDevices.data.payload.platformPage);
      platformPageClone = allDevices.data.payload.platformPage;
      setNotFound(false);
      setLoader(false);
    }
    if (
      !allDevices.isFetching &&
      allDevices.isSuccess &&
      !allDevices.data?.payload?.finalPacket.length
    ) {
      setLoader(false);
      setNotFound(true);
    }
    if (allDevices.isError) {
      showSnackbar("Devices", allDevices.error.data?.message, "error", 1000);
      setLoader(false);
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  useEffect(() => {
    if (!events.isFetching && events.isSuccess) {
      if (events.data?.payload?.data?.length) {
        let tempLoc = events.data.payload.data[0].c8y_Position;
        if (tempLoc) {
          setC8y_Position(tempLoc);
          map.current.flyTo({
            center: [tempLoc.lng, tempLoc.lat],
          });
          marker = new mapboxgl.Marker()
            .setLngLat([tempLoc.lng, tempLoc.lat])
            .addTo(map.current);
        } else {
          map.current.flyTo({
            center: [c8y_Position.lng, c8y_Position.lat],
          });
          marker = new mapboxgl.Marker()
            .setLngLat([c8y_Position.lng, c8y_Position.lat])
            .addTo(map.current);
        }
      }
    }
    if (!events.isFetching && events.isError) {
      showSnackbar("Location", "Could not fetch location", "error", 1000);
    }
  }, [events.isFetching]);

  useEffect(() => {
    if (props.openPopup) {
      fetchAllDevices();
    }
    return () => {
      platformPageClone = 1;
    };
  }, [allDevices.isFetching]);

  var onSubmitImport = async () => {
    if (serviceImport == "") {
      showSnackbar("Device", "Please select any solution", "warning", 1000);
    } else if (checked.length < 1) {
      showSnackbar(
        "Device",
        "Please select atleast one device",
        "warning",
        1000
      );
    } else {
      let body = {};
      body.serviceId = idMap[serviceImport];
      body.devices = selectedImport;
      body.location = metaData.find(
        (s) => s.id == idMap[serviceImport]
      )?.defaultLocation;
      let selectedService = metaData.find((service) => service.name == serviceImport)
      if( selectedService.assets.length > 1){
        body.platformDeviceType = selectedAssetType
      } else {
        body.platformDeviceType = selectedService.assets[0].id
      }
      console.log({body})
      let imported = await importDevices({ token, body });
      let type = "error";
      if (imported.data?.success) {
        type = "success";
        platformPageClone = 1;
        setDevices([]);
        showSnackbar(
          imported.data?.message,
          imported.data?.message,
          type,
          1000
        );
        props.handlepopupToggle();
      } else {
        showSnackbar("Device", imported.error.data?.message, "error", 1000);
      }

      // setTotalPages(1);
      // setPlatformPage(1);
      // setLoader(true);
      // showSnackbar(imported.data?.message,imported.data?.message,type,1000)
    }
  };

  var onSubmitAdd = async () => {
    let body = JSON.parse(JSON.stringify(deviceForm.values));
    if (
      selectedSolution &&
      selectedSolution.assets &&
      selectedSolution.assets.length > 1
    ) {
      if (!body.platformDeviceType || body.platformDeviceType === "") {
        showSnackbar("Device", "Asset type is required", "error", 1000);
        return;
      }
    } else {
      delete body.platformDeviceType;
    }
    body.serviceId = idMap[body.service];
    body.firmwareVersion = body.firmware;
    body.location = metaData.find(
      (s) => s.id == idMap[body.service]
    )?.defaultLocation;
    delete body.firmware;
    delete body.service;
    if (!props.deviceEdit) {
      let added = await addDevices({ token, body });
      let type = "error";
      if (added.data?.success) {
        type = "success";
        if (added.data.payload?.internalId) {
          let eventsBody = {
            deviceId: added.data.payload.internalId,
            c8y_Position,
            text: "Asset location specified",
            type: "c8y_LocationUpdate",
            time: new Date(),
          };
          let createdEvent = await createEvent({ token, body: eventsBody });
        }
        deviceForm.resetForm();
        props.handlepopupToggle2();
      }
      showSnackbar("Device", added.data?.message, type, 1000);
    } else {
      let updated = await updateDevice({
        token,
        body,
        id: props.deviceEdit.html,
      });
      let type = "error";
      if (updated.data?.success) {
        if (updated.data.payload?.internalId) {
          let eventsBody = {
            deviceId: updated.data.payload.internalId,
            c8y_Position,
            text: "Asset location specified",
            type: "c8y_LocationUpdate",
            time: new Date(),
          };
          let createdEvent = await createEvent({ token, body: eventsBody });
        }
        type = "success";
        deviceForm.resetForm();
        props.handlepopupToggle2();
        props.handleUpdateDevice(body, props.deviceEdit.html);
      }
      showSnackbar("Device", updated.data?.message, type, 1000);
    }
  };

  const handleToggle = (elm) => () => {
    let value = elm.id;
    let old = selectedImport;
    const currentIndex = checked.indexOf(value);
    const newChecked = [...checked];

    if (currentIndex === -1) {
      old.push(elm);
      newChecked.push(value);
    } else {
      old.splice(currentIndex, 1);
      newChecked.splice(currentIndex, 1);
    }

    setSelectedImport(old);
    setChecked(newChecked);
  };

  function listFunc() {
    return (
      <div>
        <FormControl sx={{marginTop: "10px"}} className={classes.formControl} fullWidth>
          <InputLabel>Solution *</InputLabel>
          <Select
            fullWidth
            required
            onChange={handleServiceImport}
            value={serviceImport}
            label={"Solution *"}
          >
            {metaData.map((elm) => (
              <MenuItem value={elm.name}>{elm.name}</MenuItem>
            ))}
          </Select>
          {/* <FormHelperText>{errors.msgServiceImport}</FormHelperText> */}
        </FormControl>
        {serviceImport !== "" && metaData.find((service) => service.name == serviceImport).assets.length > 1 ? <FormControl sx={{marginTop: "10px", marginBottom: "10px"}} className={classes.formControl} fullWidth>
          <InputLabel>Asset Type *</InputLabel>
          <Select
            fullWidth
            required
            onChange={handleAssetTypeSelect}
            value={selectedAssetType}
            disabled={serviceImport == ""}
            label={"Asset Type *"}
          >
            {serviceImport !== "" && metaData.find((service) => service.name == serviceImport).assets.map((elm) => (
              <MenuItem value={elm.id}>{elm.name}</MenuItem>
            ))}
          </Select>
          {/* <FormHelperText>{errors.msgServiceImport}</FormHelperText> */}
        </FormControl> : null}
        {/* <div style={{ paddingBottom: "20px", paddingTop: "20px" }}>
          {SearchFn(value)}
        </div> */}
        {/* <span style={{ display: "flex", paddingBottom: "20px" }}>
          <Button
            variant="contained"
            color="primary"
            style={{
              color: "white",
            }}
            onClick={onImportAll}
          >
            Import all
          </Button>
          <WarningIcon
            fontSize="small"
            style={{
              color: "grey",
              marginLeft: "5px",
              marginTop: "8px",
            }}
          />
          <p
            style={{
              color: "grey",
              marginLeft: "5px",
              marginTop: "7px",
            }}
          >
            All devices will be imported
          </p>
        </span> */}
        <List>
          {filterFn
            .fn(devices)
            .slice((page - 1) * 5, (page - 1) * 5 + 5)
            .map((elm, i) => {
              var value = elm.id;
              const labelId = value;
              return (
                <span>
                  <ListItem
                    key={value}
                    role={undefined}
                    dense
                    button
                    onClick={handleToggle(elm)}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        color="primary"
                        style={{ overflow: "hidden" }}
                        checked={checked.indexOf(value) !== -1}
                        tabIndex={-1}
                        disableRipple
                        inputProps={{ "aria-labelledby": labelId }}
                      />
                    </ListItemIcon>
                    <span
                      style={{
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <ListItemText id={labelId} primary={elm.name} />
                      <p
                        style={{
                          fontSize: "13px",
                          color: "gray",
                          position: "relative",
                          bottom: "5px",
                        }}
                      >
                        {elm.id}
                      </p>
                    </span>
                    <ListItemSecondaryAction>
                      <IconButton edge="end" aria-label="comments">
                        <SettingsInputHdmiIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                </span>
              );
              i += 1;
            })}
        </List>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {back(page)}
          <p>{`${page}`}</p>
          {next(page)}
        </span>
      </div>
    );
  }

  return (
    <div>
      <form>
        <Dialog
          open={props.openPopup}
          onClose={props.handlepopupToggle}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">Import Devices</DialogTitle>
          {notFound ? (
            <div
              style={{
                marginBottom: "40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  width: "200px",
                }}
              >
                <img
                  style={{ maxWidth: "70%", maxHeight: "70%" }}
                  src={noData}
                />
              </div>
              <p style={{ color: "#c8c8c8" }}>No devices found</p>
            </div>
          ) : (
            <Fragment>
              <DialogContent>
                {ifLoaded(allDevices.isFetching, listFunc)}
              </DialogContent>
              <DialogActions>
                <Button onClick={props.handlepopupToggle} color="primary">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loader || !validLat || !validLng}
                  onClick={onSubmitImport}
                  color="primary"
                >
                  {importResult.isLoading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <span>Submit</span>
                  )}
                </Button>
              </DialogActions>
            </Fragment>
          )}
        </Dialog>
      </form>
      <Dialog
        open={props.openPopup2}
        onClose={props.handlepopupToggle2}
        aria-labelledby="form-dialog-title"
        maxWidth="lg"
        maxHeight="lg"
      >
        <form onSubmit={deviceForm.handleSubmit}>
          <DialogTitle id="form-dialog-title">
            {props.deviceEdit
              ? `Update Device ( ${props.deviceEdit.name} )`
              : "Add Device"}
          </DialogTitle>
          <DialogContent style={{ display: "flex", gap: 20 }}>
            <div style={{ width: "50%" }}>
              <p style={{ fontSize: 14, fontWeight: "bold", color: "#999" }}>
                Device Details
              </p>
              <TextField
                id="name"
                error={
                  deviceForm.touched.name && deviceForm.errors.name
                    ? true
                    : false
                }
                margin="dense"
                style={{
                  marginBottom: "5px",
                }}
                value={deviceForm.values.name}
                onChange={deviceForm.handleChange}
                onBlur={deviceForm.handleBlur}
                fullWidth
                label="Name"
                helperText={
                  deviceForm.touched.name ? deviceForm.errors.name : ""
                }
              />
              <TextField
                id="firmware"
                error={
                  deviceForm.touched.firmware && deviceForm.errors.firmware
                    ? true
                    : false
                }
                margin="dense"
                style={{
                  marginBottom: "5px",
                }}
                value={deviceForm.values.firmware}
                onChange={deviceForm.handleChange}
                onBlur={deviceForm.handleBlur}
                fullWidth
                label="Firmware"
                helperText={
                  deviceForm.touched.firmware ? deviceForm.errors.firmware : ""
                }
              />
              <TextField
                id="serialNumber"
                error={
                  deviceForm.touched.serialNumber &&
                  deviceForm.errors.serialNumber
                    ? true
                    : false
                }
                margin="dense"
                style={{
                  marginBottom: "5px",
                }}
                value={deviceForm.values.serialNumber}
                onChange={deviceForm.handleChange}
                onBlur={deviceForm.handleBlur}
                fullWidth
                label="Serial Number"
                helperText={
                  deviceForm.touched.serialNumber
                    ? deviceForm.errors.serialNumber
                    : ""
                }
              />
              <TextField
                id="imei"
                error={
                  deviceForm.touched.imei && deviceForm.errors.imei
                    ? true
                    : false
                }
                margin="dense"
                style={{
                  marginBottom: "5px",
                }}
                value={deviceForm.values.imei}
                onChange={deviceForm.handleChange}
                onBlur={deviceForm.handleBlur}
                fullWidth
                label="IMEI"
                helperText={
                  deviceForm.touched.imei ? deviceForm.errors.imei : ""
                }
              />
              <TextField
                id="imsi"
                error={
                  deviceForm.touched.imsi && deviceForm.errors.imsi
                    ? true
                    : false
                }
                margin="dense"
                style={{
                  marginBottom: "5px",
                }}
                value={deviceForm.values.imsi}
                onChange={deviceForm.handleChange}
                onBlur={deviceForm.handleBlur}
                fullWidth
                label="IMSI"
                helperText={
                  deviceForm.touched.imsi ? deviceForm.errors.imsi : ""
                }
              />
              <TextField
                id="iccid"
                error={
                  deviceForm.touched.iccid && deviceForm.errors.iccid
                    ? true
                    : false
                }
                margin="dense"
                style={{
                  marginBottom: "5px",
                }}
                value={deviceForm.values.iccid}
                onChange={deviceForm.handleChange}
                onBlur={deviceForm.handleBlur}
                fullWidth
                label="ICCID"
                helperText={
                  deviceForm.touched.iccid ? deviceForm.errors.iccid : ""
                }
              />
              <TextField
                id="msisdn"
                error={
                  deviceForm.touched.msisdn && deviceForm.errors.msisdn
                    ? true
                    : false
                }
                margin="dense"
                style={{
                  marginBottom: "5px",
                }}
                value={deviceForm.values.msisdn}
                onChange={deviceForm.handleChange}
                onBlur={deviceForm.handleBlur}
                fullWidth
                label="MSISDN"
                helperText={
                  deviceForm.touched.msisdn ? deviceForm.errors.msisdn : ""
                }
              />
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ width: "50%" }}>
                  <TextField
                    id="lat"
                    error={
                      deviceForm.touched.lat && deviceForm.errors.lat
                        ? true
                        : false
                    }
                    margin="dense"
                    style={{
                      marginBottom: "5px",
                    }}
                    value={deviceForm.values.lat || ""}
                    onChange={(e) => {
                      if (e.target.value >= -90 && e.target.value <= 90) {
                        setValidLat(true);
                        setC8y_Position({
                          ...c8y_Position,
                          lat: e.target.value,
                        });
                        if (validLat && validLng) {
                          if (marker) {
                            marker.remove();
                          }
                          map.current.flyTo({
                            center: [c8y_Position.lng, e.target.value],
                          });
                          marker = new mapboxgl.Marker()
                            .setLngLat([c8y_Position.lng, e.target.value])
                            .addTo(map.current);
                        }
                      } else {
                        console.log("invalid");
                        setValidLat(false);
                      }
                      deviceForm.handleChange(e);
                    }}
                    onBlur={deviceForm.handleBlur}
                    fullWidth
                    label="Latitude"
                    helperText={
                      deviceForm.touched.lat ? deviceForm.errors.lat : null
                    }
                  />
                  {!validLat ? (
                    <div style={{ fontSize: "10px", color: "red" }}>
                      Invalid Latitude
                    </div>
                  ) : null}
                </div>
                <div style={{ width: "50%" }}>
                  <TextField
                    id="lng"
                    error={
                      deviceForm.touched.lng && deviceForm.errors.lng
                        ? true
                        : false
                    }
                    margin="dense"
                    style={{
                      marginBottom: "5px",
                    }}
                    value={deviceForm.values.lng || ""}
                    onChange={(e) => {
                      if (e.target.value >= -180 && e.target.value <= 180) {
                        setValidLng(true);
                        setC8y_Position({
                          ...c8y_Position,
                          lng: e.target.value,
                        });
                        if (validLat && validLng) {
                          if (marker) {
                            marker.remove();
                          }
                          map.current.flyTo({
                            center: [e.target.value, c8y_Position.lat],
                          });
                          marker = new mapboxgl.Marker()
                            .setLngLat([e.target.value, c8y_Position.lat])
                            .addTo(map.current);
                        }
                      } else {
                        setValidLng(false);
                      }
                      deviceForm.handleChange(e);
                    }}
                    onBlur={deviceForm.handleBlur}
                    fullWidth
                    label="Longitude"
                    helperText={
                      deviceForm.touched.lng ? deviceForm.errors.lng : null
                    }
                  />
                  {!validLng ? (
                    <div style={{ fontSize: "10px", color: "red" }}>
                      Invalid Longitude
                    </div>
                  ) : null}
                </div>
              </div>
              <FormControl
                fullWidth
                className={classes.formControl}
                margin="dense"
              >
                <InputLabel>Solution</InputLabel>
                <Select
                  value={deviceForm.values.service}
                  error={
                    deviceForm.touched.service && deviceForm.errors.service
                      ? true
                      : false
                  }
                  name="service"
                  fullWidth
                  onChange={(e) => {
                    let solution = metaData.find(
                      (s) => s.id == idMap[e.target.value]
                    );
                    deviceForm.setFieldValue("platformDeviceType", "");
                    setSelectedSolution(solution);
                    let defaultLocation = solution?.defaultLocation;
                    if (defaultLocation && defaultLocation.length) {
                      console.log({ defaultLocation });
                      setC8y_Position({
                        lng: defaultLocation[0],
                        lat: defaultLocation[1],
                      });
                      console.log({ defaultLocation });
                      deviceForm.setFieldValue("lat", defaultLocation[1]);
                      deviceForm.setFieldValue("lng", defaultLocation[0]);
                      if(marker){
                        marker.remove()
                      }
                      marker = new mapboxgl.Marker()
                      .setLngLat([defaultLocation[0], defaultLocation[1]])
                      .addTo(map.current);
                      map.current.flyTo({
                        center: [defaultLocation[0], defaultLocation[1]],
                      });
                    }
                    deviceForm.handleChange(e);
                  }}
                  label="Solution"
                  helperText={
                    deviceForm.touched.service ? deviceForm.errors.service : ""
                  }
                >
                  {metaData.map((elm) => {
                    return <MenuItem value={elm.name}>{elm.name}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              {selectedSolution &&
              selectedSolution.assets &&
              selectedSolution.assets.length > 1 ? (
                <FormControl
                  fullWidth
                  className={classes.formControl}
                  margin="dense"
                >
                  <InputLabel>Asset type</InputLabel>
                  <Select
                    value={deviceForm.values.platformDeviceType}
                    error={
                      deviceForm.touched.platformDeviceType &&
                      deviceForm.errors.platformDeviceType
                        ? true
                        : false
                    }
                    name="platformDeviceType"
                    fullWidth
                    onChange={(e) => {
                      console.log("e.target.value", e.target.value);
                      deviceForm.setFieldValue(
                        "platformDeviceType",
                        e.target.value
                      );
                    }}
                    label="platformDeviceType"
                    helperText={
                      deviceForm.touched.platformDeviceType
                        ? deviceForm.errors.platformDeviceType
                        : ""
                    }
                  >
                    {selectedSolution.assets.map((elm) => {
                      return (
                        <MenuItem value={elm.id || elm._id}>
                          {elm.name}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              ) : null}
            </div>
            <div style={{ width: "50%" }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: "bold",
                  color: "#999",
                  marginBottom: 6,
                }}
              >
                Device Location
              </p>
              {props.deviceEdit ? (
                events.isFetching ? (
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <CircularProgress size={40} />
                  </div>
                ) : null
              ) : null}
              <div
                ref={mapContainer}
                style={{
                  height: "calc(100% - 30px)",
                  borderRadius: "10px",
                  visibility: props.deviceEdit
                    ? events.isFetching
                      ? "hidden"
                      : "inherit"
                    : "inherit",
                }}
              />
            </div>
          </DialogContent>
          <DialogActions
            style={{ justifyContent: "center" }}
            sx={{ justifyContent: "center" }}
          >
            <Button onClick={props.handlepopupToggle2} color="primary">
              Cancel
            </Button>
            {addResult.isLoading ||
            updateResult.isLoading ||
            createEventResult.isLoading ? (
              <CircularProgress style={{ margin: "0px 16px" }} size={20} />
            ) : (
              <Button
                type="submit"
                color="primary"
                disabled={events.isFetching}
              >
                <span>Submit</span>
              </Button>
            )}
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
