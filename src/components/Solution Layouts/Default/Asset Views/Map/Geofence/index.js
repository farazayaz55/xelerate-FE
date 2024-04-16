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
  useCreateLocationMutation,
  useEditLocationMutation,
} from "services/locations";
import {
  useEditGlobalLocationMutation,
  useCreateGlobalLocationMutation,
} from "services/globalLocations";
import Box from "@mui/material/Box";
import HourPicker from "components/Asset View/Rule Management/Popup/hourPicker";
import Tab from "@mui/material/Tab";
import TabPanel from "@mui/lab/TabPanel";
import TabList from "@mui/lab/TabList";
import TabContext from "@mui/lab/TabContext";
import { getControllingValues } from "Utilities/Controlling Widgets";
import Details from "./Details";
import AlarmNotifications from "components/Asset View/Rule Management/Popup/Alarm Notifications";
import ActuationTrigger from "components/Asset View/Rule Management/Popup/Actuation Triggers";

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
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);

  const [value, setValue] = React.useState("1");
  const [muteNotifications, setMuteNotifications] = React.useState(
    props.row?.muteNotification || payload
  );
  let actuators = !props.serviceId
    ? metaDataValue.services.find((s) => s.id == props.id)?.actuators
    : metaDataValue.services.find((s) => s.id == props.serviceId)?.actuators;
  const { enqueueSnackbar } = useSnackbar();
  const [openPopup, setOpenPopup] = React.useState(props.openPopup || false);
  const [addLoader, setAddLoader] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [fieldCheck, setFieldCheck] = React.useState(false);
  const geofenceForm = useFormik({
    initialValues: {
      severity: "CRITICAL",
      name: "",
      address: "",
      alarmOn: "both",
      parameter: "",
      operator: "",
      condition: "",
      rollingAvg: "",
      rollingFlag: false,
      repeatNotification: false,
      rollingTimeDuration: "",
      number: "",
      email: "",
      actuations: [
        {
          actuator: "",
          command: "",
          label: "",
          value: "",
        },
      ],
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
      alarmOn: Yup.string().required("Required field"),
      severity: Yup.string().required("Required field"),
      name: Yup.string().required("Required field"),
      address: Yup.string(),
      repeatNotification: Yup.boolean(),
      email: Yup.string(),
    }),
    onSubmit: async (values) => {
      setAddLoader(true);
      submit();
    },
  });

  useEffect(() => {
    if (geofenceForm.values.actuations.length > 1) setFieldCheck(true);
    else setFieldCheck(false);
  }, [geofenceForm.values.actuations]);

  const [addGeofence, addResult] = useCreateLocationMutation();
  const [updateGeofence, updateResult] = useEditLocationMutation();
  const [
    addGeofenceGlobal,
    addResultGlobal,
  ] = useCreateGlobalLocationMutation();
  const [
    updateGeofenceGlobal,
    updateResultGlobal,
  ] = useEditGlobalLocationMutation();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  useEffect(() => {
    if (addResult.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar("Geofence", addResult.data?.message, "success", 1000);
    }
    if (addResult.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar("Geofence", addResult.error?.data?.message, "error", 1000);
    }

    if (addResultGlobal.isSuccess) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar("Geofence", addResultGlobal.data?.message, "success", 1000);
    }
    if (addResultGlobal.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Geofence",
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
      showSnackbar("Geofence", updateResult.data?.message, "success", 1000);
    }
    if (updateResult.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Geofence",
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
        "Geofence",
        updateResultGlobal.data?.message,
        "success",
        1000
      );
    }
    if (updateResultGlobal.isError) {
      setTimeout(() => {
        setAddLoader(false);
      }, 500);
      handlepopupClose();
      showSnackbar(
        "Geofence",
        updateResultGlobal.error?.data?.message,
        "error",
        1000
      );
    }
  }, [updateResult, updateResultGlobal]);

  function loadValues() {
    setMuteNotifications(props.row?.muteNotification || payload);
    let actuations;
    if (props.row?.actions) {
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
    geofenceForm.setValues({
      severity:
        (props.main ? props.row?.html3 : props.row?.severity) || "CRITICAL",
      name: props.row?.name || "",
      address: props.row?.address || "",
      alarmOn: props.row?.alarmsOn || "both",
      number: props.row?.html?.numbers?.join() || "",
      email:
        (props.main ? props.row?.email?.join() : props.row?.email?.join()) ||
        "",
      repeatNotification: props.row?.repeatNotification || false,
      actuations,
    });
  }

  useEffect(() => {
    loadValues();
    return () => {
      geofenceForm.resetForm();
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
    props.setOpenPopup(false);
    geofenceForm.resetForm();
    setMuteNotifications(props.row?.muteNotification || payload);
  };

  var submit = async () => {
    let emailArr = [];
    let numArr = [];
    geofenceForm.values.email.split`,`.forEach((elm) => {
      emailArr.push(elm);
    });
    geofenceForm.values.number.split`,`.forEach((elm) => {
      numArr.push(elm);
    });

    const body = {
      name: geofenceForm.values.name,
      alarmsOn: geofenceForm.values.alarmOn,
      type: props.type,
      address: geofenceForm.values.address,
      sendEmail: geofenceForm.values.email.length > 0 ? true : false,
      sendMessage: geofenceForm.values.number.length > 0 ? true : false,
      email: emailArr,
      phoneNumber: numArr,
      severity: geofenceForm.values.severity,
    };

    if (props.type == "Circle") {
      body.center = props.circle.features[0].properties.center;
      body.radius = props.circle.features[0].properties.radiusInKm;
      body.coordinates = props.circle.features[0].geometry.coordinates;
    } else {
      body.coordinates = props.geofence.coordinates;
    }

    if (props.main) {
      body.deviceId = props.id;
    } else {
      body.serviceId = props.id;
    }
    if (
      geofenceForm.values.actuations.length &&
      (geofenceForm.values.actuations[0].command != "" ||
        geofenceForm.values.actuations[0].command === 0)
    ) {
      body.performAction = true;
      body.actions = geofenceForm.values.actuations.map((e) => {
        return {
          command: e.value,
          commandLabel: e.label,
          actuatorId: actuators.find((a) => a.name == e.actuator)?._id,
          actuatorName: e.actuator,
        };
      });
    } else {
      body.performAction = false;
      body.actions = [];
    }
    if (JSON.stringify(payload) != JSON.stringify(muteNotifications)) {
      body.muteNotification = muteNotifications;
    } else {
      body.muteNotification = payload;
    }
    if (props.group) body.groupId = props.group;
    body.repeatNotification = geofenceForm.values.repeatNotification;
    if (!props.row) {
      if (props.main) addGeofence({ token, body });
      else addGeofenceGlobal({ token, body });
    } else {
      if (props.main) updateGeofence({ token, body, id: props.row._id });
      else updateGeofenceGlobal({ token, body, id: props.row.globalUUID });
    }
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  return (
    <Fragment>
      <Dialog
        open
        onClose={() => {
          handlepopupClose();
        }}
        aria-labelledby="form-dialog-title"
        PaperProps={{ style: { maxWidth: open ? "90vw" : "auto" } }}
      >
        <form onSubmit={geofenceForm.handleSubmit}>
          <DialogTitle id="form-dialog-title">
            {props.row
              ? `Edit (${props.row.name}) ${
                  open ? " - Notification Timetable" : ""
                }`
              : `Add new Geofence ${open ? " - Notification Timetable" : ""}`}
          </DialogTitle>
          {!open ? (
            <Fragment>
              <DialogContent>
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
                        <Tab label="Geofence Configuration" value="1" />
                        <Tab label="Alarm Notifications" value="2" />
                        {actuators.length && props.permission ? (
                          <Tab
                            label="Actuation Triggers"
                            value="3"
                            disabled={geofenceForm.values.unavailabilityChk}
                          />
                        ) : null}
                      </TabList>
                    </Box>

                    <TabPanel value="1">
                      <Details form={geofenceForm} fields={props.fields} />
                    </TabPanel>
                    <TabPanel value="2">
                      <AlarmNotifications
                        payload={payload}
                        form={geofenceForm}
                        muteNotifications={muteNotifications}
                        open={open}
                        setOpen={setOpen}
                      />
                    </TabPanel>
                    <TabPanel value="3">
                      <ActuationTrigger
                        form={geofenceForm}
                        actuators={actuators}
                      />
                    </TabPanel>
                  </TabContext>
                </Box>

                {props.row ? (
                  <span
                    style={{
                      fontSize: "12px",
                      color: "rgb(202,202,202)",
                      padding: "0px 24px",
                    }}
                  >
                    Note: please delete any existing alarms for this rule to
                    assure consistency
                  </span>
                ) : null}
              </DialogContent>
              <DialogActions sx={{ marginRight: "30px" }}>
                {addLoader ? null : (
                  <Button
                    onClick={() => {
                      handlepopupClose();
                    }}
                    color="error"
                  >
                    Cancel
                  </Button>
                )}

                <Button type="submit" color="secondary" disabled={addLoader}>
                  {addLoader ? (
                    <CircularProgress color="secondary" size={20} />
                  ) : (
                    <span>Submit</span>
                  )}
                </Button>
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
