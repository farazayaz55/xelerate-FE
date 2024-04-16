//---------------CORE--------------------//
import React, { useState, useEffect, Fragment } from "react";
import { useSnackbar } from "notistack";
import hexRgb from "hex-rgb";
import { useHistory } from "react-router-dom";
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
import { useSelector, useDispatch } from "react-redux";
import { tooltipClasses } from "@mui/material/Tooltip";
import { styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import WebIcon from "@mui/icons-material/Web";
import AccountTreeIcon from "@mui/icons-material/AccountTree";

//---------------MUI ICONS--------------------//
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HandymanIcon from "@mui/icons-material/Handyman";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
//---------------EXTERNAL--------------------//
import DeleteAlert from "components/Alerts/Delete";
import { useDeleteRuleGlobalMutation } from "services/rulesGlobal";
import Edit from "components/Asset View/Rule Management/Popup";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#f5f5f9",
    color: "rgba(0, 0, 0, 0.87)",
    maxWidth: "100%",
    fontSize: theme.typography.pxToRem(16),
    border: "1px solid #dadde9",
  },
  [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: "rgba(0,0,0,0)",
    color: "#f5f5f9",
  },
}));

export default function ControlledAccordions(props) {
  console.log({ props });
  let token = window.localStorage.getItem("token");
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [deleteRule, deleteResult] = useDeleteRuleGlobalMutation();

  const [isAccordianExpanded, setIsAccordianExpanded] = useState(true);

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
  const makeAccordionExpand = (panel) => {
    props.setExpanded(panel);
  };
  useEffect(() => {
    makeAccordionExpand(`panel${props.index}`);
  }, []);

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

  var generateChips = (state, email, number) => {
    let arr = ["alarm"];
    let emails = props.rule?.notification.emails;
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
    return props.fields.find((m) => m.name == name)
      ? props.fields.find((m) => m.name == name)?.friendlyName
      : "";
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
  const operations = (elm) => {
    if (elm.parameter == "availability") {
      return (
        <p style={{ display: "flex", gap: "10px" }}>
          {iconGenerator("eq")}
          <span>UNAVAILABLE</span>
        </p>
      );
    } else {
      return (
        <p style={{ display: "flex", gap: "10px" }}>
          <b>{getFriendlyName(elm.parameter)}</b>
          {iconGenerator(elm.operation)}
          {elm.operation == "ib" || elm.operation == "nib" ? (
            <b>{`${elm?.range && elm?.range.min ? elm.range.min : ""} to ${
              elm.range.max && elm?.range.max ? elm.range.max : ""
            }`}</b>
          ) : elm.rollingFlag ? (
            <b>{`${elm.rollingAvg} (Avg over ${elm.rollingTimeDuration})`}</b>
          ) : (
            <b>{elm.condition}</b>
          )}
        </p>
      );
    }
  };
  console.log("props in accordian", props);
  return (
    <Accordion
      // expanded={props.expanded === `panel${props.index}`}
      expanded={true}
      // disabled={props.disabled}
      // onChange={() => handleChange(`panel${props.index}`)}
      onChange={() => setIsAccordianExpanded(!isAccordianExpanded)}
      style={{
        backgroundColor: "#f9f9f9",
        border: "1px solid #dedede",
        borderRadius: "5px",
        margin: "0px",
      }}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        style={{ width: "100%" }}
      >
        <div style={{ width: "70%" }}>
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
              {props.rule?.name}
            </Typography>
          </span>
        </div>
        <div style={{ width: "30%" }}>
          <Chip
            icon={props.rule.groupName ? <AccountTreeIcon /> : <WebIcon />}
            label={props.rule.groupName || "Solution Wide"}
          />
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
              <div
                style={{
                  display: "flex",
                  fontSize: "15px",
                  color: "#555555",
                  cursor: "pointer",
                }}
              >
                {props.rule?.multipleOperations?.length > 1 ? (
                  <HtmlTooltip
                    placement="bottom"
                    arrow
                    TransitionComponent={Zoom}
                    title={
                      <Fragment>
                        {props.rule?.multipleOperations.map((elm, i) => {
                          if (elm.parameter == "availability") {
                            return (
                              <p style={{ display: "flex", gap: "10px" }}>
                                {iconGenerator("eq")}
                                <span>UNAVAILABLE</span>
                              </p>
                            );
                          } else {
                            return (
                              <p style={{ display: "flex", gap: "10px" }}>
                                <span>{getFriendlyName(elm.parameter)}</span>
                                {iconGenerator(elm.operation)}
                                {elm.operation == "ib" ||
                                elm.operation == "nib" ? (
                                  <b>{`${
                                    elm?.range && elm?.range.min
                                      ? elm.range.min
                                      : ""
                                  } to ${
                                    elm.range.max && elm?.range.max
                                      ? elm.range.max
                                      : ""
                                  }`}</b>
                                ) : elm.rollingFlag ? (
                                  <b>{`${elm.rollingAvg} (Avg over ${elm.rollingTimeDuration})`}</b>
                                ) : (
                                  <b>{elm.condition}</b>
                                )}
                              </p>
                            );
                          }
                        })}
                      </Fragment>
                    }
                  >
                    <p
                      style={{
                        display: "flex",
                        fontSize: "15px",
                        color: "#555555",
                        cursor: "pointer",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <span>{`${props.rule?.multipleOperations.length} ${props.rule?.multipleOperationsOperator} Conditions`}</span>
                      {" - "}
                      {props.rule?.multipleOperations?.length ? (
                        <span>
                          {operations(props.rule?.multipleOperations[0])}
                        </span>
                      ) : null}
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        {props.rule?.multipleOperations?.length &&
                        props.rule?.multipleOperations[0].parameter ==
                          "availability" ? (
                          <p style={{ display: "flex", gap: "10px" }}>
                            {iconGenerator("eq")}
                            <span>UNAVAILABLE</span>
                          </p>
                        ) : props.rule?.multipleOperations &
                          props.rule?.multipleOperations[0] ? (
                          <p style={{ display: "flex", gap: "10px" }}>
                            <span>
                              {getFriendlyName(
                                props.rule?.multipleOperations[0].parameter
                              )}
                            </span>
                            {iconGenerator(
                              props.rule?.multipleOperations[0].operation
                            )}
                            {props.rule?.multipleOperations[0].operation ==
                              "ib" ||
                            props.rule?.multipleOperations[0].operation ==
                              "nib" ? (
                              <b>{`${
                                props.rule?.multipleOperations[0]?.range &&
                                props.rule?.multipleOperations[0]?.range.min
                                  ? props.rule?.multipleOperations[0].range.min
                                  : ""
                              } to ${
                                props.rule?.multipleOperations[0].range.max &&
                                props.rule?.multipleOperations[0]?.range.max
                                  ? props.rule?.multipleOperations[0].range.max
                                  : ""
                              }`}</b>
                            ) : props.rule?.multipleOperations[0]
                                .rollingFlag ? (
                              <b>{`${props.rule?.multipleOperations[0].rollingAvg} (Avg over ${props.rule?.multipleOperations[0].rollingTimeDuration})`}</b>
                            ) : (
                              <b>
                                {props.rule?.multipleOperations[0].condition}
                              </b>
                            )}
                          </p>
                        ) : null}
                      </p>
                      <span
                        style={{
                          color: "rgba(0,0,0,0.5)",
                          textTransform: "lowercase",
                        }}
                      >
                        (and more)
                      </span>
                    </p>
                  </HtmlTooltip>
                ) : (
                  <p
                    style={{
                      display: "flex",
                      fontSize: "15px",
                      color: "#555555",
                      cursor: "pointer",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {props?.rule?.multipleOperations?.length &&
                    props.rule?.multipleOperations[0]?.parameter ==
                      "availability" ? (
                      <p style={{ display: "flex", gap: "10px" }}>
                        {iconGenerator("eq")}
                        <span>UNAVAILABLE</span>
                      </p>
                    ) : props.rule?.multipleOperations &&
                      props.rule?.multipleOperations[0] ? (
                      <p style={{ display: "flex", gap: "10px" }}>
                        <b>
                          {getFriendlyName(
                            props.rule?.multipleOperations[0].parameter
                          )}
                        </b>
                        {iconGenerator(
                          props.rule?.multipleOperations[0].operation
                        )}
                        {props.rule?.multipleOperations[0].operation == "ib" ||
                        props.rule?.multipleOperations[0].operation == "nib" ? (
                          <b>{`${
                            props.rule?.multipleOperations[0]?.range &&
                            props.rule?.multipleOperations[0]?.range.min !==
                              "undefined" &&
                            props.rule?.multipleOperations[0]?.range.min !==
                              null
                              ? props.rule?.multipleOperations[0].range.min
                              : ""
                          } to ${
                            props.rule?.multipleOperations[0].range &&
                            props.rule?.multipleOperations[0]?.range.max !==
                              "undefined" &&
                            props.rule?.multipleOperations[0]?.range.max !==
                              null
                              ? props.rule?.multipleOperations[0].range.max
                              : ""
                          }`}</b>
                        ) : props.rule?.multipleOperations[0].rollingFlag ? (
                          <b>{`${props.rule?.multipleOperations[0].rollingAvg} (Avg over ${props.rule?.multipleOperations[0].rollingTimeDuration})`}</b>
                        ) : (
                          <b>{props.rule?.multipleOperations[0].condition}</b>
                        )}
                      </p>
                    ) : null}
                  </p>
                )}
                {/* {<p
                  style={{
                    fontSize: "12px",
                    color: "#555555",
                    cursor: "pointer",
                    fontSize: "15px",
                  }}
                >
                  <b>{getFriendlyName(props.rule.parameter)}</b>
                </p>
                {iconGenerator(props.rule.operation)}
                <p
                  style={{
                    fontSize: "12px",
                    color: "#555555",
                    cursor: "pointer",
                    fontSize: "15px",
                  }}
                >
                  <b>{props.rule.condition}</b>
                </p>} */}
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
                    <Edit
                      fields={props.fields}
                      row={props.rule}
                      id={props.id}
                      updateRuleFn={props.updateRuleFn}
                      group={props.group}
                      solution = {'esb'}
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
                      onClick={() => toggleDelete(props.rule?.id)}
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
                  props.rule?.severity,
                  props.rule?.notification.emailBool,
                  props.rule?.notification.numberBool
                )}
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
