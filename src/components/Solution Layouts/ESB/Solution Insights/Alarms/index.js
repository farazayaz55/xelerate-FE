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

//
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';
import { useGetAlarmsCountQuery } from "services/alarms";
//
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

export default function Alarms(props) {
  const [severity, setSeverity] = useState("CRITICAL");
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
  // const alarmsCountRes = useGetNumOfAlarmsQuery({
  //   token: window.localStorage.getItem("token"),
  //   id: props.id,
  //   group: filtersValue.group.id,
  // });

  const alarmsCounts = useGetAlarmsCountQuery({
    token: window.localStorage.getItem("token"),
    status: '["ACTIVE","ACKNOWLEDGED"]',
    severity: '["CRITICAL","MAJOR","MINOR","WARNING"]',
    serviceId: props.id
  });

  const alarmsRes = useGetAlarmsQuery({
    token: window.localStorage.getItem("token"),
    params: `?status=["ACTIVE","ACKNOWLEDGED"]&pageSize=10&currentPage=${page}&withTotalPages=true&severity=${severity}&dateFrom=1970-01-01&serviceId=${props.id}&groupId=${filtersValue.group.id || props.groupId || ""}`,
  });

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
    if (alarmsCounts.isSuccess) {
      let legendObj = {}

      Object.keys(alarmsCounts.data?.payload).map((x, i) => {
        let category = x;
        let alarmsCount = alarmsCounts.data?.payload[x];
        let totalAlarmsCount = alarmsCount.ACKNOWLEDGED + alarmsCount.ACTIVE
        legendObj[x] = totalAlarmsCount

        if (Object.keys(alarmsCounts.data?.payload).length - 1 == i) {
          setAlarmCounts(legendObj)
          setInvisible(false);
        }
      })

    }
  }, [alarmsCounts.isFetching]);

  function updateAlarmFn(elm, i) {
    let old = [...alarms[severity]];
    if (elm.status != "CLEARED") {
      let time = new Date(elm.time);
      let newAlarm = {
        deviceName: elm.source.name,
        sensorId: elm.source.id,
        alarmId: elm.id,
        text: elm.text,
        severity: elm.severity,
        status: elm.status,
        time: time,
        count: elm.count,
        type: elm.type,
        generatedBy: elm.generatedBy,
      };
      old.splice(i, 1, newAlarm);
    } else {
      let oldCount = { ...alarmCounts };
      oldCount[elm.severity] = oldCount[elm.severity] - 1;
      setAlarmCounts(oldCount);
      old.splice(i, 1);
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
          {alarms[severity].length == 0 ? (
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
                // style={{
                //   height: "calc(100vh - 500px)",
                //   minHeight: "360px",
                //   overflowY: "scroll",
                // }}  
                style={{
                  // height: "calc(100vh - 500px)",
                  minHeight: "350px",
                  overflowY: "scroll",
                }}
              >
                <Grid container spacing={2}>
                  {alarms[severity].map((elm, i) => (

                    <Grid item xs={6} md={6}>
                      <Item>
                        <Accordion
                          alarm={elm}
                          updateAlarm={updateAlarmFn}
                          severity={elm.severity}
                          // expanded={expanded}
                          expanded={expanded}

                          setExpanded={setExpanded}
                          index={i}
                          id={props.id}
                          history={props.history}
                          asset={props.asset}
                          permission={props.permission}
                        />
                      </Item>
                    </Grid>




                  ))}
                  {/* <Grid item md={6}>
                      <Item>
                        <Accordion
                          alarm={elm}
                          updateAlarm={updateAlarmFn}
                          severity={elm.severity}
                          // expanded={expanded}
                          expanded={expanded}
                          setExpanded={setExpanded}
                          index={i}
                          id={props.id}
                          history={props.history}
                          asset={props.asset}
                          permission={props.permission}
                        />
                      </Item>
                    </Grid>
                    <Grid item md={6}>
                      <Item>
                        <Accordion
                          alarm={elm}
                          updateAlarm={updateAlarmFn}
                          severity={elm.severity}
                          // expanded={expanded}
                          expanded={expanded}
                          setExpanded={setExpanded}
                          index={i}
                          id={props.id}
                          history={props.history}
                          asset={props.asset}
                          permission={props.permission}
                        />
                      </Item>
                    </Grid> */}
                </Grid>

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
    setPage(1);
    setSeverity(severityValue);
    setDisableStat(totalPages[severityValue]);
  };

  useEffect(() => {
    handleClick('MAJOR')
  }, [])

  return (
    <Fragment>

      <div
        style={{
          display: "flex",
          gap: "20px",
          justifyContent: "center",
          alignItems: "center",
          margin: "0 10px",
          paddingBottom: "10px",
        }}
      >
        {[
          { name: "CRITICAL", color: "error" },
          { name: "MAJOR", color: "major" },
          { name: "MINOR", color: "warning" },
          { name: "WARNING", color: "info" },
        ].map((elm) => {
          return (
            <Badge
              color={elm.color}
              badgeContent={
                alarmsCounts.isSuccess && !invisible && alarmCounts
                  ? alarmCounts[elm.name]
                  : ""
              }
              invisible={
                !invisible
                  ? alarmsCounts.isSuccess && !invisible && alarmCounts
                    ? alarmCounts[elm.name] < 1
                    : true
                  : true
              }
            >
              <Chip
                color={elm.color}
                variant={
                  severity.indexOf(elm.name) != -1 ? "filled" : "outlined"
                }
                icon={
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={
                      severity.indexOf(elm.name) != -1
                        ? {
                          color: "white",
                        }
                        : {}
                    }
                  />
                }
                onClick={() => {
                  handleClick(elm.name);
                }}
                clickable
                label={elm.name}
                style={{
                  color: severity.indexOf(elm.name) != -1 ? "white" : "",
                  borderRadius: "10px",
                }}
              />
            </Badge>
          );
        })}

      </div>



      {/* CHANGED SECTION */}
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
              display: "flex",
              height: "calc(100vh - 500px)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Loader />
          </div>
        )}
      </div>
    </Fragment>
  );
}
