import React, { useEffect, useState, Fragment, useRef } from "react";
// import * as DOMPurify from "dompurify";
import { useDispatch, useSelector } from "react-redux";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLightbulb,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import Loader from "components/Progress";
import Popover from "@mui/material/Popover";
import TimeSeries from "../Monitoring/Widgets/TimeSeries";
import Controlling from "../Controlling";
import "./digitalTwin.css";
import { useGetDigitalTwinQuery } from "services/digitalTwin";
import { useGetDevicesQuery } from "services/devices";
import { controllingSocket, getSocket } from "Utilities/socket";
import { useSnackbar } from "notistack";
import NoImage from "../../../assets/img/no-image-grey.png";
import Chip from "@mui/material/Chip";
import { getColor } from "../../../Utilities/Color Spectrum";
import hexRgb from "hex-rgb";
import Slider from "@mui/material/Slider";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import Fan0Lamp0 from "../../../assets/img/fan0_lamp0.png";
import Fan0Lamp1 from "../../../assets/img/fan0_lamp1.png";
import Fan1Lamp0 from "../../../assets/img/fan1_lamp0.gif";
import Fan1Lamp1 from "../../../assets/img/fan1_lamp1.gif";
import Fan2Lamp1 from "../../../assets/img/fan2_lamp1.gif";
import Fan3Lamp1 from "../../../assets/img/fan3_lamp1.gif";
import Fan4Lamp1 from "../../../assets/img/fan4_lamp1.gif";
import Fan3Lamp0 from "../../../assets/img/fan3_lamp0.gif";
import Fan2Lamp0 from "../../../assets/img/fan2_lamp0.gif";
import Fan4Lamp0 from "../../../assets/img/fan4_lamp0.gif";
import { useGetEventsQuery } from "services/events";
import emitter from "Utilities/events";
import { useEditDeviceMutation } from "services/devices";
import useUpload from "hooks/useUpload";
import Tooltip from "@mui/material/Tooltip";
import { UploadFile } from "@mui/icons-material";
import { setDevice } from "rtkSlices/assetSlice";

let svgMapping;
let controlMapping;
let monitoringKeys;
let controlKeys;
let controlSocket;
let tempMonitoringReadings = null;
let tempFanValue;
let tempUvValue;
let tempAutoValue;
let lastValue;
let tempControlStates = {
  UVLamp: "SUCCESSFUL",
  FanSpeed: "SUCCESSFUL",
  AutoMode: "SUCCESSFUL",
};
let rgb = {};
let timeout = null;
const marks = [
  {
    value: 0,
    label: "0",
  },
  {
    value: 1,
    label: "LL",
  },
  {
    value: 2,
    label: "L",
  },
  {
    value: 3,
    label: "M",
  },
  {
    value: 4,
    label: "H",
  },
];

export default function DigitalTwin(props) {
  let token = window.localStorage.getItem("token");
  const { url, isLoading, error, fetchUrl } = useUpload();
  const device = useSelector((state) => state.asset.device);
  let uvlamp = props.actuators.find(
    (a) => a.name == "UVLamp" || a.name == "UV_Lamp"
  );
  const [svgLoader, setSvgLoader] = React.useState(false);
  const dispatch = useDispatch();
  let auto = props.actuators.find((a) => a.name == "AutoMode");
  let fanspeed = props.actuators.find(
    (a) => a.name == "FanSpeed" || a.name == "Fan_Speed"
  );
  const [img, setImg] = useState("");
  const [controlStates, setControlStates] = React.useState(
    device?.packetFromPlatform?.c8y_Availability?.status == "AVAILABLE"
      ? {
          UVLamp: "SUCCESSFUL",
          FanSpeed: "SUCCESSFUL",
          AutoMode: "SUCCESSFUL",
        }
      : {
          UVLamp: "PENDING",
          FanSpeed: "PENDING",
          AutoMode: "PENDING",
        }
  );
  const [updateDevice, updateResult] = useEditDeviceMutation();
  const svgInputRef = useRef(null);
  // disabledStates = {uvlamp: false, auto: false}
  const { enqueueSnackbar } = useSnackbar();
  const [overflow, setOverflow] = React.useState(false);
  const powerRes = useGetEventsQuery(
    {
      token,
      params: `?pageSize=1&currentPage=1&type=c8y_ControlUpdate&source=${props.id}&metaDataFilter={"metaData.status":{"$in":["SUCCESSFUL","PENDING"]} ,"metaData.actuatorName":"Power"}`,
    }
  );
  const uvlampRes = useGetEventsQuery(
    {
      token,
      params: `?pageSize=1&currentPage=1&type=c8y_ControlUpdate&source=${props.id}&metaDataFilter={"metaData.status":{"$in":["SUCCESSFUL","PENDING"]} ,"metaData.actuatorName":"UVLamp"}`,
    },
    { skip: !powerRes.isSuccess || !uvlamp }
  );
  const autoRes = useGetEventsQuery(
    {
      token,
      params: `?pageSize=1&currentPage=1&type=c8y_ControlUpdate&source=${props.id}&metaDataFilter={"metaData.status":{"$in":["SUCCESSFUL","PENDING"]} ,"metaData.actuatorName":"AutoMode"}`,
    },
    { skip: !powerRes.isSuccess || !auto }
  );
  const fanspeedRes = useGetEventsQuery(
    {
      token,
      params: `?pageSize=1&currentPage=1&type=c8y_ControlUpdate&source=${props.id}&metaDataFilter={"metaData.status":{"$in":["SUCCESSFUL","PENDING"]} ,"metaData.actuatorName":"FanSpeed"}`,
    },
    { skip: !powerRes.isSuccess || !fanspeed }
  );
  const [uvValue, setUvValue] = useState(false);
  const [powerValue, setPowerValue] = useState(false);
  const [uvOld, setUvOld] = useState("");
  const [autoOld, setAutoOld] = useState("");
  const [fanSpeedOld, setFanSpeedOld] = useState("");
  const [autoValue, setAutoValue] = useState(false);
  const [svg, setSvg] = useState("");
  const [loader, setLoader] = useState(false);
  const [fanValue, setFanValue] = useState(0);
  const [store, setStore] = React.useState(initializeStore(props?.actuators));
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == props.serviceId);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);
  const [openPopover, setOpenPopover] = useState(false);
  const [svgUrl, setSvgUrl] = useState("");
  const [monitoringReadings, setMonitoringReadings] = useState(null);
  const digitalTwin = useGetDigitalTwinQuery({ svgUrl }, { skip: !svgUrl });
  const devices = useGetDevicesQuery({
    token,
    group: "",
    params: `&internalId=${props.id}`,
  });

  useEffect(() => {
    console.log({devices})
    console.log({img})
  }, [devices])

  function initializeStore(data) {
    let store = {};
    data.forEach((elm) => {
      store[elm._id] = null;
    });
    return store;
  }

  useEffect(() => {
    console.log({uvlampRes, powerValue})
    if (
      uvlampRes.isSuccess &&
      uvlampRes.data?.payload.data.length &&
      uvlampRes.data?.payload.data[0].metaData && powerValue
    ) {
      setUvOld(uvlampRes.data?.payload.data[0]);
      setUvValue(
        uvlamp.metaData.Active.Value ==
          uvlampRes.data?.payload.data[0].metaData.action
      );
      console.log('setting uv value',uvlamp,uvlampRes,uvlamp.metaData.Active.Value ==
      uvlampRes.data?.payload.data[0].metaData.action)
      tempUvValue =
        uvlamp.metaData.Active.Value ==
        uvlampRes.data?.payload.data[0].metaData.action;
      getImageWrtStatus(
        uvlamp.metaData.Active.Value ==
          uvlampRes.data?.payload.data[0].metaData.action,
        tempFanValue
      );
    }
  }, [uvlampRes.isFetching]);
  useEffect(() => {
    if (
      powerRes.isSuccess &&
      powerRes.data?.payload.data.length &&
      powerRes.data?.payload.data[0].metaData
    ) {
      if(powerRes.data?.payload.data[0].metaData.action && JSON.parse(powerRes.data?.payload.data[0].metaData.action.slice(10))){
        const value = JSON.parse(powerRes.data?.payload.data[0].metaData.action.slice(10))[0].value;
        setPowerValue(value)
        if(!value){
          getImageWrtStatus(false, 0);
        }
      }
    }
  }, [powerRes.isFetching]);

  useEffect(() => {
    if (
      autoRes.isSuccess &&
      autoRes.data?.payload.data.length &&
      autoRes.data?.payload.data[0].metaData && powerValue
    ) {
      setAutoOld(autoRes.data?.payload.data[0]);
      setAutoValue(
        auto.metaData.Active.Value ==
          autoRes.data?.payload.data[0].metaData.action
      );
      tempAutoValue =
        auto.metaData.Active.Value ==
        autoRes.data?.payload.data[0].metaData.action;
      // getImageWrtStatus(
      //   uvlamp.metaData.Active.Value ==
      //     autoRes.data?.payload.data[0].c8y_Command.text,
      //   tempFanValue
      // );
    } else {
      setImg(Fan0Lamp0)
      // setImg(Fan0Lamp1)
    }
  }, [autoRes.isFetching]);

  useEffect(() => {
    console.log({fanspeedRes, powerValue})
    if (
      fanspeedRes.isSuccess &&
      fanspeedRes.data?.payload.data.length &&
      fanspeedRes.data?.payload.data[0].metaData && powerValue
    ) {
      setFanSpeedOld(fanspeedRes.data?.payload.data[0]);
      setFanValue(
        generateValue(fanspeedRes.data?.payload.data[0].metaData.action)
      );
      tempFanValue = generateValue(
        fanspeedRes.data?.payload.data[0].metaData.action
      );
      console.log({tempUvValue, tempFanValue})
      getImageWrtStatus(tempUvValue, tempFanValue);
    } else {
      setImg(Fan0Lamp0)
      // setImg(Fan0Lamp1)
    }
  }, [fanspeedRes.isFetching]);

  useEffect(() => {
    if (device?.latestMeasurement) {
      setSvgValues(device?.latestMeasurement);
    }
  }, [device]);

  function chkGroup() {
    let permission = metaDataValue.services
      .find((s) => s.id == props.serviceId)
      .tabs.find((tab) => tab.name == "Controlling")?.permission;
    return permission || "DISABLE";
  }

  async function connectControllingSocket() {
    controlSocket = await controllingSocket();
  }

  function generateValue(fetchedValue) {
    let fv = fetchedValue
    if(typeof(fv) !== "string"){
      fv = JSON.stringify(fetchedValue).replaceAll(/(['"])/g, "")
    }
    let command = fanspeed.metaData.Command;
    let index = command.indexOf("{range}");
    let first = command.substring(0, index);
    let temp = command.substring(index + 1);
    let last = temp.substring(temp.indexOf("}") + 1);
    let firstIndex;
    if (first.length) firstIndex = fv.indexOf(first);
    else firstIndex = 0;
    let lastIndex;
    if (last.length) lastIndex = fv.indexOf(last);
    else lastIndex = command.length - 1;
    let value = parseInt(
      fv.substring(firstIndex + first.length, lastIndex)
    );
    return value;
  }

  function eventCondition(temp, payload) {
    return (
      (temp?.metaData?.status == "SUCCESSFUL" &&
        payload.metaData?.operationId &&
        temp?.metaData?.operationId &&
        payload.metaData?.operationId == temp?.metaData?.operationId) ||
      (temp?.metaData?.status == "EXECUTING" &&
        payload?.metaData?.status == "PENDING" &&
        payload.metaData?.operationId &&
        temp?.metaData?.operationId &&
        payload?.metaData?.operationId == temp?.metaData?.operationId)
    );
  }

  async function callbackfn(event) {
    let payload = event.message;
    setLoader(false);
    // if(
    setUvOld((old) => {
      if (
        payload.metaData.actuatorName == uvlamp.name &&
        !eventCondition(old, payload)
      ) {
        clearInterval(timeout);
        tempUvValue =
          payload.metaData.action == uvlamp?.metaData.Default.Value
            ? false
            : true;
        setUvValue(tempUvValue);
        getImageWrtStatus(
          payload.metaData.action == uvlamp?.metaData.Default.Value
            ? false
            : true,
          tempFanValue
        );
        let temp = { ...tempControlStates };
        temp[payload.metaData.actuatorName] = payload.metaData.status;
        setControlStates(temp);
        tempControlStates = temp;
        return payload;
      } else {
        return old;
      }
    });
    setAutoOld((old) => {
      if (
        payload.metaData.actuatorName == auto?.name &&
        !eventCondition(old, payload)
      ) {
        // pendingOperation = false;
        clearInterval(timeout);
        // setUvValue(payload.metaData.action == "0" ? false : true);
        tempAutoValue =
          payload.metaData.action == auto?.metaData.Default.Value
            ? false
            : true;
        setAutoValue(tempAutoValue);
        let temp = { ...tempControlStates };
        temp[payload.metaData.actuatorName] = payload.metaData.status;
        setControlStates(temp);
        tempControlStates = temp;
        // getImageWrtStatus(
        //   payload.metaData.action == "0" ? false : true,
        //   tempFanValue
        // );
        return payload;
      } else {
        return old;
      }
    });

    setFanSpeedOld((old) => {
      if (
        payload.metaData.actuatorName == fanspeed.name &&
        !eventCondition(old, payload)
      ) {
        clearInterval(timeout);
        tempFanValue = generateValue(payload.metaData.action);
        setFanValue(tempFanValue);
        getImageWrtStatus(tempUvValue, generateValue(payload.metaData.action));
        let temp = { ...tempControlStates };
        temp[payload.metaData.actuatorName] = payload.metaData.status;
        setControlStates(temp);
        tempControlStates = temp;
        return payload;
      } else {
        return old;
      }
    });
    // if (payload.metaData.status == "FAILED") {
    //   showSnackbar("Digital Twin", "Operation failed", "error", 1000);
    // }
  }

  async function initializeSocket(topics) {
    await getSocket(topics);
    emitter.on("asset?events-c8y_ControlUpdate", callbackfn);
  }

  useEffect(() => {
    connectControllingSocket("operationUpdate");
    initializeSocket([
      `devices__${props.serviceId}__${props.id}`,
      `events-c8y_ControlUpdate__${props.serviceId}__${props.id}`,
    ]);

    return () => {
      emitter.off("asset?events-c8y_ControlUpdate", callbackfn);
      if (controlSocket) controlSocket.disconnect();
    };
  }, []);

  function getDatapointColor(dp) {
    let tempDevices = JSON.parse(JSON.stringify(devices.data.payload.data[0]));
    let sensor = props.sensors.find((s) => s.name == dp);
    let color = "";
    if (sensor) {
      if (
        tempDevices.dataPointThresholds.length &&
        tempDevices.dataPointThresholds.find((dt) => dt.dataPoint == sensor._id)
      ) {
        console.log(`in if ${dp}`,tempDevices)
        color = getColor(
          monitoringReadings[dp].value,
          tempDevices.dataPointThresholds.find(
            (dt) => dt.dataPoint == sensor._id
          )
        );
      } else if (
        service.dataPointThresholds.length &&
        service.dataPointThresholds.find((dt) => dt.dataPoint?._id == sensor._id)
      ) {
        console.log(`in elseif ${dp}`,tempDevices,service)
        color = getColor(
          monitoringReadings[dp].value,
          service.dataPointThresholds.find(
            (dt) => dt.dataPoint?._id == sensor._id
          )
        );
      } else {
        color = metaDataValue.branding.secondaryColor;
      }
    }
    rgb[dp] = hexRgb(color || metaDataValue.branding.secondaryColor);
    return color;
  }

  useEffect(() => {
    if (devices.isSuccess) {
      svgMapping = JSON.parse(JSON.stringify(props.sensors));
      svgMapping.forEach((s) => (s.name = s.name.replaceAll(" ", "_")));
      monitoringKeys = svgMapping.map((s) => s.name);
      controlMapping = JSON.parse(JSON.stringify(props.actuators));
      controlMapping.forEach((s) => (s.name = s.name.replaceAll(" ", "_")));
      controlKeys = controlMapping.map((s) => s.name);
      getMeasurements();
    }
  }, [devices.isFetching]);

  useEffect(() => {
    if (
      document.getElementById("digitalTwinSvg") &&
      document.getElementById("digitalTwinSvg").children[0]
    ) {
      document.getElementById("digitalTwinSvg").children[0].style.width =
        "100%";
      document.getElementById("digitalTwinSvg").children[0].style.height =
        "100%";
      subscribeForListeners();
    }
    if (devices?.data?.payload?.data[0].latestMeasurement) {
      setSvgValues(devices.data.payload.data[0].latestMeasurement);
    }
  }, [svg]);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (!digitalTwin.isLoading && digitalTwin.isError) {
      setSvg(digitalTwin.error.data);
    }
  }, [digitalTwin.isFetching]);

  async function handleSvg(e) {
    let body = e.target.files[0];
    let type = e.target.files[0].type;
    if (!type.toLowerCase().includes("svg")) {
      showSnackbar(
        "SVG",
        "The selected file format is not supported",
        "error",
        1000,
        enqueueSnackbar
      );
    } else {
      setSvg("");
      fetchUrl(body, type);
      handleLoader(true);
    }
  }

  useEffect(() => {
    if (!isLoading && url) {
      updateAsset(url);
      handleLoader(false);
    }
  }, [isLoading]);

  function handleLoader(state) {
    setSvgLoader(state);
  }

  const updateAsset = async (digitalTwinSvg) => {
    const body = { digitalTwinSvg };
    setSvg("");
    const tempImg = img;
    setImg("")
    let updated = await updateDevice({
      token,
      body,
      id: props.id,
    });
    if (updated.data?.success) {
      showSnackbar("Device", updated.data?.message, "success", 1000);
      dispatch(setDevice(updated.data.payload));
      setImg(tempImg)
    } else {
      setSvg(digitalTwin.error.data);
      showSnackbar("Device", updated.data?.message, "error", 1000);
      setImg(tempImg)
    }
  };

  async function getMeasurements() {
    if (!devices.isLoading && devices.isSuccess) {
      if (props.url) {
        setSvgUrl(props.url);
        fetchSvg();
      }
      // else{
      //   showSnackbar("Digital Twin", "No image found", "error", 1000);
      // }
    }
  }

  async function subscribeForListeners() {
    monitoringKeys.forEach((dp) => {
      if (
        document.getElementById(dp) ||
        document.getElementById(dp.replaceAll("_", "."))
      ) {
        let elem =
          document.getElementById(dp) ||
          document.getElementById(dp.replaceAll("_", "."));
        elem.addEventListener("click", (e) => {
          let val = dp;
          if (dp.includes("_")) {
            val = dp.replaceAll("_", " ");
          }
          setAnchorEl(e.currentTarget);
          setSelectedSensor(
            props.sensors.find((s) => s.name == dp || s.name == val)
          );
        });
      }
    });
    if (chkGroup() != "DISABLE") {
      controlKeys.forEach((dp) => {
        if (document.getElementById(dp)) {
          document.getElementById(dp).addEventListener("click", (e) => {
            setAnchorEl(e.currentTarget);
            setSelectedControl(
              props.actuators.find(
                (s) => s.name == dp || s.name.replaceAll(" ", "_") == dp
              )
            );
          });
        }
      });
    }
  }

  const handleClose = () => {
    setAnchorEl(null);
    setOpenPopover(false);
    setSelectedSensor(null);
    setSelectedControl(null);
  };

  async function fetchSvg() {
    if (!digitalTwin.isLoading && digitalTwin.isSuccess) {
      setSvg(digitalTwin.data.payload.svg);
    }
  }

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  function setSvgValues(values) {
    let tempValues = {};
    props.sensors.forEach((s) => {
      if (values[s.name]) {
        tempValues[s.name] = values[s.name];
      }
    });
    setMonitoringReadings({ ...tempMonitoringReadings, ...tempValues });
    tempMonitoringReadings = { ...tempMonitoringReadings, ...tempValues };
    props.sensors.forEach((sensor) => {
      let temp;
      let value;
      if (
        values &&
        values[sensor.name] &&
        document.getElementById(sensor.name.replaceAll(" ", "_")) &&
        sensor.type == "boolean"
      ) {
        value = values[sensor.name]?.value;
        let metaData = sensor.metaData;
        if (metaData.Active.Value == value) {
          temp = metaData.Active.Name;
        } else if (metaData.Default.Value == value) {
          temp = metaData.Default.Name;
        } else {
          temp = "";
        }

        document.getElementById(
          sensor.name.replaceAll(" ", "_")
        ).innerHTML = temp;
        document.getElementById(sensor.name.replaceAll(" ", "_")).style.cursor =
          "pointer";
      } else if (
        values &&
        values[sensor.name] &&
        document.getElementById(sensor.name.replaceAll(" ", "_")) &&
        sensor.type == "fillLevel"
      ) {
        value = values[sensor.name]?.value;
        temp =
          ((sensor.metaData.Min - value) /
            (sensor.metaData.Min - sensor.metaData.Max)) *
          100;
        document.getElementById(
          sensor.name.replaceAll(" ", "_")
        ).innerHTML = hasDecimal(temp) ? temp?.toFixed(2) : temp;
        document.getElementById(sensor.name.replaceAll(" ", "_")).style.cursor =
          "pointer";
      } else if (
        (values &&
          values[sensor.name] &&
          document.getElementById(sensor.name.replaceAll(" ", "_"))) ||
        document.getElementById(sensor.friendlyName.replaceAll(" ", "_"))
      ) {
        let elem =
          document.getElementById(sensor.name.replaceAll(" ", "_")) ||
          document.getElementById(sensor.friendlyName.replaceAll(" ", "_"));
        temp = values[sensor.name]?.value;
        elem.innerHTML = hasDecimal(temp) ? temp?.toFixed(2) : temp;
        elem.style.cursor = "pointer";
      }
    });
    props.actuators.forEach((actuator) => {
      let elem =
        document.getElementById(actuator.name) ||
        document.getElementById(actuator.name.replaceAll(" ", "_"));
      if (elem) {
        elem.style.cursor = "pointer";
      }
    });
  }

  const handleSliderChange = (event, val) => {
    // timeout = setInterval(() => {
    //   clearInterval(timeout);
    //   setLoader(false);
    //   if (pendingOperation) {
    //     setFanValue(lastValue);
    //     lastValue = null;
    //     showSnackbar("Digital Twin", "Operation failed", "error", 1000);
    //   }
    // }, 10000);
    // pendingOperation = true;
    if (
      !(
        controlStates["AutoMode"] == "PENDING" ||
        controlStates["AutoMode"] == "EXECUTING"
      ) &&
      !(chkGroup() == "READ")
    ){
      lastValue = fanValue;
      setFanValue(val);
      controlSocket.emit("controlling", {
        deviceId: props.id,
        payload: fanspeed.metaData.Command.replaceAll("{range}", val),
        serviceId: props.serviceId,
        actuatorId: fanspeed._id,
        actuatorName: fanspeed.name,
      });
      let temp = { ...tempControlStates };
      temp["FanSpeed"] = "PENDING";
      setControlStates(temp);
      tempControlStates = temp;
      getImageWrtStatus(tempUvValue, val);
    }
  };

  const autoChange = (e) => {
    if (
      !(
        controlStates["AutoMode"] == "PENDING" ||
        controlStates["AutoMode"] == "EXECUTING"
      ) &&
      !(chkGroup() == "READ")
    ) {
      // timeout = setInterval(() => {
      //   clearInterval(timeout);
      //   setLoader(false);
      //   if (pendingOperation) {
      //     setAutoValue(lastValue);
      //     lastValue = null;
      //     showSnackbar("Digital Twin", "Operation failed", "error", 1000);
      //   }
      // }, 10000);
      // pendingOperation = true;
      lastValue = autoValue;
      // setLoader(true);
      setAutoValue(!autoValue);
      let tempActuator = props.actuators.find((a) => a.name == "AutoMode");
      if (autoValue) {
        controlSocket.emit("controlling", {
          deviceId: props.id,
          payload: tempActuator.metaData.Default.Value,
          serviceId: props.serviceId,
          actuatorId: tempActuator._id,
          actuatorName: tempActuator.name,
        });
      } else {
        controlSocket.emit("controlling", {
          deviceId: props.id,
          payload: tempActuator.metaData.Active.Value,
          serviceId: props.serviceId,
          actuatorId: tempActuator._id,
          actuatorName: tempActuator.name,
        });
      }
      let temp = { ...tempControlStates };
      temp["AutoMode"] = "PENDING";
      setControlStates(temp);
      tempControlStates = temp;
    }
  };

  const uvChange = (e) => {
    if (
      !(
        controlStates["UVLamp"] == "PENDING" ||
        controlStates["UVLamp"] == "EXECUTING"
      ) &&
      !(chkGroup() == "READ")
    ) {
      getImageWrtStatus(!uvValue, tempFanValue);
      tempUvValue = !uvValue;
      // timeout = setInterval(() => {
      //   clearInterval(timeout);
      //   setLoader(false);
      //   if (pendingOperation) {
      //     setUvValue(lastValue);
      //     lastValue = null;
      //     showSnackbar("Digital Twin", "Operation failed", "error", 1000);
      //   }
      // }, 10000);
      // pendingOperation = true;
      lastValue = uvValue;
      // setLoader(true);
      setUvValue(!uvValue);
      let tempActuator = props.actuators.find(
        (a) => a.name == "UVLamp" || a.name == "UV_Lamp"
      );
      if (uvValue) {
        controlSocket.emit("controlling", {
          deviceId: props.id,
          payload: tempActuator.metaData.Default.Value,
          serviceId: props.serviceId,
          actuatorId: tempActuator._id,
          actuatorName: tempActuator.name,
        });
      } else {
        controlSocket.emit("controlling", {
          deviceId: props.id,
          payload: tempActuator.metaData.Active.Value,
          serviceId: props.serviceId,
          actuatorId: tempActuator._id,
          actuatorName: tempActuator.name,
        });
      }
      let temp = { ...tempControlStates };
      temp["UVLamp"] = "PENDING";
      setControlStates(temp);
      tempControlStates = temp;
    }
  };

  function getImageWrtStatus(uv, fan) {
    console.log({uv,fan})
    let tempImg = "";
    switch (uv) {
      case false:
        switch (fan) {
          case 0:
            tempImg = Fan0Lamp0;
            break;
          case 1:
            tempImg = Fan1Lamp0;
            break;
          case 2:
            tempImg = Fan2Lamp0;
            break;
          case 3:
            tempImg = Fan3Lamp0;
            break;
          case 4:
            tempImg = Fan4Lamp0;
            break;
          case undefined:
            tempImg = Fan0Lamp0;
            break;
        }
        break;
      case true:
        switch (fan) {
          case 0:
            tempImg = Fan0Lamp1;
            break;
          case 1:
            tempImg = Fan1Lamp1;
            break;
          case 2:
            tempImg = Fan2Lamp1;
            break;
          case 3:
            tempImg = Fan3Lamp1;
            break;
          case 4:
            tempImg = Fan4Lamp1;
            break;
          case undefined:
            tempImg = Fan0Lamp1;
            break;
        }
        break;
    }
    if (tempImg) {
      setImg(tempImg);
    }
    setTimeout(() => {
      let elem = document.getElementById("scroll");
      if (elem) {
        if (
          elem.clientWidth < elem.scrollWidth ||
          elem.clientHeight < elem.scrollHeight
        ) {
          setOverflow(true);
        } else {
          setOverflow(false);
        }
      }
    }, 0);
  }
  const truncDecimalValues = (value,digits)=>{
    return Math.trunc(value*Math.pow(10, digits))/Math.pow(10, digits)
  }
  return (
    <div
      style={{
        justifyContent: "space-around",
        backgroundColor: "#eeeeee",
        height: "100%",
        width: "100%",
      }}
    >
      <input
        style={{ display: "none" }}
        type="file"
        accept=".svg"
        ref={svgInputRef}
        onChange={handleSvg}
        multiple={false}
      ></input>
      {props.url ? (
        img && devices.isSuccess ? (
          <Fragment>
            {/* <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "20px",
              }}
            > */}

            <div className="values">
              <div className="monitoring-keys" id="scroll">
                {overflow ? (
                  <ArrowBackIosIcon
                    onClick={() => {
                      let item = document.getElementById("scroll");
                      item.scrollLeft -= 100;
                    }}
                    style={{
                      cursor: "pointer",
                      position: "absolute",
                      height: "20px",
                      width: "20px",
                      marginTop: "35px",
                      color: "#666",
                    }}
                  />
                ) : null}
                {monitoringReadings != null
                  ? Object.keys(monitoringReadings).map((reading, i) => {
                      return (
                        <div style={{ marginLeft: i ? "10px" : "20px" }}>
                          <p
                            style={{
                              color: "#B3B4B6",
                              fontSize: "14px",
                              textAlign: "center",
                              fontWeight: "600",
                              letterSpacing: "0.1em",
                              marginBottom: "9px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "132px",
                            }}
                          >
                            {props.sensors.find((s) => s.name == reading)
                              ?.friendlyName || reading}
                          </p>
                          <Chip
                            label={truncDecimalValues(monitoringReadings[reading].value,1)}
                            style={{
                              color: getDatapointColor(reading),
                              backgroundColor:
                                rgb && rgb[reading]
                                  ? `rgb(${rgb[reading]?.red}, ${rgb[reading]?.green}, ${rgb[reading]?.blue},0.1)`
                                  : "",
                              borderRadius: "6px",
                              width: "123px",
                              fontWeight: "bold",
                            }}
                          />
                        </div>
                      );
                    })
                  : null}
              </div>
              {overflow ? (
                <ArrowForwardIosIcon
                  onClick={() => {
                    let item = document.getElementById("scroll");
                    item.scrollLeft += 100;
                  }}
                  style={{
                    cursor: "pointer",
                    height: "20px",
                    width: "20p",
                    marginTop: "35px",
                    color: "#666",
                  }}
                />
              ) : null}
              {chkGroup() != "DISABLE" ? (
                <div
                  style={{
                    display: "flex",
                    // flex: "none",
                    justifyContent: "center",
                    gap: "20px",
                    width: "15vw",
                  }}
                >
                  {!uvlampRes.isFetching && uvlampRes.isSuccess ? (
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          color: "#B3B4B6",
                          fontSize: "14px",
                          textAlign: "center",
                          fontWeight: "600",
                          letterSpacing: "0.1em",
                          marginBottom: "11px",
                        }}
                      >
                        UV Lamp
                      </p>
                      <FontAwesomeIcon
                        icon={faLightbulb}
                        style={{
                          color:
                            !(
                              controlStates["UVLamp"] == "PENDING" ||
                              controlStates["UVLamp"] == "EXECUTING" ||
                              !powerValue
                            ) 
                              ? !uvValue
                                ? "#333"
                                : "orange"
                              : "#999",
                          cursor:
                            !(
                              controlStates["UVLamp"] == "PENDING" ||
                              controlStates["UVLamp"] == "EXECUTING" ||
                              !powerValue
                            ) && !(chkGroup() == "READ")
                              ? "pointer"
                              : "auto",
                          fontSize: "22px",
                        }}
                        onClick={uvChange}
                      />
                    </div>
                  ) : null}
                  {!autoRes.isFetching && autoRes.isSuccess ? (
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          color: "#B3B4B6",
                          fontSize: "14px",
                          textAlign: "center",
                          fontWeight: "600",
                          letterSpacing: "0.1em",
                          marginBottom: "11px",
                        }}
                      >
                        Auto
                      </p>
                      <FontAwesomeIcon
                        icon={faWandMagicSparkles}
                        style={{
                          color:
                            !(
                              controlStates["AutoMode"] == "PENDING" ||
                              controlStates["AutoMode"] == "EXECUTING" ||
                              !powerValue
                            )
                              ? !autoValue
                                ? "#333"
                                : "orange"
                              : "#999",
                          cursor:
                            !(
                              controlStates["AutoMode"] == "PENDING" ||
                              controlStates["AutoMode"] == "EXECUTING" ||
                              !powerValue
                            ) && !(chkGroup() == "READ")
                              ? "pointer"
                              : "auto",
                          fontSize: "22px",
                        }}
                        onClick={autoChange}
                      />
                    </div>
                  ) : null}
                  {!fanspeedRes.isFetching && fanspeedRes.isSuccess ? (
                    <div>
                      <p
                        style={{
                          color: "#B3B4B6",
                          fontSize: "14px",
                          textAlign: "center",
                          fontWeight: "600",
                          letterSpacing: "0.1em",
                          marginBottom: "9px",
                        }}
                      >
                        Fan Speed
                      </p>
                      <Slider
                        aria-label="Temperature"
                        defaultValue={fanValue}
                        value={fanValue}
                        valueLabelDisplay={chkGroup() == "READ" ? "off" : "auto"}
                        step={1}
                        disabled={
                          !powerValue ||
                          controlStates["FanSpeed"] == "PENDING" ||
                          controlStates["FanSpeed"] == "EXECUTING"
                        }
                        marks={marks}
                        min={0}
                        max={4}
                        onChangeCommitted={handleSliderChange}
                        sx={{
                          "& .MuiSlider-markLabel": {
                            fontSize: "9px",
                            color: "#999",
                          },
                        }}
                      />
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* </div> */}
            {/* <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "calc(100vw - 450px)",
              }}
            > */}
            <TransformWrapper initialScale={1}>
              {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
                <React.Fragment>
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      position: "relative",
                    }}
                  >
                    <TransformComponent>
                      {/* <div
                        id="digitalTwinSvg"
                        dangerouslySetInnerHTML={{
                          __html: svg,
                        }}
                        style={{
                          display: !img ? "block" : "none",
                        }}
                      ></div> */}
                      {loader ? <span className="loader"></span> : null}
                      {/* {img ? ( */}
                      <img
                        src={img}
                        style={{
                          height: "calc(100vh - 320px)",
                          opacity: loader ? "0.3" : "1",
                          width: `100%`,
                        }}
                      />

                      {selectedSensor || selectedControl ? (
                        <Popover
                          open={selectedSensor || selectedControl}
                          anchorEl={anchorEl}
                          onClose={handleClose}
                          anchorOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          PaperProps={{
                            style: {
                              width: selectedControl ? "410px" : "30%",
                              height: selectedSensor ? 245 : 260,
                              borderRadius: 8,
                              overflow: "hidden",
                            },
                          }}
                        >
                          {selectedSensor ? (
                            <TimeSeries
                              sensor={selectedSensor}
                              id={props.id}
                              type="digitalTwin"
                              dataPointThresholds={props.dataPointThresholds}
                              deviceColor={
                                device?.dataPointThresholds
                                  ? device?.dataPointThresholds.find(
                                      (x) => x.dataPoint === selectedSensor._id
                                    )
                                  : false
                              }
                            />
                          ) : selectedControl ? (
                            <Controlling
                              actuators={[selectedControl]}
                              id={props.id}
                              setText={"settext"}
                              setSnack={"setsnack"}
                              setSnackType={"setSnackType"}
                              digitalTwin
                              config={false}
                            />
                          ) : null}
                        </Popover>
                      ) : null}
                    </TransformComponent>
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        display: "grid",
                        gridGap: "5px",
                      }}
                    >
                      <div className="button" onClick={() => zoomIn()}>
                        <ZoomInIcon
                          style={{ color: "#000000", fontSize: "17px" }}
                        />
                      </div>

                      <div className="button" onClick={() => zoomOut()}>
                        <ZoomOutIcon
                          style={{ color: "#000000", fontSize: "17px" }}
                        />
                      </div>

                      <div className="button" onClick={() => resetTransform()}>
                        <RestartAltIcon
                          style={{ color: "#000000", fontSize: "17px" }}
                        />
                      </div>
                      {chkGroup("Digital Twin") != "DISABLE" &&
                    chkGroup("Metadata") != "DISABLE" ? (
                      <div
                        className="button"
                        onClick={() => svgInputRef.current.click()}
                      >
                        <Tooltip
                          title="Upload Digital Twin"
                          placement="top"
                          arrow
                        >
                          <UploadFile
                            style={{ color: "#000000", fontSize: "17px" }}
                          />
                        </Tooltip>
                      </div>
                    ) : null}
                    </div>
                  </span>
                </React.Fragment>
              )}
            </TransformWrapper>
            {/* </span> */}
          </Fragment>
        ) : (
          <Loader top={"calc(100vh - 700px)"} />
        )
      ) : (
        <div style={{ textAlign: "center", top: "35%", position: "absolute" }}>
          <img style={{ maxWidth: "80%", maxHeight: "80%" }} src={NoImage} />
          <p style={{ color: "#AAAAAA", fontSize: 21 }}>No image found</p>
        </div>
      )}
    </div>
  );
}
