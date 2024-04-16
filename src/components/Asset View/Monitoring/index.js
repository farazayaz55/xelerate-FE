import React from "react";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import TimeSeries from "./Widgets/TimeSeries";
import MultiState from "./Widgets/MultiState";
import RangeLabel from "./Widgets/RangeLabel";
import LinearScaleOutlinedIcon from "@mui/icons-material/LinearScaleOutlined";
import FillLevel from "./Widgets/Fill Level";
import Guage from "./Widgets/Guage";
import Battery from "./Widgets/Battery";
import Reading from "./Widgets/Reading";
import IconButton from "@mui/material/IconButton";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import WaterIcon from "@mui/icons-material/Water";
import SpeedIcon from "@mui/icons-material/Speed";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ColorSettings from "components/Asset View/Monitoring/Color Setting";
import Boolean from "./Widgets/Boolean";
import { useSelector } from "react-redux";

export default function DashboardWidgets(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const device = useSelector((state) => state.asset.device);
  const service = metaDataValue.services.find((s) => s.id == props.group);
  const asset = device.platformDeviceType && service.assetMapping.length ? service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType) : null;
  const [data, setData] = React.useState(generateData(service.esbMetaData));
  let color = metaDataValue.services.find((x) => x.id === props.group)
    .dataPointThresholds;
  function generateData(esbMetaData) {
    let res = ((esbMetaData && esbMetaData.datapoints && esbMetaData.datapoints.length) ? (props.sensors.filter(s=>esbMetaData.datapoints.includes(s.name))) : (asset && asset.sensors) ? (asset.sensors.filter((sensor) => sensor.config == props.config)) : (props.sensors)).map((sensor) => {
      if (sensor.defaultTimeseries) {
        let defaultType = "timeSeries";
        if (sensor.type == "multiState" || sensor.type == "boolean")
          defaultType = "step";
        return {
          ...sensor,
          tempType: sensor.type,
          type: defaultType,
        };
      } else return sensor;
    })
    return res
  }
  
  function getFilteredSensors(){
    return service.esbMetaData && service.esbMetaData.datapoints && service.esbMetaData.datapoints.length ? props.sensors.filter(s=>service.esbMetaData.datapoints.includes(s.name)) : asset && asset.sensors ? asset.sensors.filter((sensor) => sensor.config == props.config) : props.sensors;
  }

  function initializeStore(data) {
    let store = {};
    data.forEach((elm) => {
      store[elm.name] = null;
      if (elm.type == "battery") store[elm.metaData.chargingDatapoint] = null;
    });

    return store;
  }

  function handleToggle(sensor, tempType, type) {
    let index = data.findIndex((m) => m._id == sensor._id);
    let oldData = [...data];
    let defaultType = "timeSeries";
    if (sensor.type == "multiState" || sensor.type == "boolean")
      defaultType = "step";

    oldData.splice(index, 1, {
      ...oldData[index],
      type: type ? type : defaultType,
      tempType,
    });
    setData(oldData);
  }

  function generateIcon(type) {
    switch (type) {
      case "rangeLabel":
        return (
          <LinearScaleOutlinedIcon
            style={{
              height: "15px",
              width: "15px",
            }}
          />
        );

      case "multiState":
        return (
          <ToggleOnIcon
            style={{
              height: "15px",
              width: "15px",
            }}
          />
        );

      case "boolean":
        return (
          <ToggleOnIcon
            style={{
              height: "15px",
              width: "15px",
            }}
          />
        );

      case "battery":
        return (
          <BatteryFullIcon
            style={{
              height: "15px",
              width: "15px",
            }}
          />
        );

      case "fillLevel":
        return (
          <WaterIcon
            style={{
              height: "15px",
              width: "15px",
            }}
          />
        );

      case "guage":
        return (
          <SpeedIcon
            style={{
              height: "15px",
              width: "15px",
            }}
          />
        );

      case "reading":
        return (
          <LooksOneIcon
            style={{
              height: "15px",
              width: "15px",
            }}
          />
        );

      case "timeSeries":
        return (
          <ShowChartIcon
            style={{
              height: "15px",
              width: "15px",
            }}
          />
        );

      default:
        break;
    }
  }

  function switcher(sensor, id, color, deviceColor) {
    switch (sensor.type) {
      case "step":
        return (
          <div>
            <TimeSeries
              sensor={sensor}
              id={id}
              dataPointThresholds={props.dataPointThresholds}
              deviceColor={deviceColor}
              step={true}
              sensors={getFilteredSensors()}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              {sensor?.tempType ? (
                <IconButton
                  color="secondary"
                  component="span"
                  style={{
                    height: "30px",
                    width: "30px",
                  }}
                  onClick={() =>
                    handleToggle(sensor, sensor?.tempType, sensor?.tempType)
                  }
                >
                  {generateIcon(sensor.tempType)}
                </IconButton>
              ) : null}
              {props.permission == "ALL" ? (
                <ColorSettings
                  sensor={sensor}
                  sensorId={sensor._id}
                  id={id}
                  group={props.group}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );
      case "timeSeries":
        return (
          <div>
            <TimeSeries
              sensor={sensor}
              id={id}
              dataPointThresholds={props.dataPointThresholds}
              sensors={getFilteredSensors()}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              {sensor?.tempType ? (
                <IconButton
                  color="secondary"
                  component="span"
                  style={{
                    height: "30px",
                    width: "30px",
                  }}
                  onClick={() =>
                    handleToggle(sensor, sensor?.tempType, sensor?.tempType)
                  }
                >
                  {generateIcon(sensor.tempType)}
                </IconButton>
              ) : null}
              {props.permission == "ALL" ? (
                <ColorSettings
                  sensor={sensor}
                  sensorId={sensor._id}
                  id={id}
                  group={props.group}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );

      case "rangeLabel":
        return (
          <div>
            <RangeLabel
              sensor={sensor}
              id={id}
              dataPointThresholds={props.dataPointThresholds}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              <IconButton
                color="secondary"
                component="span"
                style={{
                  height: "30px",
                  width: "30px",
                }}
                onClick={() => handleToggle(sensor, "rangeLabel")}
              >
                <ShowChartIcon
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </IconButton>
              {props.permission == "ALL" ? (
                <ColorSettings
                  sensor={sensor}
                  sensorId={sensor._id}
                  id={id}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );

      case "multiState":
        return (
          <div>
            <MultiState
              sensor={sensor}
              id={id}
              dataPointThresholds={props.dataPointThresholds}
            />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              <IconButton
                color="secondary"
                component="span"
                style={{
                  height: "30px",
                  width: "30px",
                }}
                onClick={() => handleToggle(sensor, "multiState")}
              >
                <ShowChartIcon
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </IconButton>
              {props.permission == "ALL" ? (
                <ColorSettings
                  sensorId={sensor._id}
                  id={id}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );

      case "boolean":
        return (
          <div>
            <Boolean sensor={sensor} id={id} />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              <IconButton
                color="secondary"
                component="span"
                style={{
                  height: "30px",
                  width: "30px",
                }}
                onClick={() => handleToggle(sensor, "boolean")}
              >
                <ShowChartIcon
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </IconButton>
              {props.permission == "ALL" ? (
                <ColorSettings
                  deviceColor={deviceColor}
                  sensorId={sensor._id}
                  id={id}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );

      case "fillLevel":
        return (
          <div>
            <FillLevel sensor={sensor} id={id} />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              <IconButton
                color="secondary"
                component="span"
                style={{
                  height: "30px",
                  width: "30px",
                }}
                onClick={() => handleToggle(sensor, "fillLevel")}
              >
                <ShowChartIcon
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </IconButton>
              {props.permission == "ALL" ? (
                <ColorSettings
                  deviceColor={deviceColor}
                  sensorId={sensor._id}
                  id={id}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );

      case "guage":
        return (
          <div>
            <Guage sensor={sensor} id={id} />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              <IconButton
                color="secondary"
                component="span"
                style={{
                  height: "30px",
                  width: "30px",
                }}
                onClick={() => handleToggle(sensor, "guage")}
              >
                <ShowChartIcon
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </IconButton>
              {props.permission == "ALL" ? (
                <ColorSettings
                  deviceColor={deviceColor}
                  sensorId={sensor._id}
                  id={id}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );

      case "battery":
        return (
          <div>
            <Battery sensor={sensor} id={id} />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              <IconButton
                color="secondary"
                component="span"
                style={{
                  height: "30px",
                  width: "30px",
                }}
                onClick={() => handleToggle(sensor, "battery")}
              >
                <ShowChartIcon
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </IconButton>
              {props.permission == "ALL" ? (
                <ColorSettings
                  deviceColor={deviceColor}
                  sensorId={sensor._id}
                  id={id}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );

      case "reading":
        return (
          <div>
            <Reading sensor={sensor} id={id} />
            <div
              style={{
                position: "absolute",
                bottom: "2px",
                right: "5px",
                display: "flex",
                gap: "2px",
              }}
            >
              <IconButton
                color="secondary"
                component="span"
                style={{
                  height: "30px",
                  width: "30px",
                }}
                onClick={() => handleToggle(sensor, "reading")}
              >
                <ShowChartIcon
                  style={{
                    height: "15px",
                    width: "15px",
                  }}
                />
              </IconButton>
              {props.permission == "ALL" ? (
                <ColorSettings
                  deviceColor={deviceColor}
                  sensorId={sensor._id}
                  id={id}
                  name={sensor.friendlyName}
                  color={color}
                />
              ) : null}
            </div>
          </div>
        );

      default:
        return null;
    }
  }

  return (
    <div
      style={
        props.full
          ? { paddingRight: "10px" }
          : {
            height: 'calc(100vh - 238px)',
            minHeight: 'calc(100vh - 300px)',
              overflowY: "scroll",
              paddingRight: "10px",
            }
      }
    >
      <Grid container spacing={2}>
        {data.map((elm, i) => {
          return (
            <Grid
              item
              xs={12}
              sm={12}
              md={6}
              style={{ marginBottom: "20px" }}
              key={i}
            >
              <Card
                style={{
                  borderRadius: "10px",
                  maxHeight: "250px",
                  minHeight: "250px",
                  position: "relative",
                }}
              >
                {switcher(
                  elm,
                  props.id,
                  color.find((x) => x.dataPoint?._id === elm._id),
                  props.device?.dataPointThresholds
                    ? props.device.dataPointThresholds.find(
                        (x) => x.dataPoint === elm._id
                      )
                    : false
                )}
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
}
