import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
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
import { useSnackbar } from "notistack";
import NoImage from "../../../assets/img/no-image-grey.png";
import { getMonitoringValues } from "Utilities/Monitoring Widgets";
import { useGetAlarmsQuery } from "services/alarms";
import Button from "@mui/material/Button";
import useUpload from "hooks/useUpload";
import { useEditDeviceMutation } from "services/devices";
import ViewInArIcon from "@mui/icons-material/ViewInAr";
import Tooltip from "@mui/material/Tooltip";
import { RestorePageOutlined, UploadFile } from "@mui/icons-material";
import { setDevice } from "rtkSlices/assetSlice";
import { useGetEventsQuery } from "services/events";
import CloseIcon from "@mui/icons-material/Close";
import { CircularProgress } from "@mui/material";

let svgMapping;
let controlMapping;
let monitoringKeys;
let controlKeys;
let type = null;
let videoEventFound = false;
let allVideoEvents = [];

export default function DigitalTwin(props) {
  const tabs = [
    { id: "OwnAssetLink_VA", name: "Video Analytics" },
    { id: "OwnAssetLink_History", name: "History" },
    { id: "OwnAssetLink_Monitoring", name: "Monitoring" },
    { id: "OwnAssetLink_Controls", name: "Controlling" },
    { id: "OwnAssetLink_Analytics", name: "Analytics" },
    { id: "OwnAssetLink_Rules", name: "Rules" },
    { id: "OwnAssetLink_Alarms", name: "Alarms" },
    { id: "OwnAssetLink_Config", name: "Configuration" },
    { id: "OwnAssetLink_Events", name: "Events" },
    { id: "OwnAssetLink_Location", name: "Tracking" },
    { id: "OwnAssetLink_MetaData", name: "Metadata" },
    { id: 'Link_SolutionDashboard', name: 'Dashboard' },
    { id: 'Link_SolutionsCatalog', name: 'Catalog' }
  ];
  let token = window.localStorage.getItem("token");
  const device = useSelector((state) => state.asset.device);
  const { enqueueSnackbar } = useSnackbar();
  const [vp, setVp] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  let firstTime = true;
  const [ind, setInd] = useState(0)
  const [svgLoader, setSvgLoader] = React.useState(false);
  const { url, isLoading, error, fetchUrl } = useUpload();
  const [tempDigitalTwinSvg, setTempDigitalTwinSvg] = useState("");
  const svgInputRef = useRef(null);
  const dispatch = useDispatch();
  const [svg, setSvg] = useState("");
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == props.serviceId);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSensor, setSelectedSensor] = useState(null);
  const [selectedControl, setSelectedControl] = useState(null);
  const [openPopover, setOpenPopover] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState("");
  const [svgUrl, setSvgUrl] = useState("");
  const [alarmType, setAlarmType] = useState("");
  const [updateDevice, updateResult] = useEditDeviceMutation();
  const [parentChildParam, setParentChildParam] = React.useState("")
  const [allAlarmTypes, setAllAlarmTypes] = React.useState([])
  const alarmsRes = useGetAlarmsQuery(
    {
      token: window.localStorage.getItem("token"),
      params: `?source=${device.internalId}&type=${alarmType}&status=["ACTIVE"]`,
    },
    { skip: !alarmType }
  );
  const [alarms, setAlarms] = useState(null);
  const digitalTwin = useGetDigitalTwinQuery(
    { url: tempDigitalTwinSvg ? tempDigitalTwinSvg : svgUrl },
    { skip: !svgUrl }
  );
  const [videoTexts, setVideoTexts] = useState([])
  const devices = useGetDevicesQuery({
    token,
    group: "",
    params: `&internalId=${props.id}${parentChildParam ? parentChildParam : ``}`,
  });
  const dtUrls = {
    EV:
      "https://xelerate-video.s3.eu-central-1.amazonaws.com/3e31bbaa9531607e01a25b15b908dd77.image/svg%20xml",
    Inverter:
      "https://xelerate-video.s3.eu-central-1.amazonaws.com/bbbbeff76658b33c3b3f0ce7511fb398.image/svg%20xml",
    Others:
      "https://xelerate-video.s3.eu-central-1.amazonaws.com/ba4e5f98b1a364e1528988f3dfa33053.image/svg%20xml",
  };
  const events = useGetEventsQuery({
    token,
    params: `?source=${props.id}&type=c8y_videoAnalytics${`&text=${videoTexts[ind]}`
      }`,
  }, { skip: !videoTexts.length });

  const getFileType = (url) => {
    // Extract the file extension from the URL
    const fileExtension = url.split('.').pop().toLowerCase();

    // Define common video file extensions
    const videoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv'];

    // Define common image file extensions
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp'];

    // Check if the file extension is in the videoExtensions array
    if (videoExtensions.includes(fileExtension)) {
      return 'video';
    }

    // Check if the file extension is in the imageExtensions array
    if (imageExtensions.includes(fileExtension)) {
      return 'image';
    }

    // If the file extension is not recognized as video or image, you can return null or handle it differently
    return null;
  }

  useEffect(() => {
    if (device?.latestMeasurement) {
      setSvgValues(device?.latestMeasurement);
    }
  }, [device]);

  useEffect(() => {
    if (!alarmsRes.isFetching && alarmsRes.isSuccess) {
      setAlarms(alarmsRes.data.payload.data);
      const tempAlarms = alarmsRes.data.payload.data;
      if (tempAlarms?.length && tempAlarms.find((d) => d.status != "CLEARED")) {
        document.getElementById(allAlarmTypes[type - 1].id).style.display = "block";
        if (document.querySelector("[id^=Alarm_TS__]")) {
          document.querySelector("[id^=Alarm_TS__]").innerHTML =
            new Date(
              tempAlarms.filter((t) => t.status != "CLEARED")[0].updatedAt
            ).toLocaleDateString() +
            " " +
            new Date(
              tempAlarms.filter((t) => t.status != "CLEARED")[0].updatedAt
            ).toLocaleTimeString();
        }
      } else {
        document.getElementById(allAlarmTypes[type - 1].id).style.display = "none";
      }
      if (allAlarmTypes.length > type) {
        setAlarmType(allAlarmTypes[type].id.split("Alarm__")[1].replaceAll("_", " "))
        type = type + 1;
      }
    }
  }, [alarmsRes.isFetching]);
  useEffect(() => {
    if (!events.isFetching && events.isSuccess) {
      const data = events.data.payload.data;
      console.log('hereeeee data', data, videoTexts)
      if (data.length) {
        if (data.find(d => d.metaData.videoUrl || d.metaData.imageUrl)) {
          document.getElementById(`VA__${videoTexts[ind].replaceAll(" ", "_")}__Play`).style.visibility = "visible"
          allVideoEvents = [...allVideoEvents, { [videoTexts[ind]]: videoTexts[ind], url: data.find(d => d.metaData.videoUrl || d.metaData.imageUrl).metaData.videoUrl || data.find(d => d.metaData.videoUrl || d.metaData.imageUrl).metaData.imageUrl }]
          // setSelectedVideo(data.find(d=>d.metaData.videoUrl || d.metaData.imageUrl).metaData.videoUrl || data.find(d=>d.metaData.videoUrl || d.metaData.imageUrl).metaData.imageUrl)
          setInd(ind + 1)
        }
        // else{
        //   setSelectedVideo("none")
        // }
      }
    }
  }, [events.isFetching]);

  function chkGroup(tabName) {
    let permission = metaDataValue.services
      .find((s) => s.id == props.serviceId)
      .tabs.find((tab) => tab.name == tabName)?.permission;
    return permission || "DISABLE";
  }

  function fillChildrenValues() {
    const childDevices = devices.data.payload.data[0].childDevices;
    if (childDevices?.length) {
      childDevices.forEach((cd, ind) => {
        if (document.querySelector(`[id^="CHILD${ind + 1}__"]`)) {
          const id = document.querySelector(`[id^="CHILD${ind + 1}__"]`).id;
          const dpName = id.slice(id.lastIndexOf('_') + 1);
          const dpValue = cd.latestMeasurement[dpName].value;
          document.querySelector(`[id^="CHILD${ind + 1}__"]`).innerHTML = dpValue;
        }
        if (document.getElementById('CHILD_NAME')) {
          document.getElementById('CHILD_NAME').innerHTML = cd.name;
        }
      })
    }
  }

  function fillParentValue() {
    const parentDevice = devices.data.payload.data[0].parentDevice;
    if (document.querySelector(`[id^="PARENT__"]`)) {
      const id = document.querySelector(`[id^="PARENT__"]`).id;
      const dpName = id.slice(id.lastIndexOf('_') + 1);
      const dpValue = parentDevice.latestMeasurement[dpName].value;
      document.querySelector(`[id^="PARENT__"]`).innerHTML = dpValue;
    }
    if (document.getElementById('PARENT_NAME')) {
      document.getElementById('PARENT_NAME').innerHTML = parentDevice.name;
    }
  }

  function setDigitalTwinWithConds() {
    const assetTypeExists = devices.data.payload.data[0].platformDeviceType;
    let assetTypeDt = '';
    if (assetTypeExists) {
      const assetType = service.assetMapping.find(a => a.assetType._id == assetTypeExists)
      if (assetType && assetType.digitalMarketUrl && assetType.digitalMarketUrl.value) {
        assetTypeDt = assetType.digitalMarketUrl.value;
      }
    }
    if (devices.data.payload.data[0].digitalTwinSvg) {
      setTempDigitalTwinSvg(devices.data.payload.data[0].digitalTwinSvg);
    } else if (assetTypeDt) {
      setTempDigitalTwinSvg(assetTypeDt)
    }
    else {
      const deviceType = devices.data.payload.data[0].esbDeviceType;
      if (deviceType) {
        setTempDigitalTwinSvg(
          deviceType == "EVCharger"
            ? dtUrls.EV
            : deviceType == "Inverter"
              ? dtUrls.Inverter
              : dtUrls.Others
        );
      }
    }
  }

  useEffect(() => {
    if (!devices.isFetching && devices.isSuccess) {
      if (devices.data.payload && devices.data.payload.data?.length) {
        if (parentChildParam == '&showChildren=true') {
          fillChildrenValues()
        }
        if (parentChildParam == '&showParent=true') {
          fillParentValue()
        }
        setDigitalTwinWithConds()
      }
      svgMapping = JSON.parse(JSON.stringify(props.sensors));
      svgMapping.forEach(
        (s) =>
        (s.name = s.name
          .replaceAll(" ", "_")
          .replaceAll("(", "_")
          .replaceAll(")", "_")
          .replaceAll("-", "_")
          .replaceAll("/", "_"))
      );
      monitoringKeys = svgMapping.map((s) => s.name);
      controlMapping = JSON.parse(JSON.stringify(props.actuators));
      controlMapping.forEach(
        (s) =>
        (s.name = s.name
          .replaceAll(" ", "_")
          .replaceAll("(", "_")
          .replaceAll(")", "_")
          .replaceAll("-", "_")
          .replaceAll("/", "_"))
      );
      controlKeys = controlMapping.map((s) => s.name);
      // console.log({controlKeys, props, monitoringKeys})
      getMeasurements();
    }
  }, [devices.isFetching]);

  useEffect(() => {
    if (document.getElementById("digitalTwinSvg")) {
      if (document.getElementById("digitalTwinSvg").children[0]) {
        document.getElementById("digitalTwinSvg").children[0].style.width =
          "100%";
        document.getElementById("digitalTwinSvg").children[0].style.height =
          "100%";
      }
      if (devices.data.payload.data[0].latestMeasurement) {
        setSvgValues(devices.data.payload.data[0].latestMeasurement);
      }
      if (document.querySelectorAll("[id^=Alarm__]") && Array.from(document.querySelectorAll("[id^=Alarm__]")).length) {
        setAllAlarmTypes(Array.from(document.querySelectorAll("[id^=Alarm__]")))
        type = 1;
        Array.from(document.querySelectorAll("[id^=Alarm__]")).forEach(alarm => {
          setAlarmType(
            alarm.id.split("Alarm__")[1]
              .replaceAll("_", " ")
          );
          alarm.style.display = "none";
        })
      }
      subscribeForListeners();
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

  async function getMeasurements() {
    if (!devices.isLoading && devices.isSuccess) {
      if (props.url) {
        setSvgUrl(tempDigitalTwinSvg || props.url);
        fetchSvg();
      }
      // else{
      //   showSnackbar("Digital Twin", "No image found", "error", 1000);
      // }
    }
  }

  async function subscribeForListeners() {
    tabs.forEach((tab) => {
      const elem = document.getElementById(tab.id) || document.getElementById('Link_SolutionDashboard') || document.getElementById('Link_SolutionsCatalog');
      if (elem) {
        elem.style.cursor = 'pointer'
        elem.addEventListener("click", (e) => {
          setTimeout(() => {
            if (!videoEventFound) {
              const position = props.tabs.findIndex((t) => t == tab.name)
              if ((position && position != -1) || position == 0) {
                props.history.push(`/solutions/${props.serviceId}/${props.id}/${position}`);
              }
              else if (tab.name == 'Dashboard') {
                props.history.push(`/solutions/${props.serviceId}`);
              }
              else {
                props.history.push(`/solutions`);
              }
            }
          }, 1000);
        });
      }
    });
    if (service && service.parentChildEnabled) {
      if (document.querySelector('[id^="CHILD"]')) {
        setParentChildParam("&showChildren=true")
      }
      else if (document.querySelector('[id^="PARENT"]')) {
        setParentChildParam("&showParent=true")
      }
    }
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
    if (chkGroup("Controlling") != "DISABLE") {
      controlKeys.forEach((dp) => {
        if (document.getElementById(dp)) {
          document.getElementById(dp).addEventListener("click", (e) => {
            setAnchorEl(e.currentTarget);
            setSelectedControl(
              props.actuators.find(
                (s) =>
                  s.name == dp ||
                  s.name
                    .replaceAll(" ", "_")
                    .replaceAll("(", "_")
                    .replaceAll(")", "_")
                    .replaceAll("-", "_")
                    .replaceAll("/", "_") == dp
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

  function handleResize() {
    setVp({ height: window.innerHeight, width: window.innerWidth });
  }

  useEffect(() => {
    window.addEventListener("resize", handleResize);

    document.addEventListener("click", (e) => {
      const id = e.target.id.includes("VA__") ? e.target.id : (e.target.parentElement && e.target.parentElement.id.includes("VA__")) ? e.target.parentElement.id : e.target.id;
      if (id.includes("VA__")) {
        const tempText = id.slice(4, id.indexOf('__P')).replaceAll("_", " ")
        setAnchorEl(e.target)
        videoEventFound = true;
        console.log({ allVideoEvents, videoTexts })
        setSelectedVideo(allVideoEvents.find(v => v[tempText] == tempText).url)
        // setVideoText(
        //     tempText
        // );
      }
      else {
        setSelectedVideo("")
        // setVideoText("")
        videoEventFound = false
        // setAnchorEl(null)
      }
    })

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  function handleLoader(state) {
    setSvgLoader(state);
  }

  function setSvgValues(values) {
    props.sensors.forEach((sensor) => {
      let temp;
      let value;
      if (
        values &&
        values[sensor.name] &&
        document.getElementById(
          sensor.name
            .replaceAll(" ", "_")
            .replaceAll("(", "_")
            .replaceAll(")", "_")
            .replaceAll("-", "_")
            .replaceAll("/", "_")
        )
      ) {
        document.getElementById(
          sensor.name
            .replaceAll(" ", "_")
            .replaceAll("(", "_")
            .replaceAll(")", "_")
            .replaceAll("-", "_")
            .replaceAll("/", "_")
        ).innerHTML = getMonitoringValues(
          sensor.type,
          sensor.metaData,
          values[sensor.name]?.value,
          values[sensor.name]?.unit
        ).value;
        document.getElementById(
          sensor.name
            .replaceAll(" ", "_")
            .replaceAll("(", "_")
            .replaceAll(")", "_")
            .replaceAll("-", "_")
            .replaceAll("/", "_")
        ).style.cursor = "pointer";
      }
    });
    props.actuators.forEach((actuator) => {
      let elem =
        document.getElementById(actuator.name) ||
        document.getElementById(
          actuator.name
            .replaceAll(" ", "_")
            .replaceAll("(", "_")
            .replaceAll(")", "_")
            .replaceAll("-", "_")
            .replaceAll("/", "_")
        );
      if (elem) {
        elem.style.cursor = "pointer";
      }
    });
    if (document.querySelector("[id^=VA__]")) {
      let tempTexts = [];
      Array.from(document.querySelectorAll("[id^=VA__]")).forEach((video, i) => {
        // setTimeout(() => {

        document.getElementById(video.id).style.visibility = "hidden"
        tempTexts.push(video.id.slice(4, video.id.indexOf('__P')).replaceAll("_", " "))
        // }, 1000);
      })
      setVideoTexts(
        tempTexts
      );
      console.log({ tempTexts })
    }
  }

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

  const updateAsset = async (digitalTwinSvg) => {
    const body = { digitalTwinSvg };
    const deviceType = devices.data.payload.data[0].esbDeviceType;
    if (digitalTwinSvg) {
      setTempDigitalTwinSvg(digitalTwinSvg);
    } else {
      setTempDigitalTwinSvg(
        deviceType
          ? deviceType == "EVCharger"
            ? dtUrls.EV
            : deviceType == "Inverter"
              ? dtUrls.Inverter
              : dtUrls.Others
          : ""
      );
      setSvgUrl(
        deviceType
          ? deviceType == "EVCharger"
            ? dtUrls.EV
            : deviceType == "Inverter"
              ? dtUrls.Inverter
              : dtUrls.Others
          : props.url
      );
      digitalTwin.refetch();
    }
    setSvg("");
    let updated = await updateDevice({
      token,
      body,
      id: props.id,
    });
    if (updated.data?.success) {
      showSnackbar("Device", updated.data?.message, "success", 1000);
      dispatch(setDevice(updated.data.payload));
    } else {
      setSvg(digitalTwin.error.data);
      showSnackbar("Device", updated.data?.message, "error", 1000);
    }
  };

  useEffect(() => {
    if (!isLoading && url) {
      updateAsset(url);
      handleLoader(false);
    }
  }, [isLoading]);

  return (
    <div
      style={{
        display: "flex",
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
      {/* {chkGroup("Digital Twin") != "DISABLE" && chkGroup("Metadata") != "DISABLE" ? <div style={{position:'absolute', top:'-50px', right:'30px', display:'flex',gap:'10px'}}>
      <Button color="success" variant="contained" onClick={() => svgInputRef.current.click()}>
              Upload Digital Twin
            </Button>
      { tempDigitalTwinSvg ? <Button color="error" variant="contained" onClick={() => updateAsset("")}>
              Reset
            </Button> : null}
      </div> : null} */}
      {props.url ? (
        svg ? (
          <TransformWrapper initialScale={1}>
            {({ zoomIn, zoomOut, resetTransform, ...rest }) => (
              <React.Fragment>
                <span
                  style={{
                    position: "relative",
                  }}
                >
                  <TransformComponent>
                    <div
                      id="digitalTwinSvg"
                      dangerouslySetInnerHTML={{
                        __html: svg,
                      }}
                      style={{
                        height: `calc(-240px + ${vp.height}px)`,
                        width: `calc(${vp.width}px - 120px)`,
                      }}
                    ></div>
                    {selectedSensor || selectedControl || (selectedVideo) ? (
                      <Popover
                        open={selectedSensor || selectedControl || selectedVideo}
                        anchorEl={anchorEl}
                        onClose={handleClose}
                        anchorOrigin={{
                          vertical: "bottom",
                          horizontal: "left",
                        }}
                        PaperProps={{
                          style: {
                            width: selectedControl ? "410px" : selectedVideo ? "320px" : "30%",
                            height: selectedSensor ? 245 : selectedVideo ? "200px" : "auto",
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
                                ? device.dataPointThresholds.find(
                                  (x) => x.dataPoint === selectedSensor._id
                                )
                                : false
                            }
                          />
                        ) : selectedControl ? (
                          <Controlling
                            actuators={[selectedControl]}
                            device={device}
                            id={props.id}
                            setText={"settext"}
                            setSnack={"setsnack"}
                            setSnackType={"setSnackType"}
                            digitalTwin
                            service={props.serviceId}
                            config={false}
                          />
                        ) : selectedVideo ?
                          <div>
                            <CloseIcon
                              color="error"
                              sx={{
                                fontSize: 12,
                                position: "absolute",
                                cursor: 'pointer',
                                top: '10px',
                                right: '10px'
                              }}
                              onClick={() => {
                                setSelectedVideo("")
                                // setVideoText("")
                                videoEventFound = false
                              }}
                            />
                            {selectedVideo == 'none' ? <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '40px 0px', color: 'grey' }}>No event found</div> : getFileType(selectedVideo) == "image" ? <img src={selectedVideo} /> : <iframe
                              src={selectedVideo + "?autoplay=1"}
                              title="description"
                              height="100%"
                              width="100%"
                              allow="autoplay; fullscreen"
                              frameBorder={0}
                              style={{ height: '200px' }}
                            // onLoad={() => {
                            //   setContentLoader(false);
                            // }}
                            ></iframe>}
                          </div>
                          : null
                        }
                      </Popover>
                    ) : null}
                  </TransformComponent>
                  <div
                    style={{
                      position: "absolute",
                      top: "10px",
                      right: "25px",
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
                    {chkGroup("Digital Twin") != "DISABLE" &&
                      chkGroup("Metadata") != "DISABLE" &&
                      devices?.data?.payload?.data.length &&
                      devices.data.payload.data[0].digitalTwinSvg ? (
                      <div className="button" onClick={() => updateAsset("")}>
                        <Tooltip
                          title="Reset Digital Twin"
                          placement="top"
                          arrow
                        >
                          <RestorePageOutlined
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
