//---------------CORE--------------------//
import React, { useState, useEffect, Fragment } from "react";
import { useSnackbar } from "notistack";
import hexRgb from "hex-rgb";
import { useHistory } from "react-router-dom";
//---------------MUI--------------------//
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector, useDispatch } from "react-redux";
//---------------MUI ICONS--------------------//
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddCircleIcon from "@mui/icons-material/AddCircle";
//---------------EXTERNAL--------------------//
import Loader from "components/Progress";
import Edit from "components/Asset View/Rule Management/Popup";
import Accordion from "./Accordion";
import noData from "assets/img/no-data.png";
import { useGetRulesGlobalQuery } from "services/rulesGlobal";

export default function ControlledAccordions(props) {
  let token = window.localStorage.getItem("token");
  const dispatch = useDispatch();
  const history = useHistory();
  const [expanded, setExpanded] = React.useState(false);
  const [openPopup, setOpenPopup] = useState(false);
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [rgb, setRgb] = React.useState(
    hexRgb(metaDataValue.branding.secondaryColor)
  );
  const [ruleState, setRuleState] = useState([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(null);
  const [disabled, setDisable] = useState(false);
  const filtersValue = useSelector((state) => state.filterDevice);

  function setDisableStat(totalPages) {
    if (!totalPages || page >= totalPages) {
      setDisable(true);
    } else setDisable(false);
  }

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };
  // const [image, setImage] = useState(
  //   `${Keys.baseUrl}/servicecreator/asset/${props.asset.image}`
  // );
  // const [updateAlarm, result] = useUpdateAlarmMutation();
  const rules = props?.rulesData;

  console.log({rules})
  
  // let time = new Date(props.alarm.time);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  // useEffect(() => {
  //   if (result.isSuccess) {
  //     props.updateAlarm(result.data.payload, props.index);
  //     setDelete(false);
  //     enqueueSnackbar(
  //       {
  //         title: "Alarm",
  //         message: result.data.message,
  //         variant: "success",
  //       },
  //       {
  //         timeOut: 1000,
  //       }
  //     );
  //   }
  //   if (result.isError) {
  //     enqueueSnackbar(
  //       {
  //         title: "Alarm",
  //         message: result.data.message,
  //         variant: "error",
  //       },
  //       {
  //         timeOut: 1000,
  //       }
  //     );
  //   }
  // }, [result.isSuccess]);

  async function updateRuleFn(state, payload) {
    let temp = [...ruleState];
    let elm = payload;
    let time;
    switch (state) {
      case "ADD":
        time = new Date(elm.updatedAt);
        temp.unshift({
          name: elm.name,
          parameter: elm.parameter,
          operation: elm.operation,
          condition: elm.condition,
          groupName: elm?.groupName,
          time: `${time.toLocaleDateString(
            "en-GB"
          )}-${time.toLocaleTimeString()}`,
          severity: elm.severity,
          id: elm.globalId,
          notification: {
            emailBool: elm.sendEmail,
            numberBool: elm.sendMessage,
            emails: elm.email,
            numbers: elm.phoneNumber,
            id: elm.globalId,
          },
          actions: elm.actions,
          rollingAvg: elm.rollingAvg,
          rollingFlag: elm.rollingFlag,
          range: elm.range,
          type: elm.type,
          measures: elm.measures,
          repeatNotification: elm.repeatNotification,
          rollingTimeDuration: elm.rollingTimeDuration,
          muteNotification: elm.muteNotification,
          multipleOperations: elm.multipleOperations,
          multipleOperationsOperator: elm.multipleOperationsOperator,
          platformDeviceTypeAllowed:
          elm?.platformDeviceTypeAllowed &&
          elm?.platformDeviceTypeAllowed.length
            ? elm?.platformDeviceTypeAllowed
            : null,
        });
        setRuleState(temp);
        break;

      case "DELETE":
        temp.splice(
          temp.findIndex((m) => m.id == elm),
          1
        );
        setRuleState(temp);
        break;

      case "EDIT":
        time = new Date(elm.updatedAt);
        temp.splice(
          temp.findIndex((m) => m.id == elm.globalId),
          1,
          {
            name: elm.name,
            parameter: elm.parameter,
            operation: elm.operation,
            condition: elm.condition,
            groupName: elm?.groupName,
            time: `${time.toLocaleDateString(
              "en-GB"
            )}-${time.toLocaleTimeString()}`,
            severity: elm.severity,
            id: elm.globalId,
            notification: {
              emailBool: elm.sendEmail,
              numberBool: elm.sendMessage,
              emails: elm.email,
              numbers: elm.phoneNumber,
              id: elm.globalId,
            },
            actions: elm.actions,
            rollingAvg: elm.rollingAvg,
            rollingFlag: elm.rollingFlag,
            range: elm.range,
            type: elm.type,
            measures: elm.measures,
            repeatNotification: elm.repeatNotification,
            rollingTimeDuration: elm.rollingTimeDuration,
            muteNotification: elm.muteNotification,
            multipleOperations: elm.multipleOperations,
            multipleOperationsOperator: elm.multipleOperationsOperator,
            platformDeviceTypeAllowed:
            elm?.platformDeviceTypeAllowed &&
            elm?.platformDeviceTypeAllowed.length
              ? elm?.platformDeviceTypeAllowed
              : null,
          }
        );
        setRuleState(temp);
        break;

      default:
        break;
    }
  }

  const handleChange = (panel) => (event, isExpanded) => {
    props.setExpanded(isExpanded ? panel : false);
  };
  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  function handleMore() {
    // if (page < totalPages) {
    //   setPage(page + 1);
    //   if (page + 1 >= totalPages) {
    //     setDisable(true);
    //   }
    // }
    setDisable(true)
  }

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {/* {openPopup ? (
        <Edit
          fields={props.fields}
          openPopup={openPopup}
          id={props.id}
          setOpenPopup={setOpenPopup}
          // updateRuleFn={updateRuleFn}
          group={filtersValue.group.id}
          permission={props.controls}
        />
      ) : null}
      {props.permission == "ALL" ? (
        <span
          style={{
            position: "absolute",
            top: "5px",
            right: "15px",
          }}
        >
          <Tooltip
            title="Add Rule"
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <IconButton color="secondary" onClick={handlepopupOpen}>
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
        </span>
      ) : null} */}

      {rules && (
        <Fragment>
          {rules.length == 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                paddingBottom: "40px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "200px",
                  width: "200px",
                }}
              >
                <img
                  style={{ maxWidth: "70%", maxHeight: "70%" }}
                  src={noData}
                />
              </div>
              <p style={{ color: "#c8c8c8" }}>No rules found</p>
            </div>
          ) : (
            <Fragment>
              <div
                style={{
                  height: "45vh",
                  minHeight: "250px",
                  overflowY: "scroll",
                }}
              >
                {rules.map((elm, i) => (
                  <Accordion
                    rule={elm}
                    updateRuleFn={updateRuleFn}
                    expanded={expanded}
                    setExpanded={setExpanded}
                    index={i}
                    id={props.id}
                    history={props.history}
                    fields={props.fields}
                    group={filtersValue.group.id}
                    permission={props.permission}
                    controls={props.controls}
                    handleUpdate={props.handleUpdate}
                    handleDelete={props.handleDelete}
                  />
                ))}
                {/* {rules.length != 0 && !disabled ? (
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "15px",
                    }}
                  >
                    {/* {rules && (
                      <IconButton
                        color="secondary"
                        onClick={handleMore}
                        style={{
                          backgroundColor:
                            metaDataValue.branding.secondaryColor,
                        }}
                      >
                        <KeyboardArrowDownIcon
                          style={{
                            cursor: "pointer",
                            height: "30px",
                            width: "30px",
                            color: "white",
                          }}
                        />
                      </IconButton>
                    )} */}
                  {/* </span>
                ) : null} */}
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
    </div>
  );
}
