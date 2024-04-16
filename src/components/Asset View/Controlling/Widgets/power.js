import React, { useState, Fragment, useEffect } from "react";
import "../sw.css";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { useSelector } from "react-redux";
import { useGetEventsQuery } from "services/events";
import Loader from "components/Progress";
import { useCancelOperationMutation } from "services/controlling";
import NotInterestedOutlinedIcon from "@mui/icons-material/NotInterestedOutlined";
import { showSnackbar } from "Utilities/Snackbar";
import { useSnackbar } from "notistack";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import DeleteAlert from "components/Alerts/Delete";
import Zoom from "@mui/material/Zoom";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import InfoIcon from "@mui/icons-material/Info";

function Power(props) {
  const { enqueueSnackbar } = useSnackbar();
  const metaDataValue = useSelector((state) => state.metaData);
  const [activeId, setActiveId] = useState(null);
  const [swChecked, setSwChecked] = useState(false);
  const [deleteModal, setDelete] = useState(false);
  const [time, setTime] = useState("No execution found");
  const [status, setStatus] = useState(null);
  const [filter, setFilter] = useState("");
  const [last, setLast] = React.useState(null);
  const [disable, setDisable] = React.useState(false);

  const [cancel, cancelRes] = useCancelOperationMutation();

  const operationsRes = useGetEventsQuery({
    token: window.localStorage.getItem("token"),
    params: `?pageSize=1&currentPage=1&type=c8y_ControlUpdate&source=${props.id}&metaDataFilter={${filter}"metaData.actuatorName":"${props.actuator.name}"}`,
  });

  console.log({props})

  useEffect(() => {
    if (cancelRes.isSuccess) {
      let time = new Date(last.time);
      setStatus(last.metaData.status);
      setTime(
        `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
      );
      setSwChecked(
        props.actuator.metaData.Active.Value == last.metaData.action
      );
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
        setSwChecked(
          props.actuator.metaData.Active.Value ==
            operationsRes.data?.payload.data[0].metaData.action
        );
      } else {
        setStatus(null);
        setTime("No execution found");
        setSwChecked(false);
      }
    }
  }, [operationsRes.isFetching]);

  function handleCancel() {
    setDisable(true);
    cancel({
      id: last.metaData.operationId,
    });
  }

  if(props.socket){
    props.socket.on("controlResponse", (payload) => {
      console.log("RESPONSE RECIEVED")
      console.log({payload})
    })
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
      setSwChecked(
        props.actuator.metaData.Active.Value == props.data.metaData.action
      );
    }
  }, [props.data]);

  function clicked() {
    if (swChecked) {
      props.socket.emit("controlling", {
        deviceId: props.id,
        payload: props.actuator.metaData.Default.Value,
        serviceId: props.service,
        actuatorId: props.actuator._id,
        actuatorName: props.actuator.name,
      });
      setSwChecked(!swChecked);
    } else {
      props.socket.emit("controlling", {
        deviceId: props.id,
        payload: props.actuator.metaData.Active.Value,
        serviceId: props.service,
        actuatorId: props.actuator._id,
        actuatorName: props.actuator.name,
      });
      setSwChecked(!swChecked);
    }

    let time = new Date();
    setStatus("PENDING");
    setTime(
      `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
    );
    toggleDelete();
  }

  function handlePrompt() {
    if (props.actuator.prompt) {
      toggleDelete(true);
    } else {
      clicked();
    }
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }
  let infoDetail = [];
  infoDetail.push(`Description: ${props.actuator?.description}`);
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
  return (
    <Fragment>
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
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "187px",
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
   
            <input
              type="checkbox"
              className="power"
              checked={swChecked}
              style={{
                position: "absolute",
                top: "110px",
                backgroundColor: "#eeeeee",
              }}
              onChange={handlePrompt}
            ></input>
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "10px",
              position: "absolute",
              top: "0px",
            }}
          >
            <p
              style={{
                fontSize: "15px",
                color: metaDataValue.branding.secondaryColor,
              }}
            >
              <b>
                {props.actuator.metaData.Default.Name}/
                {props.actuator.metaData.Active.Name}
              </b>
            </p>
          </span>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-end",
              padding: "0 10px",
              position: "absolute",
              bottom: "-10px",
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
        </div>
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
    </Fragment>
  );
}

export default Power;
