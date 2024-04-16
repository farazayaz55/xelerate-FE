//-------------CORE------------------//
import React, { useEffect } from "react";
//-------------MUI ICON------------------//
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
//-------------EXTERNAL------------------//
import { useGetDevicesQuery } from "services/devices";
import { useSelector } from "react-redux";
import Loader from "components/Progress";
import { getColor } from "Utilities/Color Spectrum";
import { getMonitoringValues } from "Utilities/Monitoring Widgets";
import emitter from "Utilities/events";
import "./style.css";
import InfoIcon from "@mui/icons-material/Info";
import DriverScore from "Utilities/DriverScorePopup";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";

let measurements;

export default function Popup(props) {
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  console.log('find',metaDataValue.services.find((s) => s.id == props?.serviceId), props)
  let device = JSON.parse(
    JSON.stringify(metaDataValue.services.find((s) => s.id == props?.serviceId))
  );
  const [meta, setMeta] = React.useState("");
  const [color, setColor] = React.useState(null);
  const service = metaDataValue.services.find((s) => s.id == props.link);
  console.log({ service });
  const driverScoreExists = service.sensors.find(
    (s) => s.friendlyName == "Driver Score"
  );
  const [data, setData] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [image, setImage] = React.useState();

  const popupDev = useGetDevicesQuery({
    token,
    group: "",
    params: `&internalId=${props.device}&pageSize=1&currentPage=1`,
  });
  useEffect(() => {
   if(data && device && device.assets && device.assets.length > 1 ){
    device.assets.forEach((obj) => {
      if (obj?.id === data?.platformDeviceType) {
        setImage(obj.image)
      }
    });
   }
  }, [data]);
  useEffect(() => {
    if (popupDev.isSuccess) {
      updateData(popupDev.data.payload?.data[0]);
    }
  }, [popupDev.isFetching]);

  function updateData(e) {
    setMeta(e?.metaTags.find((m) => m.key.toLowerCase().includes("id")));
    measurements = generateMeasurements(e.latestMeasurement);
    let temp = {};
    if (e?.latestMeasurement) {
      Object.keys(e.latestMeasurement).forEach((e2) => {
        let id = props.sensors.find((a) => a.name == e2)?._id;
        let sensor;

        if (e?.dataPointThresholds && e?.dataPointThresholds.length) {
          sensor = e?.dataPointThresholds.find((g) => g.dataPoint == id);
        }
        if (!sensor) {
          sensor = props.dataPointThresholds.find(
            (g) => g.dataPoint?.name == e2
          );
        }

        if (sensor) temp[e2] = getColor(e.latestMeasurement[e2].value, sensor);
      });
    }
    setColor(temp);
    setData(e);
  }

  useEffect(() => {
    function callbackfn(payload) {
      if (payload.message.internalId == props.device) {
        updateData(payload.message);
      }
    }

    emitter.on("solution?devices", callbackfn);

    return () => {
      emitter.off("solution?devices", callbackfn);
    };
  }, []);

  function moreDetails() {
    props.history.push(`/solutions/${props.link}/${data.internalId}/0`);
  }

  function generateMeasurements(measurement) {
    let output = { ...measurement };
    if (measurement)
      Object.keys(measurement).forEach((val) => {
        props.sensors.forEach((sensor) => {
          if (sensor.name == val) {
            output[val] = getMonitoringValues(
              sensor.type,
              sensor.metaData,
              measurement[val]?.value,
              measurement[val]?.unit
            );
          }
        });
      });
    else output = {};
    return output;
  }

  function getIdentifier() {
    let meta = data.metaTags.find(
      (e) => e.metaId == props.layoutPermission.identifier
    );
    if (meta) return `(${meta.key}: ${meta.value})`;
    else return false;
  }

  function getRGB(c) {
    return parseInt(c, 16) || c;
  }

  function getsRGB(c) {
    return getRGB(c) / 255 <= 0.03928
      ? getRGB(c) / 255 / 12.92
      : Math.pow((getRGB(c) / 255 + 0.055) / 1.055, 2.4);
  }

  function getLuminance(hexColor) {
    return (
      0.2126 * getsRGB(hexColor.substr(1, 2)) +
      0.7152 * getsRGB(hexColor.substr(3, 2)) +
      0.0722 * getsRGB(hexColor.substr(-2))
    );
  }

  function getContrast(f, b) {
    const L1 = getLuminance(f);
    const L2 = getLuminance(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  }

  function getTextColor(bgColor) {
    const whiteContrast = getContrast(bgColor, "#ffffff");
    const blackContrast = getContrast(bgColor, "#000000");

    return whiteContrast >= blackContrast ? "#ffffff" : "#000000";
}
  return (
    <div>
      {data ? (
        <div style={{ background: "#e2e2e2", borderRadius: "10px" }}>
          <div style={{ display: "flex" }}>
            <span
              style={{
                background: "white",
                padding: "10px",
                borderRadius: "10px",
              }}
            >
              <div style={{ maxWidth: "410px" }}>
                <span
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    <b style={{ cursor: "pointer" }} onClick={moreDetails}>
                      {data.name}
                    </b>
                    <span
                      style={{
                        fontSize: "11px",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        color: "#bfbec8",
                        marginLeft: "5px",
                      }}
                    >
                      {props.layoutPermission.columns.indexOf("deviceInfo") !=
                      -1
                        ? `(${data.internalId})`
                        : getIdentifier()}
                    </span>
                    {driverScoreExists ? (
                      <span
                        style={{ cursor: "pointer", margin: "10px" }}
                        onClick={() => setOpen(true)}
                      >
                        <InfoIcon
                          style={{
                            width: "15px",
                            height: "15px",
                            position: "absolute",
                            top: "13px",
                            color: "grey",
                          }}
                        />
                      </span>
                    ) : null}
                  </p>
                </span>
              </div>
              <p
                style={{
                  fontSize: "11px",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  color: "#bfbec8",
                  marginBottom: "8px",
                }}
              >
                {props.layoutPermission.columns.indexOf("deviceInfo") != -1
                  ? getIdentifier()
                  : null}
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    minWidth: "130px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                >
                  <img
                    src={image? image: props.image}
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      position: "relative",
                      top: "2px",
                    }}
                  ></img>
                  <div
                    style={{
                      display: "flex",
                      gap: "5px",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      width: "100%",
                      height: "100%",
                      position: "relative",
                      right: "5px",
                    }}
                  >
                    <AccessTimeIcon
                      style={{
                        color: "#6d6d6d",
                        height: "13px",
                        width: "13px",
                      }}
                    />
                    <p
                      style={{
                        color: "#6d6d6d",
                        fontSize: "10px",
                        position: "relative",
                        top: "4px",
                      }}
                    >
                      {new Date(data?.lastLocationUpdateTime) >
                      new Date(data?.measurementUpdateTime)
                        ? `${new Date(
                            data?.lastLocationUpdateTime
                          ).toLocaleDateString("en-GB")}-${new Date(
                            data?.lastLocationUpdateTime
                          ).toLocaleTimeString()}`
                        : `${new Date(
                            data?.measurementUpdateTime
                          ).toLocaleDateString("en-GB")}-${new Date(
                            data?.measurementUpdateTime
                          ).toLocaleTimeString()}`}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: "130px",
                    overflowY: "scroll",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div className="gridPopup">
                    {props.sensors.map((elm) => (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          margin: "2px",
                          gap: "5px",
                          maxWidth: "100px",
                        }}
                      >
                        <Tooltip
                          title={elm.friendlyName}
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <p
                            style={{
                              color: "#6d6d6d",
                              fontSize: "9px",
                              fontWeight: "800",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {elm.friendlyName}
                          </p>
                        </Tooltip>
                        <Tooltip
                        title={
                          measurements
                            ? measurements[elm.name]?.value && measurements[elm.name]?.value !== ""
                              ? measurements[elm.name]?.value +" "+ (measurements[elm.name]?.unit || "")
                              : "N/A"
                            : "N/A"
                        }
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                        <div
                          style={{
                            padding: "0 3px",
                            borderRadius: "5px",
                            maxWidth: "3rem",
                            backgroundColor: color.hasOwnProperty(elm.name)
                              ? color[elm.name]
                              : "#555555",
                            display: "flex",
                            justifyContent: "space-between",
                            gap: measurements && measurements[elm.name]?.unit? "3px" : "0",
                            color: getTextColor(
                              color.hasOwnProperty(elm.name)
                                ? color[elm.name]
                                : "#555555"
                            ),
                            opacity: "0.8",
                            fontWeight:
                              getTextColor(
                                color.hasOwnProperty(elm.name)
                                  ? color[elm.name]
                                  : "#555555"
                              ) === "#000000"
                                ? 700
                                : null,
                          }}
                        >
                          <p
                            style={{
                              fontSize: "9px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <span>
                              {measurements
                                ? measurements[elm.name]?.value &&
                                  measurements[elm.name]?.value != ""
                                  ? measurements[elm.name]?.value
                                  : "N/A"
                                : "N/A"}
                            </span>
                          </p>
                          <p style={{ fontSize: "9px" }}>
                            {measurements ? measurements[elm.name]?.unit : "0"}
                          </p>
                        </div>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </span>
            <span
              style={{
                padding: "10px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
              }}
            >
              <div
                style={{
                  padding: "0 4px",
                  borderRadius: "5px",
                  backgroundColor: data.packetFromPlatform?.c8y_Availability
                    ? data.packetFromPlatform.c8y_Availability.status ==
                      "AVAILABLE"
                      ? "#4caf50"
                      : "#555555"
                    : "#ba75d8",
                  marginBottom: "10px",
                }}
              >
                <p style={{ fontSize: "9px", color: "white" }}>
                  {data.packetFromPlatform?.c8y_Availability
                    ? data.packetFromPlatform.c8y_Availability.status ==
                      "AVAILABLE"
                      ? "ACTIVE"
                      : "INACTIVE"
                    : "NO-COM"}
                </p>
              </div>
              {[
                {
                  color: "#bf3535",

                  value: data?.alarmSync
                    ? data?.alarmSync?.CRITICAL
                      ? data?.alarmSync?.CRITICAL
                      : "0"
                    : "0",
                },
                {
                  color: "#844204",
                  value: data?.alarmSync
                    ? data?.alarmSync?.MAJOR
                      ? data?.alarmSync?.MAJOR
                      : "0"
                    : "0",
                },
                {
                  color: "#fd9a14",
                  value: data?.alarmSync
                    ? data?.alarmSync?.MINOR
                      ? data?.alarmSync?.MINOR
                      : "0"
                    : "0",
                },
                {
                  color: "#3399ff",
                  value: data?.alarmSync
                    ? data?.alarmSync?.WARNING
                      ? data?.alarmSync?.WARNING
                      : "0"
                    : "0",
                },
              ].map((e) => (
                <div
                  style={{
                    padding: "0px 6px",
                    borderRadius: "20px",
                    backgroundColor: e.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "5px",
                  }}
                >
                  <NotificationsActiveIcon
                    style={{
                      height: "13px",
                      width: "13px",
                      color: "white",
                    }}
                  />
                  <p style={{ fontSize: "10px", color: "white" }}>{e.value}</p>
                </div>
              ))}
            </span>
          </div>
        </div>
      ) : (
        <div style={{ padding: "20px 20px" }}>
          <Loader />
        </div>
      )}
      {open ? <DriverScore setOpen={(v) => setOpen(v)} /> : null}
    </div>
  );
}
