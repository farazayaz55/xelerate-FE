//---------------CORE--------------------//
import React, { useState, useEffect, Fragment } from "react";
import { useSnackbar } from "notistack";
import hexRgb from "hex-rgb";
import { useHistory } from "react-router-dom";
//---------------MUI--------------------//
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector, useDispatch } from "react-redux";
//---------------MUI ICONS--------------------//
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
//---------------EXTERNAL--------------------//
import Loader from "components/Progress";
import Edit from "components/Asset View/Rule Management/Popup";
import Accordion from "./Accordion";
import noData from "assets/img/no-data.png";
import { useGetRulesGlobalQuery } from "services/rulesGlobal";
import { Grid, Paper } from "@mui/material";
import styled from "@emotion/styled";
import {
  setMapPage,
  setListPage,
  setLiveArr,
  setView,
} from "rtkSlices/AssetViewSlice";
import { resetFilter } from "rtkSlices/filterDevicesSlice";

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

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

  // const [image, setImage] = useState(
  //   `${Keys.baseUrl}/servicecreator/asset/${props.asset.image}`
  // );
  // const [updateAlarm, result] = useUpdateAlarmMutation();
  const rules = useGetRulesGlobalQuery({
    token,
    params: `?serviceId=${props.id}&pageSize=100&currentPage=${page}&withTotalPages=true&groupId=${filtersValue.group.id}`,
  });

  // let time = new Date(props.alarm.time);

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    return () => {
      dispatch(setMapPage(1));
      dispatch(setListPage(1));
      dispatch(resetFilter());
    };
  }, []);

  useEffect(() => {
    if (rules.isSuccess) {
      let tempRules = rules.data.payload?.data
        ? rules.data.payload?.data
        : rules.data.payload;
      setDisableStat(rules.data?.payload?.totalPages);
      setTotalPages(rules.data.payload.totalPages);
      let temp=[];
      let tempObj={};
      if (page == 1){
        tempRules.forEach((elm) => {
          let time = new Date(elm.updatedAt);
          temp.push({
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
            rules: elm.multipleOperations,
            rollingAvg: elm.rollingAvg,
            rollingFlag: elm.rollingFlag,
            range: elm.range,
            type: elm.type,
            assetType: elm.assetType,
            measures: elm.measures,
            repeatNotification: elm.repeatNotification,
            rollingTimeDuration: elm.rollingTimeDuration,
            muteNotification: elm.muteNotification,
            multipleOperations: elm.multipleOperations,
            multipleOperationsOperator: elm.multipleOperationsOperator,
            locationConditions: elm.locationConditions,
            locationsConditionsOperator: elm.locationsConditionsOperator,
            platformDeviceTypeAllowed:
            elm?.platformDeviceTypeAllowed &&
            elm?.platformDeviceTypeAllowed.length
              ? elm?.platformDeviceTypeAllowed
              : null,
          });
        });
      }
      else {

        ruleState.forEach(val => {
          if(!tempObj[val.name])
            tempObj[val.name] = val
        })

        tempRules.forEach((elm) => {
          let time = new Date(elm.updatedAt);
          if(!tempObj[elm.name])
            tempObj[elm.name] = {
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
              rules: elm.multipleOperations,
              rollingAvg: elm.rollingAvg,
              rollingFlag: elm.rollingFlag,
              range: elm.range,
              type: elm.type,
              assetType: elm.assetType,
              measures: elm.measures,
              repeatNotification: elm.repeatNotification,
              rollingTimeDuration: elm.rollingTimeDuration,
              muteNotification: elm.muteNotification,
              multipleOperations: elm.multipleOperations,
              multipleOperationsOperator: elm.multipleOperationsOperator,
              locationConditions: elm.locationConditions,
              locationsConditionsOperator: elm.locationsConditionsOperator,
              platformDeviceTypeAllowed:
              elm?.platformDeviceTypeAllowed &&
              elm?.platformDeviceTypeAllowed.length
                ? elm?.platformDeviceTypeAllowed
                : null,
            }
        })

        for (let key in tempObj) {
          temp.push(tempObj[key])
        }
      }
      setRuleState(temp);
    }
    if (rules.isError) {
      showSnackbar("Rules", rules.error?.data?.message, "error", 1000);
    }
  }, [rules.isFetching]);

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
          rules: elm.multipleOperations,
          relation: elm.multipleOperationsOperator,
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
          locationConditions: elm.locationConditions,
          locationsConditionsOperator: elm.locationsConditionsOperator,
          assetType: elm.assetType,
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
          rules: elm.multipleOperations,
          relation: elm.multipleOperationsOperator,
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
          locationConditions: elm.locationConditions,
          locationsConditionsOperator: elm.locationsConditionsOperator,
          assetType: elm.assetType,
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
    // let sensorId;
    // let alarmID = status ? e.currentTarget.id : e;
    // if (!props.alarm.id) sensorId = "";
    // else sensorId = props.alarm.id;
    // await props.UpdateAlarm(alarmID, status ? status : "CLEARED");
    // if (props.res.updateAlarm.success[0]) {
    //   props.updateAlarm(props.res.updateAlarm.payload[0], props.index);
    //   props.setSnackType("success");
    //   setDelete(false);
    // } else {
    //   props.setSnackType("fail");
    // }
    // props.setSnackText(props.res.updateAlarm.message);
    // props.setSnack(true);
  }

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const handleChange = (panel) => (event, isExpanded) => {
    props.setExpanded(isExpanded ? panel : false);
  };
  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  function handleMore() {
    if (page < totalPages) {
      setPage(page + 1);
      if (page + 1 >= totalPages) {
        setDisable(true);
      }
    }
  }
  
  return (
    <div
      style={{
        width: "100%",
        marginTop:'3rem',
      }}
    >
      {openPopup ? (
        <Edit
          fields={props.fields}
          openPopup={openPopup}
          id={props.id}
          setOpenPopup={setOpenPopup}
          updateRuleFn={updateRuleFn}
          group={filtersValue.group.id}
          permission={props.controls}
          solution = {props.em ? '':'esb'}
        />
      ) : null}
      {props.permission == "ALL" ? (
        <span
          style={{
            position: "absolute",
            top: props.em ? "80px" : "90px",
            right: "60px",
          }}
        >
          <Button
            color="secondary"
            variant="outlined"
            onClick={handlepopupOpen}
            style={{ height: "25px" }}
          >
            Add Rule
          </Button>
        </span>
      ) : null}

      {rules.isFetching ? (
        <div
          style={{
            height: "calc(100vh - 450px)",
            minHeight: "360px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader />
        </div>
      ) : (
        <Fragment>
          {ruleState.length == 0 ? (
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
                  height: "calc(100vh - 14rem)",
                  minHeight: "360px",
                  overflowY: "scroll",
                  marginTop: props.em ? "50px" : "30px"
                }}
              >
                <Grid container spacing={2}>
                  {ruleState.map((elm, i) => (
                    <Grid item md={4} key={i} >
                      <Item style={{padding:'0px'}}>
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
                          disabled={true}
                        />
                      </Item>
                    </Grid>
                  ))}
                </Grid>
                {ruleState.length != 0 && !disabled ? (
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "15px",
                    }}
                  >
                    {rules.isFetching ? (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "50%",
                          height: "46px",
                          width: "46px",
                          backgroundColor:
                            metaDataValue.branding.secondaryColor,
                        }}
                      >
                        <CircularProgress
                          size={20}
                          style={{ color: "white" }}
                        />
                      </div>
                    ) : (
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
                    )}
                  </span>
                ) : null}
              </div>
            </Fragment>
          )}
        </Fragment>
      )}
    </div>
  );
}
