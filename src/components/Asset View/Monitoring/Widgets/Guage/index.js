import React, { useState, useEffect, Fragment } from "react";
import { useGetReadingsQuery } from "services/monitoring";
import Loader from "components/Progress";
import GuageChart from "components/Charts/Guage";
import Divider from "@mui/material/Divider";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTachometerAlt } from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";

export default function App(props) {
  const device = useSelector((state) => state.asset.device);
  const { enqueueSnackbar } = useSnackbar();
  const [temp, setTemp] = useState();
  const [connection, setConnection] = useState(false);
  const [unit, setUnit] = useState();

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
      let readingTemp = readings.data.payload.data[0];
      if (readingTemp.reading[props.sensor.name]?.value) {
        setTemp(readingTemp.reading[props.sensor.name]?.value?.toFixed(2));
        setUnit(readingTemp.reading[props.sensor.name]?.unit);
      }
      setConnection(true);
    }
    if (readings.isError) {
      showSnackbar(
        `Monitoring(${props.sensor.name})`,
        readings.error.data?.message,
        "error",
        1000
      );
      setConnection(false);
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
      setConnection(true);
      setTemp(value?.toFixed(2));
    }
  }, [device]);

  function compFunc() {
    return (
      <Fragment>
        <Divider />
        {connection ? (
          <GuageChart
            data={temp}
            sensor={props.sensor}
            id={props.id}
            inverse={props.sensor.metaData.gradient}
            update={
              device?.latestMeasurement[props.sensor.name]
                ? device?.latestMeasurement[props.sensor.name]
                : null
            }
          />
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
              icon={faTachometerAlt}
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
          justifyContent: "space-between",
          margin: "10px",
        }}
      >
        <p>
          <b>{props.sensor.friendlyName}</b>
        </p>
        <p style={{ fontSize: "20px" }}>
          <strong>{temp}</strong>{" "}
          <span style={{ fontSize: "medium" }}>{unit}</span>
        </p>
      </div>

      {ifLoaded(readings.isLoading, compFunc)}
    </div>
  );
}
