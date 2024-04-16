//-----------------CORE---------------//
import { Card, CardContent, CircularProgress } from "@mui/material";
import React, { useState, Fragment, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Chart from "./Chart";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import { useGetEMAggregationForTrendQuery } from "services/monitoring";
import Loader from "components/Progress";
import Select from "@mui/material/Select";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import MenuItem from "@mui/material/MenuItem";
import dayjs from "dayjs";
import PersonIcon from "@mui/icons-material/Person";
import RoofingIcon from "@mui/icons-material/Roofing";
import FunctionsIcon from "@mui/icons-material/Functions";
import Tooltip from "@mui/material/Tooltip";

export default function EnergyComparison({
  fullScreen,
  setFullScreen,
  sensors,
  selectedDay,
  startDate,
  endDate,
  serviceId,
  unit,
  cost,
  refetch,
  setRefetch,
  target,
  permission,
  configSensors,
  cutoff,
  divideByPara,
  setDivideByPara,
}) {
  console.log({target, selectedDay})
  let token = localStorage.getItem("token");
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const metaDataValue = useSelector((state) => state.metaData);
  const [data, setData] = useState({});
  const filtersValue = useSelector((state) => state.filterDevice);
  const service = metaDataValue.services.find((s) => s.id == serviceId);

  const [energyStartTime, setEnergyStartTime] = useState(cutoff
    ? new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
    : new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours())))

  const [energyEndTime, setEnergyEndTime] = useState(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())))


  const [open, setOpen] = React.useState(false);
  // const [dataPoint, setDataPoint] = React.useState(service.trend.defaultDatapoint.name);
  const [datapoint, setDatapoint] = useState(
    service.trend?.defaultDatapoint?.name || sensors[0].name
  );
  const [aggregationType, setAggregationType] = useState(
    service.trend?.defaultAggregation || "mean"
  );
  const aggregation = useGetEMAggregationForTrendQuery(
    {
      token,
      groupId: serviceId,
      params: `?mode=hourly&aggregation=["${aggregationType}"]&aggregationType=${
        // service?.widgetDatapoints?.aggregationType || "sum"
        "sum"
      }&dataPoint=${datapoint}&dateFrom=${new Date(
        new Date(energyStartTime).setSeconds(0)
      ).toISOString()}&dateTo=${new Date(
        new Date(energyEndTime).setSeconds(0)
      ).toISOString()}${
        filtersValue.group.id && `&groupId=${filtersValue.group.id}`
      }${unit == "$" ? `&cost=${cost}` : ``}&divideByGroupPara=${divideByPara}`,
    },
    { skip: !serviceId }
  );
  const [aggregatedData, setAggregatedData] = React.useState({});

  useEffect(() => {
    setData({});
  }, [filtersValue.group.id]);

  useEffect(() => {
    setEnergyStartTime(cutoff
      ? new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours()))
      : new Date(new Date(new Date(new Date(startDate).setMonth(new Date(startDate).getMonth())).setFullYear(new Date(startDate.getFullYear()))).setHours(new Date(startDate).getHours())))

    setEnergyEndTime(new Date(new Date(new Date(new Date(endDate).setMonth(new Date(endDate).getMonth())).setFullYear(new Date(endDate.getFullYear()))).setHours(new Date(endDate).getHours())))


  }, [selectedDay, startDate, endDate, cutoff]);

  useEffect(() => {
    if (!aggregation.isFetching && aggregation.isSuccess) {
      setAggregatedData(aggregation.data.payload.data);
      let temp = aggregation.data.payload.data;
      let result = {};
      Object.keys(temp).forEach((t) => {
        result[t] = [];
        temp[t].forEach((d) => {
          let day = new Date(d.current.time).getDay();
          let hour = getHour(d.current.time) + ":00:00";
          console.log({hour, d})
          result[t].push({
            time: d.current.time
              ? selectedDay == 7
                ? days[day]
                : selectedDay == 1
                ? tConvert(hour)
                : new dayjs(d.current.time).format("DD/MM/YYYY")
              : "",
            // current: d.current[datapoint == "PowerFactor" || datapoint == "ACVoltage" ? 'mean' : 'sumOfReadings'] || 0,
            // historic: d.historic[datapoint == "PowerFactor" || datapoint == "ACVoltage" ? 'mean' : 'sumOfReadings'] || 0,
            current: parseFloat(d.current[aggregationType]?.toFixed(2)) || 0,
            historic: parseFloat(d.historic[aggregationType]?.toFixed(2)) || 0,
          });
        });
      });
      setData(result);
      console.log({result})
    }
  }, [aggregation.isFetching]);

  useEffect(() => {
    setData({});
  }, [selectedDay]);

  useEffect(() => {
    if (refetch) {
      aggregation.refetch();
      setRefetch(false);
    }
  }, [refetch]);

  function getHour(time) {
    return new Date(time).getHours().toString()?.length == 1
      ? "0" + new Date(time).getHours().toString()
      : new Date(time).getHours().toString();
  }

  function tConvert(time) {
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

    if (time?.length > 1) {
      // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join("").replaceAll(":00:00", " "); // return adjusted time or original string
  }

  return (
    <Card
      style={{
        // minHeight: "265px",
        verticalAlign: "middle",
        position: "relative",
        width: fullScreen ? "100%" : "60%",
        height: fullScreen ? "calc(100vh - 170px)" : "23vh",
      }}
    >
      <CardContent style={{ padding: "6px 16px 24px 16px", height: "100%" }}>
        <p
          style={{
            color: "#bfbec8",
            fontSize: "15px",
            display: "flex",
            alignItems: "center",
            gap: "5px"
          }}
        >
          <b>Energy Comparison</b>
          <span>{divideByPara == "perperson" ? "(per occupant)" : divideByPara == "persquaremeter" ? "(per area-m2)" : null}</span>
        </p>
        <div
          style={{
            position: "absolute",
            background: metaDataValue.branding.primaryColor,
            borderRadius: "10px",
            right: "60px",
            top: "6px",
          }}
        >
          <Select
            value={datapoint}
            onChange={(e) => setDatapoint(e.target.value)}
            onClick={() => setOpen((prev) => !prev)}
            open={open}
            id="trendMonitor-datapoints"
            style={{
              height: "30px",
              width: "200px",
              background: "rgb(105,107,114,0.1)",
              paddingRight: "5px",
              color: "white",
              borderRadius: "10px",
            }}
            IconComponent={() => (
              <ArrowDropDownIcon
                style={{
                  position: "absolute",
                  right: "3px",
                  cursor: "pointer",
                }}
              />
            )}
          >
            {(permission == "ALL"
              ? [...sensors, ...configSensors]
              : sensors
            ).map((elm) => (
              <MenuItem value={elm.name}>{elm.friendlyName}</MenuItem>
            ))}
            {/* {(sensors
                ).map((elm) => (
                  <MenuItem value={elm.name}>{elm.friendlyName}</MenuItem>
                ))} */}
          </Select>
        </div>
        {aggregation.isFetching ? (
          <Loader />
        ) : Object.keys(data)?.length ? (
          <Chart
            name="Energy"
            types={[{name:"historic", label:"H"},{name: "current", label: "C"}]}
            fullScreen={fullScreen}
            data={data}
            selectedDay={selectedDay}
            color={metaDataValue.branding.primaryColor}
            target={parseInt(target[selectedDay])}
            em={true}
          />
        ) : (
          <div
            style={{
              fontSize: "18px",
              width: "100%",
              height: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#999",
            }}
          >
            No Data found
          </div>
        )}
        {/* {datapoint != "EnergyConsumption" ? (
          <span
            style={{
              fontSize: "10px",
              color: "grey",
              opacity: "0.5",
              position: "absolute",
              top: "10px",
              right: "220px",
            }}
          >
            ( Averages )
          </span>
        ) : null} */}

        {(datapoint === "ActivePower" || datapoint === "EnergyConsumption") && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              height: "32px",
              borderRadius: "10px",
              width: "110px",
              border: "1px solid lightgrey",
              position: "absolute",
              top: "6px",
              right: "440px",
            }}
          >
            <Tooltip
              title={"Show per square meter consumption"}
              placement="top"
              arrow
            >
              <RoofingIcon
                sx={{
                  cursor: "pointer",
                  marginTop: "5px",
                  width: "25%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                fontSize="small"
                color={
                  divideByPara === "persquaremeter" ? "success" : "disabled"
                }
                onClick={() => setDivideByPara("persquaremeter")}
              />
            </Tooltip>
            <Tooltip
              title={"Show per Occupant consumption"}
              placement="top"
              arrow
            >
              <PersonIcon
                sx={{
                  cursor: "pointer",
                  marginTop: "5px",
                  width: "25%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                fontSize="small"
                color={divideByPara === "perperson" ? "primary" : "disabled"}
                onClick={() => setDivideByPara("perperson")}
              />
            </Tooltip>
            <Tooltip title={"Show cumulative usage"} placement="top" arrow>
              <FunctionsIcon
                sx={{
                  cursor: "pointer",
                  marginTop: "5px",
                  width: "25%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
                fontSize="small"
                color={divideByPara === "none" ? "primary" : "disabled"}
                onClick={() => setDivideByPara("none")}
              />
            </Tooltip>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            height: "32px",
            borderRadius: "10px",
            width: "150px",
            border: "1px solid lightgrey",
            position: "absolute",
            top: "6px",
            right: "280px",
          }}
        >
          <div
            style={{
              color: "grey",
              width: "25%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "9px",
              cursor: "pointer",
              borderRight: "1px solid lightgrey",
              borderTopLeftRadius: "10px",
              borderBottomLeftRadius: "10px",
              backgroundColor:
                aggregationType == "sumOfReadings" &&
                metaDataValue.branding.primaryColor,
              color: aggregationType == "sumOfReadings" && "white",
            }}
            onClick={() => {
              if (aggregationType != "sumOfReadings") {
                setAggregationType("sumOfReadings");
                setData({});
              }
            }}
          >
            Sum
          </div>
          <div
            style={{
              color: "grey",
              width: "25%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "9px",
              cursor: "pointer",
              borderRight: "1px solid lightgrey",
              backgroundColor:
                aggregationType == "mean" &&
                metaDataValue.branding.primaryColor,
              color: aggregationType == "mean" && "white",
            }}
            onClick={() => {
              if (aggregationType != "mean") {
                setAggregationType("mean");
                setData({});
              }
            }}
          >
            Avg
          </div>
          <div
            style={{
              color: "grey",
              width: "25%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "9px",
              cursor: "pointer",
              borderRight: "1px solid lightgrey",
              backgroundColor:
                aggregationType == "min" && metaDataValue.branding.primaryColor,
              color: aggregationType == "min" && "white",
            }}
            onClick={() => {
              if (aggregationType != "min") {
                setAggregationType("min");
                setData({});
              }
            }}
          >
            Min
          </div>
          <div
            style={{
              color: "grey",
              width: "25%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              fontSize: "9px",
              cursor: "pointer",
              borderTopRightRadius: "10px",
              borderBottomRightRadius: "10px",
              backgroundColor:
                aggregationType == "max" && metaDataValue.branding.primaryColor,
              color: aggregationType == "max" && "white",
            }}
            onClick={() => {
              if (aggregationType != "max") {
                setAggregationType("max");
                setData({});
              }
            }}
          >
            Max
          </div>
        </div>
      </CardContent>
      {fullScreen ? (
        <FullscreenExitIcon
          style={{
            cursor: "pointer",
            position: "absolute",
            top: "10px",
            right: "10px",
          }}
          onClick={() => setFullScreen("")}
          // onClick={() => setOpen(false)}
        />
      ) : (
        <FullscreenIcon
          style={{
            cursor: "pointer",
            position: "absolute",
            top: "10px",
            right: "10px",
          }}
          onClick={() => setFullScreen(1)}
          // onClick={() => setOpen(true)}
        />
      )}
    </Card>
  );
}
