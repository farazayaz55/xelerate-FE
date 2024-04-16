import React, { Fragment, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Loader from "components/Progress";
import { useGetReadingsQuery } from "services/monitoring";
import Divider from "@mui/material/Divider";
import GrainIcon from "@mui/icons-material/Grain";
import Keys from "Keys";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";

export default function App(props) {
  const device = useSelector((state) => state.asset.device);
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [text, setText] = useState("");
  const [unit, setUnit] = useState("");

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

  useEffect(() => {
    if (readings.isSuccess && readings.data.payload.data.length > 0) {
      let tempReading = readings.data.payload.data[0];
      let value = tempReading.reading[props.sensor.name]?.value;
      let unit = tempReading.reading[props.sensor.name]?.unit;
      setText(hasDecimal(value) ? value?.toFixed(2) : value);
      setUnit(unit);
    } else if (readings.isSuccess) {
      setText("Disconnected");
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

  function hasDecimal(num) {
    return num % 1 != 0;
  }

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

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
      let value = parseFloat(
        latestMeasurement[props.sensor.name].value
      );
      setText(hasDecimal(value) ? value?.toFixed(2) : value);
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
            height: "100%",
            width: "100%",
            padding: "0 10%",
          }}
        >
          <span>
            <p
              style={{
                color: text == "Disconnected" ? "#dbdbdb" : "#555555",
                fontSize: text == "Disconnected" ? "25px" : "40px",
              }}
            >
              <b>{`${text == "Disconnected" ? text : text} ${unit}`}</b>
            </p>
          </span>
          <Card
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor:
                text != "Disconnected"
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
              <GrainIcon
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

      {ifLoaded(readings.isLoading, compFunc)}
    </div>
  );
}
