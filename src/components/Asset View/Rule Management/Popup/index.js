import React, { useEffect } from "react";
import { useFormik } from "formik";
import { useSelector } from "react-redux";
import * as Yup from "yup";
import CircularProgress from "@mui/material/CircularProgress";
import DialogTitle from "@mui/material/DialogTitle";
import { Fragment } from "react";
import EditIcon from "@mui/icons-material/Edit";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { IconButton } from "@mui/material";
import Button from "@mui/material/Button";
import { useSnackbar } from "notistack";
import {
  useCreateRuleGlobalMutation,
  useEditRuleGlobalMutation,
} from "services/rulesGlobal";
import { useGetGlobalLocationsQuery } from "services/globalLocations";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import { useCreateRuleMutation, useEditRuleMutation } from "services/rules";
import HourPicker from "./hourPicker";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import TabList from "@mui/lab/TabList";
import TabContext from "@mui/lab/TabContext";
import { getControllingValues } from "Utilities/Controlling Widgets";
import RuleConfigration from "./Rule Configuration";
import RuleDetails from "./Rule Details";

import AlarmNotifications from "./Alarm Notifications";
import ActuationTrigger from "./Actuation Triggers";
import LocationConstraints from "./Location Constraints";

let payload = {
  "0": [],
  "1": [],
  "2": [],
  "3": [],
  "4": [],
  "5": [],
  "6": [],
};

export default function Edit(props) {
  console.log('props.soluton',props?.solution )
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const [muteNotifications, setMuteNotifications] = React.useState(
    props.row?.muteNotification || payload
  );
  let actuators = !props.serviceId
    ? metaDataValue.services.find((s) => s.id == props.id)?.actuators
    : metaDataValue.services.find((s) => s.id == props.serviceId)?.actuators;
  let device =
    useSelector((state) => state.asset.device) ||
    JSON.parse(
      JSON.stringify(metaDataValue.services.find((s) => s.id == props.id))
    );
  const service = props?.serviceId ? 
    metaDataValue.services.find((s) => s.id == props.serviceId) : 
    metaDataValue.services.find((s) => s.id == props.id)
 
  const [value, setValue] = React.useState(
    service.assets && service.assets.length > 1 ? "0" : "1"
  );


  const { enqueueSnackbar } = useSnackbar();
  const [openPopup, setOpenPopup] = React.useState(props.openPopup || false);
  const [addLoader, setAddLoader] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [fieldCheck, setFieldCheck] = React.useState(false);
  const [edit, setEdit] = React.useState(false);
  const [multiAssetSensors, setMultiAssetSensors] = React.useState([]);
  const [multiAssetActuators, setMultiAssetActuators] = React.useState([]);

  const geoFences = useGetGlobalLocationsQuery({
    token: window.localStorage.getItem("token"),
    id: props.serviceId ? props.serviceId : props.id,
    group: "",
  });
  const ruleForm = useFormik({
    initialValues: {
      min: "",
      max: "",
      severity: "CRITICAL",
      name: "",
      parameter: "",
      operator: "",
      condition: "",
      rollingAvg: "",
      rollingFlag: false,
      repeatNotification: false,
      rollingTimeDuration: "",
      number: "",
      email: "",
      measures: "",
      unavailabilityChk: false,
      assetType: "Inverter",
      platformDeviceTypeAllowed:
        service.assets && service.assets.length > 1
          ? service.assets.map((obj) => obj.id || obj._id)
          : [],
      multipleOperations: [
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
      ],
      actuations: [
        {
          actuator: "",
          command: "",
          label: "",
          value: "",
        },
      ],
      multipleOperationsOperator: "AND",
      locationConditions: [
        {
          coordinates: [],
          type: "",
          globalUUID: "",
        },
      ],
      locationsConditionsOperator: "Include",
    },
    validationSchema: Yup.object({
      actuations: Yup.array().of(
        Yup.object().shape({
          actuator: fieldCheck ? Yup.string().required("Required field") : "",
          command: fieldCheck ? Yup.string().required("Required field") : "",
          label: fieldCheck ? Yup.string().required("Required field") : "",
          value: fieldCheck ? Yup.string().required("Required field") : "",
        })
      ),
      locationConditions: Yup.array().of(
        Yup.object().shape({
          coordinates: Yup.array(),
          type: Yup.string(),
          globalUUID: Yup.string(),
        })
      ),
      locationsConditionsOperator: Yup.string(),
      severity: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      repeatNotification: Yup.boolean(),
      assetType: Yup.string(),
      email: Yup.string(),
      multipleOperations: Yup.array().when("unavailabilityChk", {
        is: true,
        then: Yup.array().notRequired(),
        otherwise: Yup.array().of(
          Yup.object().shape({
            parameter: Yup.string().when("unavailabilityChk", {
              is: true,
              then: Yup.string(),
              otherwise: Yup.string().required("Field is required"),
            }),
            operation: Yup.string().when("unavailabilityChk", {
              is: true,
              then: Yup.string(),
              otherwise: Yup.string().required("Field is required"),
            }),
            rollingFlag: Yup.boolean(),
            unavailabilityChk: Yup.boolean(),
            repeatNotification: Yup.boolean(),
            condition: Yup.string(),
            rollingAvg: Yup.string().when("rollingFlag", {
              is: true,
              then: Yup.string().required("Field is required"),
              otherwise: Yup.string().nullable(true),
            }),
            rollingTimeDuration: Yup.string().when("rollingFlag", {
              is: true,
              then: Yup.string().required("Field is required"),
              otherwise: Yup.string(),
            }),
          })
        ),
      }),
    }),
    onSubmit: async (values) => {
      await submit();
      setAddLoader(true);
    },
  });

  useEffect(() => {
    if (ruleForm.values.actuations.length > 1) setFieldCheck(true);
    else setFieldCheck(false);
  }, [ruleForm.values.actuations]);

  const [addRule, addResult] = useCreateRuleMutation();
  const [updateRule, updateResult] = useEditRuleMutation();
  const [addRuleGlobal, addResultGlobal] = useCreateRuleGlobalMutation();
  const [updateRuleGlobal, updateResultGlobal] = useEditRuleGlobalMutation();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (addResult.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar("Rule Management", addResult.data?.message, "success", 1000);
    }
    if (addResult.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Rule Management",
        addResult.error?.data?.message,
        "error",
        1000
      );
    }

    if (addResultGlobal.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Rule Management",
        addResultGlobal.data?.message,
        "success",
        1000
      );
      props.updateRuleFn("ADD", addResultGlobal.data.payload);
    }
    if (addResultGlobal.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Rule Management",
        addResultGlobal.error?.data?.message,
        "error",
        1000
      );
    }
  }, [addResult, addResultGlobal]);

  useEffect(() => {
    if (updateResult.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Rule Management",
        updateResult.data?.message,
        "success",
        1000
      );
    }
    if (updateResult.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Rule Management",
        updateResult.error?.data?.message,
        "error",
        1000
      );
    }

    if (updateResultGlobal.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Rule Management",
        updateResultGlobal.data?.message,
        "success",
        1000
      );
      props.updateRuleFn("EDIT", updateResultGlobal.data.payload);
    }
    if (updateResultGlobal.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Rule Management",
        updateResultGlobal.error?.data?.message,
        "error",
        1000
      );
    }
  }, [updateResult, updateResultGlobal]);

  function loadValues() {
    setMuteNotifications(props.row?.muteNotification || payload);
    let actuations;

    if (props.row?.actions && props?.row?.actions?.length) {
      // actuations = [
      //   props.row.actions
      // ]
      actuations = props.row.actions.map((e) => {
        let actuator = actuators.find((a) => a._id == e.actuatorId);
        return getControllingValues(actuator, e.command);
      });
    } else {
      actuations = [
        {
          actuator: "",
          command: "",
          label: "",
          value: "",
        },
      ];
    }
    let multipleOperationsRecord = [];
    if (props.row?.multipleOperations && props.row?.multipleOperations.length) {
      multipleOperationsRecord = props.row.multipleOperations;
    } else {
      multipleOperationsRecord = [
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
      ];
    }
    let locationConditionsRecord = [];
    if (props.row?.locationConditions && props.row?.locationConditions.length) {
      locationConditionsRecord = props.row.locationConditions;
    }
    ruleForm.setValues({
      // min: props.row?.range
      //   ? props.row?.range?.min || props.row?.range?.min == 0
      //     ? props.row?.range?.min
      //     : ""
      //   : "",
      // max: props.row?.range
      //   ? props.row?.range?.max || props.row?.range?.max == 0
      //     ? props.row?.range?.max
      //     : ""
      //   : "",
      // parameter: props.row?.parameter || "",
      // operator: (props.main ? props.row?.html2 : props.row?.operation) || "",
      // condition:
      //   props.row?.condition == 0
      //     ? 0
      //     : props.row?.condition
      //     ? props.row.condition
      //     : "",
      // rollingAvg: props.row?.rollingAvg ? props.row?.rollingAvg : "",
      // rollingFlag: props.row?.rollingFlag || false,
      // rollingTimeDuration: props.row?.rollingTimeDuration || "",

      severity:
        (props.main ? props.row?.html3 : props.row?.severity) || "CRITICAL",
      name: props.row?.name || "",

      number: props.row?.html?.numbers?.join() || "",
      email:
        (props.row?.email?.length
          ? props.row?.email?.join()
          : props.main
          ? props.row?.html?.emails?.join()
          : props.row?.notification?.emails?.join()) || "",

      measures: props.row?.measures || "",
      unavailabilityChk:
        props.row?.type == "status" || props.row?.condition === "UNAVAILABLE"
          ? true
          : false,
      repeatNotification: props.row?.repeatNotification || false,
      actuations,
      assetType: props.row?.assetType || "Inverter",
      multipleOperations: multipleOperationsRecord,
      multipleOperationsOperator: props.row?.multipleOperationsOperator || "OR",
      locationConditions: locationConditionsRecord,
      locationsConditionsOperator:
        props.row?.locationsConditionsOperator || "Include",
      platformDeviceTypeAllowed: props.row?.platformDeviceTypeAllowed && props.row?.platformDeviceTypeAllowed.length
        ? props.row?.platformDeviceTypeAllowed
        : service?.assets && service.assets.length > 1
        ? service.assets.map((obj) => obj.id || obj._id)
        : [],
    });
  }
  useEffect(() => {}, [ruleForm]);
  useEffect(() => {
    loadValues();
    return () => {
      ruleForm.resetForm();
      payload = {
        "0": [],
        "1": [],
        "2": [],
        "3": [],
        "4": [],
        "5": [],
        "6": [],
      };
    };
  }, [props.row]);

  const handlepopupOpen = () => {
    setOpenPopup(true);
    loadValues();
  };

  const handlepopupClose = () => {
    if (props.openPopup) props.setOpenPopup(false);
    setOpenPopup(false);
    setMuteNotifications(props.row?.muteNotification || payload);
  };

  var submit = async () => {
    let emailArr = [];
    let numArr = [];
    ruleForm.values.email.split`,`.forEach((elm) => {
      emailArr.push(elm);
    });
    ruleForm.values.number.split`,`.forEach((elm) => {
      numArr.push(elm);
    });

    if (ruleForm.values.name === "") {
      setAddLoader(false);
      showSnackbar("Rules", "A title is required", "error", 1000);
      return;
    }
    if (
      ruleForm.values.platformDeviceTypeAllowed &&
      ruleForm.values.platformDeviceTypeAllowed.length
    )
      if (
        !ruleForm.values.platformDeviceTypeAllowed &&
        service.assets &&
        service.assets.length > 1
      ) {
        setAddLoader(false);
        showSnackbar("Rules", "Asset type is required", "error", 1000);
        return;
      }
    const conditionsLength = ruleForm.values.multipleOperations.length;
    if (conditionsLength == 0 && !ruleForm.values.unavailabilityChk) {
      setAddLoader(false);
      showSnackbar(
        "Rules",
        "Atleast one condition required for Adding a rule",
        "error",
        1000
      );
      return;
    }
    if (service.assets && service.assets.length > 1) {
      const opertions = ruleForm.values.multipleOperations;
      for (let i = 0; i < opertions.length; i++) {
        const datapoiontExists = multiAssetSensors.find(
          (obj) => obj.name === opertions[i]?.parameter
        );
        if (!datapoiontExists && !ruleForm.values.unavailabilityChk) {
          setAddLoader(false);
          showSnackbar(
            "Rules",
            "Please select parameters from the existing datapoints",
            "error",
            1000
          );
          return;
        }
      }
    }
    const lastEntry = ruleForm.values.multipleOperations[conditionsLength - 1];
    if (!ruleForm.values.unavailabilityChk) {
      if (
        lastEntry.rollingFlag &&
        (lastEntry.rollingAvg == "" || lastEntry.rollingTimeDuration == "")
      ) {
        setAddLoader(false);
        showSnackbar("Rules", "Please fill the required fields", "error", 1000);
        return;
      }
      if (!lastEntry.rollingFlag) {
        if (lastEntry.operation == "ib" || lastEntry.operation == "nib") {
          if (lastEntry.range.min == null || lastEntry.range.max == null) {
            setAddLoader(false);
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
          setAddLoader(false);
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

    const body = {
      name: ruleForm.values.name,
      // operation: ruleForm.values.operator,
      // parameter: ruleForm.values.parameter,
      // rollingFlag: false,
      sendEmail: ruleForm.values.email.length > 0 ? true : false,
      sendMessage: ruleForm.values.number.length > 0 ? true : false,
      email: emailArr,
      measures: ruleForm.values.measures,
      phoneNumber: numArr,
      severity: ruleForm.values.severity,
      multipleOperationsOperator: ruleForm.values.multipleOperationsOperator,
      multipleOperations: ruleForm.values.multipleOperations,
      locationConditions: ruleForm.values.locationConditions,
      locationsConditionsOperator: ruleForm.values.locationsConditionsOperator,
      assetType: ruleForm.values.assetType,
      platformDeviceTypeAllowed: ruleForm.values.platformDeviceTypeAllowed,
    };
    if (props.main) {
      body.deviceId = props.id;
      body.serviceId = props.serviceId;
    } else {
      body.serviceId = props.id;
    }
    // if (ruleForm.values.operator == "ib" || ruleForm.values.operator == "nib") {
    //   body.range = {
    //     min: parseFloat(ruleForm.values.min),
    //     max: parseFloat(ruleForm.values.max),
    //   };
    // } else {
    //   body.condition = ruleForm.values.condition;
    // }
    // if (ruleForm.values.rollingFlag) {
    //   body.rollingFlag = true;
    //   body.rollingAvg = ruleForm.values.rollingAvg;
    //   body.rollingTimeDuration = ruleForm.values.rollingTimeDuration;
    // }
    if (
      ruleForm.values.actuations &&
      ruleForm.values.actuations?.length &&
      (ruleForm.values.actuations[0].command != "" ||
        ruleForm.values.actuations[0].command === 0)
    ) {
      body.performAction = true;
      body.actions = ruleForm.values.actuations?.map((e) => {
        return {
          command: e.value,
          commandLabel: e.label,
          actuatorId: actuators.find((a) => a.name == e.actuator)?._id,
          actuatorName: e.actuator,
        };
      });
    } else {
      body.performAction = false;
      body.actions = {};
    }

    if (JSON.stringify(payload) != JSON.stringify(muteNotifications)) {
      body.muteNotification = muteNotifications;
    } else {
      body.muteNotification = payload;
    }
    if (props.group) body.groupId = props.group;
    body.repeatNotification = ruleForm.values.repeatNotification;
    if (ruleForm.values.unavailabilityChk) {
      body.type = "status";
      body.operation = "eq";
      body.parameter = "availability";
      body.condition = "UNAVAILABLE";
      body.name = ruleForm.values.name;
      body.multipleOperations = [
        {
          parameter: "availability",
          operation: "eq",
          condition: "UNAVAILABLE",
          rollingAvg: "",
          rollingFlag: false,
          rollingTimeDuration: "",
          range: {
            min: "",
            max: "",
          },
        },
      ];
      body.performAction = false;
      body.actions = [];
     // delete body.performAction;
     // delete body.actions;
    } else {
      body.type = "measurement";
      body.parameter = "";
      body.condition = "";
    }

    if (props?.handleUpdate) {
      setOpenPopup(false);
      props.handleUpdate(body, props.index);
      setAddLoader(false);
      return;
    }
    if (props.openPopup) {
      if (props?.handleSubmit) {
        setAddLoader(false);
        props.handleSubmit(body);
        return;
      }
      if (props.main) addRule({ token, body });
      else addRuleGlobal({ token, body });
    } else {
      if (props.main) updateRule({ token, body, id: props.row._id });
      else updateRuleGlobal({ token, body, id: props.row.id });
    }
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  return (
    <Fragment>
      {!props.openPopup ? (
        <IconButton
          color="secondary"
          onClick={handlepopupOpen}
          style={
            !props.main
              ? {
                  height: "30px",
                  width: "30px",
                }
              : {}
          }
        >
          <EditIcon
            style={{
              cursor: "pointer",
              height: "20px",
              width: "20px",
            }}
          />
        </IconButton>
      ) : null}

      <Dialog
        open={openPopup}
        onClose={() => {
          ruleForm.resetForm();
          handlepopupClose();
        }}
        aria-labelledby="form-dialog-title"
        PaperProps={{
          style: {
            maxWidth: open ? "90vw" : "auto",
            minWidth: "600px",
          },
        }}
      >
        <form onSubmit={ruleForm.handleSubmit}>
          <DialogTitle id="form-dialog-title">
            {props.row
              ? `Edit (${props.row.name}) ${
                  open ? " - Notification Timetable" : ""
                }`
              : `Add new Rule ${open ? " - Notification Timetable" : ""}`}
          </DialogTitle>
          {!open ? (
            <Fragment>
              <DialogContent style={{ paddingBottom: "0" }}>
                <Box
                  sx={{
                    width: "100%",
                    typography: "body1",
                  }}
                >
                  <TabContext value={value}>
                    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                      <TabList
                        onChange={handleChange}
                        aria-label="lab API tabs example"
                      >
                        {service.assets && service.assets.length > 1 ? (
                          <Tab label="Details" value="0" />
                        ) : null}

                        <Tab label="Rules" value="1" />
                        {!geoFences.isFetching &&
                          geoFences?.data?.payload?.data?.length && (
                            <Tab label="Locations" value="2" />
                          )}
                        <Tab
                          label="Alarms"
                          value={
                            !geoFences.isFetching &&
                            geoFences?.data?.payload?.data?.length
                              ? "3"
                              : "2"
                          }
                        />
                        {actuators.length && props.permission ? (
                          <Tab
                            label="Actuations"
                            value={
                              !geoFences.isFetching &&
                              geoFences?.data?.payload?.data?.length
                                ? "4"
                                : "3"
                            }
                            disabled={ruleForm.values.unavailabilityChk}
                          />
                        ) : null}
                      </TabList>
                    </Box>
                    {service.assets && service.assets.length > 1 ? (
                      <>
                        <TabPanel value="0" style={{ padding: "5px" }}>
                          <RuleDetails
                            form={ruleForm}
                            fields={props.fields}
                            id={props.id}
                            service={service}
                            solution={props?.solution && props.solution}
                            setSensors={setMultiAssetSensors}
                            setActuators={setMultiAssetActuators}
                          />
                        </TabPanel>
                      </>
                    ) : null}
                    <TabPanel value="1" style={{ padding: "5px" }}>
                      <RuleConfigration
                        form={ruleForm}
                        fields={
                          service.assets && service.assets.length > 1
                            ? multiAssetSensors
                            : props.fields
                        }
                        id={props.id}
                        solution={props?.solution && props.solution}
                        service={service}
                      />
                    </TabPanel>
                    <TabPanel
                      style={{ padding: "5px" }}
                      value={
                        !geoFences.isFetching &&
                        geoFences?.data?.payload?.data?.length
                          ? "2"
                          : null
                      }
                    >
                      <LocationConstraints
                        form={ruleForm}
                        geofences={geoFences?.data?.payload?.data || []}
                      />
                    </TabPanel>
                    <TabPanel
                      value={
                        !geoFences.isFetching &&
                        geoFences?.data?.payload?.data?.length
                          ? "3"
                          : "2"
                      }
                    >
                      <AlarmNotifications
                        payload={payload}
                        form={ruleForm}
                        muteNotifications={muteNotifications}
                        open={open}
                        setOpen={setOpen}
                      />
                    </TabPanel>
                    <TabPanel
                      value={
                        !geoFences.isFetching &&
                        geoFences?.data?.payload?.data?.length
                          ? "4"
                          : "3"
                      }
                    >
                      <ActuationTrigger
                        form={ruleForm}
                        actuators={
                          service.assets && service.assets.length > 1
                            ? multiAssetActuators
                            : actuators
                        }
                        id={props.id}
                      />
                    </TabPanel>
                  </TabContext>
                </Box>
                {/* {props.row ? (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgb(202,202,202)",
                      padding: "0px 24px",
                    }}
                  >
                    Note: For Consistency, delete existing alarms before
                    updating
                  </span>
                ) : null} */}
              </DialogContent>
              <DialogActions sx={{ marginRight: "35px" }}>
                <span
                  style={{
                    fontSize: "12px",
                    color: "rgb(202,202,202)",
                    // padding: "0px 24px",
                  }}
                >
                  {props.row &&
                    "Note: For Consistency, delete existing alarms before updating."}
                  {addLoader ? null : (
                    <Button
                      onClick={() => {
                        ruleForm.resetForm();
                        handlepopupClose();
                      }}
                      color="error"
                      style={{
                        "margin-left": "56px",
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button onClick={() => {
                    setAddLoader(true)
                    submit()
                  }} color="secondary" disabled={addLoader}>
                    {addLoader ? (
                      <CircularProgress color="secondary" size={20} />
                    ) : (
                      <span>Submit</span>
                    )}
                  </Button>
                </span>
              </DialogActions>
            </Fragment>
          ) : (
            <HourPicker
              payload={payload}
              muteNotifications={muteNotifications}
              setMuteNotifications={setMuteNotifications}
              setOpen={setOpen}
            />
          )}
        </form>
      </Dialog>
    </Fragment>
  );
}
