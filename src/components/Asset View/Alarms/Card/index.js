import React, { useEffect, useState, Fragment } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import IconButton from "@mui/material/IconButton";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import Accordion from "../Accordion";
import Loader from "components/Progress";
import NotificationsOffIcon from "@mui/icons-material/NotificationsOff";
import { useGetAlarmsQuery } from "services/alarms";
import emitter from "Utilities/events";
import { useSelector } from "react-redux";

export default function Alarms(props) {
  let pageSize = 10;
  let token = window.localStorage.getItem("token");
  const [page, setPage] = useState(1);
  const device = useSelector((state) => state.asset.device);
  const sensors = device.esbMetaData && device.esbMetaData.datapoints && device.esbMetaData.datapoints.length ? props.sensors.filter(s=>device.esbMetaData.datapoints.includes(s.name)) : props.sensors;
  const sensorsFriendlyNames = sensors.map(s=>s.friendlyName)
  const [totalPages, setTotalPages] = useState(1);
  const fetchedAlarms = useGetAlarmsQuery({
    token,
    params: `?status=["ACTIVE","ACKNOWLEDGED"]&severity=${
      props.type
    }&pageSize=${pageSize}&withTotalPages=true&currentPage=${page}&source=${
      props.id || ""
    }&dateFrom=1970-01-01`,
  });
  const [alarms, setAlarms] = useState([]);
  const [count, setCount] = useState(0);

  function updateAlarm(payload) {
    setAlarms((prev) => {
      let arr = [...prev];
      let index = arr.findIndex((e) => e.alarmId == payload.alarmId);
      if (index != -1) {
        if (payload.status == "CLEARED") {
          arr.splice(index, 1);
        } else arr.splice(index, 1, payload);
      } else {
        arr.unshift(payload);
      }
      return arr;
    });
  }

  function updateCount(num) {
    setCount((prev) => prev + num);
  }

  useEffect(() => {
    function callbackfn(payload) {
      if (payload.message.severity == props.type) updateAlarm(payload.message);
      if (payload.realtimeAction == "CREATE") updateCount(1);
      if (payload.message.status == "CLEARED") updateCount(-1);
    }

    emitter.on("asset?alarms", callbackfn);

    return () => {
      emitter.off("asset?alarms", callbackfn);
    };
  }, []);

  function isJsonString(str) {
    let out;
    try {
      out = JSON.parse(str);
    } catch (e) {
      return str;
    }
    return out;
  }

  async function getAlarms() {
    if (!fetchedAlarms.isFetching && fetchedAlarms.isSuccess) {
      let res = JSON.parse(JSON.stringify(fetchedAlarms.data.payload.data));
      // res.forEach(r=>{
      //   if(isJsonString(r.text)){
      //     let friendlyName = JSON.parse(r.text).friendlyName;
      //     if(friendlyName){
      //       if(!sensorsFriendlyNames.includes(friendlyName)){
              
      //       }
      //     }
      //   }
      // })
      setCount(fetchedAlarms.data.payload.totalDocuments);
      setTotalPages(fetchedAlarms.data.payload.totalPages);
      setAlarms((prev) => {
        return [...prev, ...res];
      });
    }
  }

  function ifLoaded(state, component) {
    if (state)
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
            height: "300px",
          }}
        >
          <Loader />
        </div>
      );
    else return component();
  }

  useEffect(() => {
    getAlarms();
  }, [fetchedAlarms.isFetching]);

  const handlePageNext = () => {
    setPage(page + 1);
  };
  const handlePagePrevious = () => {
    setPage(page - 1);
  };

  function back(page) {
    let disabled;
    if (page != 0) disabled = false;
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

  const clearAlarm = (alarmId) => {
    const updatedAlarms = alarms.filter(alarm => alarm._id !== alarmId);
    setCount(count - 1);
    setAlarms(updatedAlarms);
  };


  function alarmsFn() {
    return (
      <Fragment>
        <CardContent>
          {alarms.length == 0 ? (
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
          ) : null}
          {alarms.map((alarm) => (
            <Accordion
              key={alarm.alarmId}
              alarm={alarm}
              permission={props.permission}
              alarmType={props.type}
              clear={(alarmId) => clearAlarm(alarmId)}
            />
          ))}
        </CardContent>

        {page >= totalPages || alarms.length == 0 ? null : (
          <IconButton
            size="medium"
            onClick={handlePageNext}
            style={{ position: "relative", left: "50%", marginBottom: "15px" }}
          >
            <KeyboardArrowDownIcon fontSize="inherit" />
          </IconButton>
        )}
      </Fragment>
    );
  }

  return (
    <Fragment>
      <Card
        style={{
          minHeight: "300px",
          position: "relative",
          margin: "50px 20px 20px 0px",
          marginTop: "50px",
          overflow: "visible",
        }}
      >
        <span>
          <Card
            style={{
              width: "90px",
              height: "90px",
              backgroundColor: props.color,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
              left: "20px",
              top: "0",
              transform: "translateY(-50%)",
            }}
          >
            <NotificationsActiveIcon
              style={{ color: "white", height: "35px", width: "35px" }}
            />
          </Card>
        </span>
        <span
          style={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            position: "relative",
            right: "20px",
            top: "10px",
            paddingBottom: "30px",
          }}
        >
          <p
            style={{
              color: "#6d6d6d",
              fontWeight: "bold",
              fontSize: "13px",
              marginRight: "20px",
              marginTop: "3px",
            }}
          >
            {props.type}
          </p>
          <h3>{count}</h3>
        </span>

        <div
          style={{
            height: "calc(50vh - 250px)",
            minHeight: "240px",
            overflow: "auto",
          }}
        >
          {ifLoaded(fetchedAlarms.isLoading, alarmsFn)}
        </div>
      </Card>
    </Fragment>
  );
}
