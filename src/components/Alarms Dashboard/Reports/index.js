import React, { useEffect, useState } from "react";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useSnackbar } from "notistack";
import IconButton from "@mui/material/IconButton";
import CircularProgress from "@mui/material/CircularProgress";
import Loader from "components/Progress";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteAlert from "components/Alerts/Delete";
import { useSelector } from "react-redux";
import { useDeleteScheduleMutation } from "services/controlling";
import Accordion from "./Accordion";
import { useGetReportQuery } from "services/alarms";
import Popup from "./Popup";
import noData from "assets/img/no-data.png";

export default function DM(props) {
  const metaDataValue = useSelector((state) => state.metaData);
  let token = window.localStorage.getItem("token");
  const [deleteSchedule, deleteResult] = useDeleteScheduleMutation();
  const { enqueueSnackbar } = useSnackbar();
  const [reports, setReports] = useState([]);
  const [row, setRow] = useState(null);
  const [openPopup, setOpenPopup] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);
  const [disabled, setDisable] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [totalPages, setTotalPages] = React.useState(null);
  const [page, setPage] = useState(1);

  const schedules = useGetReportQuery({
    token,
    params: `?pageSize=25&currentPage=${page}&withTotalPages=true`,
  });

  const handlepopupClose = () => {
    setOpenPopup(false);
  };

  function showSnackbar(title, message, variant, timeOut) {
    return enqueueSnackbar({ title, message, variant }, { timeOut });
  }

  function handleMore() {
    if (page < totalPages) {
      setPage(page + 1);
      if (page + 1 >= totalPages) {
        setDisable(true);
      }
    }
  }

  useEffect(() => {
    if (schedules.isSuccess) {
      setTotalPages(schedules.data?.payload?.totalPages);
      if (page == 1) setReports(schedules.data?.payload?.data);
      else
        setReports((old) => {
          return [...old, ...schedules.data.payload?.data];
        });
      if (page >= schedules.data?.payload?.totalPages) {
        setDisable(true);
      }
    } else if (
      !schedules.isLoading &&
      schedules.isError &&
      schedules.data?.message != ""
    ) {
      showSnackbar("Automation", schedules?.data?.message, "error");
    }
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

  return (
    <div>
      {openPopup ? (
        <Popup
          actuators={props.actuators}
          setOpenPopup={setOpenPopup}
          row={row}
          solutions={props.solutions}
          setRow={setRow}
          id={props.id}
        />
      ) : null}
      <span
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "5px 20px",
          gap: "20px",
        }}
      >
        <p style={{ fontSize: "18px" }}>Scheduled Reports</p>
        <IconButton
          color="secondary"
          onClick={() => {
            setRow(null);
            setOpenPopup(true);
          }}
        >
          <AddCircleIcon />
        </IconButton>
      </span>
      {schedules.isLoading ? (
        <span style={{ padding: "50px" }}>
          <Loader />
        </span>
      ) : (
        <>
          {reports.length == 0 ? (
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
              <p style={{ color: "#c8c8c8" }}>No data found</p>
            </div>
          ) : (
            <div
              style={{
                height: "calc(100vh - 100px)",
                overflowY: "scroll",
                paddingLeft: "20px",
              }}
            >
              {reports.map((elm, i) => (
                <Accordion
                  expanded={expanded}
                  setExpanded={setExpanded}
                  setOpenPopup={setOpenPopup}
                  setRow={setRow}
                  index={i}
                  report={elm}
                  permisson={props.permisson}
                  actuators={props.actuators}
                />
              ))}
              {reports.length != 0 && !disabled ? (
                <span
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    marginTop: "15px",
                    position: "relative",
                    bottom: "10px",
                  }}
                >
                  {schedules.isFetching ? (
                    <div
                      style={{
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: "50%",
                        height: "25px",
                        width: "25px",
                        backgroundColor: metaDataValue.branding.secondaryColor,
                      }}
                    >
                      <CircularProgress size={20} style={{ color: "white" }} />
                    </div>
                  ) : (
                    <IconButton
                      color="secondary"
                      onClick={handleMore}
                      style={{
                        backgroundColor: metaDataValue.branding.secondaryColor,
                      }}
                    >
                      <KeyboardArrowDownIcon
                        style={{
                          cursor: "pointer",
                          height: "20px",
                          width: "20px",
                          color: "white",
                        }}
                      />
                    </IconButton>
                  )}
                </span>
              ) : null}
            </div>
          )}
        </>
      )}
    </div>
  );
}
