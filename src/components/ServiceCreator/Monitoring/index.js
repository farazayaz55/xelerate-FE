import React, { Fragment, useEffect } from "react";
import Button from "@mui/material/Button";
import AssessmentIcon from "@mui/icons-material/Assessment";
import LinearScaleOutlinedIcon from "@mui/icons-material/LinearScaleOutlined";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import WaterIcon from "@mui/icons-material/Water";
import SpeedIcon from "@mui/icons-material/Speed";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import { useSelector, useDispatch } from "react-redux";
import Sensors from "../Cards/index";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import Divider from "@mui/material/Divider";
import DialogTitle from "@mui/material/DialogTitle";
import MultiState from "./Forms/multiState";
import RangeLabel from "./Forms/rangeLabel";
import Battery from "./Forms/battery";
import FillLevel from "./Forms/fillLevel";
import Reading from "./Forms/reading";
import Guage from "./Forms/guage";
import TimeSeries from "./Forms/timeSeries";
import Catalogue from "./Catalogue";
import { useGetSensorsQuery, useGetAssetsQuery } from "services/services";
import { setService } from "rtkSlices/ServiceCreatorSlice";
import { useSnackbar } from "notistack";
import Dragable from "components/Dragable";
import DialogActions from "@mui/material/DialogActions";
import Checkbox from "@mui/material/Checkbox";
import DialogContentText from "@mui/material/DialogContentText";

export default function Monitoring(props) {
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const serviceValue = useSelector((state) => state.serviceCreator);
  console.log({ serviceValue });
  const [openPopup, setOpenPopup] = React.useState(false);
  const [switcherState, setSwitcherState] = React.useState("");
  const [allMonitoring, setAllMonitoring] = React.useState([]);
  const [allAssets, setAllAssets] = React.useState([]);
  const [selectedAsset, setSelectedAsset] = React.useState();
  const [selectedAssetIndex, setSelectedAssetIndex] = React.useState();
  const [openModal, setOpenModal] = React.useState(false);
  const [sensorObj, setSensorObj] = React.useState(false);

  function setSelected(monitoring, datapoints, configuredSensors) {
    if (configuredSensors) {
      dispatch(
        setService({
          monitoring,
          datapoints,
          configuredSensors,
        })
      );
    } else {
      dispatch(
        setService({
          monitoring,
          datapoints,
        })
      );
    }
  }

  const getDatapointsfromSelectedAsset = () => {
    if (selectedAsset) {
      const assetMap = serviceValue.assetMapping.find(
        (am) => am.assetId == selectedAsset
      );
      return assetMap.sensors.map((sensorId) => {
        const found = serviceValue.datapoints.find((dp) => dp.id == sensorId);
        return { ...found };
      });
    } else {
      return [];
    }
  };

  function setSelectedSensor(assetMappingArray) {
    dispatch(setService({ assetMapping: assetMappingArray }));
  }
  const monitoring = useGetSensorsQuery(token);
  const assets = useGetAssetsQuery(token);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }

  function generateIcon(type) {
    switch (type) {
      case "multiState":
        return ToggleOnIcon;

      case "rangeLabel":
        return LinearScaleOutlinedIcon;

      case "battery":
        return BatteryFullIcon;

      case "fillLevel":
        return WaterIcon;

      case "guage":
        return SpeedIcon;

      case "reading":
        return LooksOneIcon;

      case "timeSeries":
        return ShowChartIcon;

      default:
        break;
    }
  }

  console.log("serviceValue in mon", serviceValue);
  useEffect(() => {
    const index = serviceValue.assetMapping.findIndex(
      (item) => item.assetId === selectedAsset
    );
    setSelectedAssetIndex(index);
  }, [selectedAsset, serviceValue.assetMapping]);
  useEffect(() => {
    if (monitoring.isSuccess) {
      console.log({ sensors: monitoring });
      let allSensors = [];
      monitoring.data.payload.forEach((sensor) => {
        if (sensor.typeValue == props.type) {
          allSensors.push({
            name: sensor.name,
            friendlyName: sensor.friendlyName,
            id: sensor._id,
            tags: [sensor.name],
            description: sensor.description,
            icon: generateIcon(sensor.type),
            config: sensor.config,
            operation:
              props.type == "valueInsight" ? sensor.operation : undefined,
          });
        }
      });
      setAllMonitoring(allSensors);
    }
    if (monitoring.isError) {
      showSnackbar("Monitoring", monitoring.error?.message, "error", 1000);
    }
  }, [monitoring.isFetching]);
  useEffect(() => {
    if (assets.isSuccess) {
      let allAssets = [];
      assets.data.payload.forEach((asset) => {
        if (serviceValue.asset.includes(asset._id)) {
          allAssets.push({
            name: asset.name,
            id: asset._id,
            description: asset.name,
            image: asset.logoPath,
          });
        }
      });
      if (allAssets.length) {
        setSelectedAsset(allAssets[0].id);
      }
      setAllAssets(allAssets);
    }
    if (assets.isError) {
      showSnackbar("Assets", assets.error?.message, "error", 1000);
    }
  }, [assets.isFetching]);

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const handlepopupClose = () => {
    setOpenPopup(false);
  };
  const configuredAsset = (obj, assetMappingArray) => {
    let configuredSensors = JSON.parse(
      JSON.stringify([...serviceValue.configuredSensors])
    );
    const sensorIndex = serviceValue.configuredSensors.findIndex(
      (item) => (item.id || item._id) === (obj.id || obj._id)
    );
    if (sensorIndex === -1) {
      configuredSensors.push(obj);
    } else {
      // If the sesons is fully removed than remove it from configured assets aswell
      const sensorExists = assetMappingArray.some((item) =>
        item.sensors.includes(obj.id || obj._id)
      );

      if (!sensorExists) {
        configuredSensors.splice(sensorIndex, 1);
      }
    }
    return configuredSensors;
  };
  const isStringInsideParentheses = (mainString, targetString) => {
    // Define the regular expression pattern for curly braces
    const pattern = /\{([^{}]+)\}/g;

    // Find all matches of the pattern in the main string
    const matches = mainString.match(pattern);

    // Check if the target string is in any of the matches
    if (matches) {
      for (const match of matches) {
        const textInsideBraces = match.slice(1, -1); // Remove the curly braces
        if (textInsideBraces.includes(targetString)) {
          return true;
        }
      }
    }

    return false;
  }
  function doesObjectContainOperationsAndDatapoint(arr, searchString) {

    return arr.some(
      (obj) =>
        obj.operation && isStringInsideParentheses(obj.operation, searchString)
    );
  }
  // Function to map sensors with their configurations
  function mapSensorsWithConfigurations(sensorIds, configurations) {
    return sensorIds
      .map((id) => configurations.find((obj) => obj._id === id))
      .filter(Boolean);
  }
  const validateAndHandleToggleSensor = (obj) => {
    console.log("obj", obj);

    let assetMappingArray = JSON.parse(
      JSON.stringify([...serviceValue.assetMapping])
    );
    let configureSens = JSON.parse(
      JSON.stringify([...serviceValue.configuredSensors])
    );
    const index = serviceValue.assetMapping.findIndex(
      (item) => item.assetId === selectedAsset
    );

    if (index !== -1) {
      // An object with assetId exists, so add sensorsId to it
      const sensorIndex = serviceValue.assetMapping[index].sensors.indexOf(
        obj.id || obj._id
      );
      const valueInsights = mapSensorsWithConfigurations(
        assetMappingArray[index].valueInsights,
        configureSens
      );

      if (sensorIndex !== -1) {
        if (
          doesObjectContainOperationsAndDatapoint(
            valueInsights,
            obj.friendlyName
          )
        ) {
          setSensorObj(obj);
          setOpenModal(true);
        } else {
          handleToggleSensor(obj);
        }
      } else {
        handleToggleSensor(obj);
      }
    } else {
      handleToggleSensor(obj);
    }
  };
  const handleToggleSensor = (obj) => {
    setOpenModal(false);
    const index = serviceValue.assetMapping.findIndex(
      (item) => item.assetId === selectedAsset
    );

    let assetMappingArray = JSON.parse(
      JSON.stringify([...serviceValue.assetMapping])
    );

    if (index !== -1) {
      // An object with assetId exists, so add sensorsId to it
      const sensorIndex = serviceValue.assetMapping[index].sensors.indexOf(
        obj.id || obj._id
      );
      if (sensorIndex !== -1) {
        assetMappingArray[index].sensors.splice(sensorIndex, 1);
      } else {
        assetMappingArray[index].sensors.push(obj.id || obj._id);
      }
    } else {
      // Create a new object and push it to the array
      const newAssetMapping = {
        assetId: selectedAsset,
        sensors: [obj.id || obj._id],
        actuators: [],
        valueInsights: [],
      };
      assetMappingArray.push(newAssetMapping);
    }
    setSelectedSensor(assetMappingArray);
    let configuredSensors = configuredAsset(obj, assetMappingArray);
    console.log("obj in monitioring", obj);
    let name = obj.name;
    let id = obj.id || obj._id;
    let friendlyName = obj.friendlyName;
    console.log({ name, friendlyName });
    const currentIndex = serviceValue.monitoring.indexOf(id);
    const datacurrentIndex = serviceValue.datapoints.findIndex(
      (e) => (e.id || e._id) == id
    );
    let newData = [...serviceValue.datapoints];
    let newSelected = [...serviceValue.monitoring];
    console.log("assetMappingArray", assetMappingArray);
    console.log("id", id);

    let sensorExists = checkSensorInAllAssets(assetMappingArray, id);
    console.log("sensorExists", sensorExists);
    if (datacurrentIndex === -1) {
      newData.push({ id, name, friendlyName });
    } else {
      if (!sensorExists) {
        newData.splice(datacurrentIndex, 1);
      }
    }

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      if (!sensorExists) {
        newSelected.splice(currentIndex, 1);
      }
    }
    setSelected(newSelected, newData, configuredSensors);
  };

  const configuredAssetValueInsights = (obj, assetMappingArray) => {
    console.log("obj", obj);

    let configuredSensors = JSON.parse(
      JSON.stringify([...serviceValue.configuredSensors])
    );
    const sensorIndex = serviceValue.configuredSensors.findIndex(
      (item) => (item.id || item._id) === obj.id
    );
    if (sensorIndex === -1) {
      configuredSensors.push(obj);
    } else {
      // If the sesons is fully removed than remove it from configured assets aswell
      const sensorExists = assetMappingArray.some((item) =>
        item.valueInsights.includes(obj.id || obj._id)
      );
      if (!sensorExists) {
        configuredSensors.splice(sensorIndex, 1);
      }
    }
    return configuredSensors;
  };
  const checkSensorInAllAssets = (arrayOfObjects, targetId) => {
    return arrayOfObjects.some((obj) =>
      obj.sensors.some((sensor) => sensor === targetId)
    );
  };
  const checkValueInsightsInAllAssets = (arrayOfObjects, targetId) => {
    return arrayOfObjects.some((obj) =>
      obj.valueInsights.some((sensor) => sensor === targetId)
    );
  };
  const getDataPointsFromTheString = (inputString) => {
    const regex = /\{\s*([^}]+)\s*\}/g;
    const matches = inputString.match(regex);

    if (!matches) {
      return [];
    }

    // Remove curly brackets and keep only the strings
    const result = matches.map((match) => match.slice(1, -1));

    return result;
  };
  const handleToggleSensorValueInsights = (obj) => {
    let datapoints = getDataPointsFromTheString(obj.operation);
    const datapointsList = datapoints.map((str) => str.trim());
    for (let i = 0; i < datapointsList.length; i++) {
      let foundSensorId;
      for (let j = 0; j < serviceValue.configuredSensors.length; j++) {
        if (
          serviceValue.configuredSensors[j].name === datapointsList[i] ||
          serviceValue.configuredSensors[j].friendlyName === datapointsList[i]
        ) {
          foundSensorId =
            serviceValue.configuredSensors[j].id ||
            serviceValue.configuredSensors[j]._id;
        }
      }
      if (!foundSensorId) {
        showSnackbar("Datapoint", "Datapoint is not selected", "info", 1000);
        return;
      } else {
        const index = serviceValue.assetMapping.findIndex(
          (item) => item.assetId === selectedAsset
        );
        const sensorExists = serviceValue.assetMapping[index].sensors.includes(
          foundSensorId
        );
        if (!sensorExists) {
          showSnackbar(
            "Datapoint",
            "Datapoint is not selected for this Asset",
            "info",
            1000
          );
          return;
        }
      }
    }
    const index = serviceValue.assetMapping.findIndex(
      (item) => item.assetId === selectedAsset
    );

    let assetMappingArray = JSON.parse(
      JSON.stringify([...serviceValue.assetMapping])
    );

    if (index !== -1) {
      // An object with assetId exists, so add sensorsId to it
      const sensorIndex = serviceValue.assetMapping[
        index
      ].valueInsights.indexOf(obj.id || obj._id);
      if (sensorIndex !== -1) {
        assetMappingArray[index].valueInsights.splice(sensorIndex, 1);
      } else {
        assetMappingArray[index].valueInsights.push(obj.id || obj._id);
      }
    } else {
      // Create a new object and push it to the array
      const newAssetMapping = {
        assetId: selectedAsset,
        sensors: [],
        actuators: [],
        valueInsights: [obj.id || obj._id],
      };
      assetMappingArray.push(newAssetMapping);
    }
    setSelectedSensor(assetMappingArray);
    let configuredSensors = configuredAssetValueInsights(
      obj,
      assetMappingArray
    );

    let name = obj.name;
    let id = obj.id || obj._id;
    let friendlyName = obj.friendlyName;
    console.log({ name, friendlyName });
    const currentIndex = serviceValue.monitoring.indexOf(id);
    const datacurrentIndex = serviceValue.datapoints.findIndex(
      (e) => e.id == id
    );
    let newData = [...serviceValue.datapoints];
    let newSelected = [...serviceValue.monitoring];
    let sensorExists = checkValueInsightsInAllAssets(assetMappingArray, id);
    if (datacurrentIndex === -1) {
      newData.push({ id, name, friendlyName });
    } else {
      if (!sensorExists) {
        newData.splice(datacurrentIndex, 1);
      }
    }

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      if (!sensorExists) {
        newSelected.splice(currentIndex, 1);
      }
    }
    setSelected(newSelected, newData, configuredSensors);
  };

  function switcher(state) {
    switch (state) {
      case "":
        return (
          <Catalogue setSwitcherState={setSwitcherState} type={props.type} />
        );

      case "rangeLabel":
        return (
          <RangeLabel
            setSwitcherState={setSwitcherState}
            selected={serviceValue.monitoring}
            datapoints={getDatapointsfromSelectedAsset()}
            setSelected={
              props.type === "valueInsight"
                ? handleToggleSensorValueInsights
                : handleToggleSensor
            }
            setOpenPopup={setOpenPopup}
            type={props.type}
          />
        );

      case "multiState":
        return (
          <MultiState
            setSwitcherState={setSwitcherState}
            selected={serviceValue.monitoring}
            datapoints={getDatapointsfromSelectedAsset()}
            setSelected={
              props.type === "valueInsight"
                ? handleToggleSensorValueInsights
                : handleToggleSensor
            }
            setOpenPopup={setOpenPopup}
            type={props.type}
          />
        );

      case "battery":
        return (
          <Battery
            setSwitcherState={setSwitcherState}
            selected={serviceValue.monitoring}
            datapoints={getDatapointsfromSelectedAsset()}
            setSelected={
              props.type === "valueInsight"
                ? handleToggleSensorValueInsights
                : handleToggleSensor
            }
            setOpenPopup={setOpenPopup}
            type={props.type}
          />
        );

      case "fillLevel":
        return (
          <FillLevel
            setSwitcherState={setSwitcherState}
            selected={serviceValue.monitoring}
            datapoints={getDatapointsfromSelectedAsset()}
            setSelected={
              props.type === "valueInsight"
                ? handleToggleSensorValueInsights
                : handleToggleSensor
            }
            setOpenPopup={setOpenPopup}
            type={props.type}
          />
        );

      case "reading":
        return (
          <Reading
            setSwitcherState={setSwitcherState}
            selected={serviceValue.monitoring}
            datapoints={getDatapointsfromSelectedAsset()}
            setSelected={
              props.type === "valueInsight"
                ? handleToggleSensorValueInsights
                : handleToggleSensor
            }
            setOpenPopup={setOpenPopup}
            type={props.type}
          />
        );

      case "guage":
        return (
          <Guage
            setSwitcherState={setSwitcherState}
            selected={serviceValue.monitoring}
            datapoints={getDatapointsfromSelectedAsset()}
            setSelected={
              props.type === "valueInsight"
                ? handleToggleSensorValueInsights
                : handleToggleSensor
            }
            setOpenPopup={setOpenPopup}
            type={props.type}
          />
        );

      case "timeSeries":
        return (
          <TimeSeries
            setSwitcherState={setSwitcherState}
            selected={serviceValue.monitoring}
            datapoints={getDatapointsfromSelectedAsset()}
            setSelected={
              props.type === "valueInsight"
                ? handleToggleSensorValueInsights
                : handleToggleSensor
            }
            setOpenPopup={setOpenPopup}
            type={props.type}
          />
        );
      default:
        break;
    }
  }
  const closeModal = () => {
    setOpenModal(false);
  };
  return (
    <Fragment>
      <Dialog open={openModal} onClose={closeModal}>
        <DialogTitle id="alert-dialog-title">{"Confirmation"}</DialogTitle>
        <DialogContent style={{ overflow: "hidden" }}>
          <DialogContentText id="alert-dialog-description">
            This Datapoint is already in use in the solution
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {/* {deleteResult?.isLoading ? null : ( */}
          <Button onClick={closeModal} color="error">
            Cancel
          </Button>
          {/* )} */}
          <Button
            onClick={() => handleToggleSensor(sensorObj)}
            color="secondary"
          >
            <span>Proceed</span>
          </Button>
        </DialogActions>
      </Dialog>

      <Dragable bottom={"30px"} right={"30px"} name="add-monitoring">
        <Fab
          style={{ boxShadow: "none" }}
          id="monitoring-fab"
          onClick={handlepopupOpen}
          color="secondary"
        >
          <AddIcon />
        </Fab>
      </Dragable>
      <Dialog
        open={openPopup}
        onClose={() => {
          handlepopupClose();
          setTimeout(() => {
            setSwitcherState("");
          }, 200);
        }}
        onBackdropClick={() => {
          handlepopupClose();
          setTimeout(() => {
            setSwitcherState("");
          }, 200);
        }}
        maxWidth={switcherState == "" ? false : "sm"}
        fullWidth={switcherState == "" ? true : false}
      >
        {switcherState == "" ? (
          <DialogTitle id="form-dialog-title">Select Widget</DialogTitle>
        ) : null}
        <DialogContent>{switcher(switcherState)}</DialogContent>
      </Dialog>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
        }}
      >
        <span style={{ padding: "0px 30px 0px 30px" }}>
          {props.type === "valueInsight" ? (
            <Sensors
              name="Monitoring"
              loader={monitoring.isLoading}
              handleToggle={handleToggleSensorValueInsights}
              selected={
                serviceValue.assetMapping[selectedAssetIndex]?.valueInsights
              }
              uniqueSelected={serviceValue.configuredSensors}
              parameters={allMonitoring}
              zoomOut
              allAssets={allAssets}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              selectedAssetIndex={selectedAssetIndex}
              assetMapping={serviceValue.assetMapping}
              type="valueInsight"
            />
          ) : (
            <Sensors
              name="Monitoring"
              loader={monitoring.isLoading}
              handleToggle={validateAndHandleToggleSensor}
              selected={serviceValue.assetMapping[selectedAssetIndex]?.sensors}
              uniqueSelected={serviceValue.configuredSensors}
              parameters={allMonitoring}
              zoomOut
              allAssets={allAssets}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              selectedAssetIndex={selectedAssetIndex}
              assetMapping={serviceValue.assetMapping}
            />
          )}
        </span>
        {/* <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <props.Chips
            icon={AssessmentIcon}
            value={props.sensor}
            id={selected}
            handleDelete={handleDeleteSensor}
          />
          <br></br>
        </span> */}
        <Divider />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            position: "relative",
            top: "10px",
          }}
        >
          {props.edit ? (
            <Button
              id="cancel"
              color="error"
              onClick={() => {
                dispatch(
                  setService({
                    page: 0,
                    devices: 0,
                    serviceId: "",
                    name: "",
                    description: "",
                    tags: [],
                    meta: [],
                    asset: [],
                    actuator: [],
                    monitoring: [],
                    metaData: {
                      location: false,
                      maintenance: false,
                      videoAnalytics: false,
                      digitalTwin: false,
                    },
                    persist: {
                      tags: [],
                      meta: [],
                      cover: null,
                    },
                  })
                );
                props.setSelected(null);
              }}
            >
              Cancel
            </Button>
          ) : null}
          <Button
            id="back"
            color="secondary"
            onClick={() => {
              dispatch(
                setService({
                  page: props.type == "datapoint" ? 1 : 3,
                })
              );
            }}
          >
            Back
          </Button>
          <Button
            id="next"
            color="secondary"
            onClick={() => {
              let missingAssets = false;
              serviceValue.asset.forEach((assetId) => {
                const matchingAsset = serviceValue.assetMapping.find(
                  (asset) => asset.assetId === assetId
                );

                if (
                  !matchingAsset ||
                  !matchingAsset.sensors ||
                  matchingAsset.sensors.length === 0
                ) {
                  if (!missingAssets) {
                    missingAssets = true;
                    showSnackbar(
                      "Solution",
                      "Please select atleast 1 datapoint for each asset",
                      "error",
                      1000
                    );
                  }
                  return;
                }
              });
              if (missingAssets) {
                return;
              }
              if (serviceValue.datapoints.length < 1) {
                showSnackbar(
                  "Datapoint",
                  "Datapoint is required",
                  "info",
                  1000
                );
              } else
                dispatch(
                  setService({
                    page: props.type == "datapoint" ? 3 : 5,
                  })
                );
            }}
          >
            Next
          </Button>
          {props.edit ? (
            <Button
              id="save"
              color="secondary"
              onClick={() => {
                if (
                  serviceValue.actuator.length < 1 &&
                  serviceValue.monitoring.length < 1
                )
                  showSnackbar(
                    "Solution",
                    "Select atleast one Monitoring/Controlling parameter",
                    "info",
                    1000
                  );
                else {
                  props.handleSave();
                }
              }}
            >
              Save
            </Button>
          ) : null}
        </div>
      </div>
    </Fragment>
  );
}
