import React, { Fragment, useState } from "react";
import { useFormik, FieldArray, FormikProvider } from "formik";
import * as Yup from "yup";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import BarChartIcon from "@mui/icons-material/BarChart";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
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
import { useSelector } from "react-redux";

export default function ControlledAccordions(props) {
  console.log({props})
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [open, setOpen] = useState(false);
  const [solutionObj, setSolutionObj] = useState(getObj());
  const metaDataValue = useSelector((state) => state.metaData);
  const [change, setChange] = useState(false);
  const [aggregationChanged, setAggregationChanged] = useState(false);
  const [devices, setDevices] = React.useState([]);
  const device = useSelector((state) => state.asset.device);
  let services = JSON.parse(JSON.stringify(props.services))
  services.forEach(s=>{
    s.sensors = device.esbMetaData && device.esbMetaData.datapoints && device.esbMetaData.datapoints.length ? s.sensors.filter(sensor=>device.esbMetaData.datapoints.includes(sensor.name)) : s.sensors;
  })

  const datapointForm = useFormik({
    initialValues: {
      datapoint: 
        {
            solution: props.datapoint?.service || (services[services.findIndex(s=>s.sensors.length)]?.id),
            datapoint: props.datapoint?.datapoint || services[services.findIndex(s=>s.sensors.length)]?.sensors[0]?.name,
            months: props.datapoint?.months || 7,
            aggregation: props.datapoint?.aggregation
              ? props.datapoint?.aggregation
              : "mean",
            device: props.datapoint?.device,
            name: props.datapoint?.name
              ? props.datapoint?.name
              : "Datapoint",
            friendlyName: services[services.findIndex(s=>s.sensors.length)]?.sensors[0]?.friendlyName || 'Datapoint',
            deviceName: props.datapoint?.deviceName
              ? props.datapoint?.deviceName
              : "",
          }
    },
    validationSchema: Yup.object({
      datapoints: Yup.array().of(
        Yup.object().shape(
          {
                solution: Yup.string().required("Required field"),
                datapoint: Yup.string().required("Required field"),
                aggregation: Yup.string().required("Required field"),
                months: Yup.number().required("Required field"),
                device: Yup.string().required("Required field"),
                name: Yup.string().required("Required field"),
                deviceName: Yup.string().required("Required field"),
              }
        )
      ),
    }),
  });
  const solutionDevices = useGetDevicesQuery(
    {
      token,
      group: datapointForm.values.datapoint?.solution,
      params: datapointForm.value.datapoint?.solution && metaDataValue.services.find(s=>s.id == datapointForm.value.datapoint?.solution).group?.id ? `&associatedGroup=${metaDataValue.services.find(s=>s.id == datapointForm.value.datapoint?.solution).group?.id}` : ``,
    },
    { skip: !open }
  );
  useEffect(() => {
    fetchDevices();
  }, [solutionDevices.isFetching]);

  function ifLoaded(state, component) {
    if (state) return <Loader top={"50px"} />;
    else return component;
  }

  async function fetchDevices() {
    var temp = [];
    if (!solutionDevices.isFetching && solutionDevices.data?.payload) {
      solutionDevices.data?.payload.data.forEach((elm) => {
        temp.push({ name: elm.name, id: elm.internalId });
      });
      setDevices(temp);
      // setLoader(false);
    } else if (
      !solutionDevices.isLoading &&
      solutionDevices.isError &&
      solutionDevices.data?.message != ""
    ) {
      showSnackbar("Devices", solutionDevices.data?.message, "error", 1000);
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function getObj() {
    let obj = {};
    services?.forEach((elm) => {
      if (elm.name != "Solutions" && elm.sensors) obj[elm.id] = elm;
    });
    return obj;
  }

  const handleListItemClick = (e) => {
    datapointForm.setFieldValue(`datapoint.deviceName`, e.name);
    datapointForm.setFieldValue(`datapoint.device`, e.id);
  };


  function ListComp() {
    return (
      <Fragment>
        <List component="nav">
          <Divider />
          {devices?.map((elm, i) => {
            return (
              <Fragment>
                <ListItemButton
                  onClick={() => {
                    setChange(false);
                    handleListItemClick(elm)
                    setTimeout(() => {
                      setOpen(false);
                    }, 100);
                  }}
                  style={{
                    
                    margin: "5px",
                  }}
                >
                  <ListItemIcon>
                    <RouterIcon
                      
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={`${elm.name} (${elm.id})`}
                   
                  />
                </ListItemButton>
                <Divider />
              </Fragment>
            );
          })}
        </List>
      </Fragment>
    );
  }

  return (
    <Fragment>
      <FormikProvider value={datapointForm}>
        <form onSubmit={datapointForm.handleSubmit}>
          <FieldArray name="datapoints">
            {() => (
              <div>
                
                      <div>
                        <Accordion
                          expanded={true}
                          style={{
                            backgroundColor: "#f2f2f2",
                            borderRadius:"12px",
                            margin: "5px",
                          }}
                        >
                          <AccordionSummary
                            aria-controls="panel1bh-content"
                            id="panel1bh-header"
                          >
                            <div>
                              <span
                                style={{
                                  display: "flex",
                                  gap: "10px",
                                }}
                              >
                                <BarChartIcon
                                  style={{
                                    color: "black",
                                  }}
                                />
                                
                                <p>
                                  {datapointForm.values.datapoint?.friendlyName}
                                </p>
                              </span>
                            </div>
                          </AccordionSummary>
                          <AccordionDetails>
                              <FormControl fullWidth style={{ margin: "5px" }}>
                                <InputLabel>Solution</InputLabel>
                                <Select
                                  disabled={props.disabled}
                                  name="solution"
                                  value={datapointForm.values.datapoint?.solution}
                                  label="Solution"
                                  onChange={(e) => {
                                    datapointForm.setFieldValue(`datapoint.deviceName`,"");
                                    datapointForm.setFieldValue(`datapoint.device`,"");
                                    datapointForm.setFieldValue(`datapoint.datapoint`,"");
                                    datapointForm.setFieldValue(`datapoint.solution`,e.target.value);
                                    setAggregationChanged(false);
                                    // datapointForm.handleChange(e.target.value);
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

                            <FormControl fullWidth style={{ margin: "5px" }}>
                              <InputLabel>Datapoint</InputLabel>
                              <Select
                                name={
                                  datapointForm.values.datapoint
                                    .datapoint
                                }
                                disabled={props.disabled}
                                label="Datapoint"
                                value={
                                  datapointForm.values.datapoint
                                    .datapoint
                                }
                                onChange={(e) => {
                                  datapointForm.setFieldValue(`datapoint.datapoint`,e.target.value)
                                  datapointForm.setFieldValue(`datapoint.name`,e.target.value)
                                  datapointForm.setFieldValue(`datapoint.friendlyName`,
                                  solutionObj[datapointForm.values.datapoint?.solution]?.sensors.find(s=>s.name == e.target.value)?.friendlyName
                                  )
                                }}
                              >
                                {solutionObj[
                                  datapointForm.values.datapoint
                                    .solution
                                ]?.sensors.map((elm) => {
                                  return (
                                    <MenuItem value={elm.name}>
                                      {elm.friendlyName}
                                    </MenuItem>
                                  );
                                })}
                              </Select>
                            </FormControl>
                            <FormControl fullWidth style={{ margin: "5px" }}>
                              <InputLabel>Aggregation</InputLabel>
                              <Select
                                disabled={props.disabled}
                                name={datapointForm.values.datapoint
                                  .aggregation}
                                label="Aggregation"
                                value={datapointForm.values.datapoint
                                    .aggregation}
                                onChange={(e) => {
                                  if (
                                    Object.entries(props.aggregations).length
                                  ) {
                                    setAggregationChanged(true);
                                  }
                                  datapointForm.setFieldValue(`datapoint.aggregation`,e.target.value);
                                }}
                              >
                                <MenuItem value={"mean"}>Mean</MenuItem>
                                <MenuItem value={"min"}>Min</MenuItem>
                                <MenuItem value={"max"}>Max</MenuItem>
                                
                              </Select>
                            </FormControl>
                              <FormControl fullWidth style={{ margin: "5px" }}>
                                <InputLabel>Duration</InputLabel>
                                <Select
                                  disabled={props.disabled}
                                  name={
                                    datapointForm.values.datapoint
                                      .months
                                  }
                                  label="Duration"
                                  value={
                                    datapointForm.values.datapoint
                                      .months
                                  }
                                  onChange={(e) => {
                                    datapointForm.setFieldValue(`datapoint.months`,e.target.value);
                                  }}
                                >
                                  <MenuItem value={7}>7 days</MenuItem>
                                  <MenuItem value={30}>30 days</MenuItem>
                                  <MenuItem value={90}>90 days</MenuItem>
                                </Select>
                              </FormControl>
                              <Fragment>
                                <Dialog
                                  open={open}
                                  onClose={() => setOpen(!open)}
                                >
                                  <DialogTitle>Device</DialogTitle>
                                  <DialogContent
                                    style={{
                                      textAlign: "center",
                                      minWidth: "200px",
                                      minHeight: "200px",
                                    }}
                                  >
                                    {ifLoaded(
                                      solutionDevices.isFetching,
                                      <ListComp/>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                <div
                                  style={{
                                    width: "100%",
                                    height: "56px",
                                    border:
                                      datapointForm.values.datapoint
                                        .solution
                                        ? `solid 1px ${
                                            JSON.parse(
                                              window.localStorage.getItem(
                                                "metaData"
                                              )
                                            )?.branding.primaryColor
                                          }`
                                        : `solid 1px #b0bcbb`,
                                    borderRadius: "5px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor:
                                      datapointForm.values.datapoint
                                        .solution
                                        ? "pointer"
                                        : "",
                                    margin: "5px",
                                  }}
                                  onClick={() => {
                                    if (
                                      datapointForm.values.datapoint
                                        .solution
                                    ) {
                                      setOpen(true);
                                      fetchDevices();
                                    }
                                  }}
                                >
                                  <p
                                    style={{
                                      color: "#5c6261",
                                      fontSize: "16px",
                                      color:
                                        datapointForm.values.datapoint
                                          .solution
                                          ? JSON.parse(
                                              window.localStorage.getItem(
                                                "metaData"
                                              )
                                            )?.branding.primaryColor
                                          : "grey",
                                      userSelect: "none",
                                    }}
                                  >
                                    <b>
                                      {!datapointForm.values.datapoint
                                        .solution
                                        ? "Select a solution"
                                        : !datapointForm.values.datapoint?.deviceName
                                        ? "Select a device"
                                        : datapointForm.values.datapoint
                                            .deviceName}
                                    </b>
                                  </p>
                                </div>
                              </Fragment>

                            <span
                              style={{
                                display: "flex",
                                alignItems: "flex-end",
                                justifyContent: "flex-end",
                                width: "100%",
                                marginTop: "5px",
                              }}
                            >
                              <Button
                                 onClick={() => {
                                  props.handleLoad(
                                    datapointForm.values.datapoint
                                      .device,
                                    datapointForm.values.datapoint
                                      .datapoint,
                                    datapointForm.values.datapoint
                                      .aggregation,
                                    datapointForm.values.datapoint
                                          .months,
                                    datapointForm.values.datapoint?.name,
                                    datapointForm.values.datapoint
                                      .solution,
                                    datapointForm.values.datapoint
                                      .deviceName,
                                    null,
                                    aggregationChanged
                                  );
                                  setAggregationChanged(false);
                                }}
                                disabled={
                                  datapointForm.values.datapoint
                                    .datapoint == "" ||
                                  datapointForm.values.datapoint
                                    .aggregation == "" ||
                                  datapointForm.values.datapoint
                                    .device == "" ||
                                  change
                                }
                              >
                                Predict
                              </Button>
                              {
                              props.socketConnect.state == "disconnected" ? (
                                <div
                                  style={{ color: "red", margin: "10px 0px" }}
                                >
                                  {props.socketConnect.msg}
                                </div>
                              ) : null}
                            </span>
                          </AccordionDetails>
                        </Accordion>
                        
                      </div>
              </div>
            )}
          </FieldArray>
        </form>
      </FormikProvider>
    </Fragment>
  );
}
