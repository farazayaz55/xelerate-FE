//--------------CORE------------------------//
import React, { Fragment, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
//--------------MUI------------------------//
import Card from "@mui/material/Card";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import CircularProgress from "@mui/material/CircularProgress";
import Zoom from "@mui/material/Zoom";
import { styled } from "@mui/material/styles";
import { tooltipClasses } from "@mui/material/Tooltip";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers";
import TextField from "@mui/material/TextField";
import { DatePicker, TimePicker } from "antd";
import dayjs from "dayjs";
const { RangePicker } = DatePicker;
//--------------MUI ICONS------------------------//
import BarChartIcon from "@mui/icons-material/BarChart";
import TimelineIcon from "@mui/icons-material/Timeline";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import { BorderlessTableOutlined } from "@ant-design/icons";
import InfoIcon from "@mui/icons-material/Info";
//--------------EXTERNAL------------------------//
import Chart from "components/Charts/Trend Monitor";
import Chart2 from "components/Charts/Trend Monitor/line";
import MapChart from "components/Charts/Trend Monitor/heatmap";
import Loader from "components/Progress";
import noData from "assets/img/lineChart.png";
import { useGetServiceAnalyticsQuery } from "services/analytics";
import { getSocket } from "Utilities/socket";
import "./style.css";
import { Box, Tooltip } from "@mui/material";
import { makeStyles } from "@mui/styles";
import zIndex from "@mui/material/styles/zIndex";
import EnumerationChart from "./EnumerationChart";
import { useGetReadingsQuery } from "services/monitoring";
import { useGetEnumerationAnalyticsQuery } from "services/analytics";
import { HorizontalSplit, HorizontalSplitOutlined } from "@mui/icons-material";
import { StackedBarChartOutlined } from "@mui/icons-material";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "rgb(246, 255, 201)",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: "100%",
    fontSize: theme.typography.pxToRem(16),
    border: "1px solid #dadde9",
  },
  [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: "rgba(0,0,0,0)",
    color: "#f5f5f9",
  },
}));

const useStyles = makeStyles((theme) => ({
  hidden: {
    display: "flex",
    [theme.breakpoints.down("1600")]: {
      display: "none",
    },
  },
  hidden2: {
    display: "flex",
    [theme.breakpoints.down("1520")]: {
      display: "none",
    },
  },
}));

export default function TrendMonitor(props) {
  console.log({ props });
  const styles = useStyles();
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == props.id);
  const filtersValue = useSelector((state) => state.filterDevice);

  const defaultDatapoint = metaDataValue.services.find((s) => s.id == props.id)
    .trend?.defaultDatapoint?.name;
  const { enqueueSnackbar } = useSnackbar();
  const [enumeration, setEnumeration] = React.useState(false);

  const [dateTo, setDateTo] = React.useState(() => {
    let date = new Date();
    date.setHours(date.getHours());
    return date.toISOString();
  });
  const [dateFrom, setDateFrom] = React.useState(
    new Date(new Date().setDate(new Date().getDate() - 1)).toISOString()
  );
  const [dataPoint, setDataPoint] = React.useState(
    filtersValue.sensors
      ? defaultDatapoint &&
        filtersValue.sensors.find((s) => s.name == defaultDatapoint)
        ? defaultDatapoint
        : filtersValue.sensors[0].name
      : defaultDatapoint || props.sensors[0]?.name
  );
  const [open, setOpen] = React.useState(false);
  const [data, setData] = React.useState([]);
  const [unit, setUnit] = React.useState("");
  const [mode, setMode] = React.useState("line");
  const [datePicker, setDatePicker] = React.useState(false);
  const [aggregationType, setAggregationType] = React.useState(
    service.trend?.defaultAggregation || "readingPerHour"
  );
  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }
  const readings = useGetReadingsQuery({
    id: props.id,
    parameter: `?currentPage=1&pageSize=50&dataPoint=${dataPoint}`,
  });
  const [dates, setDates] = React.useState(null);
  const [value, setValue] = React.useState(null);

  const [endDate, setEndDate] = React.useState(new Date());
  const [startDate, setStartDate] = React.useState(
    new Date(
      new Date(new Date().setDate(new Date().getDate() - 6)).setHours(
        0,
        0,
        0,
        0
      )
    )
  );
  const dateFormat = "DD/MM/YYYY";

  useEffect(() => {
    setDataPoint(
      filtersValue.sensors
        ? defaultDatapoint &&
          filtersValue.sensors.find((s) => s.name == defaultDatapoint)
          ? defaultDatapoint
          : filtersValue.sensors[0].name
        : defaultDatapoint || props.sensors[0]?.name
    );
  }, [JSON.stringify(filtersValue)]);

  const analyticsRes = useGetServiceAnalyticsQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    dataPoint,
    parameters: `&dateFrom=${
      mode == "heatmap" ? startDate.toISOString() : dateFrom
    }&dateTo=${
      mode == "heatmap"
        ? new Date(
            new Date(endDate).setHours(new Date(endDate).getHours(), 0, 0, 0)
          ).toISOString()
        : dateTo
    }&groupId=${filtersValue.group.id}&assetTypes=${filtersValue.assetTypes}&MeasurementFilter=${filtersValue.measurement}&connected=${filtersValue.connection}&alarms=${filtersValue.alarms}`,
  }, {skip: (enumeration && (mode == "enumeration"))});

  const enumerationRes = useGetEnumerationAnalyticsQuery({
    token: window.localStorage.getItem("token"),
    id: props.id,
    dataPoint,
    parameters: `&dateFrom=${
      mode == "heatmap" ? startDate.toISOString() : dateFrom
    }&dateTo=${
      mode == "heatmap"
        ? new Date(
            new Date(endDate).setHours(new Date(endDate).getHours(), 0, 0, 0)
          ).toISOString()
        : dateTo
    }&groupId=${filtersValue.group.id}&assetTypes=${filtersValue.assetTypes}&MeasurementFilter=${filtersValue.measurement}&connected=${filtersValue.connection}&alarms=${filtersValue.alarms}`,
  }, {skip: (mode && mode != "enumeration")});

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  function generateLimit() {
    let res = { min: null, max: null };
    let sensor = props.dataPointThresholds.find(
      (e) => e.dataPoint?.name == dataPoint
    );
    if (sensor && sensor?.ranges.length)
      res = {
        min: sensor.ranges[0].min,
        max: sensor.ranges[sensor.ranges.length - 1].max,
      };
    else if (sensor)
      res = {
        min: sensor.min,
        max: sensor.max,
      };
    else {
      if (!analyticsRes.isFetching && analyticsRes.isSuccess) {
        if (analyticsRes?.data?.payload?.data) {
          const filtered = analyticsRes?.data?.payload?.data.filter(
            (data) => data[`${aggregationType}`] !== null
          );
          res = {
            min: filtered[0][`${aggregationType}`],
            max: filtered[0][`${aggregationType}`],
          };
          filtered.forEach((data) => {
            if (data[`${aggregationType}`] > res.max) {
              res = {
                ...res,
                max: data[`${aggregationType}`],
              };
            }
            if (data[`${aggregationType}`] < res.min) {
              res = {
                ...res,
                min: data[`${aggregationType}`],
              };
            }
          });
        } else {
          res = {
            min: 0,
            max: 100,
          };
        }
      } else {
        res = {
          min: 0,
          max: 100,
        };
      }
    }
    return res;
  }

  function getHour(time) {
    return new Date(time).getHours().toString()?.length == 1
      ? "0" + new Date(time).getHours().toString()
      : new Date(time).getHours().toString();
  }

  function tConvert(time) {
    time = time
      .toString()
      .match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];
    if (time.length > 1) {
      // If time format correct
      time = time.slice(1); // Remove full string match value
      time[5] = +time[0] < 12 ? "AM" : "PM"; // Set AM/PM
      time[0] = +time[0] % 12 || 12; // Adjust hours
    }
    return time.join("").replaceAll(":00:00", " "); // return adjusted time or original string
  }

  useEffect(() => {
    if (!analyticsRes.isFetching && analyticsRes.isSuccess) {
      let tempData = [];
      if (analyticsRes.data.payload?.data) {
        // if (enumeration) {
          // setData({})
          
        // } else {
          analyticsRes.data.payload.data.forEach((elm) => {
            // if(enumeration){
            //   let hour = getHour(elm.date) + ":00:00";
            //   let arr = [];
            //   enumeration.forEach(type=>{
            //     if(obj[type.label]){
            //       obj[type.label] = obj[type.label] + 1;
            //     }
            //     else{
            //       obj[type.label] = 1;
            //     }
            //   })
            //   // tempData.push(obj)
            // }
            if (elm.date) {
              tempData.push({
                date:
                  mode === "heatmap"
                    ? elm.date
                    : new Date(elm.date).setSeconds(0),
                value: hasDecimal(elm[aggregationType])
                  ? parseFloat(elm[aggregationType]?.toFixed(2))
                  : elm[aggregationType],
              });
            }
          });
        // }
        setUnit(analyticsRes.data.payload.unit);
      }
      setData(tempData);
      console.log({ tempData });
    }
    if (analyticsRes.isError) {
      showSnackbar(
        "Trend Monitor",
        analyticsRes.error?.data?.message,
        "error",
        1000
      );
      setData([]);
    }
  }, [analyticsRes.isFetching]);

  useEffect(()=>{
    if(!enumerationRes.isFetching && enumerationRes.isSuccess){
      let options = filtersValue.sensors
      ? filtersValue.sensors
      : props.permission == "ALL"
      ? [
        ...new Map(
          [...props.sensors, ...props.configSensors].map((item) => [
            item._id,
            item,
          ])
          ).values(),
        ]
        : props.sensors;
        const dp = options.find((dp) => dp.name == dataPoint);
        console.log({enumeration})

        let tempData = [];
        for(let i=0; i<24; i++){
          let hour = tConvert(getHour(new Date(dateFrom).setHours(new Date(dateFrom).getHours() + i)) + ":00:00");
          let obj = {time: hour}
          enumeration.metaData.forEach((type) => {
            obj[type.label] = 0
          })
          obj["Other"] = 0
          tempData.push(obj)
        }
        console.log({tempData})
        
        enumerationRes.data.payload.forEach((elm) => {
          let hour = tConvert(getHour(elm.time) + ":00:00");
          let foundType = false
          enumeration.metaData.forEach((type) => {
            if(foundType){
             return 
            }
            foundType = dp.type == "multiState"
            ? (type.value == elm.reading.value)
            : elm.reading.value >= type.min &&
              elm.reading.value <= type.max;

            console.log(
              { foundType },
              type,
              elm,
              type.value == elm.reading.value
            );
            if(foundType) {
              if(tempData.find((a) => a.time == hour))
              tempData.find((a) => a.time == hour)[
                type.label
              ] = tempData.find((a) => a.time == hour)[type.label] + 1
            }
          })

          if(!foundType){
            console.log("PUSHING TO OTHERS")
            console.log({elm})
            if (tempData.find((a) => a.time == hour)) {
              tempData.find((a) => a.time == hour)["Other"] = tempData.find((a) => a.time == hour)["Other"] + 1
            }
          }
        });
        console.log({tempData})
        setData(tempData)

        //   enumeration.metaData.forEach((type) => {
        //     // let arr = []
        //     enumerationRes.data.payload.forEach((elm) => {
        //       let hour = tConvert(getHour(elm.time) + ":00:00");
        //       let foundType =
        //         dp.type == "multiState"
        //           ? (type.value == elm.reading.value)
        //           : elm.reading.value >= type.min &&
        //             elm.reading.value <= type.max;
        //       // console.log(
        //       //   { foundType },
        //       //   type,
        //       //   elm,
        //       //   type.value == elm.reading.value
        //       // );
        //       if (foundType) {
        //         if (tempData.find((a) => a.time == hour)) {
        //           tempData.find((a) => a.time == hour)[
        //             type.label
        //           ] = tempData.find((a) => a.time == hour)[type.label]
        //             ? tempData.find((a) => a.time == hour)[type.label] + 1
        //             : 1;
        //         } else {
        //           tempData = [
        //             ...tempData,
        //             { time: tConvert(hour), [type.label]: 1 },
        //           ];
        //         }
        //       } else {
        //         if (tempData.find((a) => a.time == hour)) {
        //           tempData.find((a) => a.time == hour)["Other"] = tempData.find(
        //             (a) => a.time == hour
        //           )["Other"]
        //             ? tempData.find((a) => a.time == hour)["Other"] + 1
        //             : 1;
        //         } else {
        //           tempData = [...tempData, { time: tConvert(hour), Other: 1 }];
        //         }
        //       }
        //     });
        //     // tempData[type.label] = arr;
        //   });
        //   console.log({tempData})
        //   setData(tempData.reverse())
    }
  },[enumerationRes.isFetching])

  function generateBackground(datapoint) {
    let res;
    let found = props.dataPointThresholds.find(
      (e) => e.dataPoint?.name == datapoint
    );
    if (found) {
      let code = [...found.colorArray];
      if (found.reverse) code.reverse();
      if (found?.ranges?.length) {
        let totalRange =
          found.ranges[found.ranges.length - 1].max - found.ranges[0].min;
        res = "linear-gradient(to right";
        found.ranges.forEach((range, i) => {
          res +=
            ", " +
            code[i] +
            " " +
            Math.trunc(((range.max - found.ranges[0].min) / totalRange) * 100) +
            "%";
        });
      } else {
        res = `linear-gradient(to right,${code.join(", ")})`;
      }
    } else {
      res = `linear-gradient(to right, #FFBF00, #FF0000)`;
    }
    return res;
  }

  async function handleChange(e) {
    if(!props.aq){
      let options = filtersValue.sensors
      ? filtersValue.sensors
      : props.permission == "ALL"
      ? [
          ...new Map(
            [...props.sensors, ...props.configSensors].map((item) => [
              item._id,
              item,
            ])
          ).values(),
        ]
      : props.sensors;
    const dp = options.find((dp) => dp.name == e.target.value);
    if (dp.type == "multiState" || dp.type == "rangeLabel") {
      setEnumeration(options.find((dp) => dp.name == e.target.value));
      setMode("enumeration");
    } else {
      setEnumeration(false);
      setData([])
      setMode("line");
    }
    }
    let dateTo = new Date();
    dateTo.setHours(dateTo.getHours() - 1);
    let dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - 1);
    setDateTo(dateTo.toISOString());
    setDateFrom(dateFrom.toISOString());
    setDataPoint(e.target.value);
    const connector = await getSocket([
      `devices__${props.id}`,
      `alarms__${props.id}`,
      `analyticsAggregation-${e.target.value}__${props.id}`,
      `deviceDashboardHealth__${props.id}`,
      `deviceDashboardConnectivity__${props.id}`,
    ]);
    connector.emit("updateFilter", e.target.value);
  }

  const handleDateChange = (value) => {
    let start, end;

    if (value) {
      end = new Date(value);
      start = new Date(
        new Date(new Date(end).setDate(new Date(end).getDate() - 6)).setHours(
          0,
          0,
          0,
          0
        )
      );
    } else if (!value) {
      end = new Date();
      start = new Date(
        new Date(new Date(end).setDate(new Date(end).getDate() - 6)).setHours(
          0,
          0,
          0,
          0
        )
      );
    }
    setStartDate(start);
    setEndDate(end);
    setDatePicker(false);
  };

  return (
    <Card
      style={{
        maxHeight: props.height ? `${props.height}px` : "fit-content",
        minHeight: props.height ? `${props.height}px` : "auto",
        height: "100%",
        minWidth: "590px",
        position: "relative",
        borderRadius: props.height ? "10px" : "4px",
      }}
    >
      <div style={{ padding: "10px", height: "100%" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              display: "flex",
              gap: "15px",
              flex: 1,
              alignItems: "center",
              marginLeft: "5px",
            }}
          >
            <p
              style={{
                display: "flex",
                gap: "5px",
                color: "#bfbec8",
                fontSize: "15px",
              }}
            >
              <b>Trend Monitor</b>

              <HtmlTooltip
                title={
                  <Fragment>
                    <div
                      style={{
                        color: "grey",
                        width: "370px",
                        padding: "5px 10px",
                      }}
                    >
                      <div style={{ fontWeight: "bold", marginBottom: "7px" }}>
                        Trend Monitor
                      </div>
                      <p style={{ marginBottom: "4px" }}>
                        Useful for glancing over general trends of individual
                        data points over the past 24-hour period.
                      </p>

                      <p>
                        Chosen aggregation method is applied to converge the
                        data of individual asset’s selected datapoint into
                        hourly bins. In case of multiple assets in a chosen
                        group, these hourly trends are combined together into
                        single trend by using same aggregation method{" "}
                      </p>
                    </div>
                  </Fragment>
                }
                placement="top"
                arrow
                transitionComponent={Zoom}
              >
                <InfoIcon />
              </HtmlTooltip>
              {service.assets.length > 1 ? (
                <span className={styles.hidden}>
                  <p>for</p>
                  {!filtersValue?.percist?.assetTypes ||
                  filtersValue?.percist?.assetTypes?.length ==
                    service.assets.length ? (
                    <p>All Assets</p>
                  ) : filtersValue.percist.assetTypes.length == 1 ? (
                    <p>
                      {
                        service.assets.find(
                          (asset) =>
                            asset.id == filtersValue.percist.assetTypes[0]
                        )?.name
                      }
                    </p>
                  ) : (
                    <p style={{ cursor: "pointer" }}>
                      <HtmlTooltip
                        title={
                          <Fragment>
                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {filtersValue.percist.assetTypes.map((id) => (
                                <span key={id}>
                                  {
                                    service.assets.find(
                                      (asset) => asset.id == id
                                    ).name
                                  }
                                </span>
                              ))}
                            </div>
                          </Fragment>
                        }
                        placement="bottom"
                        arrow
                        transitionComponent={Zoom}
                      >
                        Multiple Assets
                      </HtmlTooltip>
                    </p>
                  )}
                </span>
              ) : null}
            </p>
          </span>

          
          {!enumeration || (enumeration && enumeration.type != "multiState") ? <div
              style={{
                height: "32px",
                width: !enumeration ? "100px" : "110px", 
                justifyContent: "space-between",
                alignItems: "center",
                background: "rgb(105,107,114,0.1)",
                borderRadius: "20px",
                padding: "0px 10px",
                position: "absolute",
                top: "10px",
                right: !enumeration || (enumeration && mode != "enumeration") ? "394px" : "220px",
              }}
              className={styles.hidden2}
            >
              {(!enumeration ? [
                { id: "line", icon: TimelineIcon },
                { id: "bar", icon: BarChartIcon },
                { id: "heatmap", icon: BorderlessTableOutlined },
              ] : 
              [
                { id: "line", icon: TimelineIcon },
                { id: "bar", icon: BarChartIcon },
                { id: "heatmap", icon: BorderlessTableOutlined },
                { id: "enumeration", icon: HorizontalSplit },
              ] 
              
              ).map((e) => (
                <div
                  style={{
                    background:
                      mode == e.id ? metaDataValue.branding.primaryColor : "",
                    height: "20px",
                    width: "20px",
                    borderRadius: "50%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "0.5s",
                  }}
                  id={e.id}
                  onClick={() => {
                    // if(e.id != "enumeration"){
                    //   setEnumeration(false);
                    // }
                    setMode(e.id)}}
                >
                  <e.icon
                    style={{
                      color:
                        mode == e.id
                          ? "white"
                          : metaDataValue.branding.primaryColor,
                      height: "14px",
                      width: "14px",
                    }}
                  />
                </div>
              ))}
            </div>
             : null}

          <div style={{ display: "flex", gap: "20px" }}>
          {!enumeration || (enumeration && mode != "enumeration") ? <div
              style={{
                display: "flex",
                justifyContent: "center",
                height: "30px",
                borderRadius: "10px",
                width: "150px",
                border: "1px solid lightgrey",
                position: "absolute",
                top: "10px",
                right: "228px",
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
                    let tempData = [];
                    analyticsRes.data.payload.data.forEach((elm) => {
                      if (elm.date)
                        tempData.push({
                          date:
                            mode === "heatmap"
                              ? elm.date
                              : new Date(elm.date).setSeconds(0),
                          value: hasDecimal(elm["sumOfReadings"])
                            ? parseFloat(elm["sumOfReadings"].toFixed(2))
                            : elm["sumOfReadings"],
                        });
                    });
                    setData(tempData);
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
                    aggregationType == "readingPerHour" &&
                    metaDataValue.branding.primaryColor,
                  color: aggregationType == "readingPerHour" && "white",
                }}
                onClick={() => {
                  if (aggregationType != "readingPerHour") {
                    setAggregationType("readingPerHour");
                    let tempData = [];
                    analyticsRes.data.payload.data.forEach((elm) => {
                      if (elm.date)
                        tempData.push({
                          date: new Date(elm.date).setSeconds(0),
                          value: hasDecimal(elm["readingPerHour"])
                            ? parseFloat(elm["readingPerHour"].toFixed(2))
                            : elm["readingPerHour"],
                        });
                    });
                    setData(tempData);
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
                    aggregationType == "min" &&
                    metaDataValue.branding.primaryColor,
                  color: aggregationType == "min" && "white",
                }}
                onClick={() => {
                  if (aggregationType != "min") {
                    setAggregationType("min");
                    let tempData = [];
                    analyticsRes.data.payload.data.forEach((elm) => {
                      if (elm.date)
                        tempData.push({
                          date:
                            mode === "heatmap"
                              ? elm.date
                              : new Date(elm.date).setSeconds(0),
                          value: hasDecimal(elm["min"])
                            ? parseFloat(elm["min"].toFixed(2))
                            : elm["min"],
                        });
                    });
                    setData(tempData);
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
                    aggregationType == "max" &&
                    metaDataValue.branding.primaryColor,
                  color: aggregationType == "max" && "white",
                }}
                onClick={() => {
                  if (aggregationType != "max") {
                    setAggregationType("max");
                    let tempData = [];
                    analyticsRes.data.payload.data.forEach((elm) => {
                      if (elm.date) {
                        tempData.push({
                          date:
                            mode === "heatmap"
                              ? elm.date
                              : new Date(elm.date).setSeconds(0),
                          value: hasDecimal(elm["max"])
                            ? parseFloat(elm["max"].toFixed(2))
                            : elm["max"],
                        });
                      }
                    });
                    setData(tempData);
                  }
                }}
              >
                Max
              </div>
            </div> : null}
            <div
              style={{
                position: "relative",
                background: metaDataValue.branding.primaryColor,
                borderRadius: props.height ? "10px" : "4px",
              }}
            >
              {analyticsRes.isFetching || enumerationRes.isFetching ? (
                <span
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "30px",
                  }}
                >
                  <CircularProgress
                    style={{
                      color: "white",
                      width: "17px",
                      height: "17px",
                    }}
                  />
                </span>
              ) : null}
              <Select
                value={dataPoint}
                disabled={analyticsRes.isFetching}
                onChange={handleChange}
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
                {(filtersValue.sensors
                  ? filtersValue.sensors
                  : props.permission == "ALL"
                  ? [
                      ...new Map(
                        [
                          ...props.sensors,
                          ...props.configSensors,
                        ].map((item) => [item._id, item])
                      ).values(),
                    ]
                  : props.sensors
                ).map((elm) => (
                  <MenuItem value={elm.name}>{elm.friendlyName}</MenuItem>
                ))}
              </Select>
            </div>
          </div>
        </div>
        {!analyticsRes.isFetching ? (
          data.length ? (
            <Fragment>
              {mode == "bar" ? (
                  <Chart
                    name="Trend-Monitor"
                    height={props.height ? `${props.height - 60}px` : `170px`}
                    data={data}
                    unit={unit}
                    id={props.id}
                    dataPointThresholds={props.dataPointThresholds}
                    dataPoint={dataPoint}
                  />
              ) : 
              mode == "enumeration" ? 
              !enumerationRes.isFetching ?
              <EnumerationChart
                    name="Trend"
                    height={"200px"}
                    types={enumeration.metaData.map((e) => {
                      return {
                        name: e.label,
                        value:
                          enumeration.type == "rangeLabel"
                            ? `${e.min} - ${e.max}`
                            : e.value,
                      };
                    })}
                    dataPointThresholds={props.dataPointThresholds}
                    dataPoint={dataPoint}
                    fullScreen={""}
                    data={data}
                    color={metaDataValue.branding.primaryColor}
                    target={10000}
                  /> : <span
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
                </span> :
              mode == "line" ? (
                <Chart2
                  name="Trend-Monitor"
                  height={props.height ? `${props.height - 60}px` : `170px`}
                  data={data}
                  unit={unit}
                  id={props.id}
                  dataPointThresholds={props.dataPointThresholds}
                  dataPoint={dataPoint}
                />
              ) : (
                <MapChart
                  name="Trend-Monitor"
                  height={props.height ? `${props.height - 55}px` : `165px`}
                  date={endDate}
                  data={data}
                  unit={unit}
                  id={props.id}
                  dataPointThresholds={props.dataPointThresholds}
                  dataPoint={dataPoint}
                  min={generateLimit().min}
                  max={generateLimit().max}
                />
              )}
            </Fragment>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
                // marginTop: "30px",
              }}
            >
              <img src={noData} height="80px" width="80px" />
              <p style={{ color: "#c7c7c7", marginBottom: "15px" }}>
                No data found
              </p>
            </div>
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
      {props.dataPointThresholds.find((e) => e.dataPoint?.name == dataPoint) ||
      mode == "heatmap" ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            gap: "20px",
            position: "absolute",
            width: "100%",
            left: "0px",
            bottom: "-3px",
            padding: "0 15px",
            marginBottom: "2px",
          }}
        >
          {mode === "heatmap" ? (
            <div style={{ postion: "relative" }}>
              <p
                style={{
                  fontSize: "12px",
                  color: "#bfbec8",
                  marginBottom: "2.5px",
                }}
              >
                Data for Last 7 Days up to{" "}
                <span
                  onClick={() => {
                    setDatePicker(!datePicker);
                  }}
                  style={{
                    fontWeight: "bold",
                    textDecoration: "underline",
                    cursor: "pointer",
                    color: "darkgray",
                  }}
                >
                  {dayjs(endDate).format("DD/MM/YYYY")}
                </span>
              </p>
              {/* Date Picker */}
              <div
                style={{
                  position: "absolute",
                  bottom: "20px",
                  marginLeft: "20px",
                  zIndex: "10 !important",
                }}
              >
                {datePicker && (
                  <Box
                    sx={{ display: "flex", alignItems: "center", gap: "6px" }}
                  >
                    <Box>
                      <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DateTimePicker
                          inputFormat="dd/MM/yyyy h:mm:ss aaa"
                          renderInput={({
                            inputRef,
                            inputProps,
                            InputProps,
                          }) => (
                            <Box ref={inputRef}>
                              <div></div>
                            </Box>
                          )}
                          value={endDate}
                          open
                          onChange={(value) => {
                            if (
                              value.getHours() !== endDate.getHours() ||
                              value.getMinutes() !== endDate.getMinutes()
                            ) {
                              handleDateChange(value);
                            }
                          }}
                        />
                      </LocalizationProvider>
                      {/* <DatePicker
                      showTime = {{
                        defaultValue: dayjs(dayjs(endDate), "HH:mm"),
                        format: "HH:mm"
                        
                      }}
                      showNow
                        value={dayjs(dayjs(endDate), dateFormat)}
                        onChange={(value, dateString) => {
                          handleDateChange(value, dateString);
                        }}
                        size="small"
                    /> */}
                    </Box>
                  </Box>
                )}
              </div>
            </div>
          ) : (
            <p
              style={{
                fontSize: "12px",
                color: "#bfbec8",
                marginBottom: "2.5px",
              }}
            >
              Note: Last 24 hours aggregates
            </p>
          )}
          {!enumeration || (enumeration && (mode != "enumeration")) ? <div
            style={{
              display: "flex",
              gap: "5px",
              alignItems: "center",
              opacity: "0.5",
              marginBottom: "1px",
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
              {Math.round(Number(generateLimit().min) * 100) / 100}
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
              {Math.round(Number(generateLimit().max) * 100) / 100}
            </p>
          </div> : null}
        </div>
      ) : null}
    </Card>
  );
}