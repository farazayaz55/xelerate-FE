import React, { Fragment, useState } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import BarChartIcon from "@mui/icons-material/BarChart";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import InputBase from "@mui/material/InputBase";
import { useRouteMatch } from "react-router-dom";
import { useEffect } from "react";
import { useGetDevicesQuery } from "services/devices";
import Loader from "components/Progress";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import RouterIcon from "@mui/icons-material/Router";
import { useSnackbar } from "notistack";
import { useDispatch, useSelector } from "react-redux";
import { setDevice } from "rtkSlices/assetSlice";
import { Checkbox, Chip, Collapse } from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { el } from "date-fns/locale";

export default function ControlledAccordions(props) {
  let token = window.localStorage.getItem("token");
  const { url } = useRouteMatch();
  const dispatch = useDispatch();
  const metaDataValue = useSelector((state) => state.metaData);
  function chkGroup(id) {
    let permission = metaDataValue.services
      .find((s) => s.id == id)
      .tabs.find((tab) => tab.name == "Controlling")?.permission;
    return permission || "DISABLE";
  }
  let id = url.substring(url.lastIndexOf("/") + 1);
  function chkGroup(id) {
    let permission = metaDataValue.services
      .find((s) => s.id == id)
      .tabs.find((tab) => tab.name == "Controlling")?.permission;
    return permission || "DISABLE";
  }
  const [showChildren, setShowChildren] = React.useState(false);
  let services = JSON.parse(JSON.stringify(props.services));
  const [solutionObj, setSolutionObj] = useState(getObj());
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [change, setChange] = useState(false);
  const [type, setType] = useState(["Datapoints"]);
  const [devices, setDevices] = React.useState([]);
  const [selectedParent, setSelectedParent] = React.useState(null);
  const [selectedChildren, setSelectedChildren] = React.useState([]);
  const [selectedDevice, setSelectedDevice] = React.useState(null);

  const device = useSelector((state) => state.asset.device);
  let service = null;
  if (device) {
    services.forEach((s) => {
      s.sensors =
        device.esbMetaData &&
        device.esbMetaData.datapoints &&
        device.esbMetaData.datapoints.length
          ? s.sensors.filter((sensor) =>
              device.esbMetaData.datapoints.includes(sensor.name)
            )
          : s.sensors;
    });
    service = props.service
      ? JSON.parse(JSON.stringify(props.service))
      : props.service;
    if (service) {
      service.sensors =
        device.esbMetaData &&
        device.esbMetaData.datapoints &&
        device.esbMetaData.datapoints.length
          ? service.sensors.filter((sensor) =>
              device.esbMetaData.datapoints.includes(sensor.name)
            )
          : service.sensors;
      service.actuators =
        device.esbMetaData &&
        device.esbMetaData.actuators &&
        device.esbMetaData.actuators.length
          ? service.actuators.filter((sensor) =>
              device.esbMetaData.actuators.includes(sensor.name)
            )
          : service.actuators;
    }
  }
  const seriesForm = useFormik({
    initialValues: {
      series: [
        {
          solution: "",
          datapoint: "",
          actuator: "",
          aggregation: "mean",
          device: device ? device.internalId : "",
          name: "Datapoint",
          friendlyName: "Datapoint",
          deviceName: device ? device.name : "",
        },
      ],
    },
    validationSchema: Yup.object({
      series: Yup.array().of(
        Yup.object().shape({
          solution: Yup.string().required("Required field"),
          datapoint: Yup.string().required("Required field"),
          actuator: Yup.string().required("Required field"),
          aggregation: Yup.string().required("Required field"),
          device: Yup.string().required("Required field"),
          name: Yup.string().required("Required field"),
          deviceName: Yup.string().required("Required field"),
        })
      ),
    }),
  });

  function getObj() {
    let obj = {};
    services?.forEach((elm) => {
      if (elm.name != "Solutions" && elm.sensors) obj[elm.id] = elm;
    });
    return obj;
  }

  const solutionDevices = useGetDevicesQuery(
    {
      token,
      group: seriesForm.values.series[selectedIndex]?.solution,
      params:
        seriesForm.values.series[selectedIndex]?.solution &&
        metaDataValue.services.find(
          (s) => s.id == seriesForm.values.series[selectedIndex]?.solution
        ).group?.id
          ? `&associatedGroup=${
              metaDataValue.services.find(
                (s) => s.id == seriesForm.values.series[selectedIndex]?.solution
              ).group?.id
            }${
              open &&
              services.find(
                (s) => s.id == seriesForm.values.series[selectedIndex]?.solution
              ).parentChildEnabled
                ? "&showChildren=true&showParent=true"
                : ""
            }`
          : `${
              open &&
              services.find(
                (s) => s.id == seriesForm.values.series[selectedIndex]?.solution
              ).parentChildEnabled
                ? "&showChildren=true&showParent=true"
                : ""
            }`,
    },
    { skip: !open }
  );
  useEffect(() => {
    fetchDevices();
  }, [solutionDevices.isFetching]);

  function ifLoaded(state, index, component) {
    if (state) return <Loader top={"50px"} />;
    else return component;
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  async function fetchDevices() {
    var temp = [];
    if (!solutionDevices.isFetching && solutionDevices.data?.payload) {
      solutionDevices.data?.payload.data.forEach((elm) => {
        // temp.push({ name: elm.name, id: elm.internalId });
        temp.push({ ...elm, id: elm.internalId });
        // if(elm.platformDeviceType){
        //   Object.keys(solutionObj).forEach(id=>{
        //     if(solutionObj[id].assetMapping.length && solutionObj[id].assetMapping.find(a=>a.assetType._id == elm.platformDeviceType)){
        //       solutionObj[id].sensors = solutionObj[id].assetMapping.find(a=>a.assetType._id == elm.platformDeviceType).sensors
        //       solutionObj[id].sensors = solutionObj[id].assetMapping.find(a=>a.assetType._id == elm.platformDeviceType).actuators
        //     }
        //   })
        //   if(service && service.assetMapping.length && service.assetMapping.find(a=>a.assetType._id == elm.platformDeviceType)){
        //     service.sensors = service.assetMapping.find(a=>a.assetType._id == elm.platformDeviceType).sensors
        //     service.actuators = service.assetMapping.find(a=>a.assetType._id == elm.platformDeviceType).actuators
        //   }
        //   if(props.service && props.service.assetMapping.length && props.service.assetMapping.find(a=>a.assetType._id == elm.platformDeviceType)){
        //     props.service.sensors = props.service.assetMapping.find(a=>a.assetType._id == elm.platformDeviceType).sensors
        //     props.service.actuators = props.service.assetMapping.find(a=>a.assetType._id == elm.platformDeviceType).actuators
        //   }
        // }
      });
      let modifiedDevices = [...devices];
      modifiedDevices[selectedIndex] = temp;
      setDevices(modifiedDevices);
    } else if (
      !solutionDevices.isLoading &&
      solutionDevices.isError &&
      solutionDevices.data?.message != ""
    ) {
      showSnackbar("Devices", solutionDevices.data?.message, "error", 1000);
    }
  }

  const handleChange = (panel) => () => {
    props.setExpanded(props.expanded === panel ? false : panel);
  };

  const handleListItemClick = (e, elm, index) => {
    if (!(elm.childDevices && elm.childDevices.length) || !solutionObj[seriesForm.values.series[index].solution].parentChildEnabled) {
      seriesForm.setFieldValue(
        `series[${props.expanded[props.expanded.length - 1]}].deviceName`,
        elm.name
      );
      props.setDeviceName(elm.name);
      seriesForm.setFieldValue(
        `series[${props.expanded[props.expanded.length - 1]}].device`,
        elm.id
      );
      setSelectedDevice(elm);
      setSelectedParent(null);
      setSelectedChildren([])
      let temp = JSON.parse(JSON.stringify(seriesForm.values.series[index]));
      temp.deviceName = elm.name;
      temp.device = elm.id;
      if (props.series[index]) {
        let tempDisabled = [...props.disabled];
        if (JSON.stringify(temp) != JSON.stringify(props.series[index])) {
          tempDisabled[index] = false;
        } else {
          tempDisabled[index] = true;
        }
        props.setDisabled(tempDisabled);
      } else {
        let tempDisabled = [...props.disabled];
        tempDisabled[index] = false;
        props.setDisabled(tempDisabled);
      }
    } else {
      setSelectedDevice(null)
      setShowChildren(!showChildren);
      setSelectedParent(selectedParent ? null : { ...elm, checked: true });
    }
  };

  function addToChildren(elm) {
    const tempSelectedChildren = JSON.parse(JSON.stringify(selectedChildren));
    if (!tempSelectedChildren.find((t) => t.internalId == elm.internalId)) {
      tempSelectedChildren.push(elm);
    } else {
      const ind = tempSelectedChildren.findIndex(
        (c) => c.internalId == elm.internalId
      );
      tempSelectedChildren.splice(ind, 1);
    }
    setSelectedChildren(tempSelectedChildren);
  }

  function selectDevices(){
    const solutionId = seriesForm.values.series[selectedIndex].solution;
    if (!selectedDevice) {
      const tempDevices = selectedParent.checked
        ? [...selectedChildren, selectedParent]
        : selectedChildren;
      seriesForm.setFieldValue(
        `series[${selectedIndex}].deviceName`,
        tempDevices[0].name
      );
      seriesForm.setFieldValue(
        `series[${selectedIndex}].device`,
        tempDevices[0].internalId
      );
      seriesForm.setFieldValue(
        `series[${selectedIndex}].datapoint`,
        seriesForm.values.series[selectedIndex].datapoint
      );
      seriesForm.setFieldValue(
        `series[${selectedIndex}].actuator`,
        ""
      );
      seriesForm.setFieldValue(
        `series[${selectedIndex}].name`,
        seriesForm.values.series[selectedIndex].name
      );
      seriesForm.setFieldValue(
        `series[${selectedIndex}].friendlyName`,
        seriesForm.values.series[selectedIndex].friendlyName
      );
      seriesForm.setFieldValue(
        `series[${selectedIndex}].aggregation`,
        seriesForm.values.series[selectedIndex].aggregation
      );
      seriesForm.setFieldValue(
        `series[${selectedIndex}].solution`,
        seriesForm.values.series[selectedIndex].solution
      );
      let tempType = [...type];
      if(tempDevices[0].platformDeviceType){
        if(solutionObj[solutionId].assetMapping.length && solutionObj[solutionId].assetMapping.find(a=>a.assetType._id == tempDevices[0].platformDeviceType)){
          solutionObj[solutionId].sensors = solutionObj[solutionId].assetMapping.find(a=>a.assetType._id == tempDevices[0].platformDeviceType).sensors;
          solutionObj[solutionId].actuators = solutionObj[solutionId].assetMapping.find(a=>a.assetType._id == tempDevices[0].platformDeviceType).actuators;
        }
      }
      tempDevices.slice(1).forEach((device, ind) => {
        tempType.push("Datapoints");
        seriesForm.setFieldValue(
          `series[${selectedIndex + ind + 1}].deviceName`,
          device.name
        );
        seriesForm.setFieldValue(
          `series[${selectedIndex + ind + 1}].device`,
          device.internalId
        );
        seriesForm.setFieldValue(
          `series[${selectedIndex + ind + 1}].datapoint`,
          seriesForm.values.series[selectedIndex].datapoint
        );
        seriesForm.setFieldValue(
          `series[${selectedIndex + ind + 1}].actuator`,
          seriesForm.values.series[selectedIndex].actuator || ""
        );
        seriesForm.setFieldValue(
          `series[${selectedIndex + ind + 1}].name`,
          seriesForm.values.series[selectedIndex].name
        );
        seriesForm.setFieldValue(
          `series[${selectedIndex + ind + 1}].friendlyName`,
          seriesForm.values.series[selectedIndex].friendlyName
        );
        seriesForm.setFieldValue(
          `series[${selectedIndex + ind + 1}].aggregation`,
          seriesForm.values.series[selectedIndex].aggregation
        );
        seriesForm.setFieldValue(
          `series[${selectedIndex + ind + 1}].solution`,
          seriesForm.values.series[selectedIndex].solution
        );
        if(device.platformDeviceType){
          if(solutionObj[solutionId].assetMapping.length && solutionObj[solutionId].assetMapping.find(a=>a.assetType._id == device.platformDeviceType)){
            solutionObj[solutionId].sensors = solutionObj[solutionId].assetMapping.find(a=>a.assetType._id == device.platformDeviceType).sensors;
            solutionObj[solutionId].actuators = solutionObj[solutionId].assetMapping.find(a=>a.assetType._id == device.platformDeviceType).actuators;
          }
          if(service && service.assetMapping.length && service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType)){
            service.sensors = service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType).sensors;
            service.actuators = service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType).actuators;
          }
          if(props.service && props.service.assetMapping.length && props.service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType)){
            props.service.sensors = props.service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType).sensors;
            props.service.actuators = props.service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType).actuators;
          }
        }
      });
      setType(tempType);
    }
    else{
      if(selectedDevice.platformDeviceType){
        if(solutionObj[solutionId].assetMapping.length && solutionObj[solutionId].assetMapping.find(a=>a.assetType._id == selectedDevice.platformDeviceType)){
          solutionObj[solutionId].sensors = solutionObj[solutionId].assetMapping.find(a=>a.assetType._id == selectedDevice.platformDeviceType).sensors;
        }
        if(service && service.assetMapping.length && service.assetMapping.find(a=>a.assetType._id == selectedDevice.platformDeviceType)){
          service.sensors = service.assetMapping.find(a=>a.assetType._id == selectedDevice.platformDeviceType).sensors;
        }
        if(props.service && props.service.assetMapping.length && props.service.assetMapping.find(a=>a.assetType._id == selectedDevice.platformDeviceType)){
          props.service.sensors = props.service.assetMapping.find(a=>a.assetType._id == selectedDevice.platformDeviceType).sensors;
        }
      }
    }
    setOpen(false);
  }

  function ListComp({ index }) {
    return (
      <Fragment>
        <List
          component="nav"
          style={{ height: "520px", overflow:'auto' }}
        >
          <Divider />
          {devices[selectedIndex]?.map((elm, i) => {
            return (
              elm.name ? <Fragment>
                <ListItemButton
                  onClick={(event) => {
                    setChange(false);
                    handleListItemClick(event, elm, index);
                    // if (!elm.childDevices?.length) {
                    //   setTimeout(() => {
                    //     setOpen(false);
                    //   }, 100);
                    // }
                  }}
                  style={{
                    backgroundColor:
                      selectedDevice && selectedDevice.internalId === elm.internalId ? "#3399ff" : "white",
                    margin: "5px",
                    color: selectedDevice && selectedDevice.internalId === elm.internalId ? "white" : "inherit",
                  }}
                >
                  {seriesForm.values.series[index].solution && solutionObj[seriesForm.values.series[index].solution].parentChildEnabled ? (selectedParent &&
                  selectedParent.id == elm.id &&
                  selectedParent.childDevices?.length ? (
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={
                          selectedParent &&
                          selectedParent.id == elm.id &&
                          selectedParent.checked
                        }
                        disableRipple
                        onChange={(e) => {
                          setShowChildren(true);
                          setSelectedParent({
                            ...elm,
                            checked: e.target.checked,
                          });
                        }}
                      />
                    </ListItemIcon>
                  ) : null) : null}
                  <ListItemText
                    primary={`${elm.name} (${elm.id})`}
                    style={{
                      color: selectedIndex === elm.name ? "white" : "",
                    }}
                  />
                  {seriesForm.values.series[index].solution && solutionObj[seriesForm.values.series[index].solution].parentChildEnabled ? (showChildren && selectedParent.id == elm.id ? (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Chip
                        label={elm.childDevices?.length + " children"}
                        size="small"
                      />
                      <ExpandLess />
                    </div>
                  ) : elm.childDevices?.length ? (
                    <div style={{ display: "flex", gap: "5px" }}>
                      <Chip
                        label={elm.childDevices?.length + " children"}
                        size="small"
                      />
                      <ExpandMore />
                    </div>
                  ) : null) : null}
                </ListItemButton>
                <Collapse
                  in={
                    selectedParent &&
                    selectedParent.id == elm.id &&
                    showChildren
                  }
                  timeout="auto"
                  unmountOnExit
                >
                  <List component="div" disablePadding>
                    {selectedParent &&
                      selectedParent.childDevices.map((child) => {
                        return (
                          <Fragment>
                            <Divider />
                            <ListItemButton
                              sx={{ pl: 4 }}
                              onClick={() => addToChildren(child)}
                            >
                              <Checkbox
                                edge="start"
                                checked={selectedChildren.find(
                                  (s) => s.internalId == child.internalId
                                )}
                                disableRipple
                                onChange={(e) => addToChildren(child)}
                              />
                              <ListItemText
                                primary={child.name + " - Child"}
                              />
                            </ListItemButton>
                          </Fragment>
                        );
                      })}
                  </List>
                </Collapse>
                <Divider />
              </Fragment> : null
            );
          })}
        </List>
        <div style={{ textAlign: "right", position:'absolute',bottom:'25px',right:'25px' }}>
          <Button
            color="success"
            onClick={() => {
              // dispatch(setDevice(selectedDevice))
              selectDevices()
            }}
          >
            Ok
          </Button>
        </div>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <FormikProvider value={seriesForm}>
        <form onSubmit={seriesForm.handleSubmit}>
          <FieldArray name="series">
            {({ insert, remove, push }) => (
              <div>
                {seriesForm.values.series.length > 0
                  ? seriesForm.values.series.map((friend, index) => (
                      <div>
                        <Accordion
                          expanded={props.expanded === `panel${index}`}
                          style={{
                            backgroundColor: "#f2f2f2",
                            borderRadius:
                              props.expanded === `panel${index}` ? "12px" : "",
                            margin: "5px",
                          }}
                        >
                          <AccordionSummary
                            expandIcon={
                              <ExpandMoreIcon
                                onClick={handleChange(`panel${index}`)}
                              />
                            }
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                          >
                            <div style={{ width: "100%" }}>
                              <span
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                }}
                              >
                                <BarChartIcon
                                  style={{
                                    color: "black",
                                    width: "10%",
                                  }}
                                />

                                <p
                                  style={{
                                    width: "50%",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {type[index] == "Datapoints"
                                    ? seriesForm.values.series[index]
                                        .friendlyName || "Datapoint"
                                    : seriesForm.values.series[index].actuator
                                        ?.name || "Actuator"}
                                </p>
                                <div
                                  style={{
                                    fontSize: "11px",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    width: "40%",
                                    marginTop: props.assetView ? "5px" : "1px",
                                    color: "grey",
                                    marginLeft: "10px",
                                  }}
                                >
                                  {seriesForm.values.series[index].deviceName}
                                </div>
                              </span>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails>
                            {(
                              props.assetView
                                ? chkGroup(service.id) != "DISABLE" &&
                                  (device
                                    ? service.actuators
                                    : props.service.actuators
                                  )?.length
                                : solutionObj[
                                    seriesForm.values.series[index].solution
                                  ]?.actuators?.filter(
                                    (a) =>
                                      a.type == "power" ||
                                      a.type == "thermostat"
                                  ).length &&
                                  chkGroup(
                                    seriesForm.values.series[index].solution
                                  ) != "DISABLE"
                            ) ? (
                              <span
                                style={{
                                  display: "flex",
                                  justifyContent: "center",
                                  alignItems: "center",
                                  gap: "10px",
                                  margin: "-10px 0px 10px 0px",
                                }}
                              >
                                {["Datapoints", "Controls"].map((elm) => {
                                  return (
                                    <div
                                      style={{
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        backgroundColor:
                                          type[index] == elm
                                            ? metaDataValue.branding
                                                .secondaryColor
                                            : "#f5f5f5",
                                        borderRadius: "10px",
                                        border: `1px solid ${metaDataValue.branding.secondaryColor}`,
                                        cursor: "pointer",
                                        transition: "0.3s",
                                      }}
                                      onClick={() => {
                                        let tempType = [...type];
                                        tempType[index] = elm;
                                        setType(tempType);
                                        let tempDp = JSON.parse(
                                          JSON.stringify(props.series)
                                        );
                                        if (elm == "Datapoints") {
                                          tempDp[index] = {
                                            name: "Datapoint",
                                            datapoint: "",
                                            aggregation: "",
                                            device: "",
                                            service: "",
                                            deviceName: "",
                                            type: "datapoint",
                                          };
                                        } else {
                                          tempDp[index] = {
                                            name: "Actuator",
                                            datapoint: "",
                                            device: "",
                                            service: "",
                                            deviceName: "",
                                            type: "actuator",
                                          };
                                        }
                                        seriesForm.setFieldValue(
                                          `series[${index}].deviceName`,
                                          ""
                                        );
                                        seriesForm.setFieldValue(
                                          `series[${index}].device`,
                                          ""
                                        );
                                        seriesForm.setFieldValue(
                                          `series[${index}].datapoint`,
                                          ""
                                        );
                                        seriesForm.setFieldValue(
                                          `series[${index}].actuator`,
                                          ""
                                        );
                                        seriesForm.setFieldValue(
                                          `series[${index}].name`,
                                          "Datapoint"
                                        );
                                        seriesForm.setFieldValue(
                                          `series[${index}].aggregation`,
                                          "mean"
                                        );
                                        seriesForm.setFieldValue(
                                          `series[${index}].solution`,
                                          ""
                                        );
                                      }}
                                    >
                                      <p
                                        style={{
                                          color:
                                            type[index] == elm
                                              ? "white"
                                              : "grey",
                                          fontSize: "13px",
                                          margin: "5px",
                                          userSelect: "none",
                                          transition: "0.3s",
                                          overflow: "hidden",
                                          whiteSpace: "nowrap",
                                        }}
                                      >
                                        <b>{elm}</b>
                                      </p>
                                    </div>
                                  );
                                })}
                              </span>
                            ) : null}
                            {!props.assetView ? (
                              <FormControl fullWidth style={{ margin: "5px" }}>
                                <InputLabel>Solution</InputLabel>
                                <Select
                                  // disabled={props.disabled}
                                  name={`series[${index}].solution`}
                                  label="Solution"
                                  value={
                                    seriesForm.values.series[index].solution
                                  }
                                  onChange={(e) => {
                                    if (props.series[index]) {
                                      let tempDisabled = [...props.disabled];
                                      if (
                                        JSON.stringify({
                                          ...seriesForm.values.series[index],
                                          solution: e.target.value,
                                        }) !=
                                        JSON.stringify(props.series[index])
                                      ) {
                                        tempDisabled[index] = false;
                                      } else {
                                        tempDisabled[index] = true;
                                      }
                                      props.setDisabled(tempDisabled);
                                    } else {
                                      let tempDisabled = [...props.disabled];
                                      tempDisabled[index] = false;
                                      props.setDisabled(tempDisabled);
                                    }
                                    seriesForm.handleChange(e);
                                    // service = JSON.parse(JSON.stringify(services.find(s=>s.id == e.target.value)));
                                    // console.log({service})
                                    // if(service){
                                    //   service.sensors = device.esbMetaData && device.esbMetaData.datapoints && device.esbMetaData.datapoints.length ? service.sensors.filter(sensor=>device.esbMetaData.datapoints.includes(sensor.name)) : service.sensors;
                                    //   service.actuators = device.esbMetaData && device.esbMetaData.actuators && device.esbMetaData.actuators.length ? service.actuators.filter(sensor=>device.esbMetaData.actuators.includes(sensor.name)) : service.actuators;
                                    // }
                                    seriesForm.setFieldValue(
                                      `series[${index}].deviceName`,
                                      ""
                                    );
                                    seriesForm.setFieldValue(
                                      `series[${index}].device`,
                                      ""
                                    );
                                  }}
                                >
                                  {services.map((elm) => {
                                    return (
                                      <MenuItem value={elm.id}>
                                        {elm.name}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            ) : props.service.parentChildEnabled && (device.childDevices.length ||
                              device.parentDevice) ? (
                              <FormControl fullWidth style={{ margin: "5px" }}>
                                <InputLabel>Device</InputLabel>
                                <Select
                                  // disabled={props.disabled}
                                  name={`series[${index}].device`}
                                  label="Device"
                                  value={seriesForm.values.series[index].device}
                                  onChange={(e) => {
                                    seriesForm.setFieldValue(
                                      `series[${index}].device`,
                                      e.target.value
                                    );
                                  }}
                                >
                                  <MenuItem
                                    value={device.internalId}
                                  >{`${device.name} - Self`}</MenuItem>
                                  {(device.childDevices.length
                                    ? device.childDevices
                                    : [device.parentDevice]
                                  ).map((child) => {
                                    return (
                                      <MenuItem value={child.internalId}>{`${
                                        child.name
                                      } - ${
                                        device.childDevices.length
                                          ? "Child"
                                          : "Parent"
                                      }`}</MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            ) : null}
                            {!props.assetView ? (
                              <Fragment>
                                <Dialog
                                  open={open}
                                  onClose={() => setOpen(!open)}
                                >
                                  <DialogTitle>Device</DialogTitle>
                                  <DialogContent
                                    style={{
                                      textAlign: "center",
                                      width: "450px",
                                      minHeight: "600px",
                                      maxHeight: "800px",
                                    }}
                                  >
                                    {ifLoaded(
                                      solutionDevices.isFetching,
                                      index,
                                      <ListComp index={index} />
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <div
                                  style={{
                                    width: "100%",
                                    height: "56px",
                                    border: seriesForm.values.series[index]
                                      .solution
                                      ? `solid 1px ${metaDataValue.branding.primaryColor}`
                                      : `solid 1px #b0bcbb`,
                                    borderRadius: "5px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: seriesForm.values.series[index]
                                      .solution
                                      ? "pointer"
                                      : "",
                                    margin: "5px",
                                  }}
                                  onClick={() => {
                                    if (
                                      seriesForm.values.series[index].solution
                                    ) {
                                      setOpen(true);
                                      setSelectedIndex(index);
                                      fetchDevices();
                                    }
                                  }}
                                >
                                  <p
                                    style={{
                                      color: "#5c6261",
                                      fontSize: "16px",
                                      color: seriesForm.values.series[index]
                                        .solution
                                        ? metaDataValue.branding.primaryColor
                                        : "grey",
                                      userSelect: "none",
                                    }}
                                  >
                                    <b>
                                      {!seriesForm.values.series[index].solution
                                        ? "Select a solution"
                                        : !seriesForm.values.series[index]
                                            .deviceName
                                        ? "Select a device"
                                        : seriesForm.values.series[index]
                                            .deviceName}
                                    </b>
                                  </p>
                                </div>
                              </Fragment>
                            ) : null}
                            {type[index] == "Datapoints" ? (
                              <FormControl fullWidth style={{ margin: "5px" }}>
                                <InputLabel>Datapoint</InputLabel>
                                <Select
                                  name={`series[${index}].datapoint`}
                                  disabled={
                                    !props.assetView
                                      ? seriesForm.values.series[index]
                                          .solution == ""
                                      : false
                                  }
                                  label="Datapoint"
                                  value={
                                    seriesForm.values.series[index].datapoint
                                  }
                                  onChange={(e) => {
                                    let tempVal;
                                    for (
                                      let i =
                                        seriesForm.values.series.length - 1;
                                      i >= 0;
                                      i--
                                    ) {
                                      if (
                                        seriesForm.values.series[i].datapoint ==
                                        e.target.value
                                      ) {
                                        tempVal = i;
                                        break;
                                      }
                                    }
                                    if (props.series[index]) {
                                      let tempDisabled = [...props.disabled];
                                      if (
                                        JSON.stringify({
                                          ...seriesForm.values.series[index],
                                          datapoint: e.target.value,
                                        }) !=
                                        JSON.stringify(props.series[index])
                                      ) {
                                        tempDisabled[index] = false;
                                      } else {
                                        tempDisabled[index] = true;
                                      }
                                      props.setDisabled(tempDisabled);
                                    } else {
                                      let tempDisabled = [...props.disabled];
                                      tempDisabled[index] = false;
                                      props.setDisabled(tempDisabled);
                                    }
                                    seriesForm.handleChange(e);
                                    seriesForm.setFieldValue(
                                      `series[${index}].name`,
                                      seriesForm.values.series.filter(
                                        (d) => d.datapoint == e.target.value
                                      ).length > 0
                                        ? e.target.value +
                                            " " +
                                            (seriesForm.values.series[
                                              tempVal
                                            ].name.charAt(
                                              seriesForm.values.series[tempVal]
                                                .name.length - 2
                                            ) == " "
                                              ? parseInt(
                                                  seriesForm.values.series[
                                                    tempVal
                                                  ].name.charAt(
                                                    seriesForm.values.series[
                                                      tempVal
                                                    ].name.length - 1
                                                  )
                                                ) + 1
                                              : seriesForm.values.series.filter(
                                                  (d) =>
                                                    d.datapoint ==
                                                    e.target.value
                                                ).length + 1)
                                        : e.target.value
                                    );
                                    let friendlyName = (props.assetView
                                      ? service
                                      : solutionObj[
                                          seriesForm.values.series[index]
                                            .solution
                                        ]
                                    )?.sensors.find(
                                      (s) => s.name == e.target.value
                                    )?.friendlyName;
                                    seriesForm.setFieldValue(
                                      `series[${index}].friendlyName`,
                                      seriesForm.values.series.filter(
                                        (d) => d.datapoint == e.target.value
                                      ).length > 0
                                        ? friendlyName +
                                            " " +
                                            (seriesForm.values.series[
                                              tempVal
                                            ].name.charAt(
                                              seriesForm.values.series[tempVal]
                                                .name.length - 2
                                            ) == " "
                                              ? parseInt(
                                                  seriesForm.values.series[
                                                    tempVal
                                                  ].name.charAt(
                                                    seriesForm.values.series[
                                                      tempVal
                                                    ].name.length - 1
                                                  )
                                                ) + 1
                                              : seriesForm.values.series.filter(
                                                  (d) =>
                                                    d.datapoint ==
                                                    e.target.value
                                                ).length + 1)
                                        : friendlyName
                                    );
                                  }}
                                >
                                  {(!props.assetView
                                    ? solutionObj[
                                        seriesForm.values.series[index].solution
                                      ]?.sensors
                                    : device
                                    ? service.sensors
                                    : props.service.sensors
                                  )?.map((elm) => {
                                    return (
                                      <MenuItem value={elm.name}>
                                        {elm.friendlyName}
                                      </MenuItem>
                                    );
                                  })}
                                </Select>
                              </FormControl>
                            ) : (
                              <FormControl fullWidth style={{ margin: "5px" }}>
                                <InputLabel>Actuator</InputLabel>
                                <Select
                                  name={`series[${index}].actuator`}
                                  disabled={
                                    !props.assetView
                                      ? seriesForm.values.series[index]
                                          .solution == ""
                                      : false
                                  }
                                  label="Datapoint"
                                  value={
                                    seriesForm.values.series[index].actuator
                                  }
                                  onChange={(e) => {
                                    let tempVal;
                                    for (
                                      let i =
                                        seriesForm.values.series.length - 1;
                                      i >= 0;
                                      i--
                                    ) {
                                      if (
                                        seriesForm.values.series[i].actuator
                                          ?.name == e.target.value.name
                                      ) {
                                        tempVal = i;
                                        break;
                                      }
                                    }
                                    if (props.series[index]) {
                                      let tempDisabled = [...props.disabled];
                                      if (
                                        JSON.stringify({
                                          ...seriesForm.values.series[index],
                                          actuator: e.target.value,
                                        }) !=
                                        JSON.stringify(props.series[index])
                                      ) {
                                        tempDisabled[index] = false;
                                      } else {
                                        tempDisabled[index] = true;
                                      }
                                      props.setDisabled(tempDisabled);
                                    } else {
                                      let tempDisabled = [...props.disabled];
                                      tempDisabled[index] = false;
                                      props.setDisabled(tempDisabled);
                                    }
                                    seriesForm.setFieldValue(
                                      `series[${index}].actuator`,
                                      e.target.value
                                    );
                                  }}
                                >
                                  {(props.assetView
                                    ? device
                                      ? service.actuators
                                      : props.service.actuators
                                    : solutionObj[
                                        seriesForm.values.series[index].solution
                                      ]?.actuators
                                  )
                                    ?.filter(
                                      (a) =>
                                        a.type == "power" ||
                                        a.type == "thermostat"
                                    )
                                    .map((elm) => {
                                      return (
                                        <MenuItem value={elm}>
                                          {elm.name}
                                        </MenuItem>
                                      );
                                    })}
                                </Select>
                              </FormControl>
                            )}
                            {type[index] == "Datapoints" ? (
                              <FormControl fullWidth style={{ margin: "5px" }}>
                                <InputLabel>Aggregation</InputLabel>
                                <Select
                                  // disabled={props.disabled}
                                  name={`series[${index}].aggregation`}
                                  label="Aggregation"
                                  value={
                                    seriesForm.values.series[index].aggregation
                                  }
                                  onChange={(e) => {
                                    // if (
                                    //   Object.entries(props.aggregations).length
                                    // ) {
                                    //   setAggregationChanged(true);
                                    // }
                                    if (props.series[index]) {
                                      let tempDisabled = [...props.disabled];
                                      if (
                                        JSON.stringify({
                                          ...seriesForm.values.series[index],
                                          aggregation: e.target.value,
                                        }) !=
                                        JSON.stringify(props.series[index])
                                      ) {
                                        tempDisabled[index] = false;
                                      } else {
                                        tempDisabled[index] = true;
                                      }
                                      props.setDisabled(tempDisabled);
                                    } else {
                                      let tempDisabled = [...props.disabled];
                                      tempDisabled[index] = false;
                                      props.setDisabled(tempDisabled);
                                    }
                                    seriesForm.handleChange(e);
                                  }}
                                >
                                  <MenuItem value={"mean"}>Mean</MenuItem>
                                  <MenuItem value={"min"}>Min</MenuItem>
                                  <MenuItem value={"max"}>Max</MenuItem>
                                  <MenuItem value={"sumOfReadings"}>
                                    Sum
                                  </MenuItem>
                                  <MenuItem value={"stDivNegative"}>
                                    Standard Deviation +
                                  </MenuItem>

                                  <MenuItem value={"stDivPositive"}>
                                    Standard Deviation -
                                  </MenuItem>
                                </Select>
                              </FormControl>
                            ) : null}

                            <span
                              style={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "flex-end",
                                width: "100%",
                                marginTop: "5px",
                              }}
                            >
                              {seriesForm.values.series.length > 1 ? (
                                <Button
                                  onClick={() => {
                                    setSelectedIndex(
                                      index - 1 >= 0 ? index - 1 : 0
                                    );
                                    remove(index);
                                    props.handleDeleteDatapoint(index);
                                    // props.handleDeleteDatapoint(
                                    //   index,
                                    //   props.name,
                                    //   index > props.series?.length - 1
                                    //     ? ""
                                    //     : props.series && props.series[index].name,
                                    //     // props.series[index].actuator ? 'actuator' : 'datapoint'
                                    // );
                                    let tempType = [...type];
                                    tempType.splice(index, 1);
                                    setType(tempType);
                                  }}
                                  style={{ color: "#bf3535" }}
                                >
                                  Delete
                                </Button>
                              ) : null}
                              <Button
                                onClick={() => {
                                  let tempDatapoints = JSON.parse(
                                    JSON.stringify(seriesForm.values.series)
                                  );
                                  let duplicate = false;
                                  for (
                                    let j = 0;
                                    j < tempDatapoints.length;
                                    j++
                                  ) {
                                    delete tempDatapoints[j].name;
                                    delete tempDatapoints[j].friendlyName;
                                    let val = tempDatapoints[j];
                                    if (
                                      tempDatapoints.find(
                                        (d, i) =>
                                          i != j &&
                                          d.solution &&
                                          val.solution &&
                                          JSON.stringify(d) ==
                                            JSON.stringify(val)
                                      )
                                    ) {
                                      showSnackbar(
                                        "Analytics",
                                        "Duplicate datapoint already selected",
                                        "info",
                                        1000
                                      );
                                      duplicate = true;
                                      break;
                                    }
                                  }
                                  if (duplicate) {
                                    return;
                                  }

                                  // props.handleLoad(
                                  //   seriesForm.values.series[index]
                                  //     .device,
                                  //   seriesForm.values.series[index]
                                  //     .datapoint,
                                  //     seriesForm.values.series[index]
                                  //     .actuator,
                                  //   seriesForm.values.series[index]
                                  //     .aggregation,
                                  //   seriesForm.values.series[index].name,
                                  //   index,
                                  //   seriesForm.values.series[index]
                                  //     .solution,
                                  //   seriesForm.values.series[index]
                                  //     .deviceName,
                                  //   seriesForm.values.series[index].actuator ?
                                  //   (index > props.series?.length - 1
                                  //     ? ""
                                  //     : props.series&& seriesForm.values.series[index].actuator.name) :
                                  //   (index > props.series?.length - 1
                                  //     ? ""
                                  //     : props.series&& props.series[index].name),
                                  //   null,
                                  //   aggregationChanged
                                  // );
                                  // setAggregationChanged(false);
                                  let tempSeries = JSON.parse(
                                    JSON.stringify(
                                      seriesForm.values.series[index]
                                    )
                                  );
                                  delete tempSeries.failed;
                                  props.handleLoad(tempSeries, index);
                                }}
                                // disabled={
                                //   !props.assetView
                                //     ? (type[index] == "Datapoints"
                                //         ? seriesForm.values.series[index]
                                //             .datapoint == ""
                                //         : !seriesForm.values.series[index]
                                //             .actuator) ||
                                //       seriesForm.values.series[index]
                                //         .aggregation == "" ||
                                //       seriesForm.values.series[index].device ==
                                //         "" ||
                                //       change ||
                                //       props.disabled[index]
                                //     : (seriesForm.values.series[index]
                                //         .datapoint ||
                                //         seriesForm.values.series[index]
                                //           .actuator) &&
                                //       !props.disabled[index]
                                //     ? false
                                //     : true
                                // }
                              >
                                Load
                              </Button>
                            </span>
                          </AccordionDetails>
                        </Accordion>
                        {index + 1 == seriesForm.values.series.length ? (
                          <span style={{ padding: "7px" }}>
                            <div
                              style={{
                                cursor:
                                  props.series.filter((s) => !s.failed)
                                    .length == seriesForm.values.series.length
                                    ? "pointer"
                                    : "auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                height: "45px",
                                border: `1px dashed ${
                                  props.series.filter((s) => !s.failed)
                                    .length == seriesForm.values.series.length
                                    ? metaDataValue.branding.secondaryColor
                                    : "grey"
                                }`,
                              }}
                              onClick={() => {
                                if (
                                  props.series.filter((s) => !s.failed)
                                    .length == seriesForm.values.series.length
                                ) {
                                  !props.assetView
                                    ? push({
                                        solution: "",
                                        datapoint: "",
                                        aggregation: "mean",
                                        device: "",
                                        name: `Datapoint`,
                                        deviceName: "",
                                      })
                                    : push({
                                        solution:
                                          seriesForm.values.series[0].solution,
                                        datapoint: "",
                                        aggregation: "mean",
                                        device:
                                          seriesForm.values.series[0].device,
                                        name: `Datapoint`,
                                        deviceName: "",
                                      });
                                  props.setExpanded(
                                    `panel${seriesForm.values.series.length}`
                                  );
                                  let tempType = [...type];
                                  tempType.push(tempType[tempType.length - 1]);
                                  setType(tempType);
                                }
                              }}
                            >
                              <p
                                style={{
                                  color:
                                    props.series.filter((s) => !s.failed)
                                      .length == seriesForm.values.series.length
                                      ? metaDataValue.branding.secondaryColor
                                      : "grey",
                                }}
                              >
                                <b>Add another series</b>
                              </p>
                            </div>
                          </span>
                        ) : null}
                      </div>
                    ))
                  : null}
              </div>
            )}
          </FieldArray>
        </form>
      </FormikProvider>
    </Fragment>
  );
}
