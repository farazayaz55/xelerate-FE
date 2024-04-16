import React, { Fragment, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Loader from "components/Progress";
import { useGetReadingsQuery } from "services/monitoring";
import Divider from "@mui/material/Divider";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import Keys from "Keys";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";

export default function App(props) {
  const device = useSelector((state) => state.asset.device);
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [text, setText] = useState("");
  const [active, setActive] = useState(false);
  const [loader, setLoader] = useState(true);

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
      let value = readingTemp.reading[props.sensor.name]?.value;
      let metaData = props.sensor.metaData;
      if (metaData.Active.Value == value) {
        setText(metaData.Active.Name);
        setActive(true);
      } else if (metaData.Default.Value == value) {
        setText(metaData.Default.Name);
        setActive(false);
      } else {
        setText("");
        setActive(false);
      }
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
    console.log({latestMeasurement})
    if (
      latestMeasurement &&
    latestMeasurement[props.sensor.name] &&
      !readings.isLoading
    ) {
      let value = latestMeasurement[props.sensor.name].value;
      let metaData = props.sensor.metaData;
      if (metaData.Active.Value == value) {
        setText(metaData.Active.Name);
        setActive(true);
      } else if (metaData.Default.Value == value) {
        setText(metaData.Default.Name);
        setActive(false);
      } else {
        setText("");
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
          <span>
            <p
              style={{
                color: text == "Disconnected" ? "#dbdbdb" : "#555555",
                fontSize: "25px",
              }}
            >
              <b>{text}</b>
            </p>
          </span>
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
                src={`${Keys.baseUrl}/servicecreator/sensor/${props.sensor.icon}`}
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
