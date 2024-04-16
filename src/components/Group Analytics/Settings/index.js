import React, { Fragment, useEffect } from "react";
import { useSnackbar } from "notistack";
import { useSelector } from "react-redux";
import SettingsIcon from "@mui/icons-material/Settings";
import Dialog from "@mui/material/Dialog";
import Divider from "@mui/material/Divider";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Button from "@mui/material/Button";
import { useDispatch } from "react-redux";
import {
  setPreCanned,
  setHorizontalBar,
  setBox,
} from "rtkSlices/GroupAnalyticsSlice";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import Groups from "components/Groups";
import "../style.css";

export default function TrendForecasting(props) {
  const [path, setPath] = React.useState(["0:All assets"])
  const metaDataValue = useSelector((state) => state.metaData);
  const groupAnalytics = useSelector((state) => state.groupAnalytics);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [error, setError] = React.useState("");
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useDispatch();

  function reset() {
    switch (props.type) {
      case "PreCanned":
        dispatch(
          setPreCanned({
            ...groupAnalytics.PreCanned.cache,
          })
        );
        break;

      case "HorizontalBar":
        dispatch(
          setHorizontalBar({
            ...groupAnalytics.HorizontalBar.cache,
          })
        );
        break;

      case "Box":
        dispatch(
          setBox({
            ...groupAnalytics.Box.cache,
          })
        );
        break;

      default:
        break;
    }
    handlepopupClose();
  }

  function checkDisable() {
    return (
      error != "" ||
      (groupAnalytics[props.type].datapoint ==
        groupAnalytics[props.type].cache.datapoint &&
        groupAnalytics[props.type].aggregation ==
          groupAnalytics[props.type].cache.aggregation &&
        groupAnalytics[props.type].solution ==
          groupAnalytics[props.type].cache.solution &&
        groupAnalytics[props.type].start ==
          groupAnalytics[props.type].cache.start &&
        groupAnalytics[props.type].end ==
          groupAnalytics[props.type].cache.end &&
        groupAnalytics[props.type].group?.id ==
          groupAnalytics[props.type].cache.group?.id)
    );
  }

  useEffect(() => {
    switch (props.type) {
      case "PreCanned":
        dispatch(
          setPreCanned({
            solution:
              groupAnalytics[props.type].solution ||
              metaDataValue.services[0].id,
            end: groupAnalytics[props.type].end || new Date().toISOString(),
            start:
              groupAnalytics[props.type].start ||
              new Date(
                new Date().setDate(new Date().getDate() - 1)
              ).toISOString(),
            filter: `${
              groupAnalytics[props.type].solution ||
              metaDataValue.services[0].id
            }?dateFrom=${
              groupAnalytics[props.type].start ||
              new Date(
                new Date().setDate(new Date().getDate() - 1)
              ).toISOString()
            }&dateTo=${
              groupAnalytics[props.type].end || new Date().toISOString()
            }&aggregation=${groupAnalytics.PreCanned.aggregation}&groupId=${
              groupAnalytics.PreCanned.group.id
            }`,
          })
        );
        break;

      case "HorizontalBar":
        dispatch(
          setHorizontalBar({
            solution:
              groupAnalytics[props.type].solution ||
              metaDataValue.services[0].id,
            datapoint:
              groupAnalytics[props.type].datapoint ||
              metaDataValue.services[0].sensors[0].name,
            end: groupAnalytics[props.type].end || new Date().toISOString(),
            start:
              groupAnalytics[props.type].start ||
              new Date(
                new Date().setDate(new Date().getDate() - 1)
              ).toISOString(),
            filter: `${
              groupAnalytics[props.type].solution ||
              metaDataValue.services[0].id
            }?dateFrom=${
              groupAnalytics[props.type].start ||
              new Date(
                new Date().setDate(new Date().getDate() - 1)
              ).toISOString()
            }&dateTo=${
              groupAnalytics[props.type].end || new Date().toISOString()
            }&aggregation=${groupAnalytics.PreCanned.aggregation}&groupId=${
              groupAnalytics.PreCanned.group.id
            }&dataPoint=${
              groupAnalytics[props.type].datapoint ||
              metaDataValue.services[0].sensors[0].name
            }`,
          })
        );
        break;

      case "Box":
        dispatch(
          setBox({
            solution:
              groupAnalytics[props.type].solution ||
              metaDataValue.services[0].id,
            datapoint:
              groupAnalytics[props.type].datapoint ||
              metaDataValue.services[0].sensors[0].name,
            end: groupAnalytics[props.type].end || new Date().toISOString(),
            start:
              groupAnalytics[props.type].start ||
              new Date(
                new Date().setDate(new Date().getDate() - 1)
              ).toISOString(),
            filter: `${
              groupAnalytics[props.type].solution ||
              metaDataValue.services[0].id
            }?dateFrom=${
              groupAnalytics[props.type].start ||
              new Date(
                new Date().setDate(new Date().getDate() - 1)
              ).toISOString()
            }&dateTo=${
              groupAnalytics[props.type].end || new Date().toISOString()
            }&dataPoint=${
              groupAnalytics[props.type].datapoint ||
              metaDataValue.services[0].sensors[0].name
            }`,
          })
        );
        break;

      default:
        break;
    }

    return () => {};
  }, []);

  function generateLegends() {
    let legends = [
      {
        name: "Solution",
        value: `${
          metaDataValue.services.find(
            (e) => e.id == groupAnalytics[props.type].solution
          )
            ? metaDataValue.services.find(
                (e) => e.id == groupAnalytics[props.type].solution
              ).name
            : ""
        }`,
      },
      { name: "Group", value: groupAnalytics[props.type].group.name },
    ];

    if (props.type != "Box")
      legends.push({
        name: "Aggregation",
        value: groupAnalytics[props.type].aggregation,
      });

    if (props.type != "PreCanned")
      legends.push({
        name: "Datapoint",
        value: getDatapoints(groupAnalytics[props.type].solution).find(
          (e) => e.name == groupAnalytics[props.type].datapoint
        )?.friendlyName,
      });

    legends = [
      ...legends,
      ...[
        {
          name: "Start Time",
          value: `${new Date(
            groupAnalytics[props.type].start
          ).toLocaleDateString("en-GB")} ${new Date(
            groupAnalytics[props.type].start
          ).toLocaleTimeString()}`,
        },
        {
          name: "End Time",
          value: `${new Date(groupAnalytics[props.type].end).toLocaleDateString(
            "en-GB"
          )} ${new Date(groupAnalytics[props.type].end).toLocaleTimeString()}`,
        },
      ],
    ];

    return legends;
  }

  function handleExpand() {
    let elm = document.getElementById("pre-canned-group");
    let arrow = document.getElementById("pre-canned-arrow");
    if (elm.style.height == "" || elm.style.height == "55px") {
      arrow.style.transform = "rotate(180deg)";
      elm.style.height = "500px";
    } else {
      arrow.style.transform = "rotate(360deg)";
      elm.style.height = "55px";
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  const handlepopupOpen = () => {
    switch (props.type) {
      case "PreCanned":
        dispatch(
          setPreCanned({
            cache: {
              group: groupAnalytics.PreCanned.group,
              solution: groupAnalytics.PreCanned.solution,
              aggregation: groupAnalytics.PreCanned.aggregation,
              start: groupAnalytics.PreCanned.start,
              end: groupAnalytics.PreCanned.end,
            },
          })
        );
        break;

      case "HorizontalBar":
        dispatch(
          setHorizontalBar({
            cache: {
              group: groupAnalytics.HorizontalBar.group,
              solution: groupAnalytics.HorizontalBar.solution,
              aggregation: groupAnalytics.HorizontalBar.aggregation,
              start: groupAnalytics.HorizontalBar.start,
              end: groupAnalytics.HorizontalBar.end,
              datapoint: groupAnalytics.HorizontalBar.datapoint,
            },
          })
        );
        break;

      case "Box":
        dispatch(
          setBox({
            cache: {
              group: groupAnalytics.Box.group,
              solution: groupAnalytics.Box.solution,
              aggregation: groupAnalytics.Box.aggregation,
              start: groupAnalytics.Box.start,
              end: groupAnalytics.Box.end,
              datapoint: groupAnalytics.Box.datapoint,
            },
          })
        );
        break;

      default:
        break;
    }
    setOpenPopup(true);
  };

  const handlepopupClose = () => {
    setOpenPopup(false);
  };

  const setGroup = (group) => {
    switch (props.type) {
      case "PreCanned":
        dispatch(
          setPreCanned({
            group: {
              name: group.name,
              id: group.id,
            },
          })
        );
        break;

      case "HorizontalBar":
        dispatch(
          setHorizontalBar({
            group: {
              name: group.name,
              id: group.id,
            },
          })
        );
        break;

      case "Box":
        dispatch(
          setBox({
            group: {
              name: group.name,
              id: group.id,
            },
          })
        );
        break;

      default:
        break;
    }
  };

  const handleSolution = (e) => {
    let datapoint = metaDataValue.services.find(
      (elm) => elm.id == e.target.value
    ).sensors[0].name;
    switch (props.type) {
      case "PreCanned":
        dispatch(
          setPreCanned({
            group: { name: "All assets", id: "" },
            solution: e.target.value,
          })
        );
        break;

      case "HorizontalBar":
        dispatch(
          setHorizontalBar({
            group: { name: "All assets", id: "" },
            solution: e.target.value,
            datapoint: datapoint,
          })
        );
        break;

      case "Box":
        dispatch(
          setBox({
            group: { name: "All assets", id: "" },
            solution: e.target.value,
            datapoint: datapoint,
          })
        );
        break;

      default:
        break;
    }
  };

  const handleAggregation = (e) => {
    switch (props.type) {
      case "PreCanned":
        dispatch(setPreCanned({ aggregation: e.target.value }));
        break;

      case "HorizontalBar":
        dispatch(setHorizontalBar({ aggregation: e.target.value }));
        break;

      default:
        break;
    }
  };

  const handleStart = (newValue) => {
    if (Object.prototype.toString.call(newValue) === "[object Date]") {
      if (!isNaN(newValue)) {
        switch (props.type) {
          case "PreCanned":
            dispatch(setPreCanned({ start: new Date(newValue).toISOString() }));
            break;

          case "HorizontalBar":
            dispatch(
              setHorizontalBar({ start: new Date(newValue).toISOString() })
            );
            break;

          case "Box":
            dispatch(setBox({ start: new Date(newValue).toISOString() }));
            break;

          default:
            break;
        }
        chkError(
          new Date(newValue).toISOString(),
          groupAnalytics[props.type].end
        );
      }
    }
  };

  const handleEnd = (newValue) => {
    if (Object.prototype.toString.call(newValue) === "[object Date]") {
      if (!isNaN(newValue)) {
        switch (props.type) {
          case "PreCanned":
            dispatch(setPreCanned({ end: new Date(newValue).toISOString() }));
            break;

          case "HorizontalBar":
            dispatch(
              setHorizontalBar({ end: new Date(newValue).toISOString() })
            );
            break;

          case "Box":
            dispatch(setBox({ end: new Date(newValue).toISOString() }));
            break;

          default:
            break;
        }
        chkError(
          groupAnalytics[props.type].start,
          new Date(newValue).toISOString()
        );
      }
    }
  };

  const handleDatapoint = (e) => {
    switch (props.type) {
      case "HorizontalBar":
        dispatch(
          setHorizontalBar({
            datapoint: e.target.value,
          })
        );
        break;

      case "Box":
        dispatch(
          setBox({
            datapoint: e.target.value,
          })
        );
        break;

      default:
        break;
    }
  };

  const getDatapoints = (solution) => {
    let res = [];
    let service = metaDataValue.services.find((e) => e.id == solution);
    if (service) {
      res = service.sensors;
    }
    return res;
  };

  function chkError(start, end) {
    let err = "";
    var one_day = 1000 * 60 * 60 * 24;
    var startDate = new Date(start);
    var endDate = new Date(end);
    var diff = Math.ceil((endDate.getTime() - startDate.getTime()) / one_day);
    if (diff > 7) err = "Please select date range within 7 days.";
    setError(err);
  }

  return (
    <Fragment>
      <form>
        <Dialog
          open={openPopup}
          onClose={reset}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            {props.name} Settings
          </DialogTitle>
          <DialogContent style={{ width: "500px" }}>
            <FormControl fullWidth style={{ margin: "5px" }}>
              <InputLabel>Solution</InputLabel>
              <Select
                value={groupAnalytics[props.type].solution}
                label="Solution"
                onChange={handleSolution}
              >
                {metaDataValue.services.map((elm) => {
                  return <MenuItem value={elm.id}>{elm.name}</MenuItem>;
                })}
              </Select>
            </FormControl>
            <div
              style={{
                position: "relative",
                margin: "10px 0px",
                left: "5px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: "-12px",
                  left: "11px",
                  background: "white",
                  color: "#9b9b9b",
                  fontSize: "13px",
                  padding: "0 5px",
                  zIndex: 1,
                }}
              >
                <p style={{ userSelect: "none" }}>Group</p>
              </div>
              <div className="pre-canned-group" id="pre-canned-group">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    height: "55px",
                    width: "100%",
                    padding: "0 15px",
                  }}
                  onClick={handleExpand}
                >
                  <p>{groupAnalytics[props.type].group.name}</p>
                  <ArrowDropDownIcon
                    id="pre-canned-arrow"
                    style={{
                      color: "#757575",
                      position: "relative",
                      left: "8px",
                    }}
                  />
                </div>
                <Divider style={{ margin: "0 10px 10px 10px" }} />
                <div style={{ padding: "20px" }}>
                  <Groups
                    id={groupAnalytics[props.type].solution}
                    setGroup={setGroup}
                    refetch={false}
                    serviceDashboard={true}
                    path={path}
                  setPath={setPath}
                  />
                </div>
              </div>
            </div>
            {props.type != "PreCanned" ? (
              <FormControl
                fullWidth
                style={{ margin: "10px 0px", left: "5px" }}
              >
                <InputLabel>Datapoint</InputLabel>
                <Select
                  value={groupAnalytics[props.type].datapoint}
                  label="Datapoint"
                  onChange={handleDatapoint}
                >
                  {getDatapoints(groupAnalytics[props.type].solution).map(
                    (elm) => {
                      return (
                        <MenuItem value={elm.name}>{elm.friendlyName}</MenuItem>
                      );
                    }
                  )}
                </Select>
              </FormControl>
            ) : null}

            {props.type != "Box" ? (
              <FormControl fullWidth style={{ margin: "5px" }}>
                <InputLabel>Aggregation</InputLabel>
                <Select
                  label="Aggregation"
                  value={groupAnalytics[props.type].aggregation}
                  onChange={handleAggregation}
                >
                  <MenuItem value={"mean"}>Mean</MenuItem>
                  <MenuItem value={"min"}>Min</MenuItem>
                  <MenuItem value={"max"}>Max</MenuItem>
                  <MenuItem value={"sum"}>Sum</MenuItem>
                </Select>
              </FormControl>
            ) : null}

            <div
              style={{
                display: "flex",
                marginTop: "5px",
              }}
            >
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Time"
                  inputFormat="dd/MM/yyyy h:mm:ss aaa"
                  value={groupAnalytics[props.type].start}
                  onChange={handleStart}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      style={{ maxWidth: "300px", margin: "5px" }}
                    />
                  )}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="End Time"
                  value={groupAnalytics[props.type].end}
                  onChange={handleEnd}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      fullWidth
                      style={{
                        maxWidth: "300px",
                        margin: "5px",
                        position: "relative",
                        left: "10px",
                      }}
                    />
                  )}
                />
              </LocalizationProvider>
            </div>
            <p style={{ color: "red", padding: "5px 10px" }}>{error}</p>
            {props.type == "Box" ? (
              <p
                style={{
                  position: "relative",
                  left: "13px",
                  fontSize: "13px",
                  color: "grey",
                }}
              >
                <b>Hint:</b> For better experience divide the assets into
                different groups, as it can only show 20 assets.
              </p>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={reset} color="error">
              Cancel
            </Button>
            <Button
              disabled={checkDisable()}
              type="submit"
              onClick={() => {
                switch (props.type) {
                  case "PreCanned":
                    dispatch(
                      setPreCanned({
                        filter: `${groupAnalytics.PreCanned.solution}?dateFrom=${groupAnalytics.PreCanned.start}&dateTo=${groupAnalytics.PreCanned.end}&aggregation=${groupAnalytics.PreCanned.aggregation}&groupId=${groupAnalytics.PreCanned.group.id}`,
                      })
                    );
                    break;

                  case "HorizontalBar":
                    dispatch(
                      setHorizontalBar({
                        filter: `${groupAnalytics.HorizontalBar.solution}?dateFrom=${groupAnalytics.HorizontalBar.start}&dateTo=${groupAnalytics.HorizontalBar.end}&aggregation=${groupAnalytics.HorizontalBar.aggregation}&groupId=${groupAnalytics.HorizontalBar.group.id}&dataPoint=${groupAnalytics.HorizontalBar.datapoint}`,
                      })
                    );
                    break;

                  case "Box":
                    dispatch(
                      setBox({
                        filter: `${groupAnalytics.Box.solution}?dateFrom=${groupAnalytics.Box.start}&dateTo=${groupAnalytics.Box.end}&dataPoint=${groupAnalytics.Box.datapoint}&groupId=${groupAnalytics.Box.group.id}`,
                      })
                    );
                    break;

                  default:
                    break;
                }
                handlepopupClose();
              }}
              color="secondary"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </form>
      <div
        style={{
          position: "absolute",
          right: "25px",
          top: "25px",
          zIndex: "1",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            padding: "10px",
            borderRadius: "10px",
            color: "black",
            background: "rgb(191,190,200,0.2)",
          }}
        >
          {generateLegends().map((e) => (
            <div
              key={e.name}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                alignItems: "center",
                marginBottom: "5px",
              }}
            >
              <p>
                <b>{e.name}:</b>
              </p>
              <p>{e.value}</p>
            </div>
          ))}
        </div>
        <span
          style={{
            marginTop: "10px",
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            className="pre-canned-button"
            style={{ background: metaDataValue.branding.secondaryColor }}
            onClick={handlepopupOpen}
          >
            <SettingsIcon
              className="pre-canned-icon"
              sx={{ height: "20px", width: "20px" }}
            />
          </div>
        </span>
      </div>
    </Fragment>
  );
}
