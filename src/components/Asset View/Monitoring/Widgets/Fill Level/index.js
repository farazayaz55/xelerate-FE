import React, { useState, useEffect, Fragment } from "react";
import { color } from "d3-color";
import { interpolateRgb } from "d3-interpolate";
import LiquidFillGauge from "react-liquid-gauge";
import Loader from "components/Progress";
import Divider from "@mui/material/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWater } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
import { useGetReadingsQuery } from "services/monitoring";
import { useSelector } from "react-redux";

export default function FillLevel(props) {
  const device = useSelector((state) => state.asset.device);
  const { enqueueSnackbar } = useSnackbar();
  const [value, setValue] = React.useState(0);
  const [loader, setLoader] = useState(true);
  const [connection, setConnection] = useState(false);

  const readings = useGetReadingsQuery({
    id: props.id,
    parameter: `?currentPage=1&pageSize=1&dataPoint=${props.sensor.name}`,
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  useEffect(() => {
    if (readings.isSuccess && readings.data.payload.data.length > 0) {
      let readingTemp = readings.data.payload.data[0];
      let tempValue =
        ((props.sensor.metaData.Min -
          readingTemp.reading[props.sensor.name]?.value) /
          (props.sensor.metaData.Min - props.sensor.metaData.Max)) *
        100;
      setValue(hasDecimal(tempValue) ? tempValue.toFixed(2) : tempValue);
      setConnection(true);
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

  let startColor = "#bf3535"; // cornflowerblue
  let endColor = "#4caf50"; // crimson

  const radius = 80;
  const interpolate = interpolateRgb(startColor, endColor);
  const fillColor = interpolate(value / 100);
  const gradientStops = [
    {
      key: "0%",
      stopColor: color(fillColor).darker(0.5).toString(),
      stopOpacity: 1,
      offset: "0%",
    },
    {
      key: "50%",
      stopColor: fillColor,
      stopOpacity: 0.75,
      offset: "50%",
    },
    {
      key: "100%",
      stopColor: color(fillColor).brighter(0.5).toString(),
      stopOpacity: 0.5,
      offset: "100%",
    },
  ];

  useEffect(() => {
    let latestMeasurement = {};
    if(device?.esbMetaData && device.esbMetaData?.datapoints?.length){
      device?.esbMetaData.datapoints.forEach(datapoint=>{
        latestMeasurement[datapoint] = device?.latestMeasurement[datapoint];
      })
    }
    else{
      // latestMeasurement[datapoint] = device.latestMeasurement;
    }
    if (
      latestMeasurement &&
    latestMeasurement[props.sensor.name] &&
      !readings.isLoading
    ) {
      let value = latestMeasurement[props.sensor.name].value;
      let tempValue =
        ((props.sensor.metaData.Min - value) /
          (props.sensor.metaData.Min - props.sensor.metaData.Max)) *
        100;
      setValue(hasDecimal(tempValue) ? tempValue.toFixed(2) : tempValue);
    }
  }, [device]);

  function compFunc() {
    return (
      <Fragment>
        <Divider />
        {connection ? (
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "23px",
            }}
          >
            <LiquidFillGauge
              width={radius * 2}
              height={radius * 2}
              value={value}
              percent={"%"}
              textSize={1}
              textOffsetX={5}
              textOffsetY={20}
              textRenderer={(props) => {
                const value = Math.round(props.value);
                const radius = Math.min(props.height / 2, props.width / 2);
                const textPixels = (props.textSize * radius) / 2;
                const valueStyle = {
                  fontSize: textPixels,
                };
                const percentStyle = {
                  fontSize: textPixels * 0.6,
                };

                return (
                  <tspan>
                    <tspan className="value" style={valueStyle}>
                      {value}
                    </tspan>
                    <tspan style={percentStyle}>{props.percent}</tspan>
                  </tspan>
                );
              }}
              riseAnimation
              waveAnimation
              waveFrequency={2}
              waveAmplitude={1}
              gradient
              gradientStops={gradientStops}
              circleStyle={{
                fill: fillColor,
              }}
              waveStyle={{
                fill: fillColor,
              }}
              textStyle={{
                fill: color("#444").toString(),
                fontFamily: "Arial",
              }}
              waveTextStyle={{
                fill: color("#fff").toString(),
                fontFamily: "Arial",
              }}
            />
          </span>
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
              icon={faWater}
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
    <div style={{ height: "200px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          margin: "10px",
        }}
      >
        <p>
          <b>{props.sensor.friendlyName}</b>
        </p>
      </div>
      {ifLoaded(loader, compFunc)}
    </div>
  );
}
