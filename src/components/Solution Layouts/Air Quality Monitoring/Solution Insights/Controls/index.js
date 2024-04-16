//---------------CORE--------------------//
import React, { useState, useEffect, Fragment } from "react";
import { useSnackbar } from "notistack";
//---------------MUI--------------------//
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import { useSelector } from "react-redux";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import Badge from "@mui/material/Badge";
//---------------MUI ICONS--------------------//
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import SyncIcon from "@mui/icons-material/Sync";
import AddCircleIcon from "@mui/icons-material/AddCircle";
//---------------EXTERNAL--------------------//
import Loader from "components/Progress";
import Popup from "components/Asset View/Controlling/Scheduler/Popup";
import Accordion from "./Accordion";
import noData from "assets/img/no-data.png";
import {
  useGetSchedulesGlobalQuery,
  useGetPendingGlobalQuery,
  useSyncScheduleGlobalMutation,
} from "services/controllingGlobal";
import { Grid, Paper } from "@mui/material";
import styled from "@emotion/styled";
const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function ControlledAccordions(props) {
  let token = window.localStorage.getItem("token");
  const [expanded, setExpanded] = React.useState(false);
  const metaDataValue = useSelector((state) => state.metaData);
  const { enqueueSnackbar } = useSnackbar();
  const [scheduleState, setScheduleState] = useState([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(null);
  const [disabled, setDisable] = useState(false);
  const filtersValue = useSelector((state) => state.filterDevice);
  const [syncSchedules, syncResult] = useSyncScheduleGlobalMutation();
  const [row, setRow] = useState(null);
  const [openPopup, setOpenPopup] = React.useState(false);

  useEffect(() => {
    if (syncResult.isSuccess) {
      showSnackbar("Automation", syncResult.data?.message, "success", 1000);
      updateSchFn("SYNC");
    }
    if (syncResult.isError) {
      showSnackbar(
        "Automation",
        syncResult.error?.data?.message,
        "error",
        1000
      );
    }
  }, [syncResult]);

  function setDisableStat(totalPages) {
    if (!totalPages || page >= totalPages) {
      setDisable(true);
    } else setDisable(false);
  }

  function handleMore() {
    if (page < totalPages) {
      setPage(page + 1);
      if (page + 1 >= totalPages) {
        setDisable(true);
      }
    }
  }

  function chkGroup() {
    let permission = metaDataValue.services
      .find((s) => s.id == props.id)
      .tabs.find((tab) => tab.name == "Controlling")?.permission;
    return permission || "DISABLE";
  }

  const handlepopupOpen = () => {
    setOpenPopup(true);
  };

  const schedules = useGetSchedulesGlobalQuery({
    token,
    params: `?serviceId=${props.id}&pageSize=10&currentPage=${page}&withTotalPages=true&groupId=${filtersValue.group.id}&addGroupNames=true&assetTypes=${filtersValue.assetTypes}`,
  });

  const pendingCount = useGetPendingGlobalQuery({
    token,
    params: `?serviceId=${props.id}&groupId=${filtersValue.group.id}`,
  });

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (schedules.isSuccess) {
      setDisableStat(schedules.data?.payload?.totalPages);
      setTotalPages(schedules.data.payload.totalPages);
      let temp;
      if (page == 1) temp = [];
      else temp = [...scheduleState];
      schedules.data.payload &&
        schedules.data.payload.data?.forEach((elm) => {
          let time = new Date(elm.time);
          let dateDays = [];
          if (elm.days.length > 0) {
            elm.days.forEach((days) => {
              dateDays.push(days);
            });
          } else {
            dateDays.push(new Date(elm.time).toLocaleDateString());
          }
          time = time.toLocaleTimeString();
          temp.push({
            groupName: elm?.groupName,
            name: elm.name,
            time: time,
            html2: dateDays,
            actuator: elm.actuatorName,
            command: elm.command,
            commandName: elm.commandKey,
            id: elm.globalId,
            syncStatus: elm?.syncStatus ? elm?.syncStatus : false,
            pending: elm?.pending ? elm?.pending : false,
            synced: elm?.synced ? elm?.synced : false,
            notifyExecutionStatus: elm?.notifyExecutionStatus,
            notifyExecutionStatusEmail: elm?.notifyExecutionStatusEmail,
            notifyExecutionStatusReportAfter: elm?.notifyExecutionStatusReportAfter,
          });
        });
      setScheduleState(temp);
    }
    if (schedules.isError) {
      showSnackbar("Schedules", schedules.error?.data?.message, "error");
    }
  }, [schedules.isFetching]);

  async function updateSchFn(state, payload) {
    let temp = [...scheduleState];
    let elm = payload;
    let time;
    let dateDays = [];
    switch (state) {
      case "SYNC":
        temp.forEach((e) => {
          e.pending = false;
          e.synced = e.syncStatus;
        });
        setScheduleState(temp);
        break;

      case "ADD":
        time = new Date(elm.time);
        if (elm.days.length > 0) {
          elm.days.forEach((days) => {
            dateDays.push(days);
          });
        } else {
          dateDays.push(new Date(elm.time).toLocaleDateString("en-GB"));
        }
        time = time.toLocaleTimeString();
        temp.unshift({
          name: elm.name,
          groupName: elm?.groupName,
          time: time,
          html2: dateDays,
          actuator: elm.actuatorName,
          command: elm.command,
          html: elm._id,
          commandName: elm.commandKey,
          id: elm.globalId,
          synced: elm.synced,
          syncStatus: elm.syncStatus,
          pending: elm.pending,
          notifyExecutionStatus: elm?.notifyExecutionStatus,
          notifyExecutionStatusEmail: elm?.notifyExecutionStatusEmail,
          notifyExecutionStatusReportAfter: elm?.notifyExecutionStatusReportAfter,
        });
        setScheduleState(temp);
        pendingCount.refetch();
        break;

      case "DELETE":
        temp.splice(
          temp.findIndex((m) => m.id == elm),
          1
        );
        setScheduleState(temp);
        pendingCount.refetch();
        break;

      case "EDIT":
        time = new Date(elm.time);
        if (elm.days.length > 0) {
          elm.days.forEach((days) => {
            dateDays.push(days);
          });
        } else {
          dateDays.push(new Date(elm.time).toLocaleDateString("en-GB"));
        }
        time = time.toLocaleTimeString();
        temp.splice(
          temp.findIndex((m) => m.id == elm.globalId),
          1,
          {
            name: elm.name,
            groupName: elm?.groupName,
            time: time,
            html2: dateDays,
            actuator: elm.actuatorName,
            command: elm.command,
            html: elm._id,
            commandName: elm.commandKey,
            id: elm.globalId,
            synced: elm.synced,
            syncStatus: elm.syncStatus,
            pending: elm.pending,
            notifyExecutionStatus: elm?.notifyExecutionStatus,
            notifyExecutionStatusEmail: elm?.notifyExecutionStatusEmail,
            notifyExecutionStatusReportAfter: elm?.notifyExecutionStatusReportAfter,
          }
        );
        setScheduleState(temp);
        break;

      default:
        break;
    }
  }

  return (
    <div
      style={{
        width: "100%",
      }}
    >
      {openPopup ? (
        <Popup
          actuators={props.actuators}
          setOpenPopup={setOpenPopup}
          row={row}
          setRow={setRow}
          id={props.id}
          group={filtersValue.group.id}
          global
          updateSchFn={updateSchFn}
        />
      ) : null}
      {chkGroup() == "ALL" ? (
        <span
          style={{
            position: "absolute",
            top: "5px",
            right: "40px",
          }}
        >
          {/* <Tooltip
            title="Sync Automations"
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <IconButton
              color="secondary"
              disabled={
                pendingCount.data?.payload?.pendingCount
                  ? pendingCount.data?.payload?.pendingCount.length < 1
                  : true
              }
              onClick={() =>
                syncSchedules({
                  token,
                  body: {
                    serviceId: props.id,
                    groupId: filtersValue.group.id,
                  },
                })
              }
            >
              <Badge
                badgeContent={pendingCount.data?.payload?.pendingCount}
                color="warning"
              >
                <SyncIcon />
              </Badge>
            </IconButton>
          </Tooltip> */}

          <Tooltip
            title="Add Automation"
            placement="bottom"
            arrow
            TransitionComponent={Zoom}
          >
            <IconButton color="secondary" onClick={handlepopupOpen}>
              <AddCircleIcon />
            </IconButton>
          </Tooltip>
        </span>
      ) : null}

      {schedules.isFetching ? (
        <div
          style={{
            height: "calc(100vh - 700px)",
            minHeight: "100px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Loader />
        </div>
      ) : (
        <Fragment>
          {scheduleState.length == 0 ? (
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
              <p style={{ color: "#c8c8c8" }}>No schedules found</p>
            </div>
          ) : (
            <Fragment>
              <div
                style={{
                  height: !props.fullScreenModeOpen ? "calc(100vh - 700px)" : '72vh',
                  minHeight: !props.fullScreenModeOpen ? "100px" : '100%',
                  overflowY: "scroll",
                }}
              >
                {props.fullScreenModeOpen ? (
                <Grid container spacing={2}>
                {scheduleState.map((elm, i) => (
                    <Grid item xs={12} sm={6} md={4} key={i} >
                      <Item style={{padding:'0px'}}>
                        <Accordion
                          expanded={expanded}
                          setExpanded={setExpanded}
                          index={i}
                          id={props.id}
                          history={props.history}
                          actuators={props.actuators}
                          group={filtersValue.group.id}
                          permission={chkGroup()}
                          row={elm}
                          setRow={setRow}
                          setOpenPopup={setOpenPopup}
                          fullScreenModeOpen={props.fullScreenModeOpen}
                        />
                      </Item>
                    </Grid>
                ))}
                </Grid>
                ) : (
                  scheduleState.map((elm, i) => (
                        <Accordion
                          expanded={expanded}
                          setExpanded={setExpanded}
                          index={i}
                          id={props.id}
                          history={props.history}
                          actuators={props.actuators}
                          group={filtersValue.group.id}
                          permission={chkGroup()}
                          row={elm}
                          setRow={setRow}
                          setOpenPopup={setOpenPopup}
                          fullScreenModeOpen={props.fullScreenModeOpen}
                        />
                  ))
                )}
                {scheduleState.length != 0 && !disabled ? (
                  <span
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      marginTop: "15px",
                    }}
                  >
                    {schedules.isFetching ? (
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