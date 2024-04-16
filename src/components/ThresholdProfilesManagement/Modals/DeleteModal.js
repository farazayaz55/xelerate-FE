import React, { useEffect, useState } from "react";
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
  title,
  deleteRes
}) {
  useEffect(() => {
    if(deleteRes.isSuccess){
      handleClose()
    }
  }, [deleteRes.isSuccess])

  return (
    <Dialog open={deleteModal} onClose={handleClose}>
      <DialogTitle id="alert-dialog-title">
        {title ? title : "Confirmation"}
      </DialogTitle>
      <DialogContent style={{ overflow: "hidden" }}>
        <DialogContentText id="alert-dialog-description">
          {deleteRes.isLoading?
            <div style={{width: "15vw", height: "100%", display: "flex", justifyContent: "center", alignItems: "center"}}>
              <CircularProgress />
            </div>
            :
            question
          }
        </DialogContentText>
      </DialogContent>
      <DialogActions>        
        <Button onClick={handleClose} color="error">
          Cancel
        </Button>
        <Button
          onClick={() => handleDelete()}
          color="secondary"
        >
          <span>Proceed</span>
        </Button>
      </DialogActions>
    </Dialog>
  );
}
