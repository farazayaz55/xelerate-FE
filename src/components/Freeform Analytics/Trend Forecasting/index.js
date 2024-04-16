import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import { Divider } from "@mui/material";
import Loader from "components/Progress";
import noDataImg from "assets/img/lineChart.png";
import Datapoints from "./Datapoints";
import Freeform from "components/Charts/Freeform";
import connector from "./connector";
import { useSnackbar } from "notistack";
import io from "socket.io-client";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import "./loader.css";
import { useHistory } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector, useDispatch } from "react-redux";
import { setPredictiveProps } from "rtkSlices/predictivePropsSlice";
import { store } from "../../../app/store";
import Keys from "Keys";

// let url = 'https://ef7f-125-209-124-218.eu.ngrok.io'
// const socket = io(url);

let tempChartPayload = {};
let selectedDatapoint;
let sent = false;
let selectedDays;
let socket;
let predictedResult;
let error = false;
let emitted = false;
let plotted = false;
let connectionId;
export default function TrendForecasting(props) {
  let firstTime = true;
  let token = window.localStorage.getItem("token");
  const predictiveProps = useSelector((state) => {
    // confirm this
    return state.predictiveProps;
  });
  const { enqueueSnackbar } = useSnackbar();
  const history = useHistory();
  const [loader, setLoader] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const [noData, setNoData] = React.useState(false);
  const [predictedData, setPredictedData] = React.useState(null);
  const [datapoint, setDatapoint] = useState({
    name: predictiveProps.chartPayload?.name,
    datapoint: predictiveProps.chartPayload?.datapoint,
    aggregation: predictiveProps.chartPayload?.aggregation,
    months: 30,
    device: predictiveProps.chartPayload?.device,
    service: predictiveProps.chartPayload?.solution,
    deviceName: predictiveProps.chartPayload?.deviceName,
  });
  const [accuracy, setAccuracy] = useState(
    predictiveProps?.prediction?.accuracy || 0
  );
  const [socketConnect, setSocketConnect] = React.useState({
    state: predictiveProps.prediction ? "connected" : "loading",
    msg: "",
  });
  const [progress, setProgress] = React.useState(
    !predictiveProps.prediction
      ? {
          msg: "Fetching Data...",
          progress: 0,
        }
      : { msg: "Done", progress: 100 }
  );
  const dispatch = useDispatch();
  const [aggregations, setAggregations] = React.useState({});
  const [chartPayload, setChartPayload] = React.useState(
    predictiveProps.prediction && predictiveProps.chartPayload
      ? JSON.parse(JSON.stringify(predictiveProps.chartPayload))
      : {}
  );
  if (
    !predictiveProps.prediction &&
    // !connectionId &&
    socketConnect.state == "loading"
  ) {
    socket = io(Keys.socket, {
      path: "/api/predictive/socket.io",
      query: {
        token: token,
      },
      upgrade: false,
    });
    socket.on("connect", (data) => {
      connectionId = data?.connectionId || connectionId;
      setSocketConnect({ state: "connected", msg: "" });
      subscribeSocketListeners();
    });
  }

  useEffect(() => {
    setTimeout(() => {
      setReady(true)
    }, 1000);
    return () => {
      if (!progress.progress || progress.progress == 100)
        connectionId = undefined;
    };
  }, []);

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  useEffect(() => {
    return () => {
      if (Object.entries(tempChartPayload).length && emitted) {
        dispatch(
          setPredictiveProps({
            chartPayload: tempChartPayload,
            prediction: predictedResult,
          })
        );
      }
    };
  }, [props.name]);

  useEffect(() => {
    if (predictiveProps.prediction && predictiveProps.chartPayload) {
      let temp = JSON.parse(JSON.stringify(predictiveProps.chartPayload));
      let newPred = JSON.parse(JSON.stringify(predictiveProps.prediction));
      setDatapoint({
        name: predictiveProps.chartPayload.name,
        datapoint: predictiveProps.chartPayload.datapoint,
        aggregation: predictiveProps.chartPayload.aggregation,
        months: predictiveProps.chartPayload.months,
        device: predictiveProps.chartPayload.device,
        service: predictiveProps.chartPayload.solution,
        deviceName: predictiveProps.chartPayload.deviceName,
      });
      updateChart(undefined, newPred, temp);
      dispatch(setPredictiveProps({ ...predictiveProps, prediction: null }));
      socket = io(Keys.socket, {
        path: "/api/predictive/socket.io",
        query: {
          token: token,
        },
        upgrade: false,
      });
      socket.on("connect", (data) => {
        connectionId = data?.connectionId || connectionId;
        setSocketConnect({ state: "connected", msg: "" });
        subscribeSocketListeners();
      });
    }
  }, [predictiveProps.prediction]);

  function subscribeSocketListeners() {
    socket.on("disconnect", (data) => {
      connectionId = undefined;
      showSnackbar("Analytics", data.msg, "error", 1000);
      setSocketConnect({ state: "disconnected", msg: data.msg });
    });
    socket.on("predictedData", (d) => {
      let invalid = false;
      if (!noData) {
        if (!d.mlr) {
          setProgress({
            msg: "Fetching Data...",
            progress: 0,
          });
          return enqueueSnackbar(
            { message: "No data found", title: "Prediction", variant: "error" },
            {
              variant: "error",
              autoHideDuration: 5000,
              preventDuplicate: true,
            }
          );
          return;
        }
        for (let i = 0; i < Object.entries(d?.mlr).length; i++) {
          if (d?.actual.find((a) => Math.abs(a - d?.mlr[i]) > 500)) {
            invalid = true;
            break;
          }
        }
        if (invalid) {
          showSnackbar("Trend Forecasting", "Invalid data", "error", 1000);
          return;
        }
        emitted = false;
        if (!d.length) {
          setProgress({
            msg: "Fetching Data...",
            progress: 0,
          });
        }
        if (d.type == "error") {
          setProgress({ msg: "", progress: 0 });
          return enqueueSnackbar(
            { message: d.msg, title: "Prediction", variant: "error" },
            {
              variant: "error",
              autoHideDuration: 5000,
              preventDuplicate: true,
            }
          );
        }
        if (d.length == 0) {
          setProgress({ msg: "", progress: 0 });
        } else {
          let acc = JSON.parse(d.accuracy);
          acc = acc["LevelTestSetMAPE"]["0"]
            ? acc["LevelTestSetMAPE"]["0"] * 100
            : null;
          if (acc) {
            setAccuracy((100 - acc).toFixed(2));
          }
          // if (!sent) {
          if (acc > 100 || !acc) {
            setProgress({ msg: "", progress: 100 });
            sent = false;
            if (!error) {
              error = true;
              dispatch(setPredictiveProps({}));
              return;
            }
          } else {
            setAccuracy((100 - acc).toFixed(2));
          }

          let temp = { past: [], future: [], accuracy: acc ? 100 - acc : null };
          let data = d;
          Object.entries(data.DATE).forEach((val) => {
            temp.future.push({
              date: new Date(data.DATE[val[0]]),
              [selectedDatapoint]: data.mlr[val[0]].toFixed(2),
            });
          });
          let start = new Date(
            new Date().setDate(new Date().getDate() - selectedDays)
          ).valueOf();
          let end = new Date().valueOf();
          data.pastDates.forEach((t, i) => {
            if (new Date(t).valueOf() > start && new Date(t).valueOf() < end) {
              temp.past.push({
                date: new Date(t),
                [selectedDatapoint]: data.actual[i],
              });
            }
          });
          sent = true;
          predictedResult = temp;
          setPredictedData(temp);
          if (!window.location.pathname.includes("trendForecasting")) {
            const globalStore = store.getState();
            dispatch(
              setPredictiveProps({
                ...globalStore.predictiveProps,
                prediction: temp,
              })
            );
            return enqueueSnackbar({
              message: "Your prediction is done",
              title: "Prediction",
              variant: "success",
              action: true,
              history: history,
            });
          }
          setProgress({ msg: "Done", progress: 100 });
          if (window.location.pathname.includes("trendForecasting")) {
            updateChart(undefined, temp);
          }
          // }
          // }
        }
      }
    });

    socket.on("progress", (data) => {
      if (!noData && data.progress && progress.progress != 100) {
        setProgress(data);
      }
    });
  }

  function updateChart(
    agg = undefined,
    prediction = undefined,
    chartpayload = undefined,
    force
  ) {
    let { aggregation, name } = chartpayload || chartPayload;
    let data = [];
    // let rawData = force
    //   ? analytics.data?.payload
    //   : Object.entries(aggregations).length
    //     ? aggregations
    //     : analytics.data?.payload;
    // if (Object.entries(rawData).length) {
    //   if (!Object.entries(aggregations).length) {
    //     setAggregations(analytics.data?.payload);
    //   }
    //   rawData[agg || aggregation].forEach((value, i) => {
    //     let body = {};
    //     body.date = new Date(rawData.time[i]);
    //     body[name] = hasDecimal(value) ? parseFloat(value.toFixed(2)) : value;
    //     data.push(body);
    //   });
    //   // connector.emit("updateFreeform", {
    //   //   name: props.name,
    //   //   datapoints: old,
    //   //   data: {
    //   //     data: data,
    //   //     name: name,
    //   //   },
    //   //   predictive: true
    //   // });
    // }
    if (prediction) {
      prediction.past.forEach((p) => {
        p.date = new Date(p.date);
      });
      prediction.future.forEach((p) => {
        p.date = new Date(p.date);
      });
      prediction.future.forEach((d) => {
        d[selectedDatapoint] = parseFloat(d[selectedDatapoint]);
      });
      prediction.past.forEach((d) => {
        d[selectedDatapoint] = parseFloat(d[selectedDatapoint]);
      });
      firstTime = true;
      connector.emit("updateFreeform", {
        name: props.name,
        datapoints: [],
        data: {
          data: prediction.past,
          name: selectedDatapoint,
        },
        predictive: true,
        type: "actual",
        firstTime
      });
      firstTime = false;
      connector.emit("updateFreeform", {
        name: props.name,
        datapoints: [],
        data: {
          data: prediction.future,
          name: selectedDatapoint,
        },
        predictive: true,
        type: "prediction",
        firstTime
      });
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function updateLoader(state) {
    setLoader(state);
  }

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  async function handleLoad(
    device,
    datapoint,
    aggregation,
    months,
    name,
    solution,
    deviceName,
    update,
    agg
  ) {
    // setAggregationChanged(agg);
    setChartPayload({
      device,
      datapoint,
      aggregation,
      months,
      name,
      solution,
      deviceName,
      update,
    });
    if (agg) {
      updateChart(aggregation, undefined, {
        device,
        datapoint,
        aggregation,
        months: 0,
        name,
        solution,
        deviceName,
        update,
      });
    }
    updateLoader(true);
    tempChartPayload = {
      device,
      datapoint,
      aggregation,
      months,
      name,
      solution,
      deviceName,
      update,
    };
    let dateTo = new Date();
    let dateFrom = new Date(dateTo.setMonth(dateTo.getMonth() - 3));
    socket.emit("predictiveData", {
      device,
      datapoint,
      aggregation,
      dateFrom,
      dateTo: new Date(),
      days: months,
      mode: months == 1 ? "hourly" : "daily",
      name,
      solution,
      deviceName,
      sid: connectionId,
    });
    error = false;
    selectedDays = months;
    selectedDatapoint = datapoint;
    sent = false;
    emitted = true;
    setPredictedData(null);
    setNoData(false);
    setProgress({ msg: "Fetching data ...", progress: 10 });
  }

  function CircularProgressWithLabel(props) {
    return (
      <Box
        sx={{
          position: "relative",
          textAlign: "center",
          marginTop: "20px !important",
        }}
      >
        <CircularProgress
          variant="determinate"
          {...props}
          size={70}
          sx={{ width: "110px", height: "110px" }}
          style={{ width: "110px", height: "110px" }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: "absolute",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
            style={{ fontSize: 18 }}
          >
            {`${Math.round(props.value)}%`}
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <div>
      <Card style={{ marginBottom: "20px" }}>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "20px",
            margin: "10px",
          }}
        >
          <p>Trend Forecast</p>
        </span>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            height: "600px",
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
                datapoint={datapoint}
                services={props.services}
                handleLoad={handleLoad}
                aggregations={aggregations}
                updateChart={updateChart}
                socketConnect={socketConnect}
                disabled={
                  progress.progress > 0 && progress.progress < 100
                    ? true
                    : false
                }
              />
            </span>
          </div>
          <Divider orientation="vertical" flexItem style={{ margin: "10px" }} />
          <div
            style={{
              width: "100%",
              height: "100%",
              position: "relative",
              margin: "10px",
            }}
          >
            {predictedData &&
            predictedData.past &&
            !predictedData.past.length ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  paddingBottom: "80px",
                }}
              >
                {!progress.msg && progress.progress == 100 ? null : (
                  <img src={noDataImg} height="100px" width="100px" />
                )}
                <p style={{ color: "#c7c7c7" }}>
                  {!progress.msg && progress.progress == 100 ? (
                    <h1 style={{ fontSize: 25 }}>Not enough data to predict</h1>
                  ) : (
                    "No datapoint set"
                  )}
                </p>
              </div>
            ) : null}
            {!progress.msg && progress.progress == 100 ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  paddingBottom: "80px",
                }}
              >
                <p style={{ color: "#c7c7c7" }}>Not enough data to predict</p>
              </div>
            ) : null}
            {progress.progress > 0 && progress.progress < 100 ? (
              <Box sx={{ width: "100%", marginTop: "200px" }}>
                <div
                  style={{ fontSize: 24, color: "grey", textAlign: "center" }}
                >
                  {progress.msg || "Fetching Data abc ..."}
                </div>
                {<CircularProgressWithLabel value={progress.progress} />}
              </Box>
            ) : null}

            {ready ? <div
              style={{
                overflow: "hidden",
                height: "500px",
                maxHeight: "500px",
                display: progress.progress != 100 ? "none" : "",
              }}
            >
              <div>
                Accuracy :{" "}
                <span className={accuracy > 50 ? "good bold" : "bad bold"}>
                  {" "}
                  {accuracy <= 0 ? (
                    <span
                      style={{ fontSize: 13, color: "red", marginLeft: 20 }}
                    >
                      Insufficient data
                    </span>
                  ) : (
                    <span>{parseInt(accuracy).toFixed(2)} %</span>
                  )}
                </span>{" "}
              </div>
              <Freeform name={props.name} trendForecasting={true} />
            </div> : null}
          </div>
        </div>
      </Card>
    </div>
  );
}

// const mapStateToProps = (state) => {
//   return { res: state.events, res2: state.analytics };
// };

// const mapDispatchToProps = {
//   GetEvents,
//   Analytics,
// };

// VideoAnalytics = connect(mapStateToProps, mapDispatchToProps)(VideoAnalytics);
