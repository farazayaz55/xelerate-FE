import React, { Fragment, useEffect, useState } from "react";
import Divider from "@mui/material/Divider";
import CircularSlider from "@fseehawer/react-circular-slider";
import Skeleton from "@mui/material/Skeleton";
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
import InfoIcon from "@mui/icons-material/Info";
import Typography from "@mui/material/Typography";

let temp = 0;
let dragging = false;

function AssetCards(props) {
  const { enqueueSnackbar } = useSnackbar();
  const [data, setData] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [time, setTime] = useState("No execution found");
  const [status, setStatus] = useState(null);
  const [sliderValue, setSliderValue] = useState(null);
  const [filter, setFilter] = useState("");
  const [last, setLast] = React.useState(null);
  const [disable, setDisable] = React.useState(false);
  const [tooltipContent, setTooltipContent] = React.useState(null);

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
      setData(dataArr.indexOf(`${generateValue(last.metaData.action)}`));
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
        setData(
          dataArr.indexOf(
            `${generateValue(
              operationsRes.data?.payload.data[0].metaData.action
            )}`
          )
        );
      } else {
        setStatus(null);
        setTime("No execution found");
        setData(dataArr.indexOf(`${props.actuator.metaData.Range.Min}`));
      }
    }
  }, [operationsRes.isFetching]);

  useEffect(() => {
    if (props.data) {
      let statusValue = props.data.metaData.status;
      if (statusValue == "FAILED") {
        if (!filter.includes("SUCCESSFUL"))
          setFilter('"metaData.status":"SUCCESSFUL",');
        else operationsRes.refetch();
      }
      let time = new Date(props.data.time);
      setData(dataArr.indexOf(`${generateValue(props.data.metaData.action)}`));
      setStatus(props.data.metaData.status);
      setTime(
        `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
      );
    }
  }, [props.data]);
  useEffect(() => {
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
    if (!tooltipContent) {
      setTooltipContent(
        <Typography>
          {infoDetail.map((line, index) => (
            <React.Fragment key={index}>
              {String(line)} {/* Convert each element to a string */}
              <br />
            </React.Fragment>
          ))}
        </Typography>
      );
    }
  }, [props]);

  function handleCancel() {
    dragging = false;
    setDisable(true);
    cancel({
      id: last.metaData.operationId,
    });
  }

  function handleChange() {
    if (props.socket && dragging) {
      temp = sliderValue;
      props.socket.emit("controlling", {
        deviceId: props.id,
        payload: props.actuator.metaData.Command.replaceAll("{range}", temp),
        serviceId: props.service,
        actuatorId: props.actuator._id,
        actuatorName: props.actuator.name,
      });
      let time = new Date();
      setStatus("PENDING");
      setTime(
        `${time.toLocaleDateString("en-GB")} - ${time.toLocaleTimeString()}`
      );
      dragging = false;
    }
    toggleDelete();
  }

  let dataArr = generateData();

  function generateData() {
    let min = parseInt(props.actuator.metaData.Range.Min);
    let max = parseInt(props.actuator.metaData.Range.Max);
    let output = [];
    while (min <= max) {
      output.push(min.toString());
      min += 1;
    }
    return output;
  }

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
    let value = parseInt(
      fv.substring(firstIndex + first.length, lastIndex)
    );
    return value;
  }

  function handlePrompt() {
    if (props.actuator.prompt) {
      toggleDelete(true);
    } else {
      handleChange();
    }
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

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
            style={{ pointerEvents: "auto" }} // Add this line
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
          onClick={() => {
            if (dragging) {
              handlePrompt();
            }
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
                alignItems: "center",
                justifyContent: "center",
                marginTop: "30px",
              }}
            >
              <CircularSlider
                width={150}
                dataIndex={data}
                label="."
                labelFontSize="0"
                data={dataArr}
                labelColor="#212121"
                valueFontSize="3rem"
                knobColor="#212121"
                progressColorFrom="#4caf50"
                progressColorTo="#a15400"
                progressSize={8}
                trackColor="grey"
                trackSize={1}
                onChange={(e) => {
                  setSliderValue(e);
                  if ((data || data == 0) && e != data) {
                    dragging = true;
                  }
                }}
              >
                <p>.</p>
              </CircularSlider>
            </div>
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-end",
              padding: "0 10px",
              position: "absolute",
              bottom: "-15px",
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
          handleDelete={handleChange}
          handleClose={() => {
            dragging = false;
            toggleDelete();
          }}
        />
      ) : null}
    </Fragment>
  );
}

export default AssetCards;
