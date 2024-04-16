import React, { Fragment, useEffect, withStyles } from "react";
import { makeStyles } from "@mui/styles";
import Card from "@mui/material/Card";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import Fab from "@mui/material/Fab";
import SaveIcon from "@mui/icons-material/Save";
import AssessmentIcon from "@mui/icons-material/Assessment";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TimelineIcon from "@mui/icons-material/Timeline";
import GpsFixedIcon from "@mui/icons-material/GpsFixed";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import FormHelperText from "@mui/material/FormHelperText";
import FormControl from "@mui/material/FormControl";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import { CreateSimulation } from "../../../actions/simulationsActions";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Snackbar from "../../SnackBar";
import { connect } from "react-redux";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import { IconButton } from "@mui/material";
import connector from "./connector";
import Box from "@mui/material/Box";
import Map from "./map";
import { getServices_GET } from "axios/serviceCreator";
import { func } from "prop-types";
import Dragable from "components/Dragable";

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
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

const useStyles = makeStyles((theme) => ({
  tab: {
    root: {
      textTransform: "none",
      minWidth: 72,
      fontWeight: theme.typography.fontWeightRegular,
      marginRight: theme.spacing(4),
      fontFamily: [
        "-apple-system",
        "BlinkMacSystemFont",
        '"Segoe UI"',
        "Roboto",
        '"Helvetica Neue"',
        "Arial",
        "sans-serif",
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
      ].join(","),
      "&:hover": {
        color: "#40a9ff",
        opacity: 1,
      },
      "&$selected": {
        color: "#1890ff",
        fontWeight: theme.typography.fontWeightMedium,
      },
      "&:focus": {
        color: "#40a9ff",
      },
    },
    selected: {},
  },
  tabs: {
    root: {
      borderBottom: "1px solid #e8e8e8",
    },
    indicator: {
      backgroundColor: "#1890ff",
    },
  },
  root: {
    flexGrow: 1,
  },
  padding: {
    padding: theme.spacing(3),
  },
  demo1: {
    backgroundColor: theme.palette.background.paper,
  },
  demo2: {
    backgroundColor: "#2e1534",
  },
  speedDial: {
    position: "fixed",
    bottom: theme.spacing(4),
    right: theme.spacing(4),
    zIndex: 20,
  },
  measurementCard: {
    backgroundColor: metaDataValue.branding.secondaryColor,
    minHeight: "80px",
    width: "auto",
    margin: "30px 30px 0px 30px",
    "&:hover": {
      boxShadow:
        "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
    },
  },
  alarmCard: {
    backgroundColor: "#bf3535",
    minHeight: "80px",
    width: "auto",
    margin: "30px 30px 0px 30px",
    "&:hover": {
      boxShadow:
        "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
    },
  },
  eventCard: {
    backgroundColor: metaDataValue.branding.primaryColor,
    minHeight: "80px",
    width: "auto",
    margin: "30px 30px 0px 30px",
    "&:hover": {
      boxShadow:
        "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
    },
  },
  measurementAdd: {
    color: metaDataValue.branding.secondaryColor,
    height: "50px",
    width: "50px",
    opacity: "0.5",
    margin: "20px",
    "&:hover": {
      cursor: "pointer",
      opacity: "1",
    },
  },
  alarmAdd: {
    color: "#bf3535",
    height: "50px",
    width: "50px",
    opacity: "0.5",
    margin: "20px",
    "&:hover": {
      cursor: "pointer",
      opacity: "1",
    },
  },
  eventAdd: {
    color: metaDataValue.branding.primaryColor,
    height: "50px",
    width: "50px",
    opacity: "0.5",
    margin: "20px",
    "&:hover": {
      cursor: "pointer",
      opacity: "1",
    },
  },
}));

export default function Simulator(props) {
  const classes = useStyles();
  const [openPopup, setOpenPopup] = React.useState(false);
  const [selector, setSelector] = React.useState({ type: null, index: null });
  const [isShown, setIsShown] = React.useState(null);
  const [isShown2, setIsShown2] = React.useState(null);
  const [isShown3, setIsShown3] = React.useState(null);
  const [route, setRoute] = React.useState([]);
  const [openPopup2, setOpenPopup2] = React.useState(false);
  const [openPopup3, setOpenPopup3] = React.useState(false);
  const [openPopup4, setOpenPopup4] = React.useState(false);
  const [severity, setSeverity] = React.useState("MINOR");
  const [snack, setSnack] = React.useState(false);
  const [snackText, setSnackText] = React.useState("");
  const [snackType, setSnackType] = React.useState("");
  const [body, setBody] = React.useState({
    name: "",
    serviceId: serviceId,
    devices: [],
    measurementsAttr: [],
    alarmsAttr: [],
    eventsAttr: [],
  });
  const [dataPointCard, setDataPointCard] = React.useState([]);
  const [alarmCard, setAlarmCard] = React.useState([]);
  const [eventCard, setEventCard] = React.useState([]);
  const [unit, setUnit] = React.useState("");
  const [time, setTime] = React.useState("");
  const [alarmType, setAlarmType] = React.useState("");
  const [alarmTime, setAlarmTime] = React.useState("");
  const [alarmMessage, setAlarmMessage] = React.useState("");
  const [eventType, setEventType] = React.useState("");
  const [locationEventTime, setLocationEventTime] = React.useState("");
  const [eventTime, setEventTime] = React.useState("");
  const [eventMessage, setEventMessage] = React.useState("");
  const [min, setMin] = React.useState("");
  const [max, setMax] = React.useState("");
  const [service, setService] = React.useState("");
  const [sensor, setSensor] = React.useState("");
  const [name, setName] = React.useState("");
  // const [metaData, setmetaData] = React.useState(
  //   JSON.parse(window.localStorage.getItem("metaData")).services
  // );
  const [errors, setErrors] = React.useState({
    errorService: false,
    errorMin: false,
    errorMax: false,
    errorTime: false,
    errorAlarmTime: false,
    errorAlarmType: false,
    errorAlarmMessage: false,
    errorUnit: false,
    errorSensor: false,
    errorName: false,
    errorLocationEventTime: false,
    msgLocationEventTime: "",
    msgSensor: "",
    msgUnit: "",
    msgName: "",
    msgAlarmMessage: "",
    msgAlarmType: "",
    msgAlarmTime: "",
    msgService: "",
    msgMin: "",
    msgMax: "",
    msgTime: "",
  });
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  function handleEditCard(type, index) {
    let elm = {};
    switch (type) {
      case "measurement":
        elm = body.measurementsAttr[index];
        setService(dataPointCard[index].service);
        setSensor(elm.ranges.dataPoint);
        setUnit(elm.ranges.unit);
        setMin(elm.ranges.min);
        setMax(elm.ranges.max);
        setTime(
          parseInt(
            elm.intervalBetween.substring(0, elm.intervalBetween.length - 1)
          )
        );
        handlepopupOpen();
        break;
      case "alarm":
        elm = body.alarmsAttr[index];
        setSeverity(elm.severity);
        setAlarmTime(
          parseInt(
            elm.intervalBetween.substring(0, elm.intervalBetween.length - 1)
          )
        );
        setAlarmType(elm.type);
        setAlarmMessage(elm.text);
        handlepopupOpen2();
        break;
      case "event":
        elm = body.eventsAttr[index];
        if (elm?.metaData?.locations) {
          setLocationEventTime(
            parseInt(
              elm.intervalBetween.substring(0, elm.intervalBetween.length - 1)
            )
          );
          setRoute(elm?.metaData?.locations);
          setTimeout(function () {
            connector.emit("setMap", elm?.metaData?.locations);
          }, 1000);
        } else {
          setEventTime(
            parseInt(
              elm.intervalBetween.substring(0, elm.intervalBetween.length - 1)
            )
          );
          setEventType(elm.type);
          setEventMessage(elm.text);
        }
        handlepopupOpen3();
        break;
      default:
        break;
    }
  }

  function handleDeleteCard(type, index) {
    let old = [];
    let value = [];
    switch (type) {
      case "measurement":
        old = dataPointCard;
        old.splice(index, 1);
        value = body.measurementsAttr;
        value.splice(index, 1);
        setBody({
          ...body,
          ...{ measurementsAttr: value },
        });
        setDataPointCard(old);
        break;
      case "alarm":
        old = alarmCard;
        old.splice(index, 1);
        value = body.alarmsAttr;
        value.splice(index, 1);
        setBody({
          ...body,
          ...{ alarmsAttr: value },
        });
        setAlarmCard(old);
        break;
      case "event":
        old = eventCard;
        old.splice(index, 1);
        value = body.eventsAttr;
        value.splice(index, 1);
        setBody({
          ...body,
          ...{ eventsAttr: value },
        });
        setEventCard(old);
        break;
      default:
        break;
    }
  }

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnack(false);
  };

  const handleClick = (severity) => {
    setSeverity(severity);
  };

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const handlepopupClose = () => {
    setOpenPopup(false);
  };

  const handlepopupOpen2 = () => {
    setOpenPopup2(true);
  };

  const handlepopupClose2 = () => {
    setOpenPopup2(false);
  };

  const handlepopupOpen3 = () => {
    setOpenPopup3(true);
  };

  const handlepopupClose3 = () => {
    setOpenPopup3(false);
  };

  const handlepopupOpen4 = () => {
    setOpenPopup4(true);
  };

  const handlepopupClose4 = () => {
    setOpenPopup4(false);
  };

  function handleAlarmType(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgAlarmType: "Required Field",
        errorAlarmType: true,
      });
    } else {
      setErrors({
        ...errors,
        msgAlarmType: "",
        errorAlarmType: false,
      });
    }
    setAlarmType(e.target.value);
  }

  function handleEventType(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgEventType: "Required Field",
        errorEventType: true,
      });
    } else {
      setErrors({
        ...errors,
        msgEventType: "",
        errorEventType: false,
      });
    }
    setEventType(e.target.value);
  }

  function handleUnit(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgUnit: "Required Field",
        errorUnit: true,
      });
    } else {
      setErrors({
        ...errors,
        msgUnit: "",
        errorUnit: false,
      });
    }
    setUnit(e.target.value);
  }

  function handleName(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgName: "Required Field",
        errorName: true,
      });
    } else {
      setErrors({
        ...errors,
        msgName: "",
        errorName: false,
      });
    }
    setName(e.target.value);
  }

  function handleAlarmMessage(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgAlarmMessage: "Required Field",
        errorAlarmMessage: true,
      });
    } else {
      setErrors({
        ...errors,
        msgAlarmMessage: "",
        errorAlarmMessage: false,
      });
    }
    setAlarmMessage(e.target.value);
  }

  function handleEventMessage(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgEventMessage: "Required Field",
        errorEventMessage: true,
      });
    } else {
      setErrors({
        ...errors,
        msgEventMessage: "",
        errorEventMessage: false,
      });
    }
    setEventMessage(e.target.value);
  }

  function handleMin(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgMin: "Required Field",
        errorMin: true,
      });
    } else {
      setErrors({
        ...errors,
        msgMin: "",
        errorMin: false,
      });
    }
    setMin(e.target.value);
  }

  function handleKeyDown(e) {
    if ([69, 187, 188, 189, 190].includes(e.keyCode)) {
      e.preventDefault();
      return;
    }
  }

  function handleMax(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgMax: "Required Field",
        errorMax: true,
      });
    } else {
      setErrors({
        ...errors,
        msgMax: "",
        errorMax: false,
      });
    }
    setMax(e.target.value);
  }

  function handleTime(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgTime: "Required Field",
        errorTime: true,
      });
    } else {
      setErrors({
        ...errors,
        msgTime: "",
        errorTime: false,
      });
    }
    setTime(e.target.value);
  }

  function handleEventTime(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgEventTime: "Required Field",
        errorEventTime: true,
      });
    } else {
      setErrors({
        ...errors,
        msgEventTime: "",
        errorEventTime: false,
      });
    }
    setEventTime(e.target.value);
  }

  function handleLocationEventTime(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgLocationEventTime: "Required Field",
        errorLocationEventTime: true,
      });
    } else {
      setErrors({
        ...errors,
        msgLocationEventTime: "",
        errorLocationEventTime: false,
      });
    }
    setLocationEventTime(e.target.value);
  }

  function handleAlarmTime(e) {
    if (e.target.value == "") {
      setErrors({
        ...errors,
        msgAlarmTime: "Required Field",
        errorAlarmTime: true,
      });
    } else {
      setErrors({
        ...errors,
        msgAlarmTime: "",
        errorAlarmTime: false,
      });
    }
    setAlarmTime(e.target.value);
  }

  function handleService(e) {
    if (e.target.value != "") {
      setErrors({
        ...errors,
        msgService: "",
        errorService: false,
      });
    }
    setService(e.target.value);
  }

  function handleSensor(e) {
    if (e.target.value != "") {
      setErrors({
        ...errors,
        msgSensor: "",
        errorSensor: false,
      });
    }
    setSensor(e.target.value);
  }

  useEffect(() => {}, []);

  function sensors(name) {
    let output = [];
    for (let i = 0; i < metaData.length; i++) {
      if (metaData[i].name == name) {
        output = metaData[i].sensors;
        break;
      }
    }
    return getFiltered(output, dataPointCard);
  }

  function serviceId(name) {
    let output = [];
    for (let i = 0; i < metaData.length; i++) {
      if (metaData[i].name == name) {
        output = metaData[i].id;
        break;
      }
    }
    return output;
  }

  function handleEvent(selector) {
    if (value == 0) {
      let tempError = {};
      if (eventMessage == "") {
        tempError.errorEventMessage = true;
        tempError.msgEventMessage = "Required Field";
      }
      if (eventType == "") {
        tempError.errorEventType = true;
        tempError.msgEventType = "Required Field";
      }
      if (eventTime == "") {
        tempError.errorEventTime = true;
        tempError.msgEventTime = "Required Field";
      }
      setErrors({ ...errors, ...tempError });
      if (Object.keys(tempError).length < 1) {
        let temp = eventCard;
        let value = body.eventsAttr;
        if (selector.type != "EDIT") {
          temp.push({ name: eventType, time: eventTime, type: "Standard" });
          value.push({
            text: eventMessage,
            type: eventType,
            intervalBetween: `${eventTime}s`,
            metaData: "",
          });
        } else {
          temp.splice(selector, 1, {
            name: eventType,
            time: eventTime,
            type: "Standard",
          });
          value.splice(selector, 1, {
            text: eventMessage,
            type: eventType,
            intervalBetween: `${eventTime}s`,
            metaData: "",
          });
        }
        setBody({
          ...body,
          ...{ eventsAttr: value },
        });
        setEventCard(temp);
        handlepopupClose3();
      }
    } else if (value == 1) {
      let tempError = {};
      if (locationEventTime == "") {
        tempError.errorLocationEventTime = true;
        tempError.msgLocationEventTime = "Required Field";
      }
      setErrors({ ...errors, ...tempError });
      if (Object.keys(tempError).length < 1) {
        let temp = eventCard;
        let value = body.eventsAttr;
        if (selector.type != "EDIT") {
          temp.push({
            name: "c8y_LocationUpdate",
            time: locationEventTime,
            type: "Location",
          });
          value.push({
            text: "Location has been updated.",
            type: "c8y_LocationUpdate",
            intervalBetween: `${locationEventTime}s`,
            metaData: { locations: route },
          });
        } else {
          temp.splice(selector.index, 1, {
            name: "c8y_LocationUpdate",
            time: locationEventTime,
            type: "Location",
          });
          value.splice(selector.index, 1, {
            text: "Location has been updated.",
            type: "c8y_LocationUpdate",
            intervalBetween: `${locationEventTime}s`,
            metaData: { locations: route },
          });
        }
        setBody({
          ...body,
          ...{ eventsAttr: value },
        });
        setEventCard(temp);
        handlepopupClose3();
      }
    }
  }

  function handleAlarm(selector) {
    let tempError = {};
    if (alarmMessage == "") {
      tempError.errorAlarmMessage = true;
      tempError.msgAlarmMessage = "Required Field";
    }
    if (alarmType == "") {
      tempError.errorAlarmType = true;
      tempError.msgAlarmType = "Required Field";
    }
    if (alarmTime == "") {
      tempError.errorAlarmTime = true;
      tempError.msgAlarmTime = "Required Field";
    }
    setErrors({ ...errors, ...tempError });
    if (Object.keys(tempError).length < 1) {
      let temp = alarmCard;
      let value = body.alarmsAttr;
      if (selector.type != "EDIT") {
        temp.push({ name: alarmType, time: alarmTime });
        value.push({
          severity: severity,
          text: alarmMessage,
          type: alarmType,
          status: "ACTIVE",
          intervalBetween: `${alarmTime}s`,
          metaData: "",
        });
      } else {
        temp.splice(selector.index, 1, { name: alarmType, time: alarmTime });
        value.splice(selector.index, 1, {
          severity: severity,
          text: alarmMessage,
          type: alarmType,
          status: "ACTIVE",
          intervalBetween: `${alarmTime}s`,
          metaData: "",
        });
      }
      setBody({
        ...body,
        ...{ alarmsAttr: value },
      });
      setAlarmCard(temp);
      handlepopupClose2();
    }
  }

  function chkLoc(eventCard) {
    let output = true;
    eventCard.forEach((elm) => {
      if (elm.type == "Location") {
        output = false;
      }
    });
    return output;
  }

  function handleDataPoint(selector) {
    let tempError = {};
    if (min == "") {
      tempError.errorMin = true;
      tempError.msgMin = "Required Field";
    }
    if (max == "") {
      tempError.errorMax = true;
      tempError.msgMax = "Required Field";
    }
    if (time == "") {
      tempError.errorTime = true;
      tempError.msgTime = "Required Field";
    }
    if (sensor == "") {
      tempError.errorService = true;
      tempError.msgService = "Please select a data point";
    }
    setErrors({ ...errors, ...tempError });
    if (Object.keys(tempError).length < 1) {
      let temp = dataPointCard;
      let value = body.measurementsAttr;
      if (selector.type != "EDIT") {
        temp.push({ name: sensor, time: time, service: service });
        value.push({
          ranges: {
            dataPoint: sensor,
            min: min,
            max: max,
            unit: unit,
          },
          type: "c8y_measurement",
          intervalBetween: `${time}s`,
        });
      } else {
        temp.splice(selector.index, 1, {
          name: sensor,
          time: time,
          service: service,
        });
        value.splice(selector.index, 1, {
          ranges: {
            dataPoint: sensor,
            min: min,
            max: max,
            unit: unit,
          },
          type: "c8y_measurement",
          intervalBetween: `${time}s`,
        });
      }
      setBody({
        ...body,
        ...{ measurementsAttr: value },
      });
      setDataPointCard(temp);
      handlepopupClose();
    }
  }

  async function handleFab() {
    let tempError = {};
    if (name == "") {
      tempError.errorName = true;
      tempError.msgNameerrorName = "Required Field";
    }
    setErrors({ ...errors, ...tempError });
    if (Object.keys(tempError).length < 1) {
      let id = serviceId(service);
      let finalBody = {
        ...body,
        ...{ serviceId: id, name: name },
      };
      await props.CreateSimulation(finalBody);
      if (props.res.createSimulation.success) {
        setSnackType("success");
        handlepopupClose4();
      } else {
        setSnackType("fail");
      }
      setSnackText(props.res.createSimulation.message);
      setSnack(true);
    }
  }

  function getFiltered(data1, data2) {
    data1.forEach((elm, i) => {
      data2.forEach((elm2) => {
        if (elm2.name == elm) data1.splice(i, 1);
      });
    });
    return data1;
  }

  return (
    <Fragment>
      <form>
        <Dialog open={openPopup} onClose={handlepopupClose} fullWidth>
          <DialogTitle style={{ maxHeight: "45px" }}>Data Point</DialogTitle>
          <DialogContent>
            <DialogContentText style={{ maxHeight: "5px" }}>
              Set the configurations and select the data proint from any
              service.
            </DialogContentText>
            <FormControl
              error={errors.errorService}
              fullWidth
              style={{ marginBottom: "20px", marginTop: "20px" }}
            >
              <InputLabel
                shrink
                style={{
                  color: "#3399ff",
                }}
              >
                Solution *
              </InputLabel>

              <Select
                value={service}
                fullWidth
                required
                onChange={handleService}
                defaultValue={service}
              >
                {metaData.map((elm) => {
                  <MenuItem value={elm.name}>{elm.name}</MenuItem>;
                })}
              </Select>
              <FormHelperText>{errors.msgService}</FormHelperText>
            </FormControl>
            <FormControl error={errors.errorSensor} fullWidth>
              <InputLabel
                shrink
                style={{
                  color: "#3399ff",
                }}
              >
                Sensors *
              </InputLabel>

              <Select
                value={sensor}
                fullWidth
                required
                onChange={handleSensor}
                defaultValue={sensor}
              >
                {sensors(service).map((elm) => {
                  return (
                    <MenuItem value={elm.name}>{elm.friendlyName}</MenuItem>
                  );
                })}
              </Select>
              <FormHelperText>{errors.msgSensor}</FormHelperText>
            </FormControl>
            <span style={{ display: "flex" }}>
              <TextField
                value={unit}
                required
                margin="dense"
                id="unit"
                label="Unit"
                fullWidth
                style={{
                  marginRight: "20px",
                }}
                error={errors.errorUnit}
                helperText={errors.msgUnit}
                onChange={handleUnit}
              />
              <TextField
                value={min}
                required
                type="number"
                margin="dense"
                id="min"
                label="Min"
                fullWidth
                style={{
                  marginRight: "20px",
                }}
                error={errors.errorMin}
                helperText={errors.msgMin}
                onChange={handleMin}
                onKeyDown={handleKeyDown}
              />
              <TextField
                value={max}
                required
                type="number"
                margin="dense"
                id="max"
                label="Max"
                fullWidth
                error={errors.errorMax}
                helperText={errors.msgMax}
                onChange={handleMax}
                onKeyDown={handleKeyDown}
              />
            </span>
            <TextField
              value={time}
              required
              type="number"
              margin="dense"
              id="time"
              label="Time interval"
              fullWidth
              style={{
                marginBottom: "20px",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">seconds</InputAdornment>
                ),
              }}
              error={errors.errorTime}
              helperText={errors.msgTime}
              onChange={handleTime}
              onKeyDown={handleKeyDown}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handlepopupClose} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              onClick={() => handleDataPoint(selector)}
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </form>
      <form>
        <Dialog
          open={openPopup2}
          onClose={handlepopupClose2}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle style={{ maxHeight: "45px" }}>Alarm</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Set the severity and configurations for the alarm.
            </DialogContentText>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "10px",
              }}
            >
              <Chip
                icon={
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={
                      severity == "CRITICAL"
                        ? {
                            color: "white",
                          }
                        : {}
                    }
                  />
                }
                onClick={() => {
                  handleClick("CRITICAL");
                }}
                clickable
                label="CRITICAL"
                style={
                  severity == "CRITICAL"
                    ? {
                        color: "white",
                        backgroundColor: "#e73e3a",
                        marginRight: "10px",
                      }
                    : {
                        marginRight: "10px",
                      }
                }
              />
              <Chip
                icon={
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={
                      severity == "MAJOR"
                        ? {
                            color: "white",
                          }
                        : {}
                    }
                  />
                }
                onClick={() => {
                  handleClick("MAJOR");
                }}
                clickable
                label="MAJOR"
                style={
                  severity == "MAJOR"
                    ? {
                        color: "white",
                        backgroundColor: "#844204",
                        marginRight: "10px",
                      }
                    : {
                        marginRight: "10px",
                      }
                }
              />
              <Chip
                style={
                  severity == "MINOR"
                    ? {
                        color: "white",
                        backgroundColor: "#fc9208",
                        marginRight: "10px",
                      }
                    : {
                        marginRight: "10px",
                      }
                }
                icon={
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={
                      severity == "MINOR"
                        ? {
                            color: "white",
                          }
                        : {}
                    }
                  />
                }
                onClick={() => {
                  handleClick("MINOR");
                }}
                clickable
                label="MINOR"
              />
              <Chip
                icon={
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={
                      severity == "WARNING"
                        ? {
                            color: "white",
                          }
                        : {}
                    }
                  />
                }
                onClick={() => {
                  handleClick("WARNING");
                }}
                clickable
                label="WARNING"
                style={
                  severity == "WARNING"
                    ? {
                        color: "white",
                        backgroundColor: "#278dea",
                        marginRight: "10px",
                      }
                    : {
                        marginRight: "10px",
                      }
                }
              />
            </div>
            <TextField
              value={alarmTime}
              required
              type="number"
              margin="dense"
              id="time"
              label="Time interval"
              fullWidth
              style={{
                marginBottom: "10px",
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">seconds</InputAdornment>
                ),
              }}
              error={errors.errorAlarmTime}
              helperText={errors.msgAlarmTime}
              onChange={handleAlarmTime}
              onKeyDown={handleKeyDown}
            />
            <TextField
              value={alarmType}
              required
              margin="dense"
              id="time"
              label="Type"
              fullWidth
              style={{
                marginBottom: "20px",
              }}
              error={errors.errorAlarmType}
              helperText={errors.msgAlarmType}
              onChange={handleAlarmType}
            />
            <TextField
              value={alarmMessage}
              required
              margin="dense"
              id="message"
              label="Message"
              fullWidth
              style={{
                marginBottom: "10px",
              }}
              error={errors.errorAlarmMessage}
              helperText={errors.msgAlarmMessage}
              onChange={handleAlarmMessage}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handlepopupClose2} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => handleAlarm(selector)}
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </form>
      <form>
        <Dialog
          open={openPopup3}
          onClose={handlepopupClose3}
          aria-labelledby="form-dialog-title"
          fullWidth
        >
          <DialogTitle id="form-dialog-title" style={{ maxHeight: "45px" }}>
            Event
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {value == 0
                ? "Set the configurations for the event."
                : "Select starting and ending points for simulated route."}
            </DialogContentText>
            {selector?.type != "EDIT" && chkLoc(eventCard) ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Tabs value={value} onChange={handleChange}>
                  <Tab label="Standard" />
                  <Tab label="Location" />
                </Tabs>
                <Typography className={classes.padding} />
              </div>
            ) : null}
            <TabPanel value={value} index={0}>
              <div>
                <Fragment>
                  <TextField
                    value={eventTime}
                    required
                    type="number"
                    margin="dense"
                    id="time"
                    label="Time interval"
                    fullWidth
                    style={{
                      marginBottom: "10px",
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">seconds</InputAdornment>
                      ),
                    }}
                    error={errors.errorEventTime}
                    helperText={errors.msgEventTime}
                    onChange={handleEventTime}
                    onKeyDown={handleKeyDown}
                  />
                  <TextField
                    value={eventType}
                    required
                    margin="dense"
                    id="time"
                    label="Type"
                    fullWidth
                    style={{
                      marginBottom: "20px",
                    }}
                    error={errors.errorEventType}
                    helperText={errors.msgEventType}
                    onChange={handleEventType}
                  />
                  <TextField
                    value={eventMessage}
                    required
                    margin="dense"
                    id="message"
                    label="Message"
                    fullWidth
                    style={{
                      marginBottom: "10px",
                    }}
                    error={errors.errorEventMessage}
                    helperText={errors.msgEventMessage}
                    onChange={handleEventMessage}
                  />
                </Fragment>
              </div>
            </TabPanel>
            <TabPanel value={value} index={1}>
              <Fragment>
                <TextField
                  value={locationEventTime}
                  required
                  type="number"
                  margin="dense"
                  id="time"
                  label="Time interval"
                  fullWidth
                  style={{
                    marginBottom: "20px",
                  }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">seconds</InputAdornment>
                    ),
                  }}
                  error={errors.errorLocationEventTime}
                  helperText={errors.msgLocationEventTime}
                  onChange={handleLocationEventTime}
                  onKeyDown={handleKeyDown}
                />
                <Map setRoute={setRoute} />
              </Fragment>
            </TabPanel>
          </DialogContent>
          <DialogActions>
            <Button onClick={handlepopupClose3} color="primary">
              Cancel
            </Button>
            <Button
              type="submit"
              onClick={() => {
                handleEvent(selector);
              }}
              color="primary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </form>
      <form>
        <Dialog
          open={openPopup4}
          onClose={handlepopupClose4}
          aria-labelledby="form-dialog-title"
          fullWidth
        >
          <DialogTitle id="form-dialog-title" style={{ maxHeight: "45px" }}>
            Add Simulator
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Set the name of the Simulator.
            </DialogContentText>
            <FormControl
              error={errors.errorService}
              fullWidth
              style={{ marginBottom: "20px", marginTop: "20px" }}
            >
              <InputLabel
                shrink
                style={{
                  color: "#3399ff",
                }}
              >
                Solution *
              </InputLabel>

              <Select
                value={service}
                fullWidth
                required
                onChange={handleService}
                defaultValue={service}
              >
                {metaData.map((elm) => {
                  return elm.name != "Solutions" ? (
                    <MenuItem value={elm.name}>{elm.name}</MenuItem>
                  ) : null;
                })}
              </Select>
              <FormHelperText>{errors.msgService}</FormHelperText>
            </FormControl>
            <TextField
              value={name}
              required
              margin="dense"
              id="name"
              label="Name"
              fullWidth
              style={{
                marginBottom: "10px",
              }}
              error={errors.errorName}
              helperText={errors.msgName}
              onChange={handleName}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handlepopupClose4} color="primary">
              Cancel
            </Button>
            <Button type="submit" onClick={handleFab} color="primary">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </form>
      <Dragable bottom={"30px"} right={"30px"} name="add-simulator">
        <Fab
          style={{ boxShadow: "none" }}
          color="primary"
          aria-label="add"
          disabled={
            dataPointCard.length < 1 &&
            alarmCard.length < 1 &&
            eventCard.length < 1
          }
          onClick={handlepopupOpen4}
        >
          <SaveIcon />
        </Fab>
      </Dragable>
      <Snackbar
        type={snackType}
        open={snack}
        setOpen={handleClose}
        text={snackText}
        timeOut={3000}
      />
      <div
        style={{
          display: "flex",
          alignContent: "center",
          justifyContent: "center",
          gap: "50px",
        }}
      >
        <Card style={{ minWidth: "30%", minHeight: "calc(100vh - 100px)" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "revert",
            }}
          >
            <div>
              <p
                style={{
                  color: "#777777",
                  display: "flex",
                  padding: "10px",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <strong>Data Points</strong>
              </p>
            </div>
            <Divider />
            {dataPointCard.map((elm, i) => (
              <Card
                onMouseEnter={() => setIsShown(i)}
                onMouseLeave={() => setIsShown(null)}
                className={classes.measurementCard}
              >
                {isShown != i ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                    }}
                  >
                    <span>
                      <AssessmentIcon
                        style={{
                          color: "white",
                          height: "30px",
                          width: "30px",
                          position: "relative",
                          top: "30",
                          marginLeft: "30px",
                        }}
                      />
                    </span>
                    <span style={{ marginRight: "30px", marginTop: "12px" }}>
                      <p style={{ color: "white" }}>
                        <strong>{elm.name}</strong>
                      </p>
                      <p
                        style={{
                          color: "white",
                          textAlign: "end",
                          marginTop: "15px",
                        }}
                      >
                        <strong>{elm.time}s</strong>
                      </p>
                    </span>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10%",
                      position: "relative",
                      top: "10px",
                    }}
                  >
                    <span>
                      <IconButton
                        onClick={() => {
                          setSelector({ type: "EDIT", index: i });
                          handleEditCard("measurement", i);
                        }}
                      >
                        <EditIcon
                          style={{
                            color: "white",
                            height: "35px",
                            width: "35px",
                          }}
                        />
                      </IconButton>
                    </span>
                    <span>
                      <IconButton
                        onClick={() => {
                          handleDeleteCard("measurement", i);
                        }}
                      >
                        <DeleteIcon
                          style={{
                            color: "white",
                            height: "35px",
                            width: "35px",
                          }}
                        />
                      </IconButton>
                    </span>
                  </div>
                )}
              </Card>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <AddCircleOutlineIcon
                className={classes.measurementAdd}
                onClick={() => {
                  setSelector({ type: null, index: null });
                  handlepopupOpen();
                }}
              />
            </div>
          </div>
        </Card>
        <Card style={{ minWidth: "30%", minHeight: "calc(100vh - 100px)" }}>
          <div>
            <p
              style={{
                color: "#777777",
                display: "flex",
                padding: "10px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <strong>Alarms</strong>
            </p>
          </div>
          <Divider />
          {alarmCard.map((elm, i) => (
            <Card
              onMouseEnter={() => setIsShown2(i)}
              onMouseLeave={() => setIsShown2(null)}
              className={classes.alarmCard}
            >
              {isShown2 != i ? (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    <NotificationsActiveIcon
                      style={{
                        color: "white",
                        height: "30px",
                        width: "30px",
                        position: "relative",
                        top: "30",
                        marginLeft: "30px",
                      }}
                    />
                  </span>
                  <span style={{ marginRight: "30px", marginTop: "12px" }}>
                    <p style={{ color: "white" }}>
                      <strong>{elm.name}</strong>
                    </p>
                    <p
                      style={{
                        color: "white",
                        textAlign: "end",
                        marginTop: "15px",
                      }}
                    >
                      <strong>{elm.time}s</strong>
                    </p>
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10%",
                    position: "relative",
                    top: "10px",
                  }}
                >
                  <span>
                    <IconButton
                      onClick={() => {
                        setSelector({ type: "EDIT", index: i });
                        handleEditCard("alarm", i);
                      }}
                    >
                      <EditIcon
                        style={{
                          color: "white",
                          height: "35px",
                          width: "35px",
                        }}
                      />
                    </IconButton>
                  </span>
                  <span>
                    <IconButton
                      onClick={() => {
                        handleDeleteCard("alarm", i);
                      }}
                    >
                      <DeleteIcon
                        style={{
                          color: "white",
                          height: "35px",
                          width: "35px",
                        }}
                      />
                    </IconButton>
                  </span>
                </div>
              )}
            </Card>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AddCircleOutlineIcon
              className={classes.measurementAdd}
              onClick={() => {
                setSelector({ type: null, index: null });
                handlepopupOpen2();
              }}
            />
          </div>
        </Card>
        <Card style={{ minWidth: "30%", minHeight: "calc(100vh - 100px)" }}>
          <div>
            <p
              style={{
                color: "#777777",
                display: "flex",
                padding: "10px",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <strong>Events</strong>
            </p>
          </div>
          <Divider />
          {eventCard.map((elm, i) => (
            <Card
              onMouseEnter={() => setIsShown3(i)}
              onMouseLeave={() => setIsShown3(null)}
              className={classes.eventCard}
            >
              {isShown3 != i ? (
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>
                    {elm.type == "Standard" ? (
                      <TimelineIcon
                        style={{
                          color: "white",
                          height: "30px",
                          width: "30px",
                          position: "relative",
                          top: "30",
                          marginLeft: "30px",
                        }}
                      />
                    ) : (
                      <GpsFixedIcon
                        style={{
                          color: "white",
                          height: "30px",
                          width: "30px",
                          position: "relative",
                          top: "30",
                          marginLeft: "30px",
                        }}
                      />
                    )}
                  </span>
                  <span style={{ marginRight: "30px", marginTop: "12px" }}>
                    <p style={{ color: "white" }}>
                      <strong>{elm.name}</strong>
                    </p>
                    <p
                      style={{
                        color: "white",
                        textAlign: "end",
                        marginTop: "15px",
                      }}
                    >
                      <strong>{elm.time}s</strong>
                    </p>
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10%",
                    position: "relative",
                    top: "10px",
                  }}
                >
                  <span>
                    <IconButton
                      onClick={() => {
                        setSelector({ type: "EDIT", index: i });
                        if (elm.type == "Location") setValue(1);
                        else setValue(0);
                        handleEditCard("event", i);
                      }}
                    >
                      <EditIcon
                        style={{
                          color: "white",
                          height: "35px",
                          width: "35px",
                        }}
                      />
                    </IconButton>
                  </span>
                  <span>
                    <IconButton
                      onClick={() => {
                        handleDeleteCard("event", i);
                      }}
                    >
                      <DeleteIcon
                        style={{
                          color: "white",
                          height: "35px",
                          width: "35px",
                        }}
                      />
                    </IconButton>
                  </span>
                </div>
              )}
            </Card>
          ))}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <AddCircleOutlineIcon
              className={classes.measurementAdd}
              onClick={() => {
                setSelector({ type: null, index: null });
                setValue(0);
                handlepopupOpen3();
              }}
            />
          </div>
        </Card>
      </div>
    </Fragment>
  );
}

const mapStateToProps = (state) => {
  return { res: state.simulations };
};

const mapDispatchToProps = {
  CreateSimulation,
};

Simulator = connect(mapStateToProps, mapDispatchToProps)(Simulator);
