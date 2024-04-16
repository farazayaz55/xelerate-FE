import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import { Divider } from "@mui/material";
import Loader from "components/Progress";
import Button from "@mui/material/Button";
import Datapoints from "./Datapoints";
import Freeform from "components/Charts/Freeform";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import InputBase from "@mui/material/InputBase";
import { useSnackbar } from "notistack";
import { useGetAnalyticsQuery } from "services/analytics";
import { useGetEventsQuery } from "services/events";
import { setFreeformChart } from "rtkSlices/freeformChartSlice";
import "./loader.css";
import { useGetOperationsQuery } from "services/controlling";
import { useSelector } from "react-redux";

let updated = { dateChange: false, index: null };
let loadedIndex;
let currentIndex;
export default function VideoAnalytics(props) {
  let controlValues;
  let token = window.localStorage.getItem("token");
  const freeformChart = useSelector((state) => {
    return state.freeformChart;
  });
  const { enqueueSnackbar } = useSnackbar();
  const [deleted, setDeleted] = useState(false);
  const [startTime, setStartTime] = useState(
    new Date().setDate(new Date().getDate() - 1)
  );
  const device = useSelector((state) => state.asset.device);
  console.log({device})
  const dispatch = useDispatch();
  const [disabled, setDisabled] = useState([]);
  const [expanded, setExpanded] = useState(`panel0`);
  const [endTime, setEndTime] = useState(new Date());
  const [seriesData, setSeriesData] = useState([]);
  const [chartName, setChartName] = useState("");
  const [series, setSeries] = useState([]);
  const [loadedSeries, setLoadedSeries] = useState("");
  const [dateChange, setDateChange] = useState(false);
  const [datetime, setDatetime] = useState("");
  const [deviceName, setDeviceName] = useState("")
  const analytics = useGetAnalyticsQuery(
    {
      token,
      id: loadedSeries?.device || props.deviceId,
      dataPoint: loadedSeries?.datapoint,
      parameters: datetime,
    },
    { skip: !loadedSeries || loadedSeries?.actuator || deleted }
  );

  // const operationRes = useGetOperationsQuery(
  //   {
  //     token,
  //     id: props.deviceId || loadedSeries?.device,
  //     params: `?actuatorId=${loadedSeries?.actuator?._id}${datetime}`,
  //   },
  //   { skip: !loadedSeries?.actuator }
  // );

  useEffect(() => {
    return () => {
      dispatch(setFreeformChart(null));
    };
  }, []);

  const operationRes = useGetEventsQuery(
    {
      token,
      // params: `?type=c8y_ControlUpdate&source=${
      //   props.deviceId || loadedSeries?.device
      // }&metaDataFilter={"metaData.actuatorName":${loadedSeries?.actuator?.name},"metaData.status":""SUCCESSFUL"}${datetime}`,
      params: `?type=c8y_ControlUpdate&source=${
        props.deviceId || loadedSeries?.device
      }&metaDataFilter={"metaData.status":"SUCCESSFUL" ,"metaData.actuatorName":"${
        loadedSeries?.actuator?.name
      }"}${datetime}`,
    },
    { skip: !loadedSeries?.actuator || deleted }
  );

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (!analytics.isFetching && analytics.isSuccess) {
      if (analytics.data?.payload && analytics.data?.payload?.time) {
        if (updated.index == series.length - 1) {
          updated = { dateChange: false, index: null };
        } else {
          updated.index = updated.index + 1;
        }
        updateChart(loadedSeries);
      } else {
        let tempSeries = [...series];
        tempSeries[currentIndex]
          ? (tempSeries[currentIndex].failed = true)
          : null;
        setSeries(tempSeries);
        loadedIndex = loadedIndex - 1;
        showSnackbar("Analytics", "No data found", "info", 1000);
      }
    }
    if (!analytics.isFetching && analytics.isError) {
      let tempSeries = [...series];
      tempSeries[currentIndex]
        ? (tempSeries[currentIndex].failed = true)
        : null;
      setSeries(tempSeries);
      loadedIndex = loadedIndex - 1;
      showSnackbar("Analytics", analytics.error?.data?.message, "error", 1000);
    }
  }, [analytics.isFetching]);

  useEffect(() => {
    if (!operationRes.isFetching && operationRes.isSuccess) {
      if (operationRes.data?.payload) {
        let temp = [];
        if (!operationRes.data.payload?.data.length) {
          showSnackbar("Operations", "No data found", "info", 1000);
        } else {
          operationRes.data.payload.data.forEach((elm) => {
            if (loadedSeries.actuator.type == "thermostat") {
              temp.push({
                [loadedSeries.actuator.name]: generateValue(
                  elm.metaData.action
                ),
                date: new Date(elm.time).valueOf(),
              });
            }
            if (loadedSeries.actuator.type == "power") {
              let val =
                loadedSeries.actuator.metaData.Default.Value ==
                elm.metaData.action
                  ? 0
                  : 1;
              temp.push({
                [loadedSeries.actuator.name]: val,
                date: new Date(elm.time).valueOf(),
              });
            }
          });
          controlValues = temp;
          if (updated.index == series.length - 1) {
            updated = { dateChange: false, index: null };
          } else {
            updated.index = updated.index + 1;
          }
          updateChart(loadedSeries);
        }
      } else {
        showSnackbar("Operations", "No data found", "info", 1000);
      }
    }
    if (!operationRes.isFetching && operationRes.isError) {
      showSnackbar(
        "Operations",
        operationRes.error?.data?.message,
        "error",
        1000
      );
    }
  }, [operationRes.isFetching]);

  function generateValue(fetchedVAlue) {
    let command = loadedSeries.actuator.metaData.Command;
    let index = command.indexOf("{range}");
    let first = command.substring(0, index);
    let temp = command.substring(index + 1);
    let last = temp.substring(temp.indexOf("}") + 1);
    let firstIndex;
    if (first.length) firstIndex = fetchedVAlue.indexOf(first);
    else firstIndex = 0;
    let lastIndex;
    if (last.length) lastIndex = fetchedVAlue.indexOf(last);
    else lastIndex = command.length - 1;
    let value = parseInt(
      fetchedVAlue.substring(firstIndex + first.length, lastIndex)
    );
    return value;
  }

  const handleStartDate = (val) => {
    setDateChange(true);
    // if (val != "Invalid Date") {
    setDateChange(true);
    setStartTime(val);
    // }
  };

  const handleEndDate = (val) => {
    setDateChange(true);
    // if (val != "Invalid Date") {
    setDateChange(true);
    setEndTime(val);
    // }
  };

  const updateSeries = () => {
    setDateChange(false);
    setLoadedSeries(series[0]);
    setDatetime(
      `&dateFrom=${new Date(
        new Date(startTime).setSeconds(0)
      ).toISOString()}&dateTo=${new Date(
        new Date(endTime).setSeconds(0)
      ).toISOString()}`
    );
    updated = { dateChange: true, index: 0 };
  };

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  function getUnique(arr) {
    return arr.filter((item, index) => arr.indexOf(item) === index);
  }

  const handleLoad = (obj, i) => {
    setDeleted(false);
    if (
      obj.name != "Datapoint" &&
      series.find(
        (s) =>
          s.datapoint == obj.datapoint &&
          s.solution == obj.solution &&
          s.device == obj.device
      )
    ) {
      if (
        series
          .filter(
            (s) =>
              s.datapoint == obj.datapoint &&
              s.solution == obj.solution &&
              s.device == obj.device
          )
          .find((s) => s.aggregation != obj.aggregation)
      ) {
        currentIndex = i;
        loadedIndex = i;
        let tempSeries = [...series];
        tempSeries[i > series.length ? series.length : i] = obj;
        setDatetime(
          `&dateFrom=${new Date(
            new Date(startTime).setSeconds(0)
          ).toISOString()}&dateTo=${new Date(
            new Date(endTime).setSeconds(0)
          ).toISOString()}`
        );
        setSeries(tempSeries);
        setLoadedSeries(obj);
        updateChart(
          obj,
          seriesData[
            series.findIndex(
              (s) =>
                s.datapoint == obj.datapoint &&
                s.solution == obj.solution &&
                s.device == obj.device
            )
          ],
          tempSeries
        );
      }
    } else {
      currentIndex = i;
      // loadedIndex = (i == loadedIndex || i < loadedIndex) ? i : (!loadedIndex && loadedIndex != 0) ? 0 : loadedIndex + 1;
      loadedIndex = i;
      let tempSeries = [...series];
      tempSeries[i > series.length ? series.length : i] = obj;
      setDatetime(
        `&dateFrom=${new Date(
          new Date(startTime).setSeconds(0)
        ).toISOString()}&dateTo=${new Date(
          new Date(endTime).setSeconds(0)
        ).toISOString()}`
      );
      setSeries(tempSeries);
      setLoadedSeries(obj);
    }
    // analytics.refetch()
    let tempDisabled = [...disabled];
    tempDisabled[i] = true;
    setDisabled(tempDisabled);
  };

  function updateChart(obj, prevData, tempSeries = undefined) {
    setDeleted(false);
    console.log({obj, series})
    if (!obj.actuator) {
      let rawData = prevData
        ? prevData
        : JSON.parse(JSON.stringify(analytics.data?.payload));
      // rawData.min = [5.213, 4.2, 9.8, 8.213]
      let data = [];
      if (Object.entries(rawData).length) {
        rawData[obj.aggregation].forEach((value, i) => {
          let body = {};
          body.date = new Date(rawData.time[i]).valueOf();
          body[
            getUnique((tempSeries || series).map((s) => s.friendlyName))[
              // getUnique((tempSeries || series).map((s) => s.name)).length - 1
              (tempSeries || series).findIndex((s) => s.friendlyName == obj.friendlyName)
            ]
          ] = hasDecimal(value) ? parseFloat(value.toFixed(2)) : value;
          data.push(body);
        });
        let payload = {
          name: props.name,
          type: "datapoint",
          update: updated.dateChange,
          datapoints: getUnique((tempSeries || series).map((s) => s.friendlyName)),
          data: {
            data: data,
            name: obj.friendlyName,
          },
          index: !updated.dateChange ? loadedIndex : "none",
          deviceName: props.assetView ? "" : deviceName
        };

        dispatch(setFreeformChart(payload));
      }
      let tempSeriesData;
      if (updated.dateChange) {
        tempSeriesData = [...seriesData];
        tempSeriesData[loadedIndex] = rawData;
      }
      setSeriesData(
        !updated.dateChange ? [...seriesData, rawData] : tempSeriesData
      );
    } else {
      let payload = {
        name: props.name,
        type: "actuator",
        update: updated.dateChange,
        datapoints: getUnique(
          (tempSeries || series).map((s) =>
            s.name != "Datapoint" ? s.name : s.actuator.name
          )
        ),
        deviceName: props.assetView ? "" : deviceName,
        data: {
          data: prevData || controlValues,
          name: obj.actuator.name,
        },
        index: !updated.dateChange ? loadedIndex : "none",
      };
      dispatch(setFreeformChart(payload));
      let tempSeriesData;
      if (updated.dateChange) {
        tempSeriesData = [...seriesData];
        tempSeriesData[loadedIndex] = controlValues;
      }
      setSeriesData(
        !updated.dateChange ? [...seriesData, controlValues] : tempSeriesData
      );
    }

    if (updated.dateChange) {
      setLoadedSeries(series[updated.index]);
    }
  }

  const handleDeleteDatapoint = (i) => {
    setDeleted(true);
    let tempSeries = JSON.parse(JSON.stringify(series));
    tempSeries.splice(i, 1);
    let tempSeriesData = [...seriesData];
    tempSeriesData.splice(i, 1);
    setSeriesData(tempSeriesData);
    setSeries(tempSeries);
    setLoadedSeries(tempSeries[tempSeries.length - 1]);
    setExpanded(`panel${tempSeries.length - 1}`);
    if (series[i]) {
      let payload = {
        index: i,
        name: props.name,
        // datapoint: series.find(s=>s.name != 'Datapoint' ? s.name : s.actuator.name),
        datapoint: series[i],
        delete: true,
      };
      dispatch(setFreeformChart(payload));
      let tempDisabled = [...disabled];
      tempDisabled.splice(i, 1);
      setDisabled(tempDisabled);
      if (series[loadedIndex] && !series[loadedIndex].failed) {
        loadedIndex = loadedIndex - 1;
      }
    }
  };

  return (
    <div style={{ height: "100%", marginBottom: props.length > 1 && "10px" }}>
      <Card style={{ height: "100%" }} id={`${props.name}Id`}>
        {/* <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            margin: "10px",
          }}
        >
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            value={chartName}
            onChange={(e)=>setChartName(e.target.value)}
          />
        </span> */}

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <div
            style={{
              minWidth: "300px",
              display: "flex",
              marginTop: "10px",
              marginBottom: "10px",
              marginLeft: "10px",
              flexDirection: "column",
            }}
          >
            <span style={{ height: "100%", overflowY: "scroll" }}>
              <Datapoints
                assetView={props.assetView}
                expanded={expanded}
                setExpanded={setExpanded}
                series={series}
                services={props.services}
                handleLoad={handleLoad}
                service={props.service}
                setLoadedSeries={setLoadedSeries}
                setSeries={setSeries}
                handleDeleteDatapoint={handleDeleteDatapoint}
                disabled={disabled}
                setDisabled={setDisabled}
                setDeviceName={(e)=>setDeviceName(e)}
              />
            </span>
          </div>
          <Divider orientation="vertical" flexItem style={{ margin: "10px" }} />
          <div
            style={{
              width: "100%",
              // height: "100%",
              // position: "relative",
              margin: "10px",
              display:'flex',
              alignItems:'end',
              marginBottom:'5vh'
            }}
          >
            {analytics.isFetching ? <Loader /> : null}

            {!(series.length < 1) ? (
              <div
                style={{
                  overflow: "hidden",
                  height: props.assetView ? "calc(100vh - 400px)" : "calc(100vh - 210px)",
                  // height: "500px",
                  // maxHeight: "500px",
                  // display: series.length < 1 || updated.dateChange ? "none" : "",
                }}
              >
                <Freeform name={props.name} />
              </div>
            ) : null}

            <span
              style={{
                // position: "absolute",
                width: "calc(100% - 100px)",
                bottom: "10px",
                gap: "20px",
                display: "flex",
              
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  inputFormat="dd/MM/yyyy h:mm:ss aaa"
                  value={startTime}
                  onChange={handleStartDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
                <DateTimePicker
                  inputFormat="dd/MM/yyyy h:mm:ss aaa"
                  label="End Time"
                  value={endTime}
                  onChange={handleEndDate}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
              <Button
                onClick={updateSeries}
                variant="outlined"
                disabled={!dateChange}
              >
                Update
              </Button>
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
