import React, { useState, useEffect, Fragment } from "react";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useGetEventsQuery } from "services/events";
import Loader from "components/Progress";
import { useCancelOperationMutation } from "services/controlling";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import { showSnackbar } from "Utilities/Snackbar";
import { useSnackbar } from "notistack";
import CircularProgress from "@mui/material/CircularProgress";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import DeleteAlert from "components/Alerts/Delete";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
import InfoIcon from "@mui/icons-material/Info";

function AssetCards(props) {
  console.log({props})
  const { enqueueSnackbar } = useSnackbar();
  const [command, setCommand] = useState("");
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [filter, setFilter] = useState("");
  const [last, setLast] = React.useState(null);
  const [disable, setDisable] = React.useState(false);
  const [temp, setTemp] = React.useState("");
  const [errors, setErrors] = React.useState({
    errorCommand: false,
    msgCommand: "",
  });
  const [time, setTime] = useState("No execution found");
  const [status, setStatus] = useState(null);

  const [cancel, cancelRes] = useCancelOperationMutation();

  const operationsRes = useGetEventsQuery({
    token: window.localStorage.getItem("token"),
    params: `?pageSize=1&currentPage=1&type=c8y_ControlUpdate&source=${props.id}&metaDataFilter={${filter}"metaData.actuatorName":"${props.actuator.name}"}`,
  });

  useEffect(() => {
    if (cancelRes.isSuccess) {
      let time = new Date(last.time);
      setStatus(last.metaData.status);
      setTime(
        `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
      );
      setCommand(generateValue(last.metaData.action));
      setDisable(false);
      showSnackbar(
        "Operations",
        cancelRes.data?.message,
        "success",
        1000,
        enqueueSnackbar
      );
    }
    if (cancelRes.isError) {
      setDisable(false);
      showSnackbar(
        "Operations",
        cancelRes.error?.data?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [cancelRes]);

  function generateValue(fetchedValue) {
    let fv = fetchedValue
    if(typeof(fv) !== "string"){
      fv = JSON.stringify(fetchedValue).replaceAll(/(['"])/g, "")
    }
    let command = props.actuator.metaData.Command;
    let index = command.indexOf("{range}");
    let first = command.substring(0, index);
    let temp = command.substring(index + 1);
    let last = temp.substring(temp.indexOf("}") + 1);
    let firstIndex;
    if (first.length) firstIndex = fv.indexOf(first);
    else firstIndex = 0;
    let lastIndex;
    if (last.length) lastIndex = fv.indexOf(last);
    else lastIndex = command.length - 1;
    let value = parseFloat(
      fv.substring(firstIndex + first.length, lastIndex)
    );
    return value;
  }

  useEffect(() => {
    if (operationsRes.isSuccess) {
      if (
        operationsRes.data?.payload.data.length &&
        operationsRes.data?.payload.data[0].metaData
      ) {
        setLast(operationsRes.data?.payload.data[0]);
        let statusValue = operationsRes.data?.payload.data[0].metaData.status;
        if (statusValue == "FAILED") {
          if (!filter.includes("SUCCESSFUL"))
            setFilter('"metaData.status":"SUCCESSFUL",');
          else operationsRes.refetch();
        }
        let time = new Date(operationsRes.data?.payload.data[0].time);
        setStatus(operationsRes.data?.payload.data[0].metaData.status);
        setTime(
          `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
        );
        setTemp(
          generateValue(operationsRes.data?.payload.data[0].metaData.action)
        );
        setCommand(
          generateValue(operationsRes.data?.payload.data[0].metaData.action)
        );
      } else {
        setStatus(null);
        setTime("No execution found");
        setTemp("");
        setCommand("");
      }
    }
  }, [operationsRes.isFetching]);

  function handleCancel() {
    setDisable(true);
    cancel({
      id: last.metaData.operationId,
    });
  }

  useEffect(() => {
    if (props.data) {
      let statusValue = props.data.metaData.status;
      if (statusValue == "FAILED") {
        if (!filter.includes("SUCCESSFUL"))
          setFilter('"metaData.status":"SUCCESSFUL",');
        else operationsRes.refetch();
      }
      let time = new Date(props.data.time);
      setStatus(props.data.metaData.status);
      setTime(
        `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
      );
      setCommand(generateValue(props.data.metaData.action));
      setTemp(generateValue(props.data.metaData.action));
    }
  }, [props.data]);
  useEffect(() => {
    if (props.data) {
      let statusValue = props.data.metaData.status;
      if (statusValue == "FAILED") {
        if (!filter.includes("SUCCESSFUL"))
          setFilter('"metaData.status":"SUCCESSFUL",');
        else operationsRes.refetch();
      }
      let time = new Date(props.data.time);
      setStatus(props.data.metaData.status);
      setTime(
        `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
      );
      setCommand(generateValue(props.data.metaData.action));
      setTemp(generateValue(props.data.metaData.action));
    }
  }, []);

  function clicked(command) {
    props.socket.emit("controlling", {
      deviceId: props.id,
      payload: props.actuator.metaData.Command.replaceAll("{range}", command),
      serviceId: props.service,
      actuatorId: props.actuator._id,
      actuatorName: props.actuator.name,
    });
    let time = new Date();
    setStatus("PENDING");
    setTemp(command);
    setTime(
      `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
    );
    toggleDelete();
  }

  function handleCommand(e) {
    if (e == "") {
      setErrors({
        ...errors,
        msgCommand: "Required Field",
        errorCommand: true,
      });
    } else if (
      e < props.actuator.metaData?.Range?.Min ||
      e > props.actuator.metaData?.Range?.Max
    ) {
      setErrors({
        ...errors,
        msgCommand: `Value out of range ${props.actuator.metaData?.Range?.Min} to ${props.actuator.metaData?.Range?.Max}`,
        errorCommand: true,
      });
    } else {
      setErrors({
        ...errors,
        msgCommand: "",
        errorCommand: false,
      });
    }
    setCommand(e);
  }

  function handlePrompt(command) {
    if (props.actuator.prompt) {
      toggleDelete(command);
    } else {
      clicked(command);
    }
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }
  let infoDetail = [];
  infoDetail.push(`Description: ${props.actuator.description}`);
  if (
    props.actuator?.metaData?.Range?.Min != undefined &&
    props.actuator?.metaData?.Range?.Max != undefined
  ) {
    infoDetail.push(`Min: ${props.actuator?.metaData?.Range?.Min}`);
    infoDetail.push(`Min: ${props.actuator?.metaData?.Range?.Max}`);
  }
  if (props.actuator?.metaData?.Increment) {
    infoDetail.push(`Increment: ${props.actuator?.metaData?.Increment}`);
  }
  if (props.actuator?.metaData?.Command) {
    infoDetail.push(`Command: ${props.actuator?.metaData?.Command}`);
  }
  const tooltipContent = (
    <Typography>
      {infoDetail.map((line, index) => (
        <React.Fragment key={index}>
          {line}
          <br />
        </React.Fragment>
      ))}
    </Typography>
  );
  if (props.actuator.name)
    return (
      <div style={{ height: "223px", position: "relative" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "96%",
            margin: "10px",
          }}
        >
          <p>
            <b>{props.actuator.name}</b>
          </p>
          <div
            style={{
              color: "#555555",
              cursor: "pointer",
            }}
          >
            <Tooltip
              title={tooltipContent}
              placement="left"
              arrow
              TransitionComponent={Zoom}
            >
              <InfoIcon />
            </Tooltip>
          </div>
        </div>

        <Divider />
        {operationsRes.isLoading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <Loader />
          </div>
        ) : (
          <Fragment>
            <div
              style={{
                opacity:
                  props.connectivity &&
                  status != "EXECUTING" &&
                  status != "PENDING" &&
                  props.permission == "ALL"
                    ? "1"
                    : "0.8",
                pointerEvents:
                  props.connectivity &&
                  status != "EXECUTING" &&
                  status != "PENDING" &&
                  props.permission == "ALL"
                    ? ""
                    : "none",
              }}
            >
              {!props.connectivity ||
              status == "EXECUTING" ||
              status == "PENDING" ? (
                <div
                  style={{
                    position: "absolute",
                    bottom: "-10px",
                    left: "10px",
                    display: "flex",
                    gap: "5px",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "10px",
                    background: "grey",
                    color: "white",
                    fontWeight: "bold",
                    fontSize: "13px",
                    padding: "5px 10px",
                    opacity: "0.6",
                  }}
                >
                  {props.permission == "ALL"
                    ? !props.connectivity
                      ? "DISCONNECTED"
                      : "QUEUED"
                    : null}

                  {props.connectivity && props.permission == "ALL" ? (
                    <Fragment>
                      {disable ? (
                        <CircularProgress
                          style={{
                            color: "white",
                            height: "15px",
                            width: "15px",
                          }}
                        />
                      ) : (
                        <IconButton
                          onClick={handleCancel}
                          style={{
                            height: "18px",
                            width: "18px",
                            cursor: "pointer",
                            pointerEvents: "auto",
                          }}
                        >
                          <NotInterestedOutlinedIcon
                            style={{
                              height: "15px",
                              width: "15px",
                              color: "#bf3535",
                            }}
                          />
                        </IconButton>
                      )}
                    </Fragment>
                  ) : null}
                </div>
              ) : null}
              <div
                style={{
                  display: "flex",
                  padding: "60px 20px 20px 20px",
                  alignItems: "center",
                  width: "100%",
                  gap: "20px",
                  opacity:
                    props.connectivity &&
                    status != "EXECUTING" &&
                    status != "PENDING"
                      ? "1"
                      : "0.8",
                  pointerEvents:
                    props.connectivity &&
                    status != "EXECUTING" &&
                    status != "PENDING"
                      ? ""
                      : "none",
                }}
              >
                  <TextField
                    required
                    fullWidth
                    id="outlined-required"
                    label="Numeric"
                    placeholder="Input numeric value"
                    typ="number"
                    value={command}
                    onChange={(e) => handleCommand(e.target.value)}
                    error={errors.errorCommand}
                    helperText={errors.msgCommand}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {temp != command &&
                          !(
                            command < props.actuator.metaData?.Range?.Min ||
                            command > props.actuator.metaData?.Range?.Max
                          ) ? (
                            <span style={{ display: "flex", gap: "10px" }}>
                              <Button
                                color="error"
                                variant="contained"
                                onClick={() => {
                                  setCommand(temp);
                                  !temp &&
                                    setErrors({
                                      ...errors,
                                      msgCommand: "Required Field",
                                      errorCommand: true,
                                    });
                                }}
                              >
                                RESET
                              </Button>
                              <Button
                                color="secondary"
                                variant="contained"
                                onClick={() => handlePrompt(command)}
                              >
                                SET
                              </Button>
                            </span>
                          ) : null}
                          <span
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              justifyContent: "center",
                              marginLeft: "10px",
                            }}
                          >
                            <IconButton
                              onClick={() => {
                                let value =
                                  command == ""
                                    ? props.actuator.metaData?.Range?.Min
                                    : parseFloat(command) +
                                      parseFloat(
                                        props.actuator.metaData.Increment
                                      );
                                handleCommand(`${value}`);
                              }}
                              disabled={
                                parseFloat(command) +
                                  parseFloat(
                                    props.actuator.metaData.Increment
                                  ) >
                                parseFloat(props.actuator.metaData?.Range?.Max)
                              }
                              style={{ width: "20px", height: "20px" }}
                            >
                              <KeyboardArrowUpIcon
                                style={{ width: "15px", height: "15px" }}
                              />
                            </IconButton>
                            <IconButton
                              onClick={() => {
                                let value =
                                  parseFloat(command) -
                                  parseFloat(props.actuator.metaData.Increment);
                                handleCommand(`${value}`);
                              }}
                              style={{ width: "20px", height: "20px" }}
                              disabled={
                                command == "" ||
                                parseFloat(command) -
                                  parseFloat(
                                    props.actuator.metaData.Increment
                                  ) <
                                  parseFloat(
                                    props.actuator.metaData?.Range?.Min
                                  )
                              }
                            >
                              <KeyboardArrowDownIcon
                                style={{ width: "15px", height: "15px" }}
                              />
                            </IconButton>
                          </span>
                        </InputAdornment>
                      ),
                    }}
                  />
              </div>
            </div>
            <div
              style={{
                padding: "0 10px",
                position: "absolute",
                bottom: "-15px",
                right: "5px",
              }}
            >
              <div>
                <span
                  style={{
                    display: "flex",
                    gap: "5px",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  {status ? (
                    <Skeleton
                      variant="circular"
                      width={8}
                      height={8}
                      style={{
                        backgroundColor:
                          status == "SUCCESSFUL"
                            ? "#5fb762"
                            : status == "PENDING"
                            ? "#fe9f1b"
                            : status == "EXECUTING"
                            ? "#3cc1e0"
                            : "#bf3535",
                      }}
                    />
                  ) : null}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#bfbec8",
                    }}
                  >
                    {status == "SUCCESSFUL"
                      ? "Last Executed"
                      : status == "PENDING"
                      ? "Last Triggered"
                      : status == "EXECUTING"
                      ? "Executing"
                      : status == "FAILED"
                      ? "Request Failed"
                      : ""}
                  </p>
                </span>
                <span
                  style={{
                    display: "flex",
                    gap: "5px",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#bfbec8",
                    }}
                  >
                    {time}
                  </p>
                </span>
              </div>
            </div>
          </Fragment>
        )}
        {activeId ? (
          <DeleteAlert
            deleteModal={deleteModal}
            question="Are you sure you want to execute this command?"
            id={activeId}
            handleDelete={clicked}
            handleClose={toggleDelete}
          />
        ) : null}
      </div>
    );
}

export default AssetCards;
