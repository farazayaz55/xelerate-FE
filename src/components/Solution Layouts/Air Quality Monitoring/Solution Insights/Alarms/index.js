//--------------CORE------------------------//
import React, { Fragment, useEffect, useState } from "react";
import { useSelector } from "react-redux";
//--------------MUI------------------------//
import Chip from "@mui/material/Chip";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
//--------------MUI ICONS------------------------//
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
//--------------EXTERNAL------------------------//
import Accordion from "./Accordion";
import { useGetNumOfAlarmsQuery } from "services/devices";
import { useGetAlarmsQuery } from "services/alarms";
import Loader from "components/Progress";
import emitter from "Utilities/events";
import { Grid, Paper } from "@mui/material";
import styled from "@emotion/styled";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

let severityState = "CRITICAL";
export default function Alarms(props) {
  const [severity, setSeverity] = useState("CRITICAL");
  useEffect(()=>console.log("severity",severity),[severity])
  const metaDataValue = useSelector((state) => state.metaData);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [disabled, setDisable] = useState(false);
  const [alarms, setAlarms] = useState({
    CRITICAL: [],
    MAJOR: [],
    MINOR: [],
    WARNING: [],
  });
  const [expanded, setExpanded] = React.useState(false);
  const [totalPages, setTotalPages] = React.useState({
    CRITICAL: null,
    MAJOR: null,
    MINOR: null,
    WARNING: null,
  });
  const [page, setPage] = React.useState(1);
  const [alarmCounts, setAlarmCounts] = React.useState(null);
  const [invisible, setInvisible] = useState(true);
  const alarmsCountRes = useGetNumOfAlarmsQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    group: filtersValue.group.id,
  });
  const alarmsRes = useGetAlarmsQuery({
    token: window.localStorage.getItem("token"),
    params: `?status=["ACTIVE","ACKNOWLEDGED"]&pageSize=10&currentPage=${page}&withTotalPages=true&severity=${severity}&dateFrom=1970-01-01&serviceId=${props.id}&groupId=${filtersValue.group.id}&assetTypes=${filtersValue.assetTypes}&MeasurementFilter=${filtersValue.measurement}&connected=${filtersValue.connection}&alarms=${filtersValue.alarms}`,
  });

  // function updateCount(payload) {
  //   setAlarmCounts((prev) => {
  //     let oldCount = { ...prev };
  //     oldCount[payload.severity] = oldCount[payload.severity] - 1;
  //     return oldCount;
  //   });
  // }

  // function updateAlarm(payload, realtime) {
  //   setAlarms((prev) => {
  //     let tempAlarms = { ...prev };
  //     let arr = tempAlarms[payload.severity];
  //     let index = arr.findIndex((e) => e.alarmId == payload.alarmId);
  //     if (index != -1) {
  //       if (payload.status == "CLEARED") {
  //         arr.splice(index, 1);
  //       } else arr.splice(index, 1, payload);
  //     } else if (index == -1 && realtime == "CREATE") {
  //       arr.unshift(payload);
  //     }
  //     tempAlarms[severity] = arr;
  //     return tempAlarms;
  //   });
  // }

  // function callbackfn(payload) {
  //   if (payload.message.severity == severityState) {
  //     updateAlarm(payload.message, payload.realtimeAction);
  //   }
  //   if (payload.realtimeAction == "CREATE") updateCount(payload.message, 1);
  //   if (payload.message.status == "CLEARED") updateCount(payload.message, -1);
  // }

  // useEffect(() => {
  //   emitter.on("solution?alarms", callbackfn);

  //   return () => {
  //     emitter.off("solution?alarms", callbackfn);
  //     severityState = "CRITICAL";
  //   };
  // }, []);

  function setDisableStat(totalPages) {
    if (page >= totalPages) {
      setDisable(true);
    } else setDisable(false);
  }

  useEffect(() => {
    if (alarmsRes.isSuccess) {
      let tempPages = { ...totalPages };
      tempPages[severity] = alarmsRes.data?.payload?.totalPages;
      setDisableStat(alarmsRes.data?.payload?.totalPages);
      setTotalPages(tempPages);
      let tempAlarms;
      if (page == 1)
        tempAlarms = {
          CRITICAL: [],
          MAJOR: [],
          MINOR: [],
          WARNING: [],
        };
      else tempAlarms = { ...alarms };
      if (alarmsRes.data?.payload?.data)
        tempAlarms[severity] = [
          ...tempAlarms[severity],
          ...alarmsRes.data?.payload?.data,
        ];
      setAlarms(tempAlarms);
    }
  }, [alarmsRes.isFetching]);

  useEffect(() => {
    if (alarmsCountRes.isSuccess) {
      setAlarmCounts(alarmsCountRes.data?.payload);
      if (alarmsCountRes.data?.payload?.CRITICAL) {
        severityState = "CRITICAL";
        setSeverity("CRITICAL");
      } else if (alarmsCountRes.data?.payload?.MAJOR) {
        severityState = "MAJOR";
        setSeverity("MAJOR");
      } else if (alarmsCountRes.data?.payload?.MINOR) {
        severityState = "MINOR";
        setSeverity("MINOR");
      } else if (alarmsCountRes.data?.payload?.WARNING) {
        severityState = "WARNING";
        setSeverity("WARNING");
      }
      setInvisible(false);
    }
  }, [alarmsCountRes.isFetching]);

  function updateAlarmFn(elm, i) {
    let old = [...alarms[severity]];
    if (elm.status != "CLEARED") {
      let newAlarm = {...old[i], status: "ACKNOWLEDGED"}
      old.splice(i, 1, newAlarm);
    } else {
      console.log("Clearing Alarm")
      let oldCount = { ...alarmCounts };
      oldCount[elm.severity] = oldCount[elm.severity] - 1;
      setAlarmCounts(oldCount);
      old.splice(i, 1);
      props.setRefetch(true)
    }
    let temp = { ...alarms };
    temp[severity] = old;
    setAlarms(temp);
  }

  function handleMore() {
    if (page < totalPages[severity]) {
      setPage(page + 1);
      if (page + 1 >= totalPages[severity]) {
        setDisable(true);
      }
    }
  }

  function alarmsFn() {
    return (
      <Fragment>
        <div
          style={{
            width: "100%",
          }}
        >
          {alarms[severity]?.length == 0 ? (
            <div
              style={{
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
                  height: "150px",
                  width: "150px",
                }}
              >
                <NotificationsOffIcon
                  style={{ color: "#c7c7c7", fontSize: "100px" }}
                />
              </div>
              <p style={{ color: "#c8c8c8" }}>No alarms found</p>
            </div>
          ) : (
            <Fragment>
              <div
                style={{
                  height: !props.fullScreenModeOpen ? "calc(100vh - 770px)" : "72vh",
                  minHeight: !props.fullScreenModeOpen ? "50px" : "100%",
                  overflowY: "scroll",
                }}
              >
                {props.fullScreenModeOpen ? (
                  <Grid container spacing={2}>
                    {alarms[severity].map((elm, i) => (
                      <Grid item xs={12} sm={6} md={4} key={i} >
                        <Item style={{ padding: '0px' }}>
                          <Accordion
                            alarm={elm}
                            updateAlarm={updateAlarmFn}
                            severity={elm.severity}
                            expanded={expanded}
                            setExpanded={setExpanded}
                            index={i}
                            id={props.id}
                            history={props.history}
                            asset={props.asset}
                            permission={props.permission}
                            fullScreenModeOpen={props.fullScreenModeOpen}
                          />
                        </Item>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  alarms[severity].map((elm, i) => (
                    <Accordion
                      alarm={elm}
                      updateAlarm={updateAlarmFn}
                      severity={elm.severity}
                      expanded={expanded}
                      setExpanded={setExpanded}
                      index={i}
                      id={props.id}
                      history={props.history}
                      asset={props.asset}
                      permission={props.permission}
                      fullScreenModeOpen={props.fullScreenModeOpen}
                    />
                  ))
                )}
                {alarms.length != 0 && !disabled ? (
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "15px",
                    }}
                  >
                    {alarmsRes.isFetching ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          height: "46px",
                          width: "46px",
                          backgroundColor:
                            metaDataValue.branding.secondaryColor,
                        }}
                      >
                        <CircularProgress
                          size={20}
                          style={{ color: "white" }}
                        />
                      </div>
                    ) : (
                      <IconButton
                        color="secondary"
                        onClick={handleMore}
                        style={{
                          backgroundColor:
                            metaDataValue.branding.secondaryColor,
                        }}
                      >
                        <KeyboardArrowDownIcon
                          style={{
                            cursor: "pointer",
                            height: "30px",
                            width: "30px",
                            color: "white",
                          }}
                        />
                      </IconButton>
                    )}
                  </span>
                ) : null}
              </div>
            </Fragment>
          )}
        </div>
      </Fragment>
    );
  }

  const handleClick = (severityValue) => {
    console.log("handling click")
    setPage(1);
    setSeverity(severityValue);
    severityState = severityValue;
    setDisableStat(totalPages[severityValue]);
  };

  return (
    <Fragment>
      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          margin: "10px",
        }}
      >
        {[
          { name: "CRITICAL", color: "error" },
          { name: "MAJOR", color: "major" },
          { name: "MINOR", color: "warning" },
          { name: "INFO", color: "info" },
        ].map((elm) => {
          return (
            <Badge
              color={elm.color}
              badgeContent={
                alarmsCountRes.isSuccess && !invisible && alarmCounts
                  ? alarmCounts[elm?.name == "INFO" ? "WARNING" : elm.name]
                  : ""
              }
              invisible={
                !invisible
                  ? alarmsCountRes.isSuccess && !invisible && alarmCounts
                    ? alarmCounts[elm.name=="INFO"?"WARNING":elm.name] < 1
                    : true
                  : true
              }
            >
              <Chip
                color={elm.color}
                variant={
                  severity.indexOf(elm.name=="INFO"?"WARNING":elm.name) != -1 ? "filled" : "outlined"
                }
                icon={
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={
                      severity.indexOf(elm.name=="INFO"?"WARNING":elm.name) != -1
                        ? {
                          color: "white",
                        }
                        : {}
                    }
                  />
                }
                onClick={() => {
                  handleClick(elm.name == "INFO" ? "WARNING" : elm.name); //backend has warning we only display in FE
                }}
                clickable
                label={elm.name}
                style={{
                  color: severity.indexOf(elm.name=="INFO"?"WARNING":elm.name) != -1 ? "white" : "",
                  borderRadius: "10px",
                }}
              />
            </Badge>
          );
        })}
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {!alarmsRes.isFetching ? (
          alarmsFn()
        ) : (
          <div
            style={{
              marginTop: "10%",
            }}
          >
            <Loader />
          </div>
        )}
      </div>
    </Fragment>
  );
}
