import React, { Fragment, useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Loader from "components/Progress";
import { useGetReadingsQuery } from "services/monitoring";
import Divider from "@mui/material/Divider";
import LinearScaleOutlinedIcon from "@mui/icons-material/LinearScaleOutlined";
import Keys from "Keys";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import { getColor } from "Utilities/Color Spectrum";
import InfoIcon from "@mui/icons-material/Info";
import DriverScore from "Utilities/DriverScorePopup";

export default function App(props) {
  const driverScoreExists = props.sensor.friendlyName == "Driver Score"
  const metaDataValue = useSelector((state) => state.metaData);
  const device = useSelector((state) => state.asset.device);
  const { enqueueSnackbar } = useSnackbar();
  const [color, setColor] = useState("grey");
  const [text, setText] = useState("");
  const [loader, setLoader] = useState(true);
  const [open, setOpen] = React.useState(false);

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

      let index = 0;
      for (const range of metaData) {
        let min = parseInt(range.min);
        let max = parseInt(range.max);

        if (index == 0 && value < min) {
          // res = code[0];
          setText(range.label);
          break;
        }

        if (
          value >= min &&
          (index == metaData.length - 1
            ? value <= max
            : value < parseInt(metaData[index + 1].min))
        ) {
          // res = code[index];
          setText(range.label);
          break;
        }
        if (index == metaData.length - 1 && value > max) {
          // res = code[index];
          setText(range.label);
          break;
        }
        index += 1;
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
      // if(datapoint && latestMeasurement[datapoint])
      // latestMeasurement[datapoint] = device.latestMeasurement;
    }
    if (
      latestMeasurement &&
      latestMeasurement[props.sensor.name] &&
      !readings.isLoading
    ) {
      let value = latestMeasurement[props.sensor.name].value;

      let metaData = props.sensor.metaData;

      let index = 0;
      for (const range of metaData) {
        let min = parseInt(range.min);
        let max = parseInt(range.max);

        if (index == 0 && value < min) {
          // res = code[0];
          setText(range.label);
          break;
        }

        if (
          value >= min &&
          (index == metaData.length - 1
            ? value <= max
            : value < parseInt(metaData[index + 1].min))
        ) {
          // res = code[index];
          setText(range.label);
          break;
        }
        if (index == metaData.length - 1 && value > max) {
          // res = code[index];
          setText(range.label);
          break;
        }
        index += 1;
      }

      setColor(getColorFn(parseInt(value)));

      // let state = metaData.find((elm) => elm.value == value);
      // if (state) {
      //   setText(state.label);
      //   setActive(state.state);
      // } else {
      //   setText(`Other(${value})`);
      //   setActive(false);
      // }
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
              backgroundColor: color,
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
              <LinearScaleOutlinedIcon
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
        <p style={{marginRight:'3px'}}>
          <b>{props.sensor.friendlyName}</b>
        </p>
        {driverScoreExists ? 
                      <span style={{ cursor: "pointer", margin: '10px' }} onClick={()=>setOpen(true)}>
                        <InfoIcon style={{width: '15px', height: '15px', position:'absolute', top:'13px',color:'grey'}} />
                      </span> : null}
      </div>

      {ifLoaded(loader, compFunc)}
      {open ? <DriverScore setOpen={(v)=>setOpen(v)} /> : null}
    </div>
  );
}
