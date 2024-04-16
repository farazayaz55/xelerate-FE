import React, { useState } from "react";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { useSnackbar } from "notistack";
import ShowAssets from "../../../assets";

let alarmTypes = [
  { name: "CRITICAL", color: "#e73e3a" },
  { name: "MAJOR", color: "#844204" },
  { name: "MINOR", color: "#fc9208" },
  { name: "WARNING", color: "#278dea" },
];

export default function Edit({ form, ...props }) {
  console.log("form", form);

  const metaDataValue = useSelector((state) => state.metaData);
  console.log("metaDataValue", metaDataValue);
  console.log(metaDataValue.services.find((s) => s.id == props.id));
  let device =
    useSelector((state) => state.asset.device) ||
    JSON.parse(
      JSON.stringify(metaDataValue.services.find((s) => s.id == props.id))
    );
  if (props.id && device && device.esbMetaData) {
    device.esbMetaData = device.esbMetaData.find(
      (type) => type.assetType == form.values.assetType
    );
  }
  console.log("metaDataValue", metaDataValue);
  const [openIndex, setOpenIndex] = React.useState(0);
  const formEnd = React.useRef(null);
  const [assetType, setAssetType] = useState(form.values.assetType);
  const [sensors, setSensors] = useState(
    device.esbMetaData &&
      device.esbMetaData.datapoints &&
      device.esbMetaData.datapoints.length
      ? props.fields.filter((s) =>
          device.esbMetaData.datapoints.includes(s.name)
        )
      : props.fields
  );
  const { enqueueSnackbar } = useSnackbar();

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function updateDeviceSensors(val) {
    if (props.id && device && device.esbMetaData) {
      device.esbMetaData = metaDataValue.services
        .find((s) => s.id == props.id)
        .esbMetaData.find((type) => type.assetType == val);
    }
  }

  useEffect(() => {
    if (!form.values.multipleOperationsOperator) {
      form.setFieldValue("multipleOperationsOperator", "AND");
    }
    if (
      form.values.platformDeviceTypeAllowed &&
      form.values.platformDeviceTypeAllowed.length
    ) {
      findCommonSensors(form.values.platformDeviceTypeAllowed);
      findCommonActuators(form.values.platformDeviceTypeAllowed);
    }
  }, []);

  const scrollToBottom = () => {
    formEnd.current.scrollIntoView({ behavior: "smooth" });
  };

  function handleKeyDown(e) {
    if ([69, 187, 188, 189].includes(e.keyCode)) {
      e.preventDefault();
      return;
    }
  }

  function handleClick(value) {
    form.setFieldValue("severity", value);
  }

  function handleAdd() {
    let temp = Array.from(form.values.multipleOperations);
    const lastEntry = temp[temp.length - 1];
    if (!form.values.unavailabilityChk) {
      if (
        lastEntry.rollingFlag &&
        (lastEntry.rollingAvg == "" || lastEntry.rollingTimeDuration == "")
      ) {
        showSnackbar("Rules", "Please fill the required fields", "error", 1000);
        return;
      }
      if (!lastEntry.rollingFlag) {
        if (lastEntry.operation == "ib" || lastEntry.operation == "nib") {
          if (lastEntry.range.min == null || lastEntry.range.max == null) {
            showSnackbar(
              "Rules",
              "Please fill the required fields",
              "error",
              1000
            );
            return;
          }
        } else if (
          lastEntry.parameter == "" ||
          lastEntry.operation == "" ||
          lastEntry.condition == ""
        ) {
          showSnackbar(
            "Rules",
            "Please fill the required fields",
            "error",
            1000
          );
          return;
        }
      }
    }

    temp.push({
      parameter: "",
      operation: "",
      condition: "",
      rollingAvg: "",
      rollingFlag: false,
      rollingTimeDuration: "",
      range: {
        min: "",
        max: "",
      },
    });
    form.setFieldValue("multipleOperations", temp);
    setOpenIndex(temp.length - 1);
    scrollToBottom();
  }

  function deleteCondition(i) {
    let temp = form.values.multipleOperations;
    if (temp.length > 1) {
      const newOperationsList = temp.filter((_, index) => index !== i);
      form.setFieldValue("multipleOperations", newOperationsList);
    } else {
      showSnackbar("Rules", "Atleast one condition is required", "error", 1000);
    }
  }

  const handleChange = (event, newValue) => {
    form.setFieldValue("assetType", newValue);
    form.setFieldValue(`multipleOperations`, [
      {
        parameter: "",
        operation: "",
        condition: "",
        rollingAvg: "",
        rollingFlag: false,
        rollingTimeDuration: "",
        range: {
          min: "",
          max: "",
        },
      },
    ]);
    setOpenIndex(0);
    setAssetType(newValue);
    updateDeviceSensors(newValue);
    setSensors(
      device.esbMetaData &&
        device.esbMetaData.datapoints &&
        device.esbMetaData.datapoints.length
        ? props.fields.filter((s) =>
            device.esbMetaData.datapoints.includes(s.name)
          )
        : props.fields
    );
  };
  const findCommonSensors = (assetTypesList) => {
    if (!assetTypesList || !assetTypesList.length) {
      props.setSensors([]);
    }
    // Filter assets based on provided asset types
    const filteredAssets = props.service?.assetMapping.filter((asset) =>
      assetTypesList.includes(asset.assetType._id)
    );
    // Check if there are any assets matching the provided asset types
    if (filteredAssets.length === 0) {
      props.setSensors([]);

      return [];
    }

    // Get the sensors for the first asset
    const combinedList = [].concat(...filteredAssets.map((obj) => obj.sensors));

    // Use a Set to eliminate duplicates based on the 'id' property
    const uniqueList = Array.from(
      new Set(combinedList.map((item) => item.id || item._id))
    ).map((id) => combinedList.find((item) => (item.id || item._id) === id));

    props.setSensors(uniqueList);
  };
  const findCommonActuators = (assetTypesList) => {
    if (!assetTypesList || !assetTypesList.length) {
      props.setActuators([]);
    }
    // Filter assets based on provided asset types
    const filteredAssets = props.service?.assetMapping.filter((asset) =>
      assetTypesList.includes(asset.assetType._id)
    );
    // Check if there are any assets matching the provided asset types
    if (filteredAssets.length === 0) {
      props.setActuators([]);

      return [];
    }

    // Get the sensors for the first asset
    const combinedList = [].concat(
      ...filteredAssets.map((obj) => obj.actuators)
    );

    // Use a Set to eliminate duplicates based on the 'id' property
    const uniqueList = Array.from(
      new Set(combinedList.map((item) => item.id || item._id))
    ).map((id) => combinedList.find((item) => (item.id || item._id) === id));
    props.setActuators(uniqueList);
  };
  const selectAsset = (asset) => {
    let selectedAssets = form.values.platformDeviceTypeAllowed
      ? JSON.parse(JSON.stringify(form.values.platformDeviceTypeAllowed))
      : [];
    let assetId = asset.id || asset._id;
    const index = selectedAssets.findIndex((item) => item === assetId);
    if (index !== -1) {
      if (
        selectedAssets &&
        selectedAssets.length === 1
      ) {
        showSnackbar("Rules", "There should be atleast one Asset type", "error", 1000);
        return;
      }
      selectedAssets.splice(index, 1);
    } else {
      selectedAssets.push(asset.id || asset._id);
    }
    findCommonSensors(selectedAssets);
    findCommonActuators(selectedAssets);
    form.setFieldValue("platformDeviceTypeAllowed", selectedAssets);
  };
  return (
    <div
      style={{
        height: "50vh",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: props?.solution && props.solution === "esb" && "flex",
          justifyContent:
            props?.solution && props.solution === "esb" && "space-between",
          textAlign:
            !props?.solution || props.solution !== "esb" ? "end" : undefined,
        }}
      >
        {props?.solution && props.solution === "esb" ? (
          <div>
            <ToggleButtonGroup
              color="primary"
              value={assetType}
              exclusive
              onChange={handleChange}
              aria-label="Platform"
              size="small"
            >
              <ToggleButton value="Inverter">Inverter</ToggleButton>
              <ToggleButton value="EVCharger">EV Charger</ToggleButton>
              <ToggleButton value="Other">Others</ToggleButton>
            </ToggleButtonGroup>
          </div>
        ) : null}
      </div>

      {!props.row ? (
        <div
          style={{
            padding: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "10px",
          }}
        >
          {alarmTypes.map((alarm) => {
            return (
              // eslint-disable-next-line react/jsx-key
              <Chip
                icon={
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={
                      form.values.severity == alarm.name
                        ? {
                            color: "white",
                          }
                        : {}
                    }
                  />
                }
                onClick={() => {
                  handleClick(alarm.name);
                }}
                clickable
                label={alarm.name}
                style={
                  form.values.severity == alarm.name
                    ? {
                        color: "white",
                        backgroundColor: alarm.color,
                        marginRight: "10px",
                      }
                    : {
                        marginRight: "10px",
                      }
                }
              />
            );
          })}
        </div>
      ) : null}
      <TextField
        id="name"
        required
        label="Name"
        variant="outlined"
        margin="dense"
        error={form.touched.name && form.errors.name}
        value={form.values.name}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
        helperText={form.touched.name ? form.errors.name : ""}
        fullWidth
        style={{
          width: "98%",
        }}
      />
      {form.values.unavailabilityChk ? null : (
        <>
          <div
            style={{
              borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
              marginBottom: "20px",
              marginTop: "20px",
              marginRight: "14px",
            }}
          ></div>
        </>
      )}
      <div style={{ marginTop: "2rem" }}>
        <ShowAssets
          assets={props.service?.assets || []}
          selectedAsset={form.values.platformDeviceTypeAllowed}
          selectAsset={selectAsset}
          selectedColor={metaDataValue.branding.secondaryColor}
        />
      </div>
    </div>
  );
}
