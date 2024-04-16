//---------------CORE--------------------//
import React, { useState, Fragment } from "react";
import { useSnackbar } from "notistack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faGreaterThan,
  faLessThan,
  faGreaterThanEqual,
  faLessThanEqual,
  faEquals,
  faArrowsLeftRightToLine,
  faArrowsLeftRight,
} from "@fortawesome/free-solid-svg-icons";
//---------------MUI--------------------//
import Accordion from "@mui/material/Accordion";
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
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HandymanIcon from "@mui/icons-material/Handyman";
import DeleteIcon from "@mui/icons-material/Delete";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
//---------------EXTERNAL--------------------//
import DeleteAlert from "components/Alerts/Delete";
import { useDeleteRuleGlobalMutation } from "services/rulesGlobal";
import Edit from "components/Asset View/Rule Management/Popup";

export default function ControlledAccordions(props) {
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [deleteRule, deleteResult] = useDeleteRuleGlobalMutation();
  const [isAccordionExpanded, setIsAccordionExpanded] = useState(false);


  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

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
      case "ib":
        val = faArrowsLeftRightToLine;
        break;
      case "nib":
        val = faArrowsLeftRight;
        break;
      default:
        break;
    }
    return (
      <FontAwesomeIcon
        icon={val}
        style={{
          color: metaDataValue.branding.secondaryColor,
          width: "20px",
          height: "20px",
          position: "relative",
          top: "2px",
        }}
      />
    );
  };

  var generateChips = (state, email, number) => {
    let arr = ["alarm"];
    let emails = props.rule.notification.emails;
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
                  <Tooltip
                    title={
                      <span>
                        <p>Email(s) sent to</p>
                        {emails.map((e) => (
                          <p>○ {e}</p>
                        ))}
                      </span>
                    }
                    placement="top"
                    arrow
                  >
                    <MailOutlineIcon
                      fontSize="small"
                      style={{
                        color: "white",
                        height: "13px",
                        width: "13px",
                      }}
                    />
                  </Tooltip>
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
    return props.fields.find((m) => m.name == name)?.friendlyName;
  }

  async function onDelete() {
    let deletedRule = await deleteRule({
      token,
      id: activeId,
    });
    if (deletedRule.error) {
      showSnackbar("Rule", deletedRule.error?.data?.message, "error", 1000);
    } else {
      showSnackbar("Rule", deletedRule.data?.message, "success", 1000);
      toggleDelete();
      props.updateRuleFn("DELETE", activeId);
    }
  }

  return (
    <Accordion
      // expanded={props.expanded === `panel${props.index}`}
      // onChange={handleChange(`panel${props.index}`)}
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
            <HandymanIcon
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
              {props.rule.name}
            </Typography>
          </span>
          <span
            style={{
              display: "flex",
              gap: "10px",
              color: "#cdcdcd",
              fontSize: "16px",
            }}
          >
            {props.rule?.groupName ? <AccountTreeIcon /> : <WebIcon />}
            <p
              style={{
                fontWeight: "600",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {props.rule?.groupName ? props.rule.groupName : "Solution Wide"}
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
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <Tooltip
                title={
                  props.rule.multipleOperations &&
                  props.rule.multipleOperations.length > 1
                    ? props.rule.multipleOperations.map((val) => {
                        return (
                          <p>
                            {getFriendlyName(val.parameter)}
                            {iconGenerator(val.operation)}
                            {val.range && val.range.min && val.range.max
                              ? `${val.range.min} to ${val.range.max}`
                              : val.condition || val.rollingAvg}
                          </p>
                        );
                      })
                    : ""
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {props.rule.multipleOperations &&
                  props.rule.multipleOperations.length > 1 ? (
                    <>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "#555555",
                          cursor: "pointer",
                          fontSize: "15px",
                        }}
                      >
                        <b>
                          {props.rule.multipleOperations.length +
                            " " +
                            props.rule.multipleOperationsOperator +
                            " Conditions - "}
                        </b>
                      </p>
                    </>
                  ) : null}

                  <p
                    style={{
                      fontSize: "12px",
                      color: "#555555",
                      cursor: "pointer",
                      fontSize: "15px",
                    }}
                  >
                    <b>
                      {props?.rule?.multipleOperations[0]?.parameter == "availability" ? "" : getFriendlyName(
                        props?.rule?.multipleOperations[0]?.parameter
                      )}
                    </b>
                  </p>
                  {iconGenerator(props?.rule?.multipleOperations[0]?.operation)}
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#555555",
                      cursor: "pointer",
                      fontSize: "15px",
                    }}
                  >
                    <b>
                      {props?.rule?.multipleOperations[0] &&
                      props.rule.multipleOperations[0].range &&
                      props.rule.multipleOperations[0].range.min !== null &&
                      props.rule.multipleOperations[0].range.min !== "" &&
                      props.rule.multipleOperations[0].range.min !==
                        "undefined" &&
                      props.rule?.multipleOperations[0]?.range.max !==
                        "undefined" &&
                      props.rule.multipleOperations[0].range.max !== "" &&
                      props.rule?.multipleOperations[0]?.range.max !== null
                        ? `${props?.rule?.multipleOperations[0]?.range.min} to ${props?.rule?.multipleOperations[0]?.range.max}`
                        : props?.rule?.multipleOperations[0]?.condition ||
                          props?.rule?.multipleOperations[0]?.rollingAvg}
                    </b>
                  </p>
                  {props?.rule?.multipleOperations &&
                  props?.rule?.multipleOperations.length > 1 ? (
                    <>
                      <p
                        style={{
                          fontSize: "12px",
                          color: "rgb(205, 205, 205)",
                          cursor: "pointer",
                          fontSize: "15px",
                        }}
                      >
                        (and more)
                      </p>
                    </>
                  ) : null}
                </div>
              </Tooltip>
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
                    <Edit
                      fields={props.fields}
                      row={props.rule}
                      id={props.id}
                      updateRuleFn={props.updateRuleFn}
                      group={props.group}
                      permission={props.controls}
                    />
                  </Tooltip>
                  <Tooltip
                    title="Clear"
                    placement="bottom"
                    arrow
                    TransitionComponent={Zoom}
                  >
                    <IconButton
                      color="secondary"
                      onClick={() => toggleDelete(props.rule.id)}
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
                justifyContent: "flex-start",
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
                {generateChips(
                  props.rule.severity,
                  props.rule.notification.emailBool,
                  props.rule.notification.numberBool
                )}
              </div>
            </div>
          </span>

          {activeId ? (
            <DeleteAlert
              deleteModal={deleteModal}
              question="Are you sure you want to delete this rule?"
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
