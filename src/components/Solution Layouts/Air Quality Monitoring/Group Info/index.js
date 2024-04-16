/* eslint-disable react/jsx-key */
import React, { useEffect } from "react";
import Card from "@mui/material/Card";
import GroupImage from "assets/icons/group.png";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useGetGroupsQuery } from "services/groups";
import { useGetGroupInfoQuery } from "services/analytics";
import { showSnackbar } from "Utilities/Snackbar";
import { useSnackbar } from "notistack";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import { useSelector, useDispatch } from "react-redux";
import { getColor } from "Utilities/Color Spectrum";
import Loader from "components/Progress";
import noData from "assets/img/no-data.png";
import { getMonitoringValues } from "Utilities/Monitoring Widgets";

export default function LabTabs(props) {
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  const filtersValue = useSelector((state) => state.filterDevice);
  const service = metaDataValue.services.find((s) => s.id == props.service);
  const matches = useMediaQuery("(min-width:1625px)");
  console.log({ filtersValue });
  function hasDecimal(num) {
    return num % 1 != 0;
  }

  const groups = useGetGroupsQuery({
    token,
    id: props.service,
    params: `?serviceId=${
      filtersValue.group.id == "" ? props.service : ""
    }&groupId=${filtersValue.group.id}&addParentDetails=true`,
  });

  const analytics = useGetGroupInfoQuery({
    token,
    id: props.service,
    parameters: `?mode=hourly&aggregation=[%22min%22,%22max%22,%22mean%22]&dataPoints=${JSON.stringify(
      props.sensors.map((e) => e.name)
    )}&aggregate=true${
      filtersValue.group.id != "" ? `&groupId=${filtersValue.group.id}` : ""
    }&MeasurementFilter=${filtersValue.measurement}&connected=${
      filtersValue.connection
    }&alarms=${filtersValue.alarms}&assetTypes=${filtersValue.assetTypes}`,
  });

  useEffect(() => {
    if (analytics.isError) {
      showSnackbar(
        "Analytics",
        analytics.error.data?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
    if (groups.isError) {
      showSnackbar(
        "Groups",
        groups.error.data?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [analytics.isFetching, groups.isFetching]);

  function chkDatapoints(datapoints) {
    let res = true;
    let chk = Object.keys(datapoints).filter(
      (e) => Object.keys(datapoints[e]).length < 1
    );
    if (chk.length == Object.keys(datapoints).length) res = false;
    return res;
  }
  function containsLetters(str) {
    // Regular expression to match any letter
    const regex = /[a-zA-Z]/;

    // Test if the string contains any letters
    return regex.test(str);
  }
  const truncDecimalValues = (value, digits) => {
    if (containsLetters(value)) {
      return value;
    } else
      return Math.trunc(value * Math.pow(10, digits)) / Math.pow(10, digits);
  };
  return (
    <Card
      style={{
        minHeight: "230px",
        maxHeight: "230px",
        position: "relative",
        marginBottom: "20px",
      }}
    >
      <div style={{ padding: "10px" }}>
        <span
          style={{
            display: "flex",
            gap: "15px",
            flex: 1,
            alignItems: "center",
            marginLeft: "5px",
          }}
        >
          <img
            src={GroupImage}
            style={{ maxHeight: "14px", maxWidth: "20px" }}
          />
          <p
            style={{
              color: "black",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
          >
            <b>GROUP INFO</b>
          </p>
        </span>
        {!groups.isFetching && !analytics.isFetching ? (
          <div
            style={{
              display: "flex",
              gap: "20px",
              justifyContent: "space-between",
            }}
          >
            <div style={{ marginTop: "20px", width: "35%", minWidth: "200px" }}>
              {filtersValue.group.name != "All assets" &&
              (!service.group || !service.group.id) ? (
                groups.data?.payload[0]?.parentChain.length ? (
                  groups.data?.payload[0]?.parentChain.map((p, i) => {
                    return (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "5px",
                          margin: "5px",
                          marginLeft: `${10 * (i + 1)}px`,
                        }}
                      >
                        <div
                          style={{
                            background: "black",
                            width: "10px",
                            height: "2px",
                          }}
                        />
                        <p>{p.name}</p>
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-start",
                      gap: "5px",
                      margin: "5px",
                      marginLeft: "10px",
                    }}
                  >
                    <div
                      style={{
                        background: "black",
                        width: "10px",
                        height: "2px",
                      }}
                    />
                    <p>{"All assets"}</p>
                  </div>
                )
              ) : null}

              <div
                style={{
                  background: metaDataValue.branding.primaryColor,
                  color: "white",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0 5px",
                  height: "30px",
                  margin: "5px",
                  borderRadius: "8px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    gap: "5px",
                    marginLeft: `${
                      10 * (groups.data?.payload[0]?.parentChain.length + 1)
                    }px`,
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      width: "10px",
                      height: "2px",
                    }}
                  />
                  <p>{filtersValue.group.name}</p>
                </div>

                <AccountTreeIcon
                  style={{
                    color: "white",
                    height: "15px",
                    width: "15px",
                    cursor: "pointer",
                    marginRight: "10px",
                  }}
                  onClick={() => {
                    dispatch(setFilter({ view: "2" }));
                    props.toggleDrawer();
                  }}
                />
              </div>
              <div
                style={{
                  maxHeight:
                    filtersValue.group.name != "All assets" ? "100px" : "120px",
                  overflowY: "scroll",
                }}
              >
                {(filtersValue.group.id == ""
                  ? groups.data?.payload
                  : groups.data?.payload[0]?.childGroups
                ).map((e, i) => {
                  let group = e.name;
                  return (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        padding: "0 20px",
                        height: "30px",
                        margin: "5px",
                        marginTop: "0",
                        borderRadius: "8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          gap: "5px",
                        }}
                      >
                        <div
                          style={{
                            background: "black",
                            width: "10px",
                            height: "2px",
                          }}
                        />
                        <p>{group}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {analytics.data?.payload?.dataPoints &&
            chkDatapoints(analytics.data?.payload?.dataPoints) ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: matches ? "1fr 1fr" : "1fr",
                  minWidth: matches ? "auto" : "280px",
                  height: "190px",
                  overflowY: "scroll",
                  gap: "10px",
                  position: "relative",
                  bottom: "5px",
                  width: "-webkit-fill-available",
                }}
              >
                {Object.keys(analytics.data?.payload?.dataPoints).map((e) => {
                  let temp = props.sensors.find((a) => a.name == e);
                  let mean = getMonitoringValues(
                    temp.type,
                    temp.metaData,
                    analytics.data.payload?.dataPoints[e].mean,
                    analytics.data.payload?.dataPoints[e].unit
                  );
                  let min = getMonitoringValues(
                    temp.type,
                    temp.metaData,
                    analytics.data.payload?.dataPoints[e].min,
                    analytics.data.payload?.dataPoints[e].unit
                  );
                  let max = getMonitoringValues(
                    temp.type,
                    temp.metaData,
                    analytics.data.payload?.dataPoints[e].max,
                    analytics.data.payload?.dataPoints[e].unit
                  );
                  let sensor = props.dataPointThresholds.find(
                    (m) => m.dataPoint?.name == e
                  );
                  let color = metaDataValue.branding.primaryColor;
                  if (sensor)
                    color = getColor(
                      analytics.data.payload?.dataPoints[e].mean,
                      sensor
                    );
                  return (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        height: "90px",
                        width: "100%",
                        border: `1px solid ${color}`,
                        borderRadius: "8px",
                        paddingLeft: "10px",
                        position: "relative",
                        color,
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: "10px",
                          background: color,
                          position: "absolute",
                          left: "0",
                          borderRadius: "8px 0px 0px 8px",
                        }}
                      />
                      <span
                        style={{ display: "flex", gap: "10px", margin: "10px" }}
                      >
                        <div>
                          <p
                            style={{
                              fontWeight: 600,
                              fontSize: "14px",
                              lineHeight: "19px",
                              letterSpacing: "0.05em",
                              textTransform: "capitalize",
                              marginBottom: "15px",
                            }}
                          >
                            {
                              props.sensors.find((m) => m.name == e)
                                .friendlyName
                            }
                          </p>
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: "20px",
                              letterSpacing: "0.05em",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {mean.value
                              ? truncDecimalValues(mean.value, 1)
                              : "N/A"}
                            <span
                              style={{
                                fontSize: "20px",
                              }}
                            >
                              {mean.unit}
                            </span>
                          </p>
                        </div>
                      </span>
                      <span
                        style={{ display: "flex", gap: "10px", margin: "10px" }}
                      >
                        <div style={{ marginTop: "2px", marginRight: "5px" }}>
                          <p
                            style={{
                              fontWeight: 400,
                              fontSize: "12px",
                              color: "#B3B4B6",
                              lineHeight: "10px",
                            }}
                          >
                            MIN
                          </p>
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: "11px",
                              marginBottom: "2px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {min.value
                              ? truncDecimalValues(min.value, 1)
                              : "N/A"}{" "}
                            {min.unit}
                          </p>
                          <p
                            style={{
                              fontWeight: 400,
                              fontSize: "12px",
                              color: "#B3B4B6",
                              lineHeight: "10px",
                            }}
                          >
                            MAX
                          </p>
                          <p
                            style={{
                              fontWeight: 700,
                              fontSize: "11px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {max.value
                              ? truncDecimalValues(max.value, 1)
                              : "N/A"}{" "}
                            {max.unit}
                          </p>
                        </div>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  minWidth: matches ? "" : "280px",
                  height: "240px",
                }}
              >
                <img
                  style={{ maxWidth: "50%", maxHeight: "50%" }}
                  src={noData}
                />
                <p style={{ color: "#c7c7c7" }}>No Data found</p>
              </div>
            )}
          </div>
        ) : (
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
              width: "100%",
            }}
          >
            <Loader />
          </span>
        )}
      </div>
    </Card>
  );
}
