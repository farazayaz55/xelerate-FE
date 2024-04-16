import React, { useState } from "react";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Chip from "@mui/material/Chip";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { Fragment } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import AddCircleOutlineRoundedIcon from "@mui/icons-material/AddCircleOutlineRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Typography from "@mui/material/Typography";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import RemoveCircleOutlineRoundedIcon from "@mui/icons-material/RemoveCircleOutlineRounded";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import { useSelector } from "react-redux";
import {
  faGreaterThan,
  faLessThan,
  faGreaterThanEqual,
  faLessThanEqual,
  faEquals,
  faArrowsLeftRightToLine,
  faArrowsLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import InputAdornment from "@mui/material/InputAdornment";
import { useEffect } from "react";
import { useSnackbar } from "notistack";

let alarmTypes = [
  { name: "CRITICAL", color: "#e73e3a" },
  { name: "MAJOR", color: "#844204" },
  { name: "MINOR", color: "#fc9208" },
  { name: "WARNING", color: "#278dea" },
];

export default function Edit({ form, ...props }) {
  const metaDataValue = useSelector((state) => state.metaData);
  console.log(metaDataValue.services.find((s) => s.id == props.id));
  let device =
    useSelector((state) => state.asset.device) ||
    JSON.parse(
      JSON.stringify(metaDataValue.services.find((s) => s.id == props.id))
    );

  if (props.id && device && device.esbMetaData) {
    device.esbMetaData = device?.esbMetaData.find(
      (type) => type.assetType == form.values.assetType
    );
  }
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
  }, []);

  const scrollToBottom = () => {
    formEnd.current.scrollIntoView({ behavior: "smooth" });
  };

  function handleKeyDown(e) {
    if ([69, 187, 188].includes(e.keyCode)) {
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

  function handleDeleteAll() {
    form.setFieldValue("multipleOperations", [
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
  const conditionalStyles =
    props.service.assets && props.service.assets.length > 1
      ? {
          display: "flex",
          justifyContent: "end",
        }
      : {
          display:
            props?.solution && props.solution === "esb" ? "flex" : "initial",
          justifyContent:
            props?.solution && props.solution === "esb"
              ? "space-between"
              : "initial",
          textAlign:
            !props?.solution || props.solution !== "esb" ? "end" : "initial",
        };
  return (
    <div
      style={{
        height: props.service.assets && props.service.assets.length === 1 ? "70vh" : "50vh",
        maxHeight: "500px",
        overflowY: "auto",
      }}
    >
      <div style={conditionalStyles}>
        {props.service.assets && props.service.assets.length === 1 ? (
          <>
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
          </>
        ) : null}
        <div>
          <FormControlLabel
            control={
              <Switch
                checked={form.values.unavailabilityChk}
                onChange={(e) => {
                  let nameVal = form.values.name;
                  form.resetForm();
                  form.setFieldValue("name", nameVal);
                  form.setFieldValue("unavailabilityChk", e.target.checked);
                }}
              />
            }
            label="Unavailability Rule"
          />
        </div>
      </div>
      {props.service.assets && props.service.assets.length === 1 ? (
        <>
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
        </>
      ) : null}

      {form.values.unavailabilityChk ? null : (
        <>
          <Box
            style={{
              margin: "16px 2px",
            }}
          >
            <p
              style={{
                fontSize: "16px",
                fontStyle: "bold",
              }}
            >
              Conditions (
              {form.values.multipleOperations
                ? form.values.multipleOperations.length
                : ""}
              )
              <Tooltip title="Add condition">
                <IconButton
                  color="secondary"
                  onClick={() => handleAdd()}
                  style={{
                    height: "40px",
                    width: "40px",
                    float: "right",
                    bottom: "6px",
                    margin: "0 1.5px",
                  }}
                >
                  <AddCircleOutlineRoundedIcon
                    style={{
                      cursor: "pointer",
                      height: "24px",
                      width: "28px",
                      color: "rgba(0, 0, 0, 0.54)",
                      float: "right",
                    }}
                  />
                </IconButton>
              </Tooltip>
              {form.values.multipleOperations.length > 1 && (
                <Tooltip title="Delete all conditions">
                  <IconButton
                    color="secondary"
                    onClick={() => handleDeleteAll()}
                    style={{
                      height: "40px",
                      width: "40px",
                      float: "right",
                      bottom: "6px",
                      margin: "0 1.5px",
                    }}
                  >
                    <DeleteRoundedIcon
                      style={{
                        cursor: "pointer",
                        height: "24px",
                        width: "28px",
                        color: "rgba(0, 0, 0, 0.54)",
                        float: "right",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              )}
              {form.values.multipleOperations.length > 1 && (
                <Box
                  style={{
                    float: "right",
                    "margin-right": "132px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      height: "30px",
                      borderRadius: "10px",
                      width: "76px",
                      border: "1px solid lightgrey",
                    }}
                  >
                    <Tooltip title="Logical Operator for conditions">
                      <div
                        style={{
                          color: "grey",
                          width: "38px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "9px",
                          cursor: "pointer",
                          borderRight: "1px solid lightgrey",
                          borderTopLeftRadius: "10px",
                          borderBottomLeftRadius: "10px",
                          backgroundColor:
                            form.values.multipleOperationsOperator == "AND" &&
                            metaDataValue.branding.primaryColor,
                          color:
                            form.values.multipleOperationsOperator == "AND" &&
                            "white",
                        }}
                        onClick={(e) => {
                          form.setFieldValue(
                            `multipleOperationsOperator`,
                            "AND"
                          );
                        }}
                      >
                        AND
                      </div>
                    </Tooltip>

                    <Tooltip title="Logical Operator for conditions">
                      <div
                        style={{
                          color: "grey",
                          width: "38px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontSize: "9px",
                          cursor: "pointer",
                          borderLeft: "1px solid lightgrey",
                          borderTopRightRadius: "10px",
                          borderBottomRightRadius: "10px",
                          backgroundColor:
                            form.values.multipleOperationsOperator == "OR" &&
                            metaDataValue.branding.primaryColor,
                          color:
                            form.values.multipleOperationsOperator == "OR" &&
                            "white",
                        }}
                        onClick={(e) => {
                          form.setFieldValue(
                            `multipleOperationsOperator`,
                            "OR"
                          );
                        }}
                      >
                        OR
                      </div>
                    </Tooltip>
                  </div>
                </Box>
              )}
            </p>
          </Box>

          {form.values?.multipleOperations.map((val, i) => {
            return (
              <>
                <Accordion
                  style={{
                    width: "520px",
                    left: "2px",
                    border: "1px solid rgba(0, 0, 0, 0.20)",
                    borderRadius: "10px",
                    marginBottom: "10px",
                  }}
                  onClick={() => {
                    setOpenIndex(i);
                  }}
                  expanded={openIndex == i}
                >
                  <AccordionSummary
                    expandIcon={<EditRoundedIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        width: "100%",
                        justifyContent: "space-between",
                        alignItems: "center",
                        height: "10px",
                      }}
                    >
                      <Typography sx={{ color: "lightgray" }}>
                        Condition {i + 1}{" "}
                      </Typography>
                      {openIndex !== i && (
                        <p
                          style={{
                            fontWeight: "bold",
                            color: "darkgray",
                            marginRight: "5px",
                          }}
                        >
                          <span>{val.parameter}</span>
                          <span style={{ fontSize: "12px", marginLeft: "4px" }}>
                            {val.operation == "eq" && val.parameter !== "" && (
                              <FontAwesomeIcon icon={faEquals} />
                            )}
                            {val.operation == "gt" && val.parameter !== "" && (
                              <FontAwesomeIcon icon={faGreaterThan} />
                            )}
                            {val.operation == "gte" && val.parameter !== "" && (
                              <FontAwesomeIcon icon={faGreaterThanEqual} />
                            )}
                            {val.operation == "lt" && val.parameter !== "" && (
                              <FontAwesomeIcon icon={faLessThan} />
                            )}
                            {val.operation == "lte" && val.parameter !== "" && (
                              <FontAwesomeIcon icon={faLessThanEqual} />
                            )}
                            {val.operation == "ib" && val.parameter !== "" && (
                              <FontAwesomeIcon icon={faArrowsLeftRightToLine} />
                            )}
                            {val.operation == "nib" && val.parameter !== "" && (
                              <FontAwesomeIcon icon={faArrowsLeftRight} />
                            )}
                          </span>
                          <span style={{ marginLeft: "4px" }}>
                            {val.parameter !== "" &&
                            val.operation !== "" &&
                            val.rollingFlag
                              ? `${val.rollingAvg} (avg over ${val.rollingTimeDuration})`
                              : `${val.condition}`}
                          </span>
                        </p>
                      )}
                      <Tooltip title="Delete condition ?">
                        <IconButton>
                          <RemoveCircleOutlineRoundedIcon
                            color="error"
                            onClick={() => deleteCondition(i)}
                          />
                        </IconButton>
                      </Tooltip>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails>
                    {form.values.unavailabilityChk ? null : (
                      <>
                        <div style={{ display: "flex", gap: "20px" }}>
                          <FormControl
                            fullWidth
                            error={
                              form.touched.multipleOperations &&
                              form.errors.multipleOperations &&
                              form.touched.multipleOperations[i]?.parameter &&
                              form.errors.multipleOperations[i]?.parameter
                            }
                          >
                            <InputLabel>Parameter *</InputLabel>
                            <Select
                              fullWidth
                              label="Parameter *"
                              name={`multipleOperations[${i}].parameter`}
                              required
                              value={
                                form.values.multipleOperations[i].parameter
                              }
                              onChange={(e) => {
                                form.handleChange(e);
                                form.setFieldValue(
                                  `multipleOperations[${i}].parameter`,
                                  e.target.value
                                );
                              }}
                              onBlur={form.handleBlur}
                              disabled={form.values.unavailabilityChk}
                            >
                              {sensors.map((elm) => {
                                return (
                                  <MenuItem value={elm.name}>
                                    {elm.friendlyName}
                                  </MenuItem>
                                );
                              })}
                            </Select>
                            <FormHelperText
                              style={{
                                marginLeft: "15px",
                                color: "#d63b3b",
                              }}
                            >
                              {form.touched.multipleOperations &&
                              form.touched.multipleOperations[i]?.parameter
                                ? form.errors.multipleOperations &&
                                  form.errors.multipleOperations[i]?.parameter
                                : ""}
                            </FormHelperText>
                          </FormControl>

                          <FormControl
                            fullWidth
                            error={
                              form.touched.multipleOperations &&
                              form.errors.multipleOperations &&
                              form.touched.multipleOperations[i]?.operation &&
                              form.errors.multipleOperations[i]?.operation
                            }
                          >
                            <InputLabel>Operator *</InputLabel>
                            <Select
                              fullWidth
                              required
                              label="Operator *"
                              name={`multipleOperations[${i}].operation`}
                              value={
                                form.values.multipleOperations[i].operation
                              }
                              onChange={(e) => {
                                form.handleChange(e);
                                form.setFieldValue(
                                  `multipleOperations[${i}].operation`,
                                  e.target.value
                                );
                                form.setFieldValue(
                                  `multipleOperations[${i}].range.min`,
                                  ""
                                );
                                form.setFieldValue(
                                  `multipleOperations[${i}].range.max`,
                                  ""
                                );
                              }}
                              onBlur={form.handleBlur}
                              disabled={form.values.unavailabilityChk}
                            >
                              <MenuItem value="eq">Equal</MenuItem>
                              <MenuItem value="gt">Greater</MenuItem>
                              <MenuItem value="gte">Greater and Equal</MenuItem>
                              <MenuItem value="lt">Less</MenuItem>
                              <MenuItem value="lte">Less and Equal</MenuItem>
                              <MenuItem value="ib">In Between</MenuItem>
                              <MenuItem value="nib">Not In Between</MenuItem>
                            </Select>
                            <FormHelperText
                              style={{
                                marginLeft: "15px",
                                color: "#d63b3b",
                              }}
                            >
                              {form.touched.multipleOperations &&
                              form.errors.multipleOperations &&
                              form.touched.multipleOperations[i]?.operation
                                ? form.errors.multipleOperations[i]?.operation
                                : ""}
                            </FormHelperText>
                          </FormControl>
                        </div>

                        <Fragment>
                          {form.values.multipleOperations[i].operation ==
                            "ib" ||
                          form.values.multipleOperations[i].operation ==
                            "nib" ? (
                            <div style={{ display: "flex", gap: "20px" }}>
                              <TextField
                                id="min"
                                variant="outlined"
                                required={
                                  form.values.multipleOperations[i].rollingAvg
                                    ? false
                                    : true
                                }
                                type="number"
                                label="Min"
                                disabled={form.values.unavailabilityChk}
                                value={
                                  form.values.multipleOperations[i].range?.min
                                }
                                error={
                                  form.touched.multipleOperations &&
                                  form.errors.multipleOperations &&
                                  form.touched.multipleOperations[i]?.range
                                    ?.min &&
                                  form.errors.multipleOperations[i]?.range?.min
                                }
                                helperText={
                                  form.touched.multipleOperations &&
                                  form.errors.multipleOperations &&
                                  form.touched.multipleOperations[i]?.range?.min
                                    ? form.errors.multipleOperations[i]?.range
                                        ?.min
                                    : ""
                                }
                                onChange={(e) => {
                                  // let arr = e.target.value.split("");
                                  // let last =
                                  //   e.target.value[e.target.value.length - 1];
                                  // if (
                                  //   last &&
                                  //   last != 0 &&
                                  //   last != "." &&
                                  //   last != "-" &&
                                  //   !parseInt(last)
                                  // ) {
                                  //   return;
                                  // }
                                  // if (
                                  //   last == "-" &&
                                  //   form.values.multipleOperations[i].range.min
                                  //     .length > 0 &&
                                  //   e.target.value != "-"
                                  // ) {
                                  //   return;
                                  // }
                                  // if (arr.filter((a) => a == ".").length > 1) {
                                  //   return;
                                  // }
                                  form.handleChange(e);
                                  form.setFieldValue(
                                    `multipleOperations[${i}].range.min`,
                                    e.target.value
                                  );
                                }}
                                onBlur={form.handleBlur}
                                fullWidth
                                margin="dense"
                                onKeyDown={handleKeyDown}
                              />
                              <TextField
                                id="max"
                                variant="outlined"
                                required={
                                  form.values.multipleOperations[i].rollingAvg
                                    ? false
                                    : true
                                }
                                type="number"
                                label="Max"
                                disabled={form.values.unavailabilityChk}
                                value={
                                  form.values.multipleOperations[i].range.max
                                }
                                error={
                                  form.touched.multipleOperations &&
                                  form.errors.multipleOperations &&
                                  form.touched.multipleOperations[i]?.range
                                    ?.max &&
                                  form.errors.multipleOperations[i]?.range?.max
                                }
                                helperText={
                                  form.touched.multipleOperations &&
                                  form.errors.multipleOperations &&
                                  form.touched.multipleOperations[i]?.range?.max
                                    ? form.errors.multipleOperations[i]?.range
                                        ?.max
                                    : ""
                                }
                                onChange={(e) => {
                                  // let arr = e.target.value.split("");
                                  // let last =
                                  //   e.target.value[e.target.value.length - 1];
                                  // if (
                                  //   last &&
                                  //   last != 0 &&
                                  //   last != "." &&
                                  //   last != "-" &&
                                  //   !parseInt(last)
                                  // ) {
                                  //   return;
                                  // }
                                  // if (
                                  //   last == "-" &&
                                  //   form.values.multipleOperations[i].range.max
                                  //     .length > 0 &&
                                  //   e.target.value != "-"
                                  // ) {
                                  //   return;
                                  // }
                                  // if (arr.filter((a) => a == ".").length > 1) {
                                  //   return;
                                  // }
                                  form.handleChange(e);
                                  form.setFieldValue(
                                    `multipleOperations[${i}].range.max`,
                                    e.target.value
                                  );
                                }}
                                onBlur={form.handleBlur}
                                fullWidth
                                margin="dense"
                                onKeyDown={handleKeyDown}
                              />
                            </div>
                          ) : (
                            <div
                              style={{
                                display: "flex",
                                gap: "20px",
                              }}
                            >
                              {!form.values.multipleOperations[i]
                                .rollingFlag ? (
                                <TextField
                                  id="condition"
                                  variant="outlined"
                                  required={
                                    form.values.rollingAvg ? false : true
                                  }
                                  type="number"
                                  label="Value"
                                  value={
                                    form.values.multipleOperations[i].condition
                                  }
                                  disabled={form.values.unavailabilityChk}
                                  error={
                                    form.touched.multipleOperations &&
                                    form.errors.multipleOperations &&
                                    form.touched.multipleOperations[i]
                                      ?.condition &&
                                    form.errors.multipleOperations[i]?.condition
                                  }
                                  helperText={
                                    form.touched.multipleOperations &&
                                    form.errors.multipleOperations &&
                                    form.touched.multipleOperations[i]
                                      ?.condition
                                      ? form.errors.multipleOperations[i]
                                          ?.condition
                                      : ""
                                  }
                                  onChange={(e) => {
                                    // let arr = e.target.value.split("");
                                    // let last =
                                    //   e.target.value[e.target.value.length - 1];
                                    // if (
                                    //   last &&
                                    //   last != 0 &&
                                    //   last != "." &&
                                    //   last != "-" &&
                                    //   !parseInt(last)
                                    // ) {
                                    //   return;
                                    // }
                                    // if (
                                    //   last == "-" &&
                                    //   form.values.multipleOperations[i]
                                    //     .condition.length > 0 &&
                                    //   e.target.value != "-"
                                    // ) {
                                    //   return;
                                    // }
                                    // if (
                                    //   arr.filter((a) => a == ".").length > 1
                                    // ) {
                                    //   return;
                                    // }
                                    form.handleChange(e);
                                    form.setFieldValue(
                                      `multipleOperations[${i}].condition`,
                                      e.target.value
                                    );
                                  }}
                                  onBlur={form.handleBlur}
                                  fullWidth
                                  margin="dense"
                                  onKeyDown={handleKeyDown}
                                  sx={{ width: "100%" }}
                                />
                              ) : (
                                <TextField
                                  id="rollingAvg"
                                  required={
                                    form.values.multipleOperations[i].condition
                                      ? false
                                      : true
                                  }
                                  variant="outlined"
                                  type="number"
                                  label="Rolling Average"
                                  disabled={form.values.unavailabilityChk}
                                  value={
                                    form.values.multipleOperations[i].rollingAvg
                                  }
                                  error={
                                    form.touched.multipleOperations &&
                                    form.errors.multipleOperations &&
                                    form.touched.multipleOperations[i]
                                      ?.rollingAvg &&
                                    form.errors.multipleOperations[i]
                                      ?.rollingAvg
                                  }
                                  helperText={
                                    form.touched.multipleOperations &&
                                    form.errors.multipleOperations &&
                                    form.touched.multipleOperations[i]
                                      ?.rollingAvg
                                      ? form.errors.multipleOperations[i]
                                          ?.rollingAvg
                                      : ""
                                  }
                                  onChange={(e) => {
                                    // let arr = e.target.value.split("");
                                    // let last =
                                    //   e.target.value[e.target.value.length - 1];
                                    // if (
                                    //   last &&
                                    //   last != 0 &&
                                    //   last != "." &&
                                    //   last != "-" &&
                                    //   !parseInt(last)
                                    // ) {
                                    //   return;
                                    // }
                                    // if (
                                    //   last == "-" &&
                                    //   form.values.multipleOperations[i]
                                    //     .rollingAvg.length > 0 &&
                                    //   e.target.value != "-"
                                    // ) {
                                    //   return;
                                    // }
                                    // if (
                                    //   arr.filter((a) => a == ".").length > 1
                                    // ) {
                                    //   return;
                                    // }
                                    form.handleChange(e);
                                    form.setFieldValue(
                                      `multipleOperations[${i}].rollingAvg`,
                                      e.target.value
                                    );
                                  }}
                                  onBlur={form.handleBlur}
                                  fullWidth
                                  margin="dense"
                                  onKeyDown={handleKeyDown}
                                  sx={{ width: "100%" }}
                                />
                              )}
                              <FormControl
                                fullWidth
                                margin="dense"
                                error={
                                  form.touched.multipleOperations &&
                                  form.errors.multipleOperations &&
                                  form.touched.multipleOperations[i]
                                    ?.rollingTimeDuration &&
                                  form.errors.multipleOperations[i]
                                    ?.rollingTimeDuration
                                }
                              >
                                <InputLabel>Time Duration *</InputLabel>
                                <Select
                                  fullWidth
                                  required
                                  defaultValue={"instantaneous"}
                                  disabled={form.values.unavailabilityChk}
                                  label="Time Duration *"
                                  name="rollingTimeDuration"
                                  value={
                                    form.values.multipleOperations[i]
                                      .rollingFlag
                                      ? form.values.multipleOperations[i]
                                          .rollingTimeDuration
                                      : "instantaneous"
                                  }
                                  onChange={(e) => {
                                    form.handleChange(e);
                                    e.target.value === "instantaneous"
                                      ? form.setFieldValue(
                                          `multipleOperations[${i}].rollingFlag`,
                                          false
                                        )
                                      : (form.setFieldValue(
                                          `multipleOperations[${i}].rollingTimeDuration`,
                                          e.target.value
                                        ),
                                        form.setFieldValue(
                                          `multipleOperations[${i}].rollingAvg`,
                                          ""
                                        ),
                                        form.setFieldValue(
                                          `multipleOperations[${i}].rollingFlag`,
                                          true
                                        ));

                                    // e.target.value === "instantaneous" ? (
                                    //   form.setFieldValue(
                                    //     `multipleOperations[${i}].rollingFlag`,
                                    //     false
                                    //   )
                                    // )
                                    // : (
                                    //   form.setFieldValue(
                                    //     `multipleOperations[${i}].rollingTimeDuration`,
                                    //     e.target.value
                                    //   )
                                    //   form.setFieldValue(
                                    //     `multipleOperations[${i}].rollingAvg`,
                                    //     ""
                                    //   )
                                    //   form.setFieldValue(
                                    //     `multipleOperations[${i}].condition`,
                                    //     ""
                                    //   )
                                    //   form.setFieldValue(
                                    //     `multipleOperations[${i}].operation`,
                                    //     ""
                                    //   )
                                    //   form.setFieldValue(
                                    //     `multipleOperations[${i}].rollingFlag`,
                                    //     true
                                    //   )
                                    // )
                                  }}
                                  onBlur={form.handleBlur}
                                >
                                  <MenuItem value="instantaneous">
                                    Instantaneous Value
                                  </MenuItem>
                                  <MenuItem value="hourly">
                                    Last hr Avg
                                  </MenuItem>
                                  <MenuItem value="4h">Last 4 hr Avg</MenuItem>
                                  <MenuItem value="8h">Last 8 hr Avg</MenuItem>
                                  <MenuItem value="daily">
                                    Last 24 hr Avg
                                  </MenuItem>
                                </Select>
                                <FormHelperText
                                  style={{
                                    marginLeft: "15px",
                                    color: "#d63b3b",
                                  }}
                                >
                                  {form.touched.multipleOperations &&
                                  form.errors.multipleOperations &&
                                  form.touched.multipleOperations[i]
                                    ?.rollingTimeDuration
                                    ? form.errors.multipleOperations[i]
                                        ?.rollingTimeDuration
                                    : ""}
                                </FormHelperText>
                              </FormControl>

                              {/* <FormControlLabel
                                control={
                                  <Switch
                                    checked={
                                      form.values.multipleOperations[i]
                                        .rollingFlag
                                    }
                                    onChange={(e) => {
                                      form.setFieldValue(
                                        `multipleOperations[${i}].condition`,
                                        ""
                                      );
                                      form.setFieldValue(
                                        `multipleOperations[${i}].rollingTimeDuration`,
                                        ""
                                      );
                                      form.setFieldValue(
                                        `multipleOperations[${i}].rollingAvg`,
                                        ""
                                      );
                                      form.setFieldValue(
                                        `multipleOperations[${i}].rollingFlag`,
                                        e.target.checked
                                      );
                                    }}
                                    disabled={form.values.unavailabilityChk}
                                  />
                                }
                                label="Rolling Average"
                              /> */}
                            </div>
                          )}
                        </Fragment>

                        {/* {form.values.multipleOperations[i].rollingFlag ? (
                          <Fragment>
                            <FormControl
                              fullWidth
                              margin="dense"
                              error={
                                form.touched.multipleOperations &&
                                form.errors.multipleOperations &&
                                form.touched.multipleOperations[i]
                                  ?.rollingTimeDuration &&
                                form.errors.multipleOperations[i]
                                  ?.rollingTimeDuration
                              }
                            >
                              <InputLabel>Time Duration *</InputLabel>
                              <Select
                                fullWidth
                                required
                                disabled={form.values.unavailabilityChk}
                                label="Time Duration *"
                                name="rollingTimeDuration"
                                value={
                                  form.values.multipleOperations[i]
                                    .rollingTimeDuration
                                }
                                onChange={(e) => {
                                  form.handleChange(e);
                                  form.setFieldValue(
                                    `multipleOperations[${i}].rollingTimeDuration`,
                                    e.target.value
                                  );
                                }}
                                onBlur={form.handleBlur}
                              >
                                <MenuItem value="hourly">Last hour</MenuItem>
                                <MenuItem value="4h">Last 4 hours</MenuItem>
                                <MenuItem value="8h">Last 8 hours</MenuItem>
                                <MenuItem value="daily">Last 24 hours</MenuItem>
                              </Select>
                              <FormHelperText
                                style={{
                                  marginLeft: "15px",
                                  color: "#d63b3b",
                                }}
                              >
                                {form.touched.multipleOperations &&
                                form.errors.multipleOperations &&
                                form.touched.multipleOperations[i]
                                  ?.rollingTimeDuration
                                  ? form.errors.multipleOperations[i]
                                      ?.rollingTimeDuration
                                  : ""}
                              </FormHelperText>
                            </FormControl>
                          </Fragment>
                        ) : null} */}
                      </>
                    )}
                  </AccordionDetails>
                </Accordion>
                <div
                  style={{ float: "left", clear: "both", marginTop: "50px" }}
                  ref={formEnd}
                />
              </>
            );
          })}
        </>
      )}
    </div>
  );
}
