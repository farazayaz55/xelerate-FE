import React, { Fragment, useEffect } from "react";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import LooksOneIcon from "@mui/icons-material/LooksOne";
import TripOriginIcon from "@mui/icons-material/TripOrigin";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import TextFieldsIcon from "@mui/icons-material/TextFields";
import Sensors from "../Cards/index";
import AddIcon from "@mui/icons-material/Add";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Power from "./Forms/power";
import Thermostat from "./Forms/thermostat";
import Numeric from "./Forms/numeric";
import Touch from "./Forms/touch";
import Text from "./Forms/text";
import Divider from "@mui/material/Divider";
import Catalogue from "./Catalogue";
import { useSelector, useDispatch } from "react-redux";
import { useGetActuatorsQuery, useGetAssetsQuery } from "services/services";
import { setService } from "rtkSlices/ServiceCreatorSlice";
import { useSnackbar } from "notistack";
import Button from "@mui/material/Button";
import Dragable from "components/Dragable";

export default function Controlling(props) {
  const dispatch = useDispatch();
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const assets = useGetAssetsQuery(token);
  const serviceValue = useSelector((state) => state.serviceCreator);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [states, setStates] = React.useState([]);
  const [switcherState, setSwitcherState] = React.useState("");
  const [allActuators, setAllActuators] = React.useState([]);
  // const [selected, setSelected] = React.useState(serviceValue.actuator);
  const [allAssets, setAllAssets] = React.useState([]);
  const [selectedAsset, setSelectedAsset] = React.useState();
  const [selectedAssetIndex, setSelectedAssetIndex] = React.useState();

  function setSelected(selected) {
    dispatch(
      setService({
        actuator: selected,
      })
    );
  }
  function setSelectedConfiguredActuators(configuredActuators) {
    dispatch(
      setService({
        configuredActuators: configuredActuators,
      })
    );
  }
  function setSelectedSensor(assetMappingArray) {
    dispatch(setService({ assetMapping: assetMappingArray }));
  }

  const actuator = useGetActuatorsQuery(token);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar(
      { title, message: message ? message : "Something went wrong", variant },
      { timeOut }
    );
  }
  useEffect(() => {
    const index = serviceValue.assetMapping.findIndex(
      (item) => item.assetId === selectedAsset
    );
    setSelectedAssetIndex(index);
  }, [selectedAsset, serviceValue.assetMapping]);


  useEffect(() => {
  }, [serviceValue.assetMapping]);
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
  function generateIcon(type) {
    switch (type) {
      case "power":
        return PowerSettingsNewIcon;

      case "thermostat":
        return TripOriginIcon;

      case "touch":
        return TouchAppIcon;

      case "text":
        return TextFieldsIcon;

      case "numeric":
        return LooksOneIcon;

      default:
        break;
    }
  }

  useEffect(() => {
    if (actuator.isSuccess) {
      let tempActuators = [];
      actuator.data.payload.forEach((sensor) => {
        let command = "";
        switch (sensor.type) {
          case "power":
            command = ` Default: ${sensor.metaData.Default.Value} Active:${sensor.metaData.Active.Value}`;
            break;

          case "touch":
            command = sensor.metaData.Command;
            break;

          case "input":
            command = "Custom Input";
            break;

          case "thermostat":
            command = ` Command: ${sensor.metaData.Command} Range:${sensor.metaData?.Range?.Min} to ${sensor.metaData?.Range?.Max}`;
            break;

          case "numeric":
            command = ` Command: ${sensor.metaData.Command} Range:${sensor.metaData?.Range?.Min} to ${sensor.metaData?.Range?.Max}`;
            break;

          default:
            command = " Custom Input";
            break;
        }
        tempActuators.push({
          name: sensor.name,
          id: sensor._id,
          description: sensor.description,
          icon: generateIcon(sensor.type),
          config: sensor.config,
          command,
        });
      });
      setAllActuators(tempActuators);
    }
    if (actuator.isError) {
      showSnackbar("Actuator", actuator.error?.data?.message, "error", 1000);
    }
  }, [actuator.isFetching]);

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const handlepopupClose = () => {
    setOpenPopup(false);
  };
  const checkActuatorInAllAssets = (arrayOfObjects, targetId) => {
    return arrayOfObjects.some((obj) =>
      obj.actuators.some((actuator) => actuator === targetId)
    );
  };
  const configuredAsset = (obj, assetMappingArray) => {
    let configuredActuators = JSON.parse(
      JSON.stringify([...serviceValue.configuredActuators])
    );
    const actuatorIndex = serviceValue.configuredActuators.findIndex(
      (item) => (item.id || item._id) === (obj.id || obj._id)
    );
    if (actuatorIndex === -1) {
      configuredActuators.push(obj);
    } else {
      // If the sesons is fully removed than remove it from configured assets aswell
      const sensorExists = assetMappingArray.some((item) =>
        item.actuators.includes(obj.id || obj._id)
      );
      if (!sensorExists) {
        configuredActuators.splice(actuatorIndex, 1);
      }
    }
    return configuredActuators;
  };
  const handleToggleActuator = (obj) => {
    const index = serviceValue.assetMapping.findIndex(
      (item) => item.assetId === selectedAsset
    );

    let assetMappingArray = JSON.parse(
      JSON.stringify([...serviceValue.assetMapping])
    );

    if (index !== -1) {
      // An object with assetId exists, so add sensorsId to it
      const actuatorIndex = serviceValue.assetMapping[index].actuators.indexOf(
        obj.id || obj._id
      );
      if (actuatorIndex !== -1) {
        assetMappingArray[index].actuators.splice(actuatorIndex, 1);
      } else {
        assetMappingArray[index].actuators.push(obj.id || obj._id);
      }
    } else {
      // Create a new object and push it to the array
      const newAssetMapping = {
        assetId: selectedAsset,
        sensors: [],
        actuators: [obj.id || obj._id],
        valueInsights: [],
      };
      assetMappingArray.push(newAssetMapping);
    }
    setSelectedSensor(assetMappingArray);
    let configuredActuators = configuredAsset(obj, assetMappingArray);

    let id = obj.id || obj._id;
    const currentIndex = serviceValue.actuator.indexOf(id);
    let newSelected = [...serviceValue.actuator];
    let actuatorExists = checkActuatorInAllAssets(assetMappingArray, id);

    if (currentIndex === -1) {
      newSelected.push(id);
    } else {
      if(!actuatorExists){
        newSelected.splice(currentIndex, 1);
      }
    }
    setSelected(newSelected);
    setSelectedConfiguredActuators(configuredActuators);
  };

  function switcher(state) {
    switch (state) {
      case "":
        return <Catalogue setSwitcherState={setSwitcherState} />;
      case "power":
        return (
          <Power
            setSwitcherState={setSwitcherState}
            selected={serviceValue.actuator}
            setSelected={handleToggleActuator}
            setOpenPopup={setOpenPopup}
          />
        );

      case "thermostat":
        return (
          <Thermostat
            setSwitcherState={setSwitcherState}
            selected={serviceValue.actuator}
            setSelected={handleToggleActuator}
            setOpenPopup={setOpenPopup}
          />
        );

      case "touch":
        return (
          <Touch
            setSwitcherState={setSwitcherState}
            selected={serviceValue.actuator}
            setSelected={handleToggleActuator}
            setOpenPopup={setOpenPopup}
          />
        );

      case "text":
        return (
          <Text
            setSwitcherState={setSwitcherState}
            selected={serviceValue.actuator}
            setSelected={handleToggleActuator}
            setOpenPopup={setOpenPopup}
          />
        );

      case "numeric":
        return (
          <Numeric
            setSwitcherState={setSwitcherState}
            selected={serviceValue.actuator}
            setSelected={handleToggleActuator}
            setOpenPopup={setOpenPopup}
          />
        );

      default:
        break;
    }
  }

  return (
    <Fragment>
      <Dragable bottom={"30px"} right={"30px"} name="add-controlling">
        <Fab
          style={{ boxShadow: "none" }}
          id="controlling-fab"
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
          <Sensors
            name="Actuator"
            loader={actuator.isLoading}
            handleToggle={handleToggleActuator}
            parameters={allActuators}
            selected={serviceValue.assetMapping[selectedAssetIndex]?.actuators}
            uniqueSelected={serviceValue.configuredActuators}
            allAssets={allAssets}
            selectedAsset={selectedAsset}
            setSelectedAsset={setSelectedAsset}
            selectedAssetIndex={selectedAssetIndex}
            zoomOut
            assetMapping={serviceValue.assetMapping}
          />
        </span>
        {/* <br></br>
        <span
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <props.Chips
            handleDelete={handleDeleteActuator}
            color={"#f77500"}
            icon={RadioButtonCheckedIcon}
            value={props.actuator}
            id={props.selected}
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
              color="error"
              id="cancel"
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
                  page: 2,
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
              else
                dispatch(
                  setService({
                    page: 4,
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
