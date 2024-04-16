import React, { Fragment, useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import Loader from "components/Progress";
import { useTranslation } from "react-i18next";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import Battery20Icon from "@mui/icons-material/Battery20";
import Battery30Icon from "@mui/icons-material/Battery30";
import Battery50Icon from "@mui/icons-material/Battery50";
import Battery60Icon from "@mui/icons-material/Battery60";
import Battery80Icon from "@mui/icons-material/Battery80";
import Battery90Icon from "@mui/icons-material/Battery90";
import BatteryCharging20Icon from "@mui/icons-material/BatteryCharging20";
import BatteryCharging30Icon from "@mui/icons-material/BatteryCharging30";
import BatteryCharging50Icon from "@mui/icons-material/BatteryCharging50";
import BatteryCharging60Icon from "@mui/icons-material/BatteryCharging60";
import BatteryCharging80Icon from "@mui/icons-material/BatteryCharging80";
import BatteryCharging90Icon from "@mui/icons-material/BatteryCharging90";
import BatteryChargingFullIcon from "@mui/icons-material/BatteryChargingFull";
import BatteryUnknownIcon from "@mui/icons-material/BatteryUnknown";
import PowerIcon from "@mui/icons-material/Power";
import GppGoodIcon from "@mui/icons-material/GppGood";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ErrorIcon from "@mui/icons-material/Error";
import { useSnackbar } from "notistack";
import { useGetReadingsQuery } from "services/monitoring";
import { useSelector } from "react-redux";

export default function DashboardCards(props) {
  const device = useSelector((state) => state.asset.device);
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [temp, setTemp] = useState("");
  const [charging, setCharging] = useState(false);
  const [loader, setLoader] = useState({ charging: true, battery: true });

  const battery = useGetReadingsQuery({
    id: props.id,
    parameter: `?currentPage=1&pageSize=1&dataPoint=${props.sensor.name}`,
  });

  const charge = useGetReadingsQuery({
    id: props.id,
    parameter: `?currentPage=1&pageSize=1&dataPoint=${props.sensor.name}`,
  });

  useEffect(() => {
    if (battery.isSuccess && battery.data.payload.data.length > 0) {
      let reading = battery.data.payload.data[0];
      let value = reading.reading[props.sensor.name]?.value;
      setTemp(value);
      setLoader({ ...loader, ...{ battery: false } });
    } else if (battery.isSuccess) {
      setLoader({ ...loader, ...{ battery: false } });
    }
    if (battery.isError) {
      showSnackbar(
        `Monitoring(${props.sensor.name})`,
        battery.error.data?.message,
        "error",
        1000
      );
    }
  }, [battery.isFetching]);

  useEffect(() => {
    if (charge.isSuccess && charge.data.payload.data.length > 0) {
      let reading = charge.data.payload.data[0];
      if (reading.reading[props.sensor.metaData.chargingDatapoint]) {
        let value =
          reading.reading[props.sensor.metaData.chargingDatapoint]?.value;
        if (props.sensor.metaData.chargingStatus == value) {
          setCharging(true);
        } else if (props.sensor.metaData.dischargingStatus == value) {
          setCharging(false);
        }
      }
      setLoader({ ...loader, ...{ charging: false } });
    } else if (charge.isSuccess) {
      // setText("Disconnected");
      setLoader({ ...loader, ...{ charging: false } });
    }
    if (charge.isError) {
      showSnackbar(
        `Monitoring(${props.sensor.name})`,
        charge.error.data?.message,
        "error",
        1000
      );
      // setText("Disconnected");
    }
  }, [charge.isFetching]);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  const { t } = useTranslation();

  function ifLoaded(state, component) {
    if (state) return <Loader />;
    else return component();
  }

  function icon(val, charge) {
    let icon = 0;
    if (val > 100) icon = 100;
    if (val < 0) icon = 0;
    if (val > 0 && val <= 20) icon = 20;
    if (val > 20 && val <= 30) icon = 30;
    if (val > 30 && val <= 50) icon = 50;
    if (val > 50 && val <= 60) icon = 60;
    if (val > 60 && val <= 80) icon = 80;
    if (val > 80 && val <= 90) icon = 90;
    if (val > 90 && val <= 100) icon = 100;
    if (charge && val != 0) icon = icon.toString();
    switch (icon) {
      case 0:
        return (
          <BatteryUnknownIcon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case 20:
        return (
          <Battery20Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case 30:
        return (
          <Battery30Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case 50:
        return (
          <Battery50Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case 60:
        return (
          <Battery60Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case 80:
        return (
          <Battery80Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );

      case 90:
        return (
          <Battery90Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );

      case 100:
        return (
          <BatteryFullIcon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );

      case "20":
        return (
          <BatteryCharging20Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case "30":
        return (
          <BatteryCharging30Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case "50":
        return (
          <BatteryCharging50Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case "60":
        return (
          <BatteryCharging60Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );
      case "80":
        return (
          <BatteryCharging80Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );

      case "90":
        return (
          <BatteryCharging90Icon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );

      case "100":
        return (
          <BatteryChargingFullIcon
            style={{
              color: "white",
              fontSize: "80px",
            }}
          />
        );

      default:
        break;
    }
  }

  function cardFunc() {
    return (
      <Fragment>
        <Divider />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              backgroundColor:
                temp != ""
                  ? temp <= props.sensor.metaData?.Minor?.Value
                    ? temp <= props.sensor.metaData.Major.Value
                      ? "#bf3535"
                      : "#ffb818"
                    : metaDataValue.branding.primaryColor
                  : "grey",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "relative",
              width: "100%",
            }}
          >
            <span style={{ margin: "20px" }}>{icon(temp, charging)}</span>
            <span>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  height: "50px",
                  width: "50px",
                  borderRadius: "50%",
                  backgroundColor: "white",
                  position: "absolute",
                  right: "10px",
                  bottom: "0",
                  transform: "translateY(50%)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "42px",
                    width: "42px",
                    borderRadius: "50%",
                    backgroundColor:
                      temp != ""
                        ? temp <= props.sensor.metaData?.Minor?.Value
                          ? temp <= props.sensor.metaData.Major.Value
                            ? "#bf3535"
                            : "#ffb818"
                          : metaDataValue.branding.primaryColor
                        : "grey",
                  }}
                >
                  {charging ? (
                    <PowerIcon style={{ color: "white" }} />
                  ) : temp <= props.sensor.metaData?.Minor?.Value ? (
                    temp <= props.sensor.metaData.Major.Value ? (
                      <ErrorIcon style={{ color: "white" }} />
                    ) : (
                      <WarningAmberIcon style={{ color: "white" }} />
                    )
                  ) : (
                    <GppGoodIcon style={{ color: "white" }} />
                  )}
                </div>
              </div>
            </span>
          </div>
          <div
            style={{
              height: "80px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <p
              style={{
                fontSize: "25px",
                marginBottom: "5px",
              }}
            >
              <b>{temp != "" ? `${parseInt(temp)}%` : ""}</b>
            </p>
            <p
              style={{
                color: temp == "" ? "#dbdbdb" : "",
                fontSize: temp != "" ? "" : "25px",
              }}
            >
              <b>
                {temp != ""
                  ? charging
                    ? "Battery Charging"
                    : temp <= props.sensor?.metaData?.Minor?.Value
                    ? temp <= props.sensor?.metaData?.Major?.Value
                      ? props.sensor?.metaData?.Major?.Text
                      : props.sensor?.metaData?.Minor?.Text
                    : "Battery Charged"
                  : "Disconnected"}
              </b>
            </p>
          </div>
        </div>
      </Fragment>
    );
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
      !battery.isLoading
    ) {
      let value = latestMeasurement[props.sensor.name].value;
      setTemp(value);
    }
  }, [device]);

  useEffect(() => {
    if (props.charging && !charge.isLoading) {
     let value = props.charging.value;
      if (props.sensor.metaData.chargingStatus == value) {
        setCharging(true);
      } else if (props.sensor.metaData.dischargingStatus == value) {
        setCharging(false);
      }
    }
  }, [props.charging]);

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
      {ifLoaded(loader.battery && loader.charging, cardFunc)}
    </div>
  );
}
