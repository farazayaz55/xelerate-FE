//---------------CORE--------------------//
import React, { useState, Fragment, useEffect } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGreaterThan,
  faLessThan,
  faGreaterThanEqual,
  faLessThanEqual,
  faEquals,
} from "@fortawesome/free-solid-svg-icons";
//---------------MUI--------------------//
import Accordion from "@mui/material/Accordion";
import Avatar from "@mui/material/Avatar";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Zoom from "@mui/material/Zoom";
import { useSelector } from "react-redux";
//---------------MUI ICONS--------------------//
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import WebIcon from "@mui/icons-material/Web";
import CloudIcon from "@mui/icons-material/Cloud";
import RouterIcon from "@mui/icons-material/Router";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import MoreTimeIcon from "@mui/icons-material/MoreTime";
import EditIcon from "@mui/icons-material/Edit";
//---------------EXTERNAL--------------------//
import DeleteAlert from "components/Alerts/Delete";
import {} from "services/controllingGlobal";
// import Edit from "../editScheduleGlobal";
import {
  useEditScheduleGlobalMutation,
  useDeleteScheduleGlobalMutation,
} from "services/controllingGlobal";

export default function ControlledAccordions({
  setRow,
  row,
  setOpenPopup,
  ...props
}) {
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [deleteRule, deleteResult] = useDeleteScheduleGlobalMutation();

  const [editSchedule, editResult] = useEditScheduleGlobalMutation();
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (editResult.isSuccess) {
      showSnackbar("Automation", editResult.data?.message, "success", 1000);
      props.updateSchFn("EDIT", editResult?.data?.payload);
    }
    if (editResult.isError) {
      showSnackbar(
        "Automation",
        editResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [editResult]);

  const handleChange = (panel) => (event, isExpanded) => {
    props.setExpanded(isExpanded ? panel : false);
  };
  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  var iconGenerator = (state) => {
    let val;
    switch (state) {
      case "gt":
        val = faGreaterThan;
        break;
      case "lt":
        val = faLessThan;
        break;
      case "lte":
        val = faLessThanEqual;
        break;
      case "gte":
        val = faGreaterThanEqual;
        break;
      case "eq":
        val = faEquals;
        break;
      default:
        break;
    }
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <FontAwesomeIcon
          icon={val}
          style={{
            color: metaDataValue.branding.secondaryColor,
            width: "10px",
            height: "10px",
          }}
        />
      </div>
    );
  };

  const handleToggleDays = (e) => {
    let name = e.currentTarget.id;
    const currentIndex = selected.indexOf(name);
    const newSelected = [...selected];

    if (currentIndex === -1) {
      newSelected.push(name);
    } else {
      newSelected.splice(currentIndex, 1);
    }
    setSelected(newSelected);
    scheduleForm.setFieldValue("days", newSelected);
  };

  var generateChips = (state, email, number) => {
    let arr = ["alarm"];
    if (email) arr.push("email");
    if (number) arr.push("number");
    let val;
    switch (state) {
      case "CRITICAL":
        val = "#e8413e";
        break;
      case "MAJOR":
        val = "#844204";
        break;
      case "MINOR":
        val = "#fb9107";
        break;
      case "WARNING":
        val = "#288deb";
        break;
      default:
        break;
    }
    return (
      <Fragment>
        {arr.map((elm) => {
          return (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: "white",
                  backgroundColor:
                    elm == "alarm"
                      ? val
                      : metaDataValue.branding.secondaryColor,
                  height: "20px",
                  width: "25px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {elm == "alarm" ? (
                  <NotificationsActiveIcon
                    fontSize="small"
                    style={{
                      color: "white",
                      height: "13px",
                      width: "13px",
                    }}
                  />
                ) : null}
                {elm == "email" ? (
                  <MailOutlineIcon
                    fontSize="small"
                    style={{
                      color: "white",
                      height: "13px",
                      width: "13px",
                    }}
                  />
                ) : null}
                {elm == "number" ? (
                  <PhoneAndroidIcon
                    fontSize="small"
                    style={{
                      color: "white",
                      height: "13px",
                      width: "13px",
                    }}
                  />
                ) : null}
              </div>
            </div>
          );
        })}
      </Fragment>
    );
  };

  function getFriendlyName(name) {
    return props.fields.find((m) => m.name == name).friendlyName;
  }

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursdat",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  function getDateDays(val) {
    if (Number.isInteger(parseInt(val[0]))) {
      return (
        <p style={{ fontSize: "13px" }}>
          <b>{val[0]}</b>
        </p>
      );
    } else
      return (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((elm, i) => (
            <Avatar
              id={elm}
              style={
                val.indexOf(elm) !== -1
                  ? {
                      height: "19px",
                      width: "19px",
                      marginRight: "5px",
                      backgroundColor: metaDataValue.branding.secondaryColor,
                      boxShadow:
                        "rgba(17, 17, 26, 0.05) 0px 1px 0px, rgba(17, 17, 26, 0.1) 0px 0px 8px",
                    }
                  : {
                      backgroundColor: "#eeeeee",
                      height: "19px",
                      width: "19px",
                      marginRight: "5px",
                      boxShadow:
                        "rgba(50, 50, 93, 0.25) 0px 30px 60px -12px inset, rgba(0, 0, 0, 0.3) 0px 18px 36px -18px inset",
                    }
              }
              color="primary"
            >
              <p
                style={{
                  fontSize: "11px",
                  fontWeight: "bold",
                }}
              >
                {days[i][0]}
              </p>
            </Avatar>
          ))}
        </div>
      );
  }

  async function onDelete() {
    let deletedRule = await deleteRule({
      token,
      id: activeId,
    });
    if (deletedRule.error) {
      showSnackbar("Schedule", deletedRule.error?.data?.message, "error", 1000);
    } else {
      showSnackbar("Schedule", deletedRule.data?.message, "success", 1000);
      toggleDelete();
      // props.updateSchFn("DELETE", activeId);
    }
  }

  return (
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
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <span
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            width: "100%",
            paddingRight: "10px",
          }}
        >
          <span
            style={{
              display: "flex",
              gap: "10px",
              width: 320,
            }}
          >
            <MoreTimeIcon
              style={{
                color: "grey",
              }}
            />

            <Typography
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row.name}
            </Typography>

            {/* {row?.pending ? (
              <SyncProblemIcon
                style={{
                  color: "grey",
                }}
              />
            ) : null} */}
          </span>
          <span
            style={{
              display: "flex",
              gap: "10px",
              color: "#cdcdcd",
              fontSize: "16px",
            }}
          >
            {row?.groupName ? <AccountTreeIcon /> : <WebIcon />}
            <p
              style={{
                fontWeight: "600",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {row?.groupName ? row.groupName : "Solution Wide"}
            </p>
          </span>
        </span>
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
                gap: "10px",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "10%",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    color: "#555555",
                    fontSize: "15px",
                  }}
                >
                  <p>
                    <b>Actuator: </b>
                  </p>
                  <p>{row.actuator}</p>
                </span>
                <span
                  style={{
                    color: "#555555",
                    fontSize: "15px",
                  }}
                >
                  <p>
                    <b>Action: </b>
                  </p>
                  <p>{row.commandName}</p>
                </span>
                {/* <span
                  style={{
                    color: "#555555",
                    fontSize: "15px",
                  }}
                >
                  <p>
                    <b>Stored: </b>
                  </p>
                  {row.syncStatus ? (
                    <RouterIcon
                      color="secondary"
                      style={{
                        height: "13px",
                        width: "13px",
                        position: "relative",
                        top: "1px",
                        left: "2px",
                      }}
                    />
                  ) : (
                    <CloudIcon
                      color="secondary"
                      style={{
                        height: "13px",
                        width: "13px",
                        position: "relative",
                        top: "1px",
                        left: "2px",
                      }}
                    />
                  )}
                </span> */}
              </div>
              {props.permission == "ALL" ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "right",
                    alignItems: "center",
                  }}
                >
                  <Tooltip
                    title="Edit"
                    placement="bottom"
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <IconButton
                      color="secondary"
                      onClick={() => {
                        setRow(row);
                        setOpenPopup(true);
                      }}
                      style={{ height: "30px", width: "30px" }}
                    >
                      <EditIcon
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
                      onClick={() => toggleDelete(row.id)}
                      style={{ height: "30px", width: "30px" }}
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
                display: "flex",
                justifyContent: "space-between",
                position: "relative",
                top: "10px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {getDateDays(row.html2)}
              </div>
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
                  <strong>{row.time}</strong>
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
              handleDelete={onDelete}
              handleClose={toggleDelete}
              deleteResult={deleteResult}
            />
          ) : null}
        </div>
      </AccordionDetails>
    </Accordion>
  );
}
