//---------------CORE--------------------//
import React, { useState, useEffect, Fragment } from "react";
import { useSnackbar } from "notistack";
import hexRgb from "hex-rgb";
import { useHistory } from "react-router-dom";
//---------------MUI--------------------//
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Zoom from "@mui/material/Zoom";
import { useSelector, useDispatch } from "react-redux";
import Badge from "@mui/material/Badge";
//---------------MUI ICONS--------------------//
import WarningIcon from "@mui/icons-material/Warning";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import BookmarkAddedIcon from "@mui/icons-material/BookmarkAdded";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import RouterIcon from "@mui/icons-material/Router";
import NotificationsActiveOutlinedIcon from "@mui/icons-material/NotificationsActiveOutlined";
//---------------EXTERNAL--------------------//
import DeleteAlert from "components/Alerts/Delete";
import { useUpdateAlarmMutation } from "services/alarms";
import { showSnackbar } from "Utilities/Snackbar";
import FlashOnIcon from "@mui/icons-material/FlashOn";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import FileMedical from "assets/icons/medicalFile.png";
import Measures from "../Measures";

export default function ControlledAccordions(props) {
  const dispatch = useDispatch();
  const history = useHistory();
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const [openMeasures, setOpenMeasures] = React.useState(false);
  const measures = isJsonString(props.alarm.text)
    ? isJsonString(props.alarm.text).measures
    : "";
  let alarmObj = { ...props.alarm, measures };
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);
  // const [image, setImage] = useState(
  //   `${Keys.baseUrl}/servicecreator/asset/${props.asset.image}`
  // );
  const [updateAlarm, result] = useUpdateAlarmMutation();

  let time = new Date(props.alarm.time);

  useEffect(() => {
    if (result.isSuccess) {
      setDelete(false);
      showSnackbar(
        "Alarm",
        result.data?.message,
        "success",
        1000,
        enqueueSnackbar
      );
      props.updateAlarm(result?.data?.payload, props.index)
      console.log({result})
    }
    if (result.isError) {
      setDelete(false);
      showSnackbar(
        "Alarm",
        result.error.data?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [result]);

  const handleChange = (panel) => (event, isExpanded) => {
    props.setExpanded(isExpanded ? panel : false);
  };
  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

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
        <Fragment  >
          <span style={{width:'83%'}}>
            <p>
              <b style={{ color: "grey" }}>Reason(s): </b>
            </p>
            <Tooltip
            title=             {text.reason ||
              (text?.sensorFriendlyName
                ? `${text.sensorFriendlyName} (value: ${text.reading}) - `
                : "") +
                (` is ${text.condition} ` +
                  (text?.threshold ? `- ${text.threshold}` : ""))}
                  TransitionComponent={Zoom}
                  arrow
                  placement="bottom"
            >

            <p style={{maxHeight:'2.5rem',overflow:'auto'}}>
              {text.reason ||
                (text?.sensorFriendlyName
                  ? `${text.sensorFriendlyName} (value: ${text.reading}) - `
                  : "") +
                  (` is ${text.condition} ` +
                    (text?.threshold ? `- ${text.threshold}` : ""))}
            </p>
            </Tooltip>
          </span>
          <span>
            <span
              style={{
                display: "flex",
                gap: "5px",
              }}
            >
              {text.sendEmail || (text?.actions && text.actions?.length) ? (
                <p>
                  <b style={{ color: "grey" }}>Actions: </b>
                </p>
              ) : null}
              {text.sendEmail ? (
                <Tooltip
                  title={
                    <span>
                      <p>Email(s) sent to</p>
                      {text.emails.map((e) => (
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
              {text?.actions && text.actions?.filter((a) => a)?.length ? (
                <Fragment>
                  <Tooltip
                    title={
                      <span>
                        {text.actions.map((e) => (
                          <p>
                            {text.actuatorNames &&
                              text.actuatorNames[e.actuatorId]}{" "}
                            → {e.commandLabel}
                          </p>
                        ))}
                      </span>
                    }
                    placement="top"
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <FlashOnIcon style={{ height: "17px", width: "17px" }} />
                  </Tooltip>
                </Fragment>
              ) : null}
            </span>
          </span>
        </Fragment>
      );
    else return text;
  }

  return (
    <Fragment>
      <Accordion
        //expanded={props.expanded === `panel${props.index}`}
        //onChange={handleChange(`panel${props.index}`)}
        expanded={props.fullScreenModeOpen ? true : isAccordionExpanded}
        onChange={() => setIsAccordionExpanded(!isAccordionExpanded)}
        style={{
          backgroundColor: "#f9f9f9",
          border: "1px solid #dedede",
          borderRadius: "10px",
          margin: "10px 0px 10px 0px",
        }}
        disableGutters
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          style={{ width: "100%" }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <span
              style={{
                display: "flex",
                gap: "5px",
                width: "60%",
              }}
            >
              <NotificationsActiveIcon
                style={{
                  color:
                    props.alarm.severity == "CRITICAL"
                      ? "#bf3535"
                      : props.alarm.severity == "MAJOR"
                      ? "#844204"
                      : props.alarm.severity == "MINOR"
                      ? "#fe9f1b"
                      : props.alarm.severity == "WARNING"
                      ? "#3399ff"
                      : "",
                }}
              />

              <Tooltip
                title={props.alarm.type}
                placement="bottom"
                arrow
                TransitionComponent={Zoom}
              >
                <Typography
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {!props.alarm.type.includes("geoFence") ? props.alarm.type : props.alarm.type.includes("Exit") ? `${props.alarm.type.split("_")[1]} - GeoFence Exit` : `${props.alarm.type.split("_")[1]} - GeoFence Entry`}
                </Typography>
              </Tooltip>

              {props.alarm.status == "ACTIVE" ||
              props.alarm.status == "ACKNOWLEDGED" ? (
                <Skeleton
                  variant="circular"
                  width={8}
                  height={8}
                  style={{
                    backgroundColor:
                      props.alarm.status == "ACKNOWLEDGED"
                        ? "orange"
                        : "#bf3535",
                    position: "relative",
                    top: "7px",
                  }}
                />
              ) : null}
            </span>
            {!props.alarm.generatedBy ? (
              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  position: "relative",
                  right: "10px",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  width: "100%",
                }}
              >
                <p
                  style={{
                    color: metaDataValue.branding.secondaryColor,
                    fontSize: "15px",
                  }}
                >
                  <strong>Device Mgmt</strong>
                </p>
                {/* <WarningIcon
              style={{
                color: metaDataValue.branding.secondaryColor,
                height: "15px",
                width: "15px",
              }}
            /> */}
              </div>
            ) : !props.expanded ? (
              <Tooltip
                title={props.alarm.deviceName}
                placement="bottom"
                arrow
                TransitionComponent={Zoom}
              >
                <div
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "130px",
                    fontWeight: "bold",
                    color: "rgb(205,205,205)",
                    textAlign: "end",
                    marginRight: "10px",
                  }}
                >
                  {props.alarm.deviceName}
                </div>
              </Tooltip>
            ) : null}
          </div>
        </AccordionSummary>
        <AccordionDetails>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span style={{ width: "100%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <p style={{ fontSize: "12px" }}>
                  <strong
                    style={{
                      color: metaDataValue.branding.secondaryColor,
                      cursor: "pointer",
                      fontSize: "15px",
                    }}
                    onClick={() => {
                      history.push(
                        `/solutions/${props.id}/${props.alarm.sensorId}/0`
                      );
                    }}
                  >
                    {props.alarm.deviceName}
                  </strong>
                  {` (${props.alarm.sensorId})`}
                </p>
                {props.permission == "ALL" ? (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "right",
                      alignItems: "center",
                      gap: "20px",
                    }}
                  >
                    <Tooltip
                      title="Acknowledge"
                      placement="bottom"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <IconButton
                        color="secondary"
                        disabled={props.alarm.status == "ACTIVE" ? false : true}
                        onClick={() => {
                          updateAlarm({
                            token: window.localStorage.getItem("token"),
                            id: props.alarm.alarmId,
                            status: "ACKNOWLEDGED",
                          });
                        }}
                        style={{ height: "10px", width: "10px" }}
                      >
                        <BookmarkAddedIcon
                          style={{
                            cursor: "pointer",
                            height: "20px",
                            width: "20px",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                    <Tooltip
                      title="Clear"
                      placement="bottom"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      <IconButton
                        color="secondary"
                        onClick={() => toggleDelete(props.alarm.alarmId)}
                        style={{ height: "10px", width: "10px" }}
                      >
                        <DeleteIcon
                          style={{
                            cursor: "pointer",
                            height: "20px",
                            width: "20px",
                          }}
                        />
                      </IconButton>
                    </Tooltip>
                  </div>
                ) : null}
              </div>
              <div
                style={{
                  margin: "10px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "20px",
                  fontSize: "13px",
                  textAlign:'left'
                }}
              >
                {gnerateDescription(isJsonString(props.alarm.text))}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    marginTop: "2px",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      backgroundColor: `rgb(${rgb.red}, ${rgb.green}, ${rgb.blue},0.1)`,
                      borderRadius: "5px",
                    }}
                  >
                    <p
                      style={{
                        margin: "0px 5px 0px 5px",
                        color: metaDataValue.branding.secondaryColor,
                        fontSize: "14px",
                        position: "relative",
                        top: "1px",
                      }}
                    >
                      <b>{props.alarm.count}</b>
                    </p>
                  </span>
                </div>
                {measures ? (
                  <div style={{ marginTop: "7px" }}>
                    <Tooltip
                      title={measures}
                      placement="top"
                      arrow
                      TransitionComponent={Zoom}
                    >
                      {/* <FontAwesomeIcon
                                  icon={famedical}
                                  style={{
                                    color: metaDataValue.branding.primaryColor,
                                    width: "18px",
                                    height: "18px",
                                  }}
                                /> */}
                      <img
                        src={FileMedical}
                        style={{
                          width: "18px",
                          height: "18px",
                          marginTop: "5px",
                          cursor: "pointer",
                        }}
                        onClick={() => setOpenMeasures(true)}
                      />
                    </Tooltip>
                  </div>
                ) : null}
                <div style={{ marginTop: "3px" }}>
                  <AccessTimeIcon
                    style={{
                      height: "18px",
                      width: "18px",
                      position: "relative",
                      top: "5px",
                      marginRight: "4px",
                    }}
                  />
                  <Typography variant="caption">
                    <strong>{`${time.toLocaleDateString(
                      "en-GB"
                    )} - ${time.toLocaleTimeString()}`}</strong>
                  </Typography>
                </div>
              </div>
            </span>

            {activeId ? (
              <DeleteAlert
                deleteModal={deleteModal}
                question="Are you sure you want to clear this alarm?"
                platformCheck={false}
                id={activeId}
                handleDelete={() =>
                  updateAlarm({
                    token: window.localStorage.getItem("token"),
                    id: props.alarm.alarmId,
                    status: "CLEARED",
                  })
                }
                handleClose={toggleDelete}
              />
            ) : null}
          </div>
        </AccordionDetails>
      </Accordion>
      {openMeasures ? (
        <Measures close={() => setOpenMeasures(false)} alarm={alarmObj} />
      ) : null}
    </Fragment>
  );
}
