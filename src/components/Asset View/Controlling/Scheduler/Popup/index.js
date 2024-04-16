import React, { useEffect, useState, Fragment } from "react";
import { DesktopDatePicker } from "@mui/x-date-pickers/DesktopDatePicker";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormHelperText from "@mui/material/FormHelperText";
import { useSnackbar } from "notistack";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Switch from "@mui/material/Switch";
import { useSelector } from "react-redux";
import CircularProgress from '@mui/material/CircularProgress';
import {
  useAddScheduleMutation,
  useEditScheduleMutation,
} from "services/controlling";
import {
  useAddScheduleGlobalMutation,
  useEditScheduleGlobalMutation,
} from "services/controllingGlobal";
import { useFormik } from "formik";
import * as Yup from "yup";
import Actuators from "components/Actuators";
import { getControllingValues } from "Utilities/Controlling Widgets";
import ShowAssets from "../../../assets";
import InputAdornment from "@mui/material/InputAdornment";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";
import Zoom from "@mui/material/Zoom";
export default function DM({
  actuators,
  setOpenPopup,
  row,
  setRow,
  global,
  group,
  execute,
  updateSchFn,
  ...props
}) {
  const metaDataValue = useSelector((state) => state.metaData);
  let device =
    useSelector((state) => state.asset.device) ||
    JSON.parse(
      JSON.stringify(metaDataValue.services.find((s) => s.id == props.id))
    );
  const service = props?.serviceId
    ? metaDataValue.services.find((s) => s.id == props.serviceId)
    : metaDataValue.services.find((s) => s.id == props.id);
  console.log({ serviceId: props.serviceId });
  console.log({ service });
  const filtersValue = useSelector((state) => state.filterDevice);
  const { enqueueSnackbar } = useSnackbar();
  let token = window.localStorage.getItem("token");
  const [addSchedule, addResult] = useAddScheduleMutation();
  const [editSchedule, editResult] = useEditScheduleMutation();
  const [addScheduleGlobal, addGlobalResult] = useAddScheduleGlobalMutation();
  const [
    editScheduleGlobal,
    editGlobalResult,
  ] = useEditScheduleGlobalMutation();
  const [multiAssetActuators, setMultiAssetActuators] = useState([]);
  const [selectedId, setSelectedId] = useState([]);
  const [selected, setSelected] = useState([]);
  const [sync, setSync] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const scheduleForm = useFormik({
    initialValues: {
      name: execute ? "Execute Control" : "",
      actuator: "",
      notifyExecutionStatus: true,
      notifyExecutionStatusEmail: metaDataValue?.userInfo?.email || "",
      notifyExecutionStatusReportAfter: "5",
      command: "",
      value: "",
      label: "",
      days: "",
      platformDeviceTypeAllowed:
        service.assets && service.assets.length > 1
          ? service.assets.map((obj) => obj.id || obj._id)
          : [],
      deviceId: props.id,
      date: new Date(Date.now()),
      time: new Date(Date.now()),
    },
    validationSchema: Yup.object({
      command: Yup.string().required("Required field"),
      label: Yup.string().required("Required field"),
      value: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      actuator: Yup.string().required("Required field"),
      deviceId: Yup.string(),
      time: Yup.string().required("Required field"),
    }),
    onSubmit: async (values) => {
      setIsLoading(true);
      if (
        !scheduleForm.values.platformDeviceTypeAllowed &&
        service.assets &&
        service.assets.length > 1
      ) {
        showSnackbar("Automations", "Asset type is required", "error", 1000);
        setIsLoading(false);
        return;
      }
      if (service.assets && service.assets.length > 1) {
        const datapoiontExists = multiAssetActuators.find(
          (obj) => obj.name === scheduleForm.values.actuator
        );
        if (!datapoiontExists) {
          showSnackbar(
            "Automations",
            "Please select Actuator from the existing Actuators",
            "error",
            1000
          );
          setIsLoading(false);
          return;
        }
      }
      if (!row) {
        if (global) {
          const result = await addScheduleGlobal({
            token,
            body: generateBody(values),
          }).then(() => setIsLoading(false))
          .catch(error => {
            setIsLoading(false);
          });
        } else addSchedule({ token, body: generateBody(values) })
        .then(() => setIsLoading(false))
          .catch(error => {
            setIsLoading(false);
          });
      } else {
        if (global)
          editScheduleGlobal({
            token,
            name: selectedId,
            body: generateBody(values),
          }).then(() => setIsLoading(false))
          .catch(error => {
            setIsLoading(false);
          });
        else
          editSchedule({
            token,
            name: selectedId,
            body: generateBody(values),
          }).then(() => setIsLoading(false))
          .catch(error => {
            setIsLoading(false);
          });
      }
    },
  });

  const handlepopupClose = () => {
    scheduleForm.resetForm();
    setOpenPopup(false);
    if (setRow) setRow(null);
  };
  useEffect(() => {
    let selectedAssets = scheduleForm.values.platformDeviceTypeAllowed
      ? scheduleForm.values.platformDeviceTypeAllowed
      : [];
    findCommonActuators(selectedAssets);
  }, []);

  useEffect(() => {
    if (row) {
      let time;
      let hours;
      let minutes;
      let date;
      let adjust;
      let days = [];
      if (!Number.isInteger(parseInt(row.html2[0]))) {
        let format = row.time.slice(row.time.length - 2);
        time = row.time;
        hours = parseInt(time.substring(0, time.indexOf(":")));
        minutes = parseInt(time.substring(time.indexOf(":") + 1));
        time = new Date(Date.now());
        time = time.setHours(format == "PM" ? hours + 12 : hours);
        time = new Date(time).setMinutes(minutes);
        time = new Date(time);
        date = new Date(Date.now());
        days = row.html2;
      } else {
        time = row.time;
        hours = parseInt(time.substring(0, time.indexOf(":")));
        minutes = parseInt(
          time.substring(time.indexOf(":") + 1, time.lastIndexOf(":"))
        );
        adjust = time.substring(time.length - 2);
        if (adjust == "PM") hours = hours + 12;
        date = row.html2[0].replaceAll(":", "-");
        date = new Date(date);
        if (date == "Invalid Date") {
          let [dateDay, dateMonth, dateYear] = row.html2[0].split("/");
          date = `${dateMonth}/${dateDay}/${dateYear}`;
          date = new Date(date);
        }
        
        date = date.setHours(hours);
        date = new Date(date).setMinutes(minutes);

        time = new Date(date);
      }

      let actuator = actuators[actuatorIndex(row.actuator)];

      let actuation = getControllingValues(actuator, row.command);
      scheduleForm.setValues({
        days,
        time,
        date: new Date(date),
        actuator: row.actuator,
        command: actuation.command,
        value: actuation.value,
        label: actuation.label,
        name: row.name,
        platformDeviceTypeAllowed: row.platformDeviceTypeAllowed,
        notifyExecutionStatus: row.notifyExecutionStatus,
        notifyExecutionStatusEmail: row.notifyExecutionStatusEmail,
        notifyExecutionStatusReportAfter: row.notifyExecutionStatusReportAfter
    
      });
      setSelected(days);
      setSelectedId(row.id);
      setSync(row?.syncStatus ? row.syncStatus : false);
      let selectedAssets = row.platformDeviceTypeAllowed
        ? row.platformDeviceTypeAllowed
        : service.assets.map(asset => asset.id);
      findCommonActuators(selectedAssets);
    }
  }, [row]);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    console.log("multiAssetActuators", multiAssetActuators);
  }, [multiAssetActuators]);
  useEffect(() => {
    if (addResult.isSuccess) {
      handlepopupClose();
      showSnackbar(
        "Automation",
        execute ? addResult.data?.message : "Command Executed successfully",
        "success",
        1000
      );
    }
    if (addResult.isError) {
      handlepopupClose();
      showSnackbar("Automation", addResult.error?.data?.message, "error", 1000);
    }
  }, [addResult]);

  useEffect(() => {
    if (scheduleForm.values.notifyExecutionStatus && scheduleForm.values.notifyExecutionStatusEmail === '') {
      if (metaDataValue?.userInfo?.email) {
        scheduleForm.setFieldValue('notifyExecutionStatusEmail', metaDataValue.userInfo.email);
        scheduleForm.setFieldValue('notifyExecutionStatusReportAfter', 5);
      }
    }
  }, [scheduleForm.values.notifyExecutionStatus, scheduleForm.values.notifyExecutionStatusEmail, metaDataValue]);

  useEffect(() => {
    if (addGlobalResult.isSuccess) {
      handlepopupClose();
      if (updateSchFn) updateSchFn("ADD", addGlobalResult.data?.payload);
      showSnackbar(
        execute ? "Execute Control" : "Automation",
        addGlobalResult.data?.message,
        "success",
        1000
      );
      if (props?.updateData) {
        props.updateData("ADD", addGlobalResult?.data?.payload);
      }
    }
    if (addGlobalResult.isError) {
      handlepopupClose();
      showSnackbar(
        execute ? "Execute Control" : "Automation",
        addGlobalResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [addGlobalResult]);

  useEffect(() => {
    if (editGlobalResult.isSuccess) {
      handlepopupClose();
      if (updateSchFn) updateSchFn("EDIT", editGlobalResult.data?.payload);
    }
    if (editGlobalResult.isError) {
      handlepopupClose();
      showSnackbar(
        execute ? "Execute Control" : "Automation",
        editGlobalResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [editGlobalResult]);

  useEffect(() => {
    if (editResult.isSuccess) {
      handlepopupClose();
      showSnackbar("Automation", editResult.data?.message, "success", 1000);
    }
    if (editResult.isError) {
      handlepopupClose();
      showSnackbar(
        "Automation",
        editResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [editResult]);

  useEffect(() => {
    if (editGlobalResult.isSuccess) {
      handlepopupClose();
      if (props?.updateData) {
        props.updateData("EDIT", editGlobalResult?.data?.payload);
      }
      showSnackbar(
        "Automation",
        editGlobalResult.data?.message,
        "success",
        1000
      );
    }
    if (editGlobalResult.isError) {
      handlepopupClose();
      showSnackbar(
        "Automation",
        editGlobalResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [editGlobalResult]);

  const handleToggleDays = (e) => {
    let name = e.currentTarget.id;
    const currentIndex = selected.indexOf(name);
    const newSelected = [...selected];

    if (currentIndex === -1) {
      newSelected.push(name);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelected(newSelected);
    scheduleForm.setFieldValue("days", newSelected);
  };

  function getNextDayArray(inputArray) {
    return getModifiedDayArray(inputArray, 1);
  }

  function getPreviousDayArray(inputArray) {
    return getModifiedDayArray(inputArray, -1);
  }

  function getModifiedDayArray(inputArray, increment) {
    const daysArray = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ];
    const modifiedDayArray = [];

    for (let i = 0; i < inputArray.length; i++) {
      const currentDay = inputArray[i];
      const currentIndex = daysArray.indexOf(currentDay);
      const modifiedIndex =
        (currentIndex + increment + daysArray.length) % daysArray.length;
      const modifiedDay = daysArray[modifiedIndex];
      modifiedDayArray.push(modifiedDay);
    }

    return modifiedDayArray;
  }

  function generateBody(values) {
    let { time, name, label, actuator, value, notifyExecutionStatus, notifyExecutionStatusEmail, notifyExecutionStatusReportAfter } = values;
    let body = {};
    body.platformDeviceTypeAllowed = values.platformDeviceTypeAllowed;
    let days = selected;
    let tempTime;
    let tempDate;
    let requireTime;
    if (execute) {
      tempTime = new Date(
        new Date().setSeconds(new Date().getSeconds() + 5)
      ).toISOString();
      tempTime = tempTime.substring(tempTime.indexOf("T") + 1);
      tempDate = new Date(scheduleForm.values.date || "").toISOString();
      tempDate = tempDate.substring(0, tempDate.indexOf("T") + 1);
      requireTime = tempDate + tempTime;
      body.days = [];
      body.time = requireTime;
    } else {
      const currentTime = time.getHours()
      const timeZoneOffset = new Date(time).getTimezoneOffset()/60
      tempTime = new Date(time.setSeconds(0)).toISOString();
      tempTime = tempTime.substring(tempTime.indexOf("T") + 1);
      if(currentTime+timeZoneOffset < 0){
        const newDate = ((new Date(scheduleForm.values.date || "")).setDate(new Date(scheduleForm.values.date || "").getDate()-1));
        tempDate = new Date(newDate).toISOString()
      }else{
        tempDate = new Date(scheduleForm.values.date || "").toISOString()
      }
      tempDate = tempDate.substring(0, tempDate.indexOf("T") + 1);
      requireTime = tempDate + tempTime;
      if (selected.length == 0) body.time = requireTime;
      else {
        tempTime = tempTime.substring(0, tempTime.indexOf("."));
        let oldHour = new Date(time).getHours();
        let offset =
          new Date(new Date(time).toISOString()).getTimezoneOffset() / 60;
        if (oldHour + offset < 0) {
          days = getPreviousDayArray(selected);
        } else if (oldHour + offset > 24) {
          days = getNextDayArray(selected);
        }
        body.time = tempTime;
      }
    }
    body.name = name;
    body.days = days;
    if (global) body.serviceId = props.id;
    else body.deviceId = props.id;
    body.actuatorName = actuator;
    body.commandKey = label;
    body.command = value;
    body.syncStatus = sync;
    if (group) body.groupId = group;
    body.notifyExecutionStatus = notifyExecutionStatus;
    body.notifyExecutionStatusEmail = notifyExecutionStatus ? notifyExecutionStatusEmail : "";
    body.notifyExecutionStatusReportAfter = notifyExecutionStatus ? notifyExecutionStatusReportAfter : "";
    body.notifyExecutionStatusProcessed = false;
    if(global && filtersValue.alarms.length){
      body.alarms = filtersValue.alarms
    }
    if(global && filtersValue.measurement){
      body.MeasurementFilter = filtersValue.measurement
    }
    return body;
  }

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  function actuatorIndex(actuator) {
    let output;
    actuators.forEach((elm, i) => {
      if (actuator == elm.name) {
        output = i;
      }
    });
    return output;
  }

  const findCommonActuators = (assetTypesList) => {
    if (!assetTypesList || !assetTypesList.length) {
      setMultiAssetActuators([]);
    }
    // Filter assets based on provided asset types
    const filteredAssets = service.assetMapping.filter((asset) =>
      assetTypesList.includes(asset.assetType._id)
    );
    // Check if there are any assets matching the provided asset types
    if (filteredAssets.length === 0) {
      setMultiAssetActuators([]);

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
    setMultiAssetActuators(uniqueList);
  };
  const selectAsset = (asset) => {
    let selectedAssets = scheduleForm.values.platformDeviceTypeAllowed
      ? JSON.parse(
          JSON.stringify(scheduleForm.values.platformDeviceTypeAllowed)
        )
      : [];
    let assetId = asset.id || asset._id;
    const index = selectedAssets.findIndex((item) => item === assetId);
    if (index !== -1) {
      if (selectedAssets && selectedAssets.length === 1) {
        showSnackbar(
          "Automations",
          "There should be atleast one Asset type",
          "error",
          1000
        );
        return;
      }
      selectedAssets.splice(index, 1);
    } else {
      selectedAssets.push(asset.id || asset._id);
    }
    findCommonActuators(selectedAssets);

    scheduleForm.setFieldValue("platformDeviceTypeAllowed", selectedAssets);
  };
  const creatTooltipData = (actuator) => {
    let detail = [];
    detail.push(`Description: ${actuator?.description}`);
    if (
      actuator?.metaData?.Range?.Min != undefined &&
      actuator?.metaData?.Range?.Max != undefined
    ) {
      detail.push(`Min: ${actuator.metaData?.Range?.Min}`);
      detail.push(`Min: ${actuator.metaData?.Range?.Max}`);
    }
    if (actuator?.metaData?.Increment) {
      detail.push(`Increment: ${actuator.metaData?.Increment}`);
    }
    if (actuator?.metaData?.Command) {
      detail.push(`Command: ${actuator.metaData?.Command}`);
    }
    return detail;
  };
  const tooltipContent = (name) => {
    const actuat =
      service.assets && service.assets.length > 1
        ? multiAssetActuators.find((actuator) => actuator.name === name)
        : actuators.find((actuator) => actuator.name === name);
    const detailList = creatTooltipData(actuat);
    return (
      <Typography>
        {detailList.map((line, index) => (
          <React.Fragment key={index}>
            {line}
            <br />
          </React.Fragment>
        ))}
      </Typography>
    );
  };
  return (
    <Dialog open onClose={handlepopupClose}>
      <DialogTitle>
        {execute
          ? "Execute Control"
          : !row
          ? "Add Automation"
          : row && selected.length < 1
          ? "Edit one-off Automation"
          : "Edit Recurring Automation"}
      </DialogTitle>

      <DialogContent>
        <form onSubmit={scheduleForm.handleSubmit} style={{ width: "500px" }}>
          {!execute ? (
            <Fragment>
              {/* {service.assets && service.assets.length > 1 ? (
                <>
                  <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                    <ShowAssets
                      assets={service.assets}
                      selectedAsset={
                        scheduleForm.values.platformDeviceTypeAllowed
                      }
                      selectAsset={selectAsset}
                      selectedColor={metaDataValue.branding.secondaryColor}
                    />
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
                      marginBottom: "20px",
                      marginTop: "20px",
                      marginRight: "14px",
                    }}
                  ></div>
                </>
              ) : null} */}
              <TextField
                value={scheduleForm.values.name}
                id="name"
                margin="dense"
                label="Name"
                fullWidth
                onChange={scheduleForm.handleChange}
                error={
                  scheduleForm.touched.name && scheduleForm.errors.name
                    ? true
                    : false
                }
                // error={errors.errorName}
                // helperText={errors.msgName}
              />
              {service.assets && service.assets.length > 1 ? (
                <>
                  <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
                    <ShowAssets
                      assets={service.assets}
                      selectedAsset={
                        scheduleForm.values.platformDeviceTypeAllowed
                      }
                      selectAsset={selectAsset}
                      selectedColor={metaDataValue.branding.secondaryColor}
                    />
                  </div>
                  <div
                    style={{
                      borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
                      marginBottom: "20px",
                      marginTop: "20px",
                      marginRight: "14px",
                    }}
                  ></div>
                </>
              ) : null}

              <span
                style={{
                  display: "flex",
                }}
              >
                {!row || (row && selected.length > 0) ? (
                  <div
                    style={{
                      position: "relative",
                      height: "57px",
                      display: "flex",
                      top: "7px",
                      marginRight: "10px",
                      borderRadius: "5px",
                      border: "1px solid #c4c4c4",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          zIndex: "1px",
                          position: "relative",
                          left: "10px",
                          bottom: "10px",
                        }}
                      >
                        <p
                          style={{
                            color: "#9e9e9e",
                            maxWidth: "58px",
                            fontSize: "12px",
                            position: "relative",
                            paddingLeft: "4px",
                            bottom: "3px",
                            backgroundColor: "white",
                          }}
                        >
                          Repeating
                        </p>
                      </span>
                      <span
                        style={{
                          display: "flex",
                          position: "relative",
                          bottom: "3px",
                          marginLeft: "10px",
                          marginRight: "5px",
                        }}
                      >
                        {[
                          "Monday",
                          "Tuesday",
                          "Wednesday",
                          "Thursday",
                          "Friday",
                          "Saturday",
                          "Sunday",
                        ].map((elm, i) => (
                          <Avatar
                            onClick={handleToggleDays}
                            key={elm}
                            id={elm}
                            style={
                              selected.indexOf(elm) !== -1
                                ? {
                                    height: "19px",
                                    width: "19px",
                                    marginRight: "5px",
                                    cursor: "pointer",
                                    backgroundColor:
                                      metaDataValue.branding.secondaryColor,
                                    boxShadow:
                                      "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
                                  }
                                : {
                                    backgroundColor: "#eeeeee",
                                    height: "19px",
                                    width: "19px",
                                    marginRight: "5px",
                                    cursor: "pointer",
                                    boxShadow:
                                      "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
                                  }
                            }
                            color="primary"
                          >
                            <p
                              style={{
                                fontSize: "11px",
                                fontWeight: "bold",
                              }}
                            >
                              {days[i][0]}
                            </p>
                          </Avatar>
                        ))}
                      </span>
                    </div>
                  </div>
                ) : null}

                <span style={{ display: "flex" }}>
                  <LocalizationProvider dateAdapter={AdapterDateFns}>
                    {!row || (row && selected.length < 1) ? (
                      <DesktopDatePicker
                        label="One-Off"
                        id="one-off"
                        inputFormat="MM/dd/yyyy"
                        value={scheduleForm.values.date}
                        onChange={(e) => {
                          scheduleForm.setFieldValue("date", e);
                        }}
                        disabled={selected.length > 0}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            margin="dense"
                            style={{ margin: "8px 10px 0px  0px" }}
                          />
                        )}
                      />
                    ) : null}

                    <TimePicker
                      label="Time"
                      id="time"
                      value={scheduleForm.values.time}
                      onChange={(e) => {
                        scheduleForm.setFieldValue("time", e);
                      }}
                      renderInput={(params) => (
                        <TextField
                          id="time-picker"
                          fullWidth
                          {...params}
                          margin="dense"
                          error={
                            scheduleForm.touched.time &&
                            scheduleForm.errors.time
                              ? true
                              : false
                          }
                          style={{
                            width:
                              !row || (row && selected.length < 1)
                                ? ""
                                : "305px",
                          }}
                        />
                      )}
                    />
                  </LocalizationProvider>
                </span>
              </span>
            </Fragment>
          ) : null}

          <FormControl fullWidth margin="dense">
            <InputLabel>Actuator</InputLabel>
            <Select
              id="actuator"
              fullWidth
              required
              value={scheduleForm.values.actuator}
              name="actuator"
              onChange={(e) => {
                scheduleForm.handleChange(e);
                scheduleForm.setFieldValue("command", "");
                scheduleForm.setFieldValue("value", "");
                scheduleForm.setFieldValue("label", "");
              }}
              label="Actuator"
              error={
                scheduleForm.touched.actuator && scheduleForm.errors.actuator
                  ? true
                  : false
              }
              endAdornment={
                <InputAdornment position="end" style={{marginRight:'2rem'}}>
                  {scheduleForm.values.actuator && (
                    <Tooltip
                      title={tooltipContent(scheduleForm.values.actuator)}
                      placement="left"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <InfoIcon />
                    </Tooltip>
                  )}
                </InputAdornment>
              }
            >
              {service.assets && service.assets.length > 1
                ? multiAssetActuators.map((elm) => {
                    return <MenuItem value={elm.name}>{elm.name}</MenuItem>;
                  })
                : actuators.map((elm) => {
                    return <MenuItem value={elm.name}>{elm.name}</MenuItem>;
                  })}
            </Select>
            <FormHelperText
              style={{
                marginLeft: "15px",
                color:
                  scheduleForm.touched.actuator && scheduleForm.errors.actuator
                    ? "#d63b3b"
                    : "",
              }}
            >
              {scheduleForm.touched.actuator && scheduleForm.errors.actuator
                ? scheduleForm.errors.actuator
                : ""}
            </FormHelperText>
          </FormControl>

          <Actuators actuators={actuators} form={scheduleForm} />

          {!execute ? null : (
            // <span
            //   style={{
            //     display: "flex",
            //     gap: "10px",
            //     justifyContent: "flex-end",
            //     alignItems: "center",
            //   }}
            // >
            //   <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
            //     Stored/Run on Edge
            //   </p>
            //   <Switch
            //     color="primary"
            //     checked={sync}
            //     onClick={() => setSync(!sync)}
            //   />
            // </span>
            <p
              style={{ color: "#c4c4c4", fontWeight: "600", marginLeft: "3px" }}
            >
              This operation will be performed on{" "}
              {filtersValue?.connectedDevices} assets out of{" "}
              {filtersValue?.totalDevices}
            </p>
          )}

              <div
                style={{
                  borderBottom: "1px solid rgba(0, 0, 0, 0.3)",
                  marginBottom: "20px",
                  marginTop: "20px",
                  marginRight: "14px",
                }}
              ></div>

          <FormControlLabel
            control={
              <Switch
                checked={scheduleForm.values.notifyExecutionStatus}
                onChange={(e) => {
                  scheduleForm.setFieldValue("notifyExecutionStatus", e.target.checked);
                }}
              />
            }
            label="Notify Execution Status"
          />

          {scheduleForm.values.notifyExecutionStatus == true ? (
            <Fragment>
              <TextField
                value={scheduleForm.values.notifyExecutionStatusEmail}
                id="notifyExecutionStatusEmail"
                margin="dense"
                label="Email"
                fullWidth
                onChange={scheduleForm.handleChange}
                error={
                  scheduleForm.touched.notifyExecutionStatusEmail && scheduleForm.errors.notifyExecutionStatusEmail
                    ? true
                    : false
                }
              />

              <TextField
                value={scheduleForm.values.notifyExecutionStatusReportAfter}
                id="notifyExecutionStatusReportAfter"
                margin="dense"
                label="Report After (minutes)"
                fullWidth
                onChange={scheduleForm.handleChange}
                error={
                  scheduleForm.touched.notifyExecutionStatusReportAfter && scheduleForm.errors.notifyExecutionStatusReportAfter
                    ? true
                    : false
                }
              />
            </Fragment>
          ) : null }
         {/*  <FormControl fullWidth margin="dense">
            <InputLabel>Notify Execution Status</InputLabel>
            <Switch
                checked={scheduleForm.touched.notifyExecutionStatus}
                onChange={(e) => {
                  scheduleForm.setFieldValue("notifyExecutionStatus", e.target.checked);
                }}
              />
          </FormControl> */}

          {/* {!execute ? null : (
            // <span
            //   style={{
            //     display: "flex",
            //     gap: "10px",
            //     justifyContent: "flex-end",
            //     alignItems: "center",
            //   }}
            // >
            //   <p style={{ fontWeight: "bold", color: "#9f9f9f" }}>
            //     Stored/Run on Edge
            //   </p>
            //   <Switch
            //     color="primary"
            //     checked={sync}
            //     onClick={() => setSync(!sync)}
            //   />
            // </span>
            <p
              style={{ color: "#c4c4c4", fontWeight: "600", marginLeft: "3px" }}
            >
              This operation will be performed on{" "}
              {filtersValue?.connectedDevices} assets out of{" "}
              {filtersValue?.totalDevices}
            </p>
          )} */}

          <div style={{ textAlign: "end" }}>
            <Button onClick={handlepopupClose} color="primary" id="cancel">
              Cancel
            </Button>
            <Button type="submit" color="primary" id="submit" disabled={isLoading} >
              Submit
              {isLoading && <CircularProgress size={14} style={{ marginLeft: 4 }} />}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
