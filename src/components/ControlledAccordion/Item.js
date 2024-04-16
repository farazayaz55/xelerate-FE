import React, { useEffect, useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Tooltip,
  Chip
} from "@mui/material";
import { tooltipClasses} from "@mui/material/Tooltip";
import {styled} from "@mui/material/styles";
import {
  faGreaterThan,
  faLessThan,
  faGreaterThanEqual,
  faLessThanEqual,
  faEquals,
  faArrowsLeftRightToLine,
  faArrowsLeftRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import HandymanIcon from "@mui/icons-material/Handyman";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import { Fragment } from "react";
import Zoom from "@mui/material/Zoom";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import WebIcon from "@mui/icons-material/Web";
import Edit from "components/Asset View/Rule Management/Popup"
import { useSelector } from "react-redux";
import RouterIcon from "@mui/icons-material/Router";

const HtmlTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: '#f5f5f9',
    color: 'rgba(0, 0, 0, 0.87)',
    maxWidth: "100%",
    fontSize: theme.typography.pxToRem(16),
    border: '1px solid #dadde9',
  },
  [`& .${tooltipClasses.arrow}`]: {
    backgroundColor: 'rgba(0,0,0,0)',
    color: "#f5f5f9"
  }
}));

const Item = ({row, operations, toggleDelete, fields, serviceId, id, permission, rules}) => {
  const metaDataValue = useSelector((state) => state.metaData);
  const [expanded, setExpanded] = useState(true);
  
      function getFriendlyName(name) {
      return fields.find((m) => m.name == name)
        ? fields.find((m) => m.name == name)?.friendlyName
        : "";
  }

  const generateChips = () => {
    let arr = ["alarm"];
    let emails = row.email;
    let phoneNumbers = row.phoneNumber;
    row?.sendEmail && arr.push("email");
    row?.sendMessage && arr.push("number");
    let val;
    switch (row.severity) {
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
        {arr.map((elm, i) => {
          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: "white",
                  backgroundColor: val,
                  height: "20px",
                  width: "25px",
                  borderRadius: "20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginRight: "5px",
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
                       {emails.map((e, i) => (
                         <p key={i}>○ {e}</p>
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
                  <Tooltip
                   title={
                     <span>
                       <p>Message(s) sent to</p>
                       {phoneNumbers.map((e, i) => (
                         <p key={i}>○ {e}</p>
                       ))}
                     </span>
                   }
                   placement="top"
                   arrow
                 >
                    <PhoneAndroidIcon
                      fontSize="small"
                      style={{
                        color: "white",
                        height: "13px",
                        width: "13px",
                      }}
                    />
                  </Tooltip>
                ) : null}
              </div>
            </div>
          );
        })}
      </Fragment>
    );
  };

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

  return (
   <Accordion
      expanded={expanded}
      style={{
        backgroundColor: "#f9f9f9",
        border: "1px solid #dedede",
        borderRadius: "10px",
        minHeight: "100%",
        padding: "5px",
        margin: "0px",
      }}
      disableGutters
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
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
              {row.name}
            </Typography>
          </span>
        </div>
        {row?.global ? (
          <Chip
            icon={<WebIcon />}
            label={"Solution Wide"}
            variant="outlined"
            size="small"
            color="secondary"
          />
        ) : (
          <Chip
            icon={<RouterIcon />}
            label={"Asset Self Only"}
            variant="outlined"
            size="small"
            color="secondary"
          />
        )}
      </AccordionSummary>
      <AccordionDetails style={{height: "100%"}}>
        <div style={{width: "100%", display: "flex", marginBottom: "10px", justifyContent: "space-between", alignItems: "center"}}>
          <div
            style={{
              display: "flex",
              fontSize: "15px",
              color: "#555555",
              cursor: "pointer",
            }}
          >
            {operations.length > 1 ? (
              <HtmlTooltip
                placement="bottom"
                arrow
                TransitionComponent={Zoom}
                title={
                  <Fragment>
                    {operations.map((elm, i) => {
                      if(i==0) return null;
                      else{
                        if(elm.parameter == "availability"){
                          return (
                          <p style={{display: "flex", gap: "10px"}}>
                            {iconGenerator("eq")}
                            <span>UNAVAILABLE</span>
                          </p>
                          )
                        } else {
                          return (
                            <p style={{display: "flex", gap: "10px"}}>
                              <span>{getFriendlyName(elm.parameter)}</span>
                              {iconGenerator(elm.operation)}
                              {elm.operation == "ib" || elm.operation == "nib" ? (
                              <b>{`${elm?.range && elm?.range?.min ? elm.range?.min : ""} to ${elm.range?.max && elm?.range?.max ? elm.range?.max : ""}`}</b>
                              ) : elm.rollingFlag ? (
                              <b>{`${elm.rollingAvg} (Avg over ${elm.rollingTimeDuration})`}</b>
                              ) : (
                              <b>{elm.condition}</b>
                              )}
                            </p>
                          )
                        }
                      }
                    })}
                  </Fragment>
                }
              >
                <p style={{
                  display: "flex",
                  fontSize: "15px",
                  color: "#555555",
                  cursor: "pointer",
                  gap: "10px",
                  alignItems: "center"
                }}>
                  <span>{`${operations.length} ${row.multipleOperationsOperator} Conditions`}</span>
                  {" - "}
                  <p
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span>{getFriendlyName(operations[0].parameter)}</span>
                    {iconGenerator(operations[0].operation)}
                    <b>{operations[0].condition}</b>
                  </p>
                  <span style={{color: "rgba(0,0,0,0.5)", textTransform: "lowercase"}}>{`(${row.multipleOperationsOperator} more)`}</span>
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
                {operations[0].parameter == "availability" ?
                  (
                    <p style={{display: "flex", gap: "10px"}}>
                      {iconGenerator("eq")}
                      <span>UNAVAILABLE</span>
                    </p>
                  )
                  : 
                  (
                    <p style={{display: "flex", gap: "10px"}}>
                      <span>{getFriendlyName(operations[0].parameter)}</span>
                      {iconGenerator(operations[0].operation)}
                      {operations[0].operation == "ib" || operations[0].operation == "nib" ? (
                      <b>{`${operations[0]?.range && operations[0]?.range?.min ? operations[0].range?.min : ""} to ${operations[0].range?.max && operations[0]?.range?.max ? operations[0].range?.max : ""}`}</b>
                      ) : operations[0].rollingFlag ? (
                      <b>{`${operations[0].rollingAvg} (Avg over ${operations[0].rollingTimeDuration})`}</b>
                      ) : (
                      <b>{operations[0].condition}</b>
                      )}
                    </p>
                  )
                }
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
              <b>{getFriendlyName(operations.parameter)}</b>
            </p>
            {iconGenerator(operations.operation)}
            <p
              style={{
                fontSize: "12px",
                color: "#555555",
                cursor: "pointer",
                fontSize: "15px",
              }}
            >
              <b>{operations.condition}</b>
            </p>} */}
          </div>
          {row?.global ? (
            null) : <div>
            <Tooltip
              title="Edit"
              placement="bottom"
              arrow
              TransitionComponent={Zoom}
            >
              <Edit
                fields={fields}
                row={{
                ...row,
                actions: rules.data?.payload?.find((p) => p._id == row.id)
                  ?.actions,
                muteNotification: rules.data?.payload?.find(
                  (p) => p._id == row.id
                )?.muteNotification,
                repeatNotification: row.repeatNotification,
              }}
                serviceId={serviceId}
                id={id}
                main
                permission={permission}
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
                onClick={() => {toggleDelete(row._id)}}
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
          </div>}
        </div>
        <div style={{display: "flex", alignItems: "flex-end"}}>
          {generateChips(row)}
        </div>
      </AccordionDetails>
    </Accordion>
  )
}

export default Item;