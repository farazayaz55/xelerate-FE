import React, { useState, useEffect, Fragment } from "react";
import { makeStyles } from "@mui/styles";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import { useSelector } from "react-redux";
import { useUpdateAlarmMutation } from "services/alarms";
import { useSnackbar } from "notistack";
import DeleteAlert from "components/Alerts/Delete";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";

export default function DetailedAccordion({ alarm, permission, clear }) {
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [updateAlarm, result] = useUpdateAlarmMutation();
  const {
    _id,
    type,
    alarmId,
    generatedBy,
    count,
    text,
    creationTime,
    status,
    updatedAt,
  } = alarm;
  let time = new Date(updatedAt);
  time = `${time.toLocaleDateString("en-GB")}-${time.toLocaleTimeString()}`;

  useEffect(() => {
    if (result.isSuccess) {
      setDelete(false);
      enqueueSnackbar(
        {
          title: "Alarm",
          message: result.data.message,
          variant: "success",
        },
        {
          timeOut: 1000,
        }
      );
    }
    if (result.isError) {
      setDelete(false);
      enqueueSnackbar(
        {
          title: "Alarm",
          message: result.error?.data?.message,
          variant: "error",
        },
        {
          timeOut: 1000,
        }
      );
    }
  }, [result]);

  const useStyles = makeStyles(() => ({
    root: {
      width: "100%",
      paddingBottom: "10px",
    },
    heading: {
      fontSize: 15,
    },
    secondaryHeading: {
      fontSize: 15,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    icon: {
      verticalAlign: "bottom",
      height: 20,
      width: 20,
    },
    details: {
      alignItems: "center",
    },
    column: {
      flexBasis: "33.33%",
    },
    helper: {
      borderLeft: `2px solid grey`,
      padding: "1px 2px",
    },
    link: {
      color: metaDataValue.branding.primaryColor,
      textDecoration: "none",
      "&:hover": {
        textDecoration: "underline",
      },
    },
  }));

  const classes = useStyles();

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }
  async function handleClear(id = null) {
    clear(id);
  };

  function isJsonString(str) {
    let out;
    try {
      out = JSON.parse(str);
    } catch (e) {
      return str;
    }
    return out;
  }

  function gnerateDescription(text) {
    if (typeof text == "object")
      return (
        <Fragment>
          <span>
            <p>
              <b style={{ color: "grey" }}>Reason: </b>
            </p>
            <p>
              {text.reason ||
                (text?.sensorFriendlyName
                  ? `${text.sensorFriendlyName} (value: ${text.reading}) - `
                  : "") +
                  (` is ${text.condition} ` +
                    (text?.threshold ? `- ${text.threshold}` : ""))}
            </p>
          </span>
        </Fragment>
      );
    else return text;
  }

  return (
    <div className={classes.root}>
      <Accordion style={{ backgroundColor: "#f9f9f9", borderRadius: "8px" }}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel1c-content"
          id="panel1c-header"
        >
          <div>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <p className={classes.secondaryHeading}>{type}</p>

              {status == "ACTIVE" || status == "ACKNOWLEDGED" ? (
                <Skeleton
                  variant="circular"
                  width={7}
                  height={7}
                  style={{
                    backgroundColor:
                      status == "ACKNOWLEDGED" ? "orange" : "#bf3535",
                  }}
                />
              ) : null}
            </span>
          </div>
          {!generatedBy ? (
            <div
              style={{
                display: "flex",
                position: "relative",
                right: "25px",
                width: "100%",
                justifyContent: "flex-end",
              }}
            >
              <p
                style={{
                  color: metaDataValue.branding.primaryColor,
                  fontSize: "15px",
                }}
              >
                <strong>Device Mgmt</strong>
              </p>
            </div>
          ) : null}
        </AccordionSummary>
        <AccordionDetails className={classes.details}>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className={classes.column} style={{ paddingRight: "1px" }}>
              <Typography variant="caption">
                {gnerateDescription(isJsonString(text))}
              </Typography>
            </div>
            <Divider orientation="vertical" flexItem />
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  minWidth: "400px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span>
                    <span
                      style={{
                        display: "flex",
                        gap: "5px",
                      }}
                    >
                      {isJsonString(text).sendEmail ||
                      (isJsonString(text)?.actions &&
                        isJsonString(text).actions?.length) ? (
                        <p>
                          <b style={{ color: "grey" }}>Actions: </b>
                        </p>
                      ) : null}
                      {isJsonString(text).sendEmail ? (
                        <Tooltip
                          title={
                            <span>
                              <p>Email(s) sent tossssssss</p>
                              {isJsonString(text).emails.map((e) => (
                                <p>○ {e}</p>
                              ))}
                            </span>
                          }
                          placement="top"
                          arrow
                          TransitionComponent={Zoom}
                        >
                          <ForwardToInboxIcon
                            style={{ height: "17px", width: "17px" }}
                          />
                        </Tooltip>
                      ) : null}
                    </span>

                    {isJsonString(text)?.actions &&
                    isJsonString(text).actions?.length ? (
                      <Fragment>
                        {isJsonString(text).actions.length == 1 ? (
                          <p>
                            Actuation triggered:{" "}
                            {isJsonString(text).actuatorNames &&
                              isJsonString(text).actuatorNames[
                                isJsonString(text).actions[0]?.actuatorId
                              ]}{" "}
                            → {isJsonString(text).actions[0]?.commandLabel}
                          </p>
                        ) : (
                          <Tooltip
                            title={
                              <span>
                                {isJsonString(text).actions.map((e) => (
                                  <p>
                                    {isJsonString(text).actuatorNames &&
                                      isJsonString(text).actuatorNames[
                                        e.actuatorId
                                      ]}{" "}
                                    → {e.commandLabel}
                                  </p>
                                ))}
                              </span>
                            }
                            placement="top"
                            arrow
                            TransitionComponent={Zoom}
                          >
                            <p style={{ cursor: "pointer" }}>
                              Multiple Actuation(s) triggered
                            </p>
                          </Tooltip>
                        )}
                      </Fragment>
                    ) : null}
                  </span>
                  <Typography variant="caption">
                    <strong>Count:</strong> {count}
                  </Typography>
                </div>

                  <Typography variant="caption">{time}</Typography>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-end",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                {permission == "ALL" ? (
                  <div>
                    <Button
                      size="small"
                      style={{ color: "#bf3535" }}
                      onClick={() => {
                        toggleDelete(alarmId); 
                        handleClear(_id);
                        updateAlarm({
                          token: window.localStorage.getItem("token"),
                          id: alarmId,
                          status: "CLEARED",
                        });
                      }}
                    >
                      Clear
                    </Button>
                    <Button
                      size="small"
                      color="secondary"
                      onClick={() => {
                        updateAlarm({
                          token: window.localStorage.getItem("token"),
                          id: alarmId,
                          status: "ACKNOWLEDGED",
                        });
                      }}
                    >
                      Acknowledge
                    </Button>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </AccordionDetails>
      </Accordion>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to clear this alarm?"
          platformCheck={false}
          id={activeId}
          handleDelete={(id) =>
            updateAlarm({
              token: window.localStorage.getItem("token"),
              id: id,
              status: "CLEARED",
            })
          }
          handleClose={toggleDelete}
        />
      ) : null}
    </div>
  );
}
