import React, { forwardRef, useCallback } from "react";
import { useSnackbar, SnackbarContent } from "notistack";
import Card from "@mui/material/Card";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import { useHistory } from "react-router-dom";
import Button from "@mui/material/Button";

const SnackMessage = forwardRef((props, ref) => {
  const { closeSnackbar } = useSnackbar();

  const handleDismiss = useCallback(() => {
    closeSnackbar(props.id);
  }, [props.id, closeSnackbar]);

  return (
    <SnackbarContent ref={ref} style={{ borderRadius: "0" }}>
      <Card style={{ borderRadius: "0", width: "100%" }} elevation={2}>
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "100%",
            borderLeft: `8px solid ${
              props.message?.variant == "success"
                ? "#5fb762"
                : props.message?.variant == "warning"
                ? "#fe9f1b"
                : props.message?.variant == "info"
                ? "#3399ff"
                : "#bf3535"
            }`,
            minHeight: "70px",
          }}
        >
          <span
            style={{
              display: "flex",
              height: "100%",
              alignItems: "center",
              gap: "20px",
              margin: "0px 10px 0px 10px",
            }}
          >
            {props.message?.variant == "success" ? (
              <CheckCircleIcon style={{ color: "#5fb762" }} />
            ) : props.message?.variant == "warning" ? (
              <WarningIcon style={{ color: "#fe9f1b" }} />
            ) : props.message?.variant == "info" ? (
              <InfoIcon style={{ color: "#3399ff" }} />
            ) : (
              <ErrorIcon style={{ color: "#bf3535" }} />
            )}
            <span style={{ paddingRight: "20px" }}>
              <p>
                <b>{props.message?.title}</b>
              </p>
              <p style={{ fontSize: "12px" }}>{props.message?.message}</p>
            </span>
            {props.message.action ? (
              <Button
                onClick={() => {
                  props.message.history.push("/analytics/trendForecasting");
                }}
                style={{
                  position: "aboslute",
                  bottom: 12,
                  right: 10,
                  cursor: "pointer",
                }}
              >
                View
              </Button>
            ) : null}
          </span>

          <div style={{ position: "absolute", top: "5px", right: "5px" }}>
            <IconButton
              onClick={handleDismiss}
              style={{ height: "10px", width: "10px" }}
            >
              <CloseIcon style={{ height: "13px", width: "13px" }} />
            </IconButton>
          </div>
        </div>
      </Card>
    </SnackbarContent>
  );
});

export default SnackMessage;
