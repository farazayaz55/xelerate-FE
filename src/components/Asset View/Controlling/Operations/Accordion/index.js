//---------------CORE--------------------//
import React from "react";
import { useSnackbar } from "notistack";
//---------------MUI--------------------//
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
//---------------MUI ICONS--------------------//
import InfoIcon from "@mui/icons-material/Info";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
//---------------EXTERNAL--------------------//
import { getControllingValues } from "Utilities/Controlling Widgets";

export default function ControlledAccordions(props) {
  let time = new Date(props.operation.time);
  let label = getControllingValues(
    props.actuators.find(
      (e) => e.name == props.operation.metaData.actuatorName
    ),
    props.operation.metaData.action
  ).label;

  function getTrigger() {
    let res = "device";
    if (props.operation.metaData?.details) {
      let trigger = props.operation.metaData?.details?.triggeredBy;
      if (trigger == "rule")
        res = `Rule (${props.operation.metaData?.details?.ruleName})`;
      else if (trigger == "automation")
        res = `Automation (${props.operation.metaData?.details?.scheduleName})`;
      else res = "manual";
    }
    return res;
  }

  return (
    <div
      style={{
        backgroundColor: "#f9f9f9",
        border: "1px solid #dedede",
        borderRadius: "10px",
        padding: "10px",
        margin: "10px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            width: 320,
          }}
        >
          <Skeleton
            variant="circular"
            width={8}
            height={8}
            style={{
              minHeight: "8px",
              minWidth: "8px",
              backgroundColor:
                props.operation.metaData.status == "SUCCESSFUL"
                  ? "#5fb762"
                  : props.operation.metaData.status == "PENDING"
                  ? "#fe9f1b"
                  : props.operation.metaData.status == "EXECUTING"
                  ? "#3cc1e0"
                  : "#bf3535",
            }}
          />
          <Typography
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              position: "relative",
              top: "2px",
            }}
          >
            {`${props.operation.metaData.actuatorName} -> ${label}`}
          </Typography>

          <Tooltip
            title={props.operation.metaData.action}
            placement="top"
            arrow
            TransitionComponent={Zoom}
          >
            <InfoIcon
              style={{ fontSize: "18px", color: "grey", cursor: "pointer" }}
            />
          </Tooltip>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: "18px",
            color: "#c3c3c3",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          <AccessTimeIcon style={{ fontSize: "18px", color: "#c3c3c3" }} />
          <Typography
            variant="caption"
            style={{ position: "relative", top: "2px" }}
          >
            <strong>{`${time.toLocaleDateString(
              "en-GB"
            )} - ${time.toLocaleTimeString()}`}</strong>
          </Typography>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "13px",
          paddingLeft: "20px",
          color: "grey",
          marginTop: "5px",
          gap: "10px",
        }}
      >
        <p>
          User:{" "}
          <span style={{ color: "#c3c3c3" }}>
            {props.operation.metaData.executedBy}
          </span>
        </p>
        <p>
          Trigger source:{" "}
          <span style={{ color: "#c3c3c3" }}>{getTrigger()}</span>
        </p>
      </div>
    </div>
  );
}
