//--------------CORE------------------------//
import React, { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
//--------------MUI ICON------------------------//
import TimelineIcon from "@mui/icons-material/Timeline";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
//--------------EXTERNAL------------------------//
import Chart from "components/Charts/Trend Monitor";
import Loader from "components/Progress";
import noData from "assets/img/lineChart.png";
import { useGetServiceAnalyticsQuery } from "services/analytics";
import "./style.css";

export default function TrendMonitor(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const filtersValue = useSelector((state) => state.filterDevice);
  const { enqueueSnackbar } = useSnackbar();
  const [dateTo, setDateTo] = React.useState(new Date().toISOString());
  const [dateFrom, setDateFrom] = React.useState(
    new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  );
  const [dataPoint, setDataPoint] = React.useState(props.sensors[0]?.name);
  const [data, setData] = React.useState([]);
  const [unit, setUnit] = React.useState("");
  const [selectedSensor, setSelectedSensor] = React.useState(props.sensors[0]);
  const [start, setStart] = React.useState(true);
  const [end, setEnd] = React.useState(false);
  const [arrows, setArrows] = React.useState(false);
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  const analyticsRes = useGetServiceAnalyticsQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    dataPoint,
    parameters: `&dateFrom=${dateFrom}&dateTo=${dateTo}&groupId=${filtersValue.group.id || props.groupId}`,
  });

  function updateDiv(scroll_pos) {
    var target = document.getElementById("scroll");

    var divWidth = target.scrollWidth - target.clientWidth;

    if (scroll_pos == 0) {
      setEnd(false);
      setStart(true);
      target.classList.remove("not-at-left");
    }

    if (scroll_pos > 0) {
      target.classList.add("not-at-left");
    }

    if (scroll_pos < divWidth) {
      target.classList.add("not-at-right");
    }

    if (scroll_pos >= divWidth) {
      setEnd(true);
      setStart(false);
      target.classList.remove("not-at-right");
    }
  }

  function scrollEvent(e) {
    e.preventDefault();
    e.stopPropagation();
    let item = document.getElementById("scroll");
    if (e.deltaY > 0) item.scrollLeft += 100;
    else item.scrollLeft -= 100;
    updateDiv(document.getElementById("scroll").scrollLeft);
  }

  useEffect(() => {
    document.getElementById("scroll").addEventListener("wheel", scrollEvent);
    var target = document.getElementById("scroll");
    if (target.scrollWidth > target.clientWidth) {
      target.classList.add("not-at-right");
      setArrows(true);
    }
    return () => {
      if(document
        .getElementById("scroll")){
          document
            .getElementById("scroll")
            .removeEventListener("wheel", scrollEvent);
        }
    };
  }, []);

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  useEffect(() => {
    if (analyticsRes.isSuccess) {
      let tempData = [];
      if (analyticsRes.data.payload?.data) {
        analyticsRes.data.payload.data.forEach((elm) => {
          if (elm.date && (elm.readingPerHour || elm.readingPerHour == 0))
            tempData.push({
              date: new Date(elm.date).setSeconds(0),
              value: hasDecimal(elm.readingPerHour)
                ? parseFloat(elm.readingPerHour.toFixed(2))
                : elm.readingPerHour,
            });
        });
        setUnit(analyticsRes.data.payload.unit);
      }
      setData(tempData);
    }
    if (analyticsRes.isError) {
      showSnackbar(
        "Trend Monitor",
        analyticsRes.error?.data?.message,
        "error",
        1000
      );
    }
  }, [analyticsRes.isFetching]);

  function generateBackground(datapoint) {
    let res;
    let found = props.dataPointThresholds.find(
      (e) => e.dataPoint?.name == datapoint
    );
    if (found) {
      let code = [...found.colorArray];
      if (found.reverse) code.reverse();
      res = `linear-gradient(to right,${code.join(", ")})`;
    }
    return res;
  }

  return (
    <div
      style={{
        maxHeight: "220px",
        minHeight: "220px",
        position: "relative",
        minWidth: "480px",
      }}
    >
      <div style={{ padding: "10px" }}>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <p
            style={{
              color: '#C1C1C1',
              fontSize: '14px'
            }}
          >
            Trend Monitor
          </p>
          <span
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {arrows ? (
              <ArrowBackIosIcon
                onClick={() => {
                  let item = document.getElementById("scroll");
                  item.scrollLeft -= 100;
                  updateDiv(document.getElementById("scroll").scrollLeft);
                }}
                style={{
                  cursor: "pointer",
                  color: start ? "#bfc4d8" : "grey",
                  marginRight: "5px",
                  height: "20px",
                  width: "20p",
                }}
              />
            ) : null}
            <div
              style={{
                overflowX: "hidden",
                position: "relative",
                maxWidth: "20vw",
              }}
            >
              <div class="inset-container" id="scroll">
                {props.sensors.map((elm) => (
                  <Chip
                    disabled={analyticsRes.isFetching && dataPoint != elm.name}
                    label={
                      <p
                        style={{
                          color: dataPoint == elm.name ? "white" : "",
                        }}
                      >
                        {elm.friendlyName}
                      </p>
                    }
                    size="small"
                    color="secondary"
                    variant="outlined"
                    style={{
                      backgroundColor:
                        dataPoint == elm.name
                          ? metaDataValue.branding.secondaryColor
                          : "",
                    }}
                    onClick={() => {
                      let dateTo = new Date();
                      let dateFrom = new Date();
                      dateFrom.setDate(dateFrom.getDate() - 1);
                      setDateTo(dateTo.toISOString());
                      setDateFrom(dateFrom.toISOString());
                      setDataPoint(elm.name);
                      setSelectedSensor(elm)
                    }}
                    clickable
                  />
                ))}
              </div>
            </div>
            {arrows ? (
              <ArrowForwardIosIcon
                onClick={() => {
                  let item = document.getElementById("scroll");
                  item.scrollLeft += 100;
                  updateDiv(document.getElementById("scroll").scrollLeft);
                }}
                style={{
                  cursor: "pointer",
                  color: end ? "#bfc4d8" : "grey",
                  height: "20px",
                  width: "20p",
                  marginLeft: "5px",
                }}
              />
            ) : null}
            <TimelineIcon style={{ color: "#bfbec8", marginLeft: "30px" }} />
          </span>
        </span>
        {!analyticsRes.isFetching ? (
          data.length < 1 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                marginTop: "30px",
              }}
            >
              <img src={noData} height="100px" width="100px" />
              <p style={{ color: "#c7c7c7" }}>No data found</p>
            </div>
          ) : (
            <span style={{ position: "relative", top: "10px" }}>
              {selectedSensor && <Chart
                name="Trend-Monitor"
                height={"180px"}
                data={data}
                unit={unit}
                id={props.id}
                dataPointThresholds={props.dataPointThresholds}
                dataPoint={dataPoint}
                sensor={selectedSensor._id}
              />}
            </span>
          )
        ) : (
          <span
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "190px",
              width: "100%",
            }}
          >
            <Loader />
          </span>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "20px",
          position: "absolute",
          width: "100%",
          left: "0px",
          bottom: "2px",
          padding: "0 15px",
        }}
      >
        <p style={{ fontSize: "12px", color: "#bfbec8" }}>
          Note: Last 24 hours averages
        </p>

        {props.dataPointThresholds.find(
          (e) => e.dataPoint?.name == dataPoint
        ) ? (
          <div
            style={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
              opacity: "0.5",
            }}
          >
            <p
              style={{
                color: "",
                fontSize: "11px",
                position: "relative",
                top: "1px",
              }}
            >
              {
                props.dataPointThresholds.find(
                  (e) => e.dataPoint?.name == dataPoint
                ).min
              }
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                background: generateBackground(dataPoint),
                opacity: "0.7",
                borderRadius: "20px",
                width: "80px",
                height: "10px",
              }}
            />
            <p
              style={{
                color: "",
                fontSize: "11px",
                position: "relative",
                top: "1px",
              }}
            >
              {
                props.dataPointThresholds.find(
                  (e) => e.dataPoint?.name == dataPoint
                ).max
              }
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
