import React from "react";
import Monitoring from "../Monitoring";
import Controlling from "../Controlling";
import { Divider } from "@mui/material";
import { useSelector } from "react-redux";

export default function DashboardWidgets(props) {
  const device = useSelector((state) => state.asset.device);
  const sensors = device.esbMetaData && device.esbMetaData.datapoints && device.esbMetaData.datapoints.length ? props.sensors.filter(s=>device.esbMetaData.datapoints.includes(s.name)) : props.sensors;
  const actuators = device.esbMetaData && device.esbMetaData.actuators && device.esbMetaData.actuators.length ? props.actuators.filter(s=>device.esbMetaData.actuators.includes(s.name)) : props.actuators;

  return (
    <div
      style={{
        height: 'calc(100vh - 238px)',
        minHeight: 'calc(100vh - 300px)',
        overflowY: "scroll",
        paddingRight: "10px",
      }}
    >
      <p style={{ color: "grey" }}>Monitoring</p>
      <Divider style={{ marginBottom: "20px", marginTop: "5px" }} />
      <Monitoring
        id={props.id}
        group={props.group}
        sensors={sensors}
        dataPointThresholds={props.dataPointThresholds}
        permission={props.permission}
        full
        config={true}
      />
      <p style={{ color: "grey" }}>Controlling</p>
      <Divider style={{ marginBottom: "20px", marginTop: "5px" }} />
      <Controlling
        actuators={actuators}
        id={props.id}
        serviceId={props.group}
        permission={props.permission}
        service={props.group}
        config={true}
        full
      />
    </div>
  );
}
