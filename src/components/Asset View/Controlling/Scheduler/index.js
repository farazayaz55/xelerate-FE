import React, { Fragment, useEffect, useState } from "react";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import WebIcon from "@mui/icons-material/Web";
import Chip from "@mui/material/Chip";
import { IconButton } from "@mui/material";
import Table from "components/Table/table";
import { useSnackbar } from "notistack";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import Zoom from "@mui/material/Zoom";
import Badge from "@mui/material/Badge";
import CloudIcon from "@mui/icons-material/Cloud";
import RouterIcon from "@mui/icons-material/Router";
import Loader from "components/Progress";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import SyncIcon from "@mui/icons-material/Sync";
import DeleteAlert from "components/Alerts/Delete";
import SyncProblemIcon from "@mui/icons-material/SyncProblem";
import { useSelector } from "react-redux";
import {
  useGetSchedulesQuery,
  useDeleteScheduleMutation,
  useSyncScheduleMutation,
  useGetPendingQuery,
} from "services/controlling";
import Popup from "./Popup";

export default function DM(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  const service = metaDataValue.services.find((s) => s.id == props.service);
  let token = window.localStorage.getItem("token");
  const schedules = useGetSchedulesQuery({ token, id: props.id });
  const [syncSchedules, syncResult] = useSyncScheduleMutation();
  const [deleteSchedule, deleteResult] = useDeleteScheduleMutation();
  const { enqueueSnackbar } = useSnackbar();
  const [rows, setRowState] = useState([]);
  const [row, setRow] = useState(null);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [loader, setLoader] = React.useState(true);
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const device = useSelector((state) => state.asset.device);
  const asset = device.platformDeviceType && service.assetMapping.length ? service.assetMapping.find(a=>a.assetType._id == device.platformDeviceType) : null;
  const actuators = device.esbMetaData && device.esbMetaData.actuators && device.esbMetaData.actuators.length ? props.actuators.filter(s=>device.esbMetaData.actuators.includes(s.name)) : asset && asset.actuators ? asset.actuators : props.actuators;

  const pendingCount = useGetPendingQuery({
    token,
    id: props.id,
  });

  function ifLoaded(state, component) {
    if (state) return <Loader top="calc(50vh - 100px)" />;
    else return component();
  }

  const handlepopupClose = () => {
    setOpenPopup(false);
  };

  async function fetchSchedules() {
    var temp = [];
    if (schedules.isSuccess) {
      schedules.data.payload.forEach((elm) => {
        let time = new Date(elm.time);
        time = time.toLocaleTimeString();
        let dateDays = [];
        if (elm?.days && elm.days.length > 0) {
          elm.days.forEach((days) => {
            dateDays.push(days);
          });
        } else {
          dateDays.push(new Date(elm.time).toLocaleDateString());
        }
        temp.push(
          createData(
            elm.name,
            time,
            dateDays,
            elm.actuatorName,
            elm.command,
            {
              id: elm._id,
              global: elm.global,
              syncStatus: elm.syncStatus,
              groupName: elm?.groupName,
            },
            elm.commandKey,
            elm?.pending ? elm?.pending : false,
            elm._id,
            elm.syncStatus
          )
        );
      });
      setRowState(temp);
      setLoader(false);
    } else if (
      !schedules.isLoading &&
      schedules.isError &&
      schedules.data?.message != ""
    ) {
      showSnackbar("Automation", schedules?.data?.message, "error");
    }
  }

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  useEffect(() => {
    if (syncResult.isSuccess) {
      showSnackbar("Automation", syncResult.data?.message, "success", 1000);
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

  useEffect(() => {
    fetchSchedules();
  }, [schedules.isFetching]);

  async function onDelete(e) {
    let deletedSchedule = await deleteSchedule({
      token,
      name: activeId,
    });
    if (deletedSchedule.error) {
      showSnackbar(
        "Schedule",
        deletedSchedule.error?.data?.message,
        "error",
        1000
      );
    } else {
      showSnackbar("Schedule", deletedSchedule.data?.message, "success", 1000);
      setDelete(false);
    }
    handlepopupClose();
  }

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  function columns() {
    let temp = [
      {
        id: "name",
        label: "Name",
        align: "center",
      },
      {
        id: "time",
        label: "Scheduled Time",
        align: "center",
      },
      {
        id: "html2",
        label: "Date/Days",
        align: "center",
      },
      { id: "actuator", label: "Actuator", align: "center" },
      { id: "commandName", label: "Action", align: "center" },
      // { id: "html3", label: "Stored On", align: "center" },
    ];
    // if (props.permission == "ALL")
    temp.push({
      id: "html",
      label: "",
      align: "center",
      disableSorting: true,
    });
    return temp;
  }

  function createData(
    name,
    time,
    html2,
    actuator,
    command,
    html,
    commandName,
    pending,
    id,
    syncStatus
  ) {
    return {
      name,
      time,
      html2,
      actuator,
      command,
      html,
      commandName,
      pending,
      id,
      syncStatus,
    };
  }

  var html = (row) => {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {row.html.global ? (
          <Chip
            icon={row.html?.groupName ? <AccountTreeIcon /> : <WebIcon />}
            label={row.html?.groupName ? row.html.groupName : "Solution Wide"}
            variant="outlined"
            size="small"
            color="secondary"
          />
        ) : props.permission == "ALL" ? (
          <Fragment>
            <IconButton
              onClick={() => {
                setRow(row);
                setOpenPopup(true);
              }}
              id="Edit-Schedule"
            >
              <EditIcon color="secondary" />
            </IconButton>
            <IconButton
              onClick={() => toggleDelete(row.html.id)}
              id="Delete-Schedule"
            >
              <DeleteIcon color="secondary" />
            </IconButton>
          </Fragment>
        ) : null}
      </div>
    );
  };

  var html2 = (row) => {
    if (Number.isInteger(parseInt(row.html2[0]))) {
      return row.html2[0];
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
                row.html2.indexOf(elm) !== -1
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
                      cursor: "pointer",
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
  };

  var html3 = (row) => (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        color: "grey",
      }}
    >
      {row.syncStatus ? (
        <RouterIcon
          style={{
            position: "relative",
            right: row.pending ? "" : "5px",
          }}
        />
      ) : (
        <CloudIcon
          style={{
            position: "relative",
            right: row.pending ? "" : "5px",
          }}
        />
      )}
      {row.pending ? (
        <SyncProblemIcon
          style={{
            position: "relative",
            bottom: "10px",
            height: "15px",
            width: "15px",
          }}
        />
      ) : null}
    </div>
  );

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursdat",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  function compFunc() {
    return (
      <Fragment>
        {props.permission == "ALL" ? (
          <span
            style={{
              position: "absolute",
              top: "-70px",
              right: "10px",
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
                      deviceId: props.id,
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
              <IconButton
                color="secondary"
                onClick={() => {
                  setRow(row);
                  setOpenPopup(true);
                }}
                id="Add-Schedule"
              >
                <AddCircleIcon />
              </IconButton>
            </Tooltip>
          </span>
        ) : null}
        <Table
          columns={columns()}
          rows={rows}
          html={html}
          html2={html2}
          html3={html3}
          filter={["name", "time"]}
        />
      </Fragment>
    );
  }

  return (
    <div>
      {openPopup ? (
        <Popup
          actuators={actuators}
          setOpenPopup={setOpenPopup}
          row={row}
          setRow={setRow}
          id={props.id}
          serviceId={props.service}
        />
      ) : null}
      <div style={{ minWidth: "500px", position: "relative" }}>
        {ifLoaded(loader, compFunc)}
      </div>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this scehdule?"
          platformCheck={false}
          id={activeId}
          handleDelete={onDelete}
          handleClose={toggleDelete}
          deleteResult={deleteResult}
        />
      ) : null}
    </div>
  );
}
