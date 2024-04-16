import React, { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";

export default function DeleteAlert({
  deleteModal,
  question,
  handleDelete,
  handleClose,
  id,
  platformCheck,
  deleteResult,
  title,
}) {
  const [deleteFromPlatform, setDeleteFromPlatform] = useState(false);

  return (
    <Dialog open={deleteModal} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">
        {title ? title : "Confirmation"}
      </DialogTitle>
      <DialogContent style={{ overflow: "hidden" }}>
        <DialogContentText id="alert-dialog-description">
          {question}
        </DialogContentText>
        {platformCheck ? (
          <div>
            <Checkbox
              color="secondary"
              checked={deleteFromPlatform}
              onChange={(e) => setDeleteFromPlatform(e.target.checked)}
            />{" "}
            Also delete from DM Platform
          </div>
        ) : (
          ""
        )}
      </DialogContent>
      <DialogActions>
        {deleteResult?.isLoading ? null : (
          <Button onClick={handleClose} color="error">
            Cancel
          </Button>
        )}
        <Button
          onClick={() => handleDelete(id, deleteFromPlatform)}
          color="secondary"
        >
          {deleteResult?.isLoading ? (
            <CircularProgress size={20} color="secondary" />
          ) : (
            <span>Proceed</span>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
