import React, { Fragment, useEffect, useState } from "react";
import { useGetReadingsQuery } from "services/monitoring";
import LiveChart from "components/Charts/LiveChart";
import Loader from "components/Progress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import Divider from "@mui/material/Divider";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { getColor } from "Utilities/Color Spectrum";

let errorMultiplyer = 20;

export default function TimeSeries(props) {
  console.log({props})
  const device = useSelector((state) => state.asset.device);
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [temp, setTemp] = useState("");
  const [min, setMin] = useState(false);
  const [max, setMax] = useState(false);
  const [unit, setUnit] = useState("");
  const [time, setTime] = useState("");
  const [loader, setLoader] = useState(true);
  const [connection, setConnection] = useState(true);
  const [chartData, setChartData] = useState([
    {
      date: new Date(),
      value: 0,
    },
  ]);

  const readings = useGetReadingsQuery({
    id: props.id,
    parameter: `?currentPage=1&pageSize=50&dataPoint=${props.sensor.name}`,
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function getColorFn(val) {
    let res = metaDataValue.branding.secondaryColor;
    let sensor;
    if (props.deviceColor) {
      sensor = props.deviceColor;
    } else if (device.dataPointThresholds?.length){
      sensor = device.dataPointThresholds.find(
        (g) => g.dataPoint == props.sensor._id
        );
      }
      else{
        sensor = props.dataPointThresholds.find(
          (dt) => dt.dataPoint?._id == props.sensor._id
        )
      }
      // console.log({props,device, sensor})
    if (sensor) {
      res = getColor(val, sensor);
      // console.log(getColor(val, sensor))
    }
    return res;
  }

  useEffect(() => {
    if (readings.isSuccess && readings.data.payload.data.length > 0) {
      let data = [];
      let tempReadings = readings.data.payload.data;
      let tempMin = null;
      let tempMax = null;
      let time = new Date(tempReadings[tempReadings.length - 1].time);
      time = `${time.toLocaleDateString("en-GB")}-${time.toLocaleTimeString()}`;
      setTime(time);
      for (const reading of tempReadings) {
        let value = parseFloat(reading.reading[props.sensor.name]?.value);
        if (tempMin === null || value < tempMin)
          tempMin = hasDecimal(value) ? value?.toFixed(2) : value;
        if (tempMax === null || value > tempMax)
          tempMax = hasDecimal(value) ? value?.toFixed(2) : value;
        data.unshift({
          date: new Date(reading.time).valueOf(),
          value: value,
        });
      }

      if (data.length > 0) {
        setMin(tempMin);
        setMax(tempMax);
        setChartData(data);
        setTemp(
          hasDecimal(data[data.length - 1].value)
            ? data[data.length - 1].value?.toFixed(2)
            : data[data.length - 1].value
        );
        setUnit(readings.data.payload.data[0].reading[props.sensor.name]?.unit);
      } else {
        setConnection(false);
      }
      setLoader(false);
    } else if (readings.isSuccess) {
      setConnection(false);
      setLoader(false);
    }
    if (readings.isError) {
      showSnackbar(
        `Monitoring(${props.sensor.name})`,
        readings.error.data?.message,
        "error",
        1000
      );
      setConnection(false);
      setLoader(false);
    }
  }, [readings.isFetching]);

  const { t } = useTranslation();

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  function ifLoaded(state, component) {
    if (state) return <Loader top={"90px"} />;
    else return component();
  }

  useEffect(() => {
    // console.log("===============================>", device);
    let latestMeasurement = {};
    let latestMeasurementTime = {};
    if(device?.esbMetaData && device.esbMetaData?.datapoints?.length){
      device?.esbMetaData.datapoints.forEach(datapoint=>{
        latestMeasurement[datapoint] = device?.latestMeasurement[datapoint];
        latestMeasurementTime[datapoint] = device?.latestMeasurementTime[datapoint];
      })
    }
    else{
      // latestMeasurement[datapoint] = device.latestMeasurement;
      // latestMeasurementTime[datapoint] = device.latestMeasurementTime;
    }
    if (
      device.latestMeasurement &&
      device.latestMeasurement[props.sensor.name] &&
      !loader
    ) {
      latestMeasurement = device.latestMeasurement;
      let value = latestMeasurement[props.sensor.name].value;
      let unit = latestMeasurement[props.sensor.name].unit;
      let time = new Date();
      let data = chartData;

      if (
        latestMeasurement &&
        latestMeasurement[props.sensor.name]
      ) {
        data.push({
          ...latestMeasurement[props.sensor.name],
          time: latestMeasurementTime
            ? latestMeasurementTime[props.sensor.name]
            : measurementUpdateTime,
        });
      }

      time = `${time.toLocaleDateString("en-GB")}-${time.toLocaleTimeString()}`;
      setTime(time);
      setConnection(true);
      setTemp(hasDecimal(value) ? value?.toFixed(2) : value);
      setUnit(unit);
      setChartData(data)
      if (!min || value < min)
        setMin(hasDecimal(value) ? parseFloat(value)?.toFixed(2) : value);
      if (!max || value > max)
        setMax(hasDecimal(value) ? parseFloat(value)?.toFixed(2) : value);
    }
  }, [device]);

  function cardFunc() {
    return (
      <Fragment>
        <Divider />
        {connection ? (
          !readings.isFetching ? (
            <div style={{ display: "flex" }}>
              <div
                style={{
                  padding: "20px",
                  width: "200px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <span>
                  <p
                    style={{
                      color: "#bfbec8",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                  >
                    {unit}
                  </p>
                  <p style={{ fontSize: "30px", fontWeight: "bold" }}>{temp}</p>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "10px",
                    }}
                  >
                    <div
                      style={{
                        height: "10px",
                        width: "10px",
                        background: getColorFn(parseInt(temp)),
                        borderRadius: "50%",
                      }}
                    />
                    <p
                      style={{
                        color: "#555555",
                        fontSize: "13px",
                        fontWeight: "bold",
                      }}
                    >
                      {props.sensor.friendlyName}
                    </p>
                  </span>

                  {[
                    { name: "Min", value: min },
                    { name: "Max", value: max },
                  ].map((e) => (
                    <span
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "10px",
                        marginBottom: "10px",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "13px",
                        }}
                      >
                        {e.name} :
                      </p>
                      <span
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "10px",
                        }}
                      >
                        <div
                          style={{
                            height: "10px",
                            width: "10px",
                            background: getColorFn(e.value),
                            borderRadius: "50%",
                            position: "relative",
                            top: "4px",
                          }}
                        />
                        <span>
                          <p
                            style={{
                              color: "#555555",
                              fontSize: "15px",
                              fontWeight: "bold",
                            }}
                          >
                            {e.value}
                          </p>
                          <p
                            style={{
                              color: "#bfbec8",
                              fontSize: "11px",
                              fontWeight: "bold",
                            }}
                          >
                            {unit}
                          </p>
                        </span>
                      </span>
                    </span>
                  ))}
                  <p
                    style={{
                      fontSize: "10px",
                      color: "grey",
                    }}
                  >
                    <span style={{ color: "black" }}>Last reading :</span>{" "}
                    {time}
                  </p>
                </span>
              </div>
              <Divider
                orientation="vertical"
                flexItem
                style={{ margin: "10px", height: "230px" }}
              />
              <div style={{ width: "100%" }}>
                <LiveChart
                  name={`Monitoring-${props.sensor.name}`}
                  id={props.id}
                  data={chartData}
                  // update={
                  //   device?.latestMeasurement &&
                  //   device?.latestMeasurement?.hasOwnProperty(props.sensor.name)
                  //     ? {
                  //         ...device?.latestMeasurement[props.sensor.name],
                  //         time: device?.latestMeasurementTime
                  //           ? device?.latestMeasurementTime[props.sensor.name]
                  //           : device?.measurementUpdateTime,
                  //       }
                  //     : null
                  // }
                  height={"240px"}
                  dataPointThresholds={device.dataPointThresholds}
                  sensor={props.sensor._id}
                  deviceColor={props.deviceColor}
                  getColor={getColorFn}
                  step={props.step}
                />
              </div>
            </div>
          ) : null
        ) : (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
            }}
          >
            <FontAwesomeIcon
              icon={faChartLine}
              style={{
                marginTop: "50px",
                width: "60px",
                height: "60px",
                color: "#dbdbdb",
                marginBottom: "20px",
              }}
            />
            <p style={{ color: "#dbdbdb", fontSize: "25px" }}>
              <b>Disconnected</b>
            </p>
          </div>
        )}
      </Fragment>
    );
  }

  return (
    <div>
      {!connection ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start",
            margin: "10px",
          }}
        >
          <p>
            <b>{props.sensor.friendlyName}</b>
          </p>
        </div>
      ) : null}
      <Fragment>{ifLoaded(loader || readings.isFetching, cardFunc)}</Fragment>
    </div>
  );
}
