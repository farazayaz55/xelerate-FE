//-------------CORE------------------//
import React, { Fragment, useEffect } from "react";
//-------------MUI ICON------------------//
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
//-------------EXTERNAL------------------//
import { useGetDevicesQuery } from "services/devices";
import { useSelector } from "react-redux";
import Loader from "components/Progress";
import { getColor } from "Utilities/Color Spectrum";
import { getMonitoringValues } from "Utilities/Monitoring Widgets";
import hexRgb from "hex-rgb";
import emitter from "Utilities/events";
import "./style.css";

let measurements;

export default function Popup(props) {
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find(s=>s.id == props.serviceId);
  const [assetType, setAssetType] = React.useState(null)
  const [meta, setMeta] = React.useState("");
  const [color, setColor] = React.useState(null);

  const [data, setData] = React.useState(null);

  const popupDev = useGetDevicesQuery({
    token,
    group: "",
    params: `&internalId=${props.device}&pageSize=1&currentPage=1`,
  });

  function checkId() {
    let perm = props.layoutPermission.columns.includes("deviceInfo");
    return perm;
  }

  useEffect(() => {
    if (popupDev.isSuccess) {
      updateData(popupDev.data.payload?.data[0]);
    }
  }, [popupDev.isFetching]);

  function updateData(e) {
    setMeta(e?.metaTags.find((m) => m.key.toLowerCase().includes("id")));
    measurements = generateMeasurements(e.latestMeasurement);
    let temp = {};
    setAssetType(e.platformDeviceType && service.assetMapping.length ? service.assetMapping.find(a=>a.assetType._id == e.platformDeviceType) : null)
    const tempAssetType = e.platformDeviceType && service.assetMapping.length ? service.assetMapping.find(a=>a.assetType._id == e.platformDeviceType) : null;
    if (e?.latestMeasurement) {
      Object.keys(e.latestMeasurement).forEach((e2) => {
        let id = (tempAssetType ? tempAssetType.sensors : props.sensors).find((a) => a.name == e2)?._id;
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
        (assetType ? assetType.sensors : props.sensors).forEach((sensor) => {
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
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "space-between",
                  alignItems: "center",
                  maxWidth: "450px",
                  width: "fit-content",
                  padding: "2px 10px",
                  borderRadius: "5px",
                  backgroundColor: data?.packetFromPlatform?.c8y_Availability
                    ? data?.packetFromPlatform.c8y_Availability.status ==
                      "AVAILABLE"
                      ? "rgb(76, 175, 80, 0.1)"
                      : data?.packetFromPlatform.c8y_Availability.status ==
                        "UNAVAILABLE"
                      ? "rgb(85, 85, 85,0.1)"
                      : "rgb(85, 85, 85, 0.1)"
                    : "rgb(85, 85, 85, 0.1)",
                }}
                onClick={moreDetails}
              >
                <span
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      cursor: "pointer",
                      height: "7px",
                      width: "7px",
                      borderRadius: "50%",
                      backgroundColor: data?.packetFromPlatform
                        ?.c8y_Availability
                        ? data?.packetFromPlatform.c8y_Availability.status ==
                          "AVAILABLE"
                          ? "rgb(76, 175, 80, 1)"
                          : data?.packetFromPlatform.c8y_Availability.status ==
                            "UNAVAILABLE"
                          ? "rgb(85, 85, 85,1)"
                          : "rgb(85, 85, 85, 1)"
                        : "rgb(85, 85, 85, 1)",
                    }}
                  />
                  <p
                    style={{
                      fontSize: "13px",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      cursor: "pointer",
                    }}
                  >
                    <b style={{ position: "relative", top: "1px" }}>
                      {data.name}
                    </b>
                    {/* {!checkId() && meta ? (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "normal",
                          color: "#6d6d6d",
                        }}
                      >{` (${meta.key}: ${meta.value})`}</span>
                    ) : null} */}
                  </p>
                </span>
                {checkId() ? (
                  <p
                    style={{ color: "#6d6d6d", fontSize: "12px" }}
                  >{`(${data.internalId})`}</p>
                ) : null}
              </div>
              <p
                style={{
                  color: "#6d6d6d",
                  fontSize: "12px",
                  margin: "0 1px 5px 1px",
                }}
              >
                {data?.metaTags && data.metaTags.find((e) => e.key == "Address")
                  ? data.metaTags.find((e) => e.key == "Address").value
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
                    src={assetType ? assetType.assetType.logoPath : props.image}
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
                      {`${new Date(
                        data.measurementUpdateTime
                      ).toLocaleDateString("en-GB")}-${new Date(
                        data.measurementUpdateTime
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
                    {(assetType ? assetType.sensors : props.sensors).map((elm) => (
                      <div>
                        <p
                          style={{
                            color: "#6d6d6d",
                            fontSize: "11px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            textAlign: "center",
                          }}
                        >
                          {elm.friendlyName}
                        </p>
                        <div
                          style={{
                            width: "100%",
                            padding: "2px 3px",
                            borderRadius: "5px",
                            backgroundColor: color.hasOwnProperty(elm.name)
                              ? `rgb(${hexRgb(color[elm.name]).red}, ${
                                  hexRgb(color[elm.name]).green
                                }, ${hexRgb(color[elm.name]).blue},0.1)`
                              : " rgb(105,107,114,0.1)",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            gap: "3px",
                            color: color[elm.name],
                          }}
                        >
                          <p
                            style={{
                              fontSize: "11px",
                            }}
                          >
                            <strong>
                              {measurements
                                ? measurements[elm.name]?.value &&
                                  measurements[elm.name]?.value != ""
                                  ? measurements[elm.name]?.value
                                  : "N/A"
                                : "N/A"}
                            </strong>
                          </p>
                          <p style={{ fontSize: "10px" }}>
                            {measurements ? measurements[elm.name]?.unit : "0"}
                          </p>
                        </div>
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
                  color: "#2E3039",
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
                    borderRadius: "5px",
                    backgroundColor: e.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "10px",
                    width: "50px",
                    marginBottom: "5px",
                  }}
                >
                  <NotificationsActiveIcon
                    style={{
                      height: "13px",
                      width: "13px",
                      color: "white",
                    }}
                  />
                  <p style={{ fontSize: "10px", color: "white" }}>
                    {parseInt(e.value) > 99 ? "99+" : e.value}
                  </p>
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
    </div>
  );
}
