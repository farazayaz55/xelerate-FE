//---------------CORE--------------------//
import React, { useEffect, useState } from "react";
//---------------MUI--------------------//
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
//---------------MUI ICONS--------------------//
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
//---------------EXTERNAL--------------------//
import DeleteAlert from "components/Alerts/Delete";
import { useDeleteReportMutation } from "services/alarms";
import { showSnackbar } from "Utilities/Snackbar";
import { useSnackbar } from "notistack";

export default function ControlledAccordions({ report, setOpenPopup, setRow }) {
  let time = new Date(report.time);
  let token = window.localStorage.getItem("token");
  const { enqueueSnackbar } = useSnackbar();
  const [activeId, setActiveId] = useState(null);
  const [deleteModal, setDelete] = useState(false);
  const [deleteReport, deleteReportResult] = useDeleteReportMutation();

  async function toggleDelete(id = null) {
    setActiveId(id);
    setDelete((state) => !state);
  }

  useEffect(() => {
    if (deleteReportResult.isSuccess) {
      setOpenPopup(false);
      showSnackbar(
        "Report",
        deleteReportResult.data?.message,
        "success",
        1000,
        enqueueSnackbar
      );
    }
    if (deleteReportResult.isError) {
      setOpenPopup(false);
      showSnackbar(
        "Report",
        deleteReportResult.error?.data?.message,
        "error",
        1000,
        enqueueSnackbar
      );
    }
  }, [deleteReportResult]);

  return (
    <>
      <div
        style={{
          backgroundColor: "#f9f9f9",
          border: "1px solid #dedede",
          borderRadius: "10px",
          padding: "10px",
          margin: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <span style={{ display: "flex", gap: "10px" }}>
            <p
              style={{
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                position: "relative",
                top: "2px",
              }}
            >
              {report.name}
            </p>
            <Chip label={report.interval} size="small" color="secondary" />
          </span>
          <div>
            <IconButton
              onClick={() => {
                setRow(report);
                setOpenPopup(true);
              }}
            >
              <EditIcon color="secondary" />
            </IconButton>
            <IconButton onClick={() => toggleDelete(true)}>
              <DeleteIcon color="secondary" />
            </IconButton>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            position: "relative",
            top: "3px",
          }}
        >
          <p style={{ fontSize: "12px", color: "grey" }}>
            User:{" "}
            <span style={{ color: "#c3c3c3", marginLeft: "5px" }}>
              {report.userName}
            </span>
          </p>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "18px",
              color: "#c3c3c3",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <p style={{ fontSize: "12px", color: "grey" }}>
              Creation:
              <span
                style={{ color: "#c3c3c3", marginLeft: "5px" }}
              >{`${time.toLocaleDateString(
                "en-GB"
              )} - ${time.toLocaleTimeString()}`}</span>
            </p>
          </div>
        </div>
      </div>
      {activeId ? (
        <DeleteAlert
          deleteModal={deleteModal}
          question="Are you sure you want to delete this report?"
          title={`Delete (${report.name})`}
          id={activeId}
          handleDelete={() => {
            deleteReport({ token, id: report._id });
          }}
          handleClose={toggleDelete}
          deleteResult={deleteReportResult}
        />
      ) : null}
    </>
  );
}
