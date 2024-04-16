import React, { Fragment, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Loader from "components/Progress";
import { useGetReadingsQuery } from "services/monitoring";
import Divider from "@mui/material/Divider";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import Keys from "Keys";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { getColor } from "Utilities/Color Spectrum";
import hexRgb from "hex-rgb";

export default function App(props) {
  const device = useSelector((state) => state.asset.device);
  const metaDataValue = useSelector((state) => state.metaData);
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [active, setActive] = useState(false);
  const [text, setText] = useState("");
  const [loader, setLoader] = useState(true);
  const [color, setColor] = useState(null);

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

  function getColorFn(val) {
    let res = metaDataValue.branding.secondaryColor;
    let sensor;

    if (props.deviceColor) {
      sensor = props.deviceColor;
    } else {
      sensor = props.dataPointThresholds.find(
        (g) => g.dataPoint?._id == props.sensor._id
      );
    }

    if (sensor) {
      res = getColor(val, sensor);
    }
    return res;
  }

  useEffect(() => {
    if (readings.isSuccess && readings.data.payload.data.length > 0) {
      let readingTemp = readings.data.payload.data[0];
      let value = readingTemp.reading[props.sensor.name]?.value;
      let metaData = props.sensor.metaData;
      let state = metaData.find((elm) => elm.value == value);
      if (state) {
        setText(state.label);
        setActive(state.state);
      } else {
        setText(`Other(${value})`);
        setActive(false);
      }
      setColor(getColorFn(parseInt(value)));
      setLoader(false);
    } else if (readings.isSuccess) {
      setText("Disconnected");
      setLoader(false);
    }
    if (readings.isError) {
      showSnackbar(
        `Monitoring(${props.sensor.name})`,
        readings.error.data?.message,
        "error",
        1000
      );
      setText("Disconnected");
    }
  }, [readings.isFetching]);

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
      let metaData = props.sensor.metaData;
      let state = metaData.find((elm) => elm.value == value);
      if (state) {
        setText(state.label);
        setActive(state.state);
        setColor(getColorFn(parseInt(value)));
      } else {
        setText(`Other(${value})`);
        setActive(false);
      }
    }
  }, [device]);

  function compFunc() {
    return (
      <Fragment>
        <Divider />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
            height: "100%",
            padding: "0 10%",
          }}
        >
          {/* <span>
            <p
              style={{
                color: text == "Disconnected" ? "#dbdbdb" : "#555555",
                fontSize: "25px",
              }}
            >
              <b>{text}</b>
            </p>
          </span> */}
          <div
            style={{
              backgroundColor:
                text == "Disconnected"
                  ? "white"
                  : color
                  ? `rgb(${hexRgb(color).red}, ${hexRgb(color).green}, ${
                      hexRgb(color).blue
                    },0.1)`
                  : `rgb(${
                      hexRgb(metaDataValue.branding.secondaryColor).red
                    }, ${
                      hexRgb(metaDataValue.branding.secondaryColor).green
                    }, ${
                      hexRgb(metaDataValue.branding.secondaryColor).blue
                    },0.1)`,
              padding: "4px 6px 4px 6px",
              borderRadius: "10px",
              cursor: "pointer",
              width: "max-content",
            }}
          >
            <p
              style={{
                color:
                  text == "Disconnected"
                    ? "#dbdbdb"
                    : color
                    ? color
                    : metaDataValue.branding.primaryColor,
                fontSize: "25px",
              }}
            >
              <b>{text}</b>
            </p>
          </div>
          <Card
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: active
                ? metaDataValue.branding.secondaryColor
                : "grey",
              height: "120px",
              width: "120px",
              borderRadius: "50%",
            }}
          >
            {props.sensor.icon ? (
              <img
                src={props.sensor.icon}
                style={{ maxWidth: "50%", maxHeight: "50%" }}
              />
            ) : (
              <ToggleOffIcon
                style={{ height: "70px", width: "70px", color: "white" }}
              />
            )}
          </Card>
        </div>
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
