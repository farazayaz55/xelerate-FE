//-------------CORE-------------//
import React, { Fragment, useEffect, useState } from "react";
//-------------MUI-------------//
import { Grid } from "@mui/material";

import { useGetGroupInfoQuery } from "services/analytics";
import { useSelector, useDispatch } from "react-redux";
import { setFilter } from "rtkSlices/filterDevicesSlice";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { CircularProgress, ListItemText } from "@mui/material";
import HumidityIcon from "../../../../assets/icons/kpihicon.png";
import TemperatureIcon from "../../../../assets/icons/kpiticon.png";
import KpiQr from "../../../../assets/icons/kpiqr.png";
import Drawer from "@mui/material/Drawer";
import Filters from "../../Default/Asset Views/Settings";
import { makeStyles, withStyles } from "@mui/styles";
import Rensair from "../../../../assets/icons/rensair-logo.png";
import CloseIcon from "@mui/icons-material/Close";
import CloudLogo from "../../../../assets/icons/cloud_logo.svg";
import { ScatterPlotOutlined } from "@mui/icons-material";

export default function KPI(props) {
  // const StyledDrawer = withStyles({
  //   root: {
  //     position: 'fixed',
  //     zIndex: '1400 !important',
  //     right: '0px',
  //     bottom: '0px',
  //     top: '0px',
  //     left: '0px'
  //   }
  // })(Drawer);
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [datapoints, setDatapoints] = useState({});
  const kpiData = localStorage.getItem("kpiData")
    ? JSON.parse(localStorage.getItem("kpiData"))
    : [];
  const [selectedDatapoint, setSelectedDatapoint] = useState(
    checkForDatapoint() || null
  );
  console.log({ metaDataValue, filtersValue });
  const service = metaDataValue.services.find((s) => s.id == props.service);
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [drawer, setDrawer] = useState(false);
  const [refetch, setRefetch] = useState(true);
  const [intervalRef, setIntervalRef] = useState(null);

  const analytics = useGetGroupInfoQuery({
    token,
    id: props.service,
    parameters: `?mode=hourly&aggregation=[%22min%22,%22max%22,%22mean%22]&dataPoints=${JSON.stringify(
      props.sensors.map((e) => e.name)
    )}&aggregate=true${
      (service.group && service.group.id) ||
      (filtersValue.group && filtersValue.group.id)
        ? `&groupId=${service.group?.id || filtersValue.group?.id}`
        : ""
    }`,
  });

  useEffect(() => {
    if (!analytics.isFetching && analytics.isSuccess) {
      console.log(JSON.parse(JSON.stringify(analytics)));
      if (
        analytics?.data?.payload &&
        Object.keys(analytics.data.payload).length
      ) {
        setDatapoints(analytics?.data?.payload?.dataPoints);
        console.log({ datapoints });
        console.log({ selectedDatapoint });
        if (
          analytics?.data?.payload?.datapoints &&
          Object.keys(analytics?.data?.payload?.datapoints).length &&
          selectedDatapoint
        ) {
          if (
            !analytics?.data?.payload?.dataPoints?.[selectedDatapoint?.name]
          ) {
            setSelectedDatapoint(null);
          }
        }
        // !analytics?.data?.payload?.dataPoints.find((e) => e._id == selectedDatapoint)
      } else {
        setDatapoints({});
        setSelectedDatapoint(null);
      }
    }
  }, [analytics.isFetching]);

  useEffect(() => {
    console.log({ filtersValue });
    if (filtersValue.group.id) {
      if (kpiData.length) {
        const ind = kpiData.findIndex((k) => k.serviceId == props.service);
        if (ind != -1) {
          const tempKpiData = [...kpiData];
          tempKpiData[ind] = { ...tempKpiData[ind], filter: filtersValue };
          localStorage.setItem("kpiData", JSON.stringify(tempKpiData));
          dispatch(setFilter(filtersValue));
        }
      }
    } else {
      const selectedKpiData =
        kpiData.length && kpiData.find((k) => k.serviceId == props.service);
      if (selectedKpiData && !selectedKpiData.filter) {
        const ind = kpiData.findIndex((k) => k.serviceId == props.service);
        if (ind != -1) {
          const tempKpiData = [...kpiData];
          delete tempKpiData[ind].filter;
          localStorage.setItem("kpiData", JSON.stringify(tempKpiData));
        }
      }
    }
  }, [JSON.stringify(filtersValue)]);

  const handleClose = () => {
    setAnchorEl(null);
  };

  function checkForDatapoint() {
    const selectedKpiData =
      kpiData.length && kpiData.find((k) => k.serviceId == props.service);
    return selectedKpiData && selectedKpiData.customDatapoint
      ? selectedKpiData.customDatapoint
      : "";
  }

  useEffect(() => {
    const ind = kpiData.findIndex((k) => k.serviceId == props.service);
    if (ind == -1) {
      kpiData.push({
        popup: true,
        serviceId: props.service,
      });
      localStorage.setItem("kpiData", JSON.stringify(kpiData));
    } else {
      const tempKpiData = [...kpiData];
      tempKpiData[ind] = { ...tempKpiData[ind], popup: true };
      localStorage.setItem("kpiData", JSON.stringify(tempKpiData));
    }
    if (kpiData.length) {
      const selectedKpiData = kpiData.find((k) => k.serviceId == props.service);
      if (selectedKpiData.filter) {
        dispatch(setFilter(selectedKpiData.filter));
      }
    }
    const timerRef = setInterval(() => {
      analytics.refetch();
    }, 60000);
    setIntervalRef(timerRef);
    if (!props.layout) {
      if (service.group && service.group?.id) {
        dispatch(setFilter({ group: service.group }));
      } else {
        dispatch(setFilter({ group: { name: "All assets", id: "" } }));
      }
    }
    return () => {
      clearInterval(intervalRef);
    };
  }, []);

  const getAQIColor = (value) => {
    if (value >= 0 && value <= 50) {
      return "#39DD00";
    }
    if (value >= 51 && value <= 100) {
      return "#FF7E00";
    }
    if (value >= 101 && value <= 150) {
      return "#DD0000";
    }
    if (value >= 150) {
      return "#6600DD";
    }
  };
  const getCO2Color = (value) => {
    if (value >= 0 && value <= 800) {
      return "#39DD00";
    }
    if (value >= 800 && value <= 1000) {
      return "#FF7E00";
    }
    if (value >= 1000 && value <= 2000) {
      return "#DD0000";
    }
    if (value >= 2000) {
      return "#6600DD";
    }
  };
  const getPMColor = (value) => {
    if (value >= 0 && value <= 5) {
      return "#39DD00";
    }
    if (value >= 5 && value <= 15) {
      return "#FF7E00";
    }
    if (value >= 15 && value <= 35.4) {
      return "#DD0000";
    }
    if (value >= 35.4) {
      return "#6600DD";
    }
  };

  const openPopover = Boolean(anchorEl);
  const id = openPopover ? "simple-popover" : undefined;

  const toggleDrawer = () => {
    setDrawer(!drawer);
  };

  return (
    <Fragment>
      <div>
        <span>
          <CloseIcon
            sx={{
              position: "absolute",
              right: "20px",
              top: "12px",
              cursor: "pointer",
              color: "lightgrey",
            }}
            onClick={() => {
              // localStorage.removeItem("kpiData")
              const ind = kpiData.findIndex(
                (k) => k.serviceId == props.service
              );
              if (ind != -1) {
                const tempKpiData = [...kpiData];
                tempKpiData[ind] = {
                  ...tempKpiData[ind],
                  popup: false,
                  serviceDashboard: true,
                };
                localStorage.setItem("kpiData", JSON.stringify(tempKpiData));
              }
              props.history.push(`/solutions/${props.service}`);
            }}
          />
        </span>

        <div
          style={{
            margin: "30px 10px 0 0",
          }}
        >
          <div
            style={{
              marginBottom: "10px",
              width: "62%",
              fontSize: "18px",
              fontWeight: "bold",
              cursor: "pointer",
            }}
            onClick={() => {
              dispatch(setFilter({ view: "2", open: true }));
              toggleDrawer();
            }}
          >
            Hello {filtersValue.group?.id ? filtersValue.group.name : ""}
          </div>
          <Grid container style={{ display: "flex" }}>
            <Grid
              item
              xs={12}
              md={8}
              style={{ display: "flex" }}
              order={{ xs: 1, md: 0 }}
            >
              <Grid
                item
                style={{
                  display: "flex",
                  border: "3px solid #ffd100",
                  borderRadius: 6,
                  margin: "5px 0px",
                  padding: "5px 10px",
                  width: "300px",
                }}
              >
                <div style={{ width: "85%" }}>
                  <div>Temperature &#176;C</div>
                  <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                    {analytics.isFetching ? (
                      <span
                        style={{
                          color: "#b3b3b3",
                          fontWeight: 100,
                          fontSize: "13px",
                        }}
                      >
                        Loading ...
                      </span>
                    ) : (
                      datapoints?.Temperature?.mean?.toFixed(2) || "N/A"
                    )}
                  </div>
                </div>
                <div style={{ width: "15%" }}>
                  {/* <ThermostatIcon /> */}
                  <img src={TemperatureIcon} />
                </div>
              </Grid>
              <Grid
                item
                style={{
                  display: "flex",
                  border: "3px solid #ffd100",
                  borderRadius: 6,
                  margin: "5px 10px",
                  padding: "5px 10px",
                  width: "300px",
                }}
              >
                <div style={{ width: "85%" }}>
                  <div>Relative Humidity</div>
                  <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                    {analytics.isFetching ? (
                      <span
                        style={{
                          color: "#b3b3b3",
                          fontWeight: 100,
                          fontSize: "13px",
                        }}
                      >
                        Loading ...
                      </span>
                    ) : (
                      datapoints?.Humidity?.mean?.toFixed(2) || "N/A"
                    )}
                  </div>
                </div>
                <div style={{ width: "15%" }}>
                  {/* <WaterDropIcon /> */}
                  <img src={HumidityIcon} />
                </div>
              </Grid>
              <Grid
                item
                style={{
                  display: "flex",
                  border: "3px solid #ffd100",
                  borderRadius: 6,
                  margin: "5px 10px",
                  padding: "5px 10px",
                  width: "300px",
                  cursor: "pointer",
                }}
                onClick={(e) => {
                  setAnchorEl(e.currentTarget);
                  setOpen(!open);
                }}
              >
                <div style={{ width: "85%" }}>
                  <div>
                    {selectedDatapoint
                      ? selectedDatapoint.friendlyName
                      : "Select a datapoint"}
                  </div>
                  <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                    {analytics.isFetching ? (
                      <span
                        style={{
                          color: "#b3b3b3",
                          fontWeight: 100,
                          fontSize: "13px",
                        }}
                      >
                        Loading ...
                      </span>
                    ) : selectedDatapoint ? (
                      datapoints[selectedDatapoint?.name]?.mean?.toFixed(2) ||
                      ""
                    ) : (
                      ""
                    )}
                  </div>
                </div>
                <div style={{ width: "15%" }}>
                  <ScatterPlotOutlined sx={{ width: "100%", height: "100%" }} />
                </div>
                {!analytics.isFetching && datapoints && (
                  <Popover
                    id={id}
                    open={open}
                    handleClose={handleClose}
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "left",
                    }}
                    PaperProps={{
                      style: {
                        maxHeight: "400px",
                        top: "10px",
                        width: "300px",
                      },
                    }}
                  >
                    <List>
                      {service.sensors.map((s) => {
                        return (
                          <ListItem disablePadding>
                            <ListItemButton
                              onClick={() => {
                                setSelectedDatapoint(s);
                                const ind = kpiData.findIndex(
                                  (k) => k.serviceId == props.service
                                );
                                if (ind != -1) {
                                  const tempKpiData = [...kpiData];
                                  tempKpiData[ind] = {
                                    ...tempKpiData[ind],
                                    customDatapoint: s,
                                  };
                                  localStorage.setItem(
                                    "kpiData",
                                    JSON.stringify(tempKpiData)
                                  );
                                }
                              }}
                            >
                              <ListItemText primary={s.friendlyName} />
                            </ListItemButton>
                          </ListItem>
                        );
                      })}
                    </List>
                  </Popover>
                )}
              </Grid>
            </Grid>

            <Grid
              item
              xs={12}
              md={4}
              style={{ textAlign: "end" }}
              order={{ xs: 0, md: 1 }}
            >
              <img
                src={CloudLogo}
                style={{
                  maxWidth: "120px",
                  maxHeight: "70px",

                  // position: "absolute",
                  // right: "4vh",
                  // top: "40px",
                }}
              />
            </Grid>
          </Grid>
          <Grid
            container
            spacing={2}
            style={{
              display: "flex",
              alignItems: "center",
              margin: "20px 0px",
            }}
          >
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
              style={{ paddingRight: "1rem", paddingLeft: "0px" }}
            >
              <Grid
                style={{
                  lineHeight: 2,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  minHeight: "24rem",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>AQI</div>
                <div style={{ fontSize: "23px" }}>[Air Quality Index]</div>
                <div
                  style={{
                    fontSize: "160px",
                    color: getAQIColor(Math.round(datapoints?.AQI?.mean)),
                    marginTop: "-20px",
                    marginBottom: "20px",
                    height: "200px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                  }}
                >
                  {analytics.isFetching ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <CircularProgress size={60} />
                    </div>
                  ) : Math.round(datapoints?.AQI?.mean) ? (
                    Math.round(datapoints?.AQI?.mean)
                  ) : Math.round(datapoints?.AQI?.mean) == 0 ? (
                    Math.round(datapoints?.AQI?.mean)
                  ) : (
                    "N/A"
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#39DD00",
                    }}
                  >
                    0-50
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#FF7E00",
                    }}
                  >
                    51-100
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#DD0000",
                    }}
                  >
                    101-150
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#6600DD",
                    }}
                  >
                    151-200
                  </div>
                </div>
              </Grid>
            </Grid>
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
              style={{ paddingRight: "1rem", paddingLeft: "0px" }}
            >
              <Grid
                style={{
                  lineHeight: 2,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  minHeight: "24rem",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>
                  PM 2.5
                </div>
                <div style={{ fontSize: "23px" }}>[Particulate Matter]</div>
                <div
                  style={{
                    fontSize: "160px",
                    color: getPMColor(Math.round(datapoints?.PM2_5?.mean)),
                    marginTop: "-20px",
                    marginBottom: "20px",
                    height: "200px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                  }}
                >
                  {analytics.isFetching ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <CircularProgress size={60} />
                    </div>
                  ) : Math.round(datapoints?.PM2_5?.mean) ? (
                    Math.round(datapoints?.PM2_5?.mean)
                  ) : Math.round(datapoints?.PM2_5?.mean) == 0 ? (
                    Math.round(datapoints?.PM2_5?.mean)
                  ) : (
                    "N/A"
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#39DD00",
                    }}
                  >
                    0-5
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#FF7E00",
                    }}
                  >
                    5-15
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#DD0000",
                    }}
                  >
                    15-35.4
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#6600DD",
                    }}
                  >
                    35.4-55
                  </div>
                </div>
              </Grid>
            </Grid>
            <Grid
              item
              md={4}
              sm={6}
              xs={12}
              style={{ paddingRight: "1rem", paddingLeft: "0px" }}
            >
              <Grid
                style={{
                  lineHeight: 2,
                  textAlign: "center",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "10px",
                  minHeight: "24rem",
                }}
              >
                <div style={{ fontSize: "24px", fontWeight: "bold" }}>CO2</div>
                <div style={{ fontSize: "23px" }}>[Carbon-di-oxide]</div>
                <div
                  style={{
                    fontSize: "160px",
                    color: getCO2Color(Math.round(datapoints?.CO2?.mean)),
                    marginTop: "-20px",
                    marginBottom: "20px",
                    height: "200px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                  }}
                >
                  {analytics.isFetching ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        width: "100%",
                        height: "100%",
                      }}
                    >
                      <CircularProgress size={60} />
                    </div>
                  ) : Math.round(datapoints?.CO2?.mean) ? (
                    Math.round(datapoints?.CO2?.mean)
                  ) : Math.round(datapoints?.CO2?.mean) == 0 ? (
                    Math.round(datapoints?.CO2?.mean)
                  ) : (
                    "N/A"
                  )}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#39DD00",
                    }}
                  >
                    0-800
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#FF7E00",
                    }}
                  >
                    800-1000
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#DD0000",
                    }}
                  >
                    1000-2000
                  </div>
                  <div
                    style={{
                      padding: "2px 5px",
                      width: "90px",
                      color: "white",
                      backgroundColor: "#6600DD",
                    }}
                  >
                    2000-5000
                  </div>
                </div>
              </Grid>
            </Grid>
          </Grid>
          <Grid container>
            <Grid item md={6} sm={6} xs={12}>
              <Grid container>
                <Grid item xs={3} style={{ display: "flex" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <div
                        style={{
                          height: "25px",
                          backgroundColor: "#39DD00",
                        }}
                      ></div>
                    </Grid>
                    <Grid item xs={6}>
                      <div>Good</div>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={3} style={{ display: "flex" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <div
                        style={{
                          height: "25px",
                          backgroundColor: "#FF7E00",
                        }}
                      ></div>
                    </Grid>
                    <Grid item xs={6}>
                      <div
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Moderate
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={3} style={{ display: "flex" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <div
                        style={{
                          height: "25px",
                          backgroundColor: "#DD0000",
                        }}
                      ></div>
                    </Grid>
                    <Grid item xs={6}>
                      <div>Poor</div>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={3} style={{ display: "flex" }}>
                  <Grid container spacing={1}>
                    <Grid item xs={6}>
                      <div
                        style={{
                          height: "25px",
                          backgroundColor: "#6600DD",
                        }}
                      ></div>
                    </Grid>
                    <Grid item xs={6}>
                      <div>Unhealthy</div>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid container style={{ alignItems: "end" }}>
            <Grid item md={6} sm={12}>
              <div
                style={{
                  display: "flex",
                  textAlign: "start",
                  marginTop: "1rem",
                }}
              >
                <div
                  style={{
                    fontWeight: "bold",
                    color: "rgba(0,0,0,0.5)",
                    marginRight: "8px",
                  }}
                >
                  Today
                </div>
                <div style={{ color: "rgba(0,0,0,0.5)", marginRight: "8px" }}>
                  {new Date().toLocaleDateString()}
                </div>
                <div style={{ color: "rgba(0,0,0,0.5)" }}>
                  {new Date().toLocaleTimeString()}
                </div>
              </div>
            </Grid>
            <Grid item md={6} sm={12}>
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    display: "flex",
                    gap: "15px",
                    justifyContent: "end",
                    alignItems: "end",
                  }}
                >
                  <div style={{ fontWeight: "bold" }}>
                    This building's indoor Air Quality is managed by{" "}
                  </div>
                  <div>
                    {" "}
                    <span>
                      <img src={Rensair} style={{ width: "210px" }} />
                    </span>
                  </div>
                  <div>
                    {" "}
                    <span>
                      <img
                        src={KpiQr}
                        style={{
                          backgroundColor: "#a5a5a5",
                          width: "120px",
                          height: "120px",
                        }}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </Grid>
          </Grid>
        </div>
      </div>

      <Drawer anchor={"right"} open={drawer} onClose={toggleDrawer}>
        <Filters
          sensors={props.sensors}
          toggleDrawer={toggleDrawer}
          id={props.service}
          history={props.history}
          serviceDashboard={true}
        />
      </Drawer>
    </Fragment>
  );
}
